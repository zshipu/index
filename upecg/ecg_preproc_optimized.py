"""
心电图图像预处理 - 优化版本
===========================================

生产级心电信号提取功能:
- 模块化架构
- 多方法网格检测融合
- 自适应参数
- 质量评估框架
- 健壮的错误处理

作者: Claude Code (从PoC优化而来)
"""

import cv2
import numpy as np
from skimage.morphology import skeletonize
from scipy.signal import find_peaks
from scipy.ndimage import gaussian_filter1d
from scipy.interpolate import interp1d
from typing import Dict, Optional, Tuple, List
import logging
from dataclasses import dataclass
from enum import Enum


# ============================================================================
# 配置与数据结构
# ============================================================================

class FallbackStrategy(Enum):
    CONSERVATIVE = "conservative"  # 高召回率,可能包含噪声
    BALANCED = "balanced"          # 平衡精确率/召回率
    AGGRESSIVE = "aggressive"      # 高精确率,可能遗漏描迹


@dataclass
class QualityScores:
    """不同处理阶段的质量评估分数"""
    image_quality: float  # 0-1, 输入图像质量
    grid_detection: float  # 0-1, 网格检测置信度
    trace_protection: float  # 0-1, 描迹保护可靠性
    trace_continuity: float  # 0-1, 最终描迹连续性
    overall: float  # 0-1, 加权平均值

    def to_dict(self) -> Dict:
        return {
            'image_quality': float(self.image_quality),
            'grid_detection': float(self.grid_detection),
            'trace_protection': float(self.trace_protection),
            'trace_continuity': float(self.trace_continuity),
            'overall': float(self.overall)
        }


@dataclass
class GridInfo:
    """网格标定信息"""
    small_box_px: float
    pixels_per_mm_est: float
    confidence: float
    detection_method: str
    paper_speed_mm_s: float = 25.0  # 标准 25mm/s
    voltage_scale_mm_mV: float = 10.0  # 标准 10mm/mV

    def to_dict(self) -> Dict:
        return {
            'small_box_px': float(self.small_box_px),
            'pixels_per_mm_est': float(self.pixels_per_mm_est),
            'confidence': float(self.confidence),
            'detection_method': self.detection_method,
            'paper_speed_mm_s': float(self.paper_speed_mm_s),
            'voltage_scale_mm_mV': float(self.voltage_scale_mm_mV)
        }


@dataclass
class CalibrationInfo:
    """从方波脉冲提取的标定信息"""
    baseline_y: float  # 0mV基线的Y坐标
    mV_per_pixel: float  # 每像素对应的电压
    pulse_detected: bool  # 是否找到标定脉冲
    confidence: float  # 0-1, 检测置信度
    pulse_region: Optional[Tuple[int, int, int, int]] = None  # (x1, y1, x2, y2)
    pulse_height_px: Optional[float] = None  # 高度(像素)

    def to_dict(self) -> Dict:
        return {
            'baseline_y': float(self.baseline_y),
            'mV_per_pixel': float(self.mV_per_pixel),
            'pulse_detected': bool(self.pulse_detected),
            'confidence': float(self.confidence),
            'pulse_region': self.pulse_region,
            'pulse_height_px': float(self.pulse_height_px) if self.pulse_height_px else None
        }


@dataclass
class LeadSignal:
    """单个导联提取的心电信号"""
    signal_mv: np.ndarray  # 电压值(毫伏)
    time_s: np.ndarray  # 时间值(秒)
    region: Tuple[int, int]  # 图像坐标中的(y_start, y_end)
    quality_score: float  # 0-1, 信号质量
    sampling_rate: float  # Hz
    coverage: float  # 0-1, 包含描迹的列的比例

    def to_dict(self) -> Dict:
        return {
            'signal_mv': self.signal_mv.tolist(),
            'time_s': self.time_s.tolist(),
            'region': self.region,
            'quality_score': float(self.quality_score),
            'sampling_rate': float(self.sampling_rate),
            'coverage': float(self.coverage),
            'duration_s': float(self.time_s[-1]) if len(self.time_s) > 0 else 0.0,
            'amplitude_range_mv': (float(self.signal_mv.min()), float(self.signal_mv.max()))
        }


# ============================================================================
# 自适应参数
# ============================================================================

class AdaptiveParams:
    """基于图像分辨率自动缩放参数"""

    def __init__(self, img_shape: Tuple[int, int], base_resolution: int = 1500):
        self.height, self.width = img_shape[:2]
        self.scale = min(self.height, self.width) / base_resolution
        self.scale = max(0.3, min(self.scale, 3.0))  # 限制在合理范围内

    def canny_thresholds(self, gray: np.ndarray) -> Tuple[int, int]:
        """基于图像统计的自适应Canny阈值"""
        median_val = np.median(gray)
        lower = int(max(0, 0.66 * median_val))
        upper = int(min(255, 1.33 * median_val))
        return lower, upper

    def hough_threshold(self) -> int:
        """自适应Hough变换阈值"""
        return max(100, int(self.width * self.scale / 20))

    def hough_min_line_length(self) -> int:
        """Hough检测的最小线段长度"""
        return max(50, int(self.width * self.scale / 6))

    def adaptive_block_size(self, grid_px: float, multiplier: float = 2.5) -> int:
        """阈值操作的自适应块大小"""
        block = int(grid_px * multiplier)
        return block if block % 2 == 1 else block + 1

    def morphology_kernel_size(self, grid_px: float, ratio: float = 0.4) -> int:
        """形态学操作的核大小"""
        return max(3, int(grid_px * ratio))


# ============================================================================
# 图像验证器
# ============================================================================

class ImageValidator:
    """验证输入图像质量和属性"""

    MIN_RESOLUTION = 600
    RECOMMENDED_RESOLUTION = 1500

    @staticmethod
    def validate(img: np.ndarray) -> Tuple[bool, List[str], float]:
        """
        验证图像质量

        返回:
            (is_valid, warnings, quality_score)
        """
        warnings = []
        scores = []

        # 检查分辨率
        h, w = img.shape[:2]
        min_dim = min(h, w)

        if min_dim < ImageValidator.MIN_RESOLUTION:
            warnings.append(f"分辨率过低 ({min_dim}px)。建议最小分辨率为 {ImageValidator.MIN_RESOLUTION}px。")
            res_score = min_dim / ImageValidator.MIN_RESOLUTION
        elif min_dim < ImageValidator.RECOMMENDED_RESOLUTION:
            warnings.append(f"低于推荐分辨率。理想分辨率为 {ImageValidator.RECOMMENDED_RESOLUTION}px。")
            res_score = 0.7 + 0.3 * (min_dim / ImageValidator.RECOMMENDED_RESOLUTION)
        else:
            res_score = 1.0
        scores.append(res_score)

        # 检查图像是否为空或损坏
        if img.size == 0:
            return False, ["图像为空或已损坏"], 0.0

        # 检查亮度分布
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) if len(img.shape) == 3 else img
        mean_brightness = np.mean(gray)
        std_brightness = np.std(gray)

        if mean_brightness < 30 or mean_brightness > 225:
            warnings.append(f"亮度异常 (均值={mean_brightness:.0f})。可能影响检测。")
            brightness_score = 0.5
        else:
            brightness_score = 1.0
        scores.append(brightness_score)

        # 检查对比度
        if std_brightness < 20:
            warnings.append("检测到低对比度。描迹提取可能困难。")
            contrast_score = 0.5
        else:
            contrast_score = min(1.0, std_brightness / 50)
        scores.append(contrast_score)

        # 总体质量
        quality_score = np.mean(scores)
        is_valid = quality_score >= 0.3  # 非常宽松的阈值

        return is_valid, warnings, quality_score


# ============================================================================
# 几何校正器
# ============================================================================

class GeometricCorrector:
    """校正图像几何(倾斜、透视)"""

    def __init__(self, params: AdaptiveParams):
        self.params = params

    def deskew(self, img: np.ndarray, gray: np.ndarray) -> Tuple[np.ndarray, Dict]:
        """
        使用Hough直线检测进行倾斜校正

        返回:
            (deskewed_image, info_dict)
        """
        # 使用自适应阈值的边缘检测
        lower, upper = self.params.canny_thresholds(gray)
        edges = cv2.Canny(gray, lower, upper)

        # Hough直线检测
        threshold = self.params.hough_threshold()
        min_length = self.params.hough_min_line_length()

        lines = cv2.HoughLinesP(
            edges, 1, np.pi/180,
            threshold=threshold,
            minLineLength=min_length,
            maxLineGap=20
        )

        if lines is None or len(lines) < 3:
            return img, {'angle': 0.0, 'confidence': 0.0, 'method': 'none'}

        # 从接近水平的直线中提取角度
        angles = []
        for line in lines[:, 0]:
            x1, y1, x2, y2 = line
            angle = np.degrees(np.arctan2(y2 - y1, x2 - x1))
            # 保留接近水平的角度
            if abs(angle) < 45:
                angles.append(angle)

        if len(angles) == 0:
            return img, {'angle': 0.0, 'confidence': 0.0, 'method': 'insufficient_lines'}

        # 使用中位数角度(对异常值具有鲁棒性)
        angle_deg = np.median(angles)
        confidence = 1.0 - min(np.std(angles) / 10.0, 1.0)  # 标准差越低=置信度越高

        # 仅在角度显著时旋转
        if abs(angle_deg) < 0.5:
            return img, {'angle': angle_deg, 'confidence': confidence, 'method': 'skipped_small_angle'}

        # 旋转图像
        h, w = img.shape[:2]
        center = (w // 2, h // 2)
        M = cv2.getRotationMatrix2D(center, angle_deg, 1.0)

        # 处理彩色和灰度图像
        rotated = cv2.warpAffine(
            img, M, (w, h),
            flags=cv2.INTER_LINEAR,
            borderMode=cv2.BORDER_REPLICATE
        )

        return rotated, {
            'angle': float(angle_deg),
            'confidence': float(confidence),
            'method': 'hough_median',
            'num_lines': len(angles)
        }


# ============================================================================
# 网格检测器 (多方法融合)
# ============================================================================

class GridDetector:
    """使用多种方法和融合检测网格间距"""

    def __init__(self, params: AdaptiveParams):
        self.params = params

    def detect(self, gray: np.ndarray) -> Optional[GridInfo]:
        """
        使用多方法融合检测网格

        返回:
            GridInfo 或 None(如果检测失败)
        """
        results = []

        # 方法A: 投影分析
        result_proj = self._detect_projection(gray)
        if result_proj:
            results.append(result_proj)

        # 方法B: Hough直线聚类
        result_hough = self._detect_hough(gray)
        if result_hough:
            results.append(result_hough)

        # 融合策略
        if len(results) == 0:
            return self._fallback_estimate(gray)
        elif len(results) == 1:
            return results[0]
        else:
            return self._fuse_results(results)

    def _detect_projection(self, gray: np.ndarray) -> Optional[GridInfo]:
        """方法A: 垂直和水平投影分析"""
        h, w = gray.shape

        # 垂直投影(检测垂直线)
        proj_v = np.mean(255 - gray, axis=0)
        proj_v_smooth = gaussian_filter1d(proj_v, sigma=2.0)

        # 自适应峰值检测
        prominence = np.percentile(proj_v_smooth, 75) - np.percentile(proj_v_smooth, 50)
        peaks_v, _ = find_peaks(
            proj_v_smooth,
            distance=5,
            prominence=max(prominence * 0.4, 5)
        )

        # 水平投影(检测水平线)
        proj_h = np.mean(255 - gray, axis=1)
        proj_h_smooth = gaussian_filter1d(proj_h, sigma=2.0)
        peaks_h, _ = find_peaks(
            proj_h_smooth,
            distance=5,
            prominence=max(prominence * 0.4, 5)
        )

        # 需要足够的峰值
        if len(peaks_v) < 4 or len(peaks_h) < 4:
            return None

        # 计算间距
        diffs_v = np.diff(peaks_v)
        diffs_h = np.diff(peaks_h)

        # 使用中位数(对异常值具有鲁棒性)
        small_v = np.median(diffs_v)
        small_h = np.median(diffs_h)

        # 检查一致性
        avg_spacing = (small_v + small_h) / 2
        consistency = 1.0 - abs(small_v - small_h) / max(small_v, small_h)

        confidence = min(consistency, 0.9)

        return GridInfo(
            small_box_px=avg_spacing,
            pixels_per_mm_est=avg_spacing,
            confidence=confidence,
            detection_method='projection'
        )

    def _detect_hough(self, gray: np.ndarray) -> Optional[GridInfo]:
        """方法B: Hough直线检测和聚类"""
        edges = cv2.Canny(gray, 50, 150)

        # 检测直线
        lines = cv2.HoughLines(edges, 1, np.pi/180, threshold=100)

        if lines is None or len(lines) < 8:
            return None

        # 分离垂直和水平线
        vertical_rhos = []
        horizontal_rhos = []

        for line in lines[:, 0]:
            rho, theta = line
            angle_deg = np.degrees(theta)

            # 垂直线(约90°)
            if 85 <= angle_deg <= 95:
                vertical_rhos.append(abs(rho))
            # 水平线(约0°或180°)
            elif angle_deg < 5 or angle_deg > 175:
                horizontal_rhos.append(abs(rho))

        if len(vertical_rhos) < 4 or len(horizontal_rhos) < 4:
            return None

        # 排序并计算间距
        vertical_rhos = sorted(vertical_rhos)
        horizontal_rhos = sorted(horizontal_rhos)

        v_diffs = np.diff(vertical_rhos)
        h_diffs = np.diff(horizontal_rhos)

        # 过滤异常值(非常大或小的间距)
        v_diffs = v_diffs[(v_diffs > 3) & (v_diffs < 100)]
        h_diffs = h_diffs[(h_diffs > 3) & (h_diffs < 100)]

        if len(v_diffs) == 0 or len(h_diffs) == 0:
            return None

        small_v = np.median(v_diffs)
        small_h = np.median(h_diffs)
        avg_spacing = (small_v + small_h) / 2

        consistency = 1.0 - abs(small_v - small_h) / max(small_v, small_h)
        confidence = min(consistency * 0.85, 0.85)  # 比投影法稍低

        return GridInfo(
            small_box_px=avg_spacing,
            pixels_per_mm_est=avg_spacing,
            confidence=confidence,
            detection_method='hough'
        )

    def _fuse_results(self, results: List[GridInfo]) -> GridInfo:
        """融合多个检测结果"""
        # 按置信度加权平均
        weights = np.array([r.confidence for r in results])
        weights = weights / np.sum(weights)

        fused_spacing = np.sum([r.small_box_px * w for r, w in zip(results, weights)])
        fused_confidence = np.mean([r.confidence for r in results])

        methods = '+'.join([r.detection_method for r in results])

        return GridInfo(
            small_box_px=fused_spacing,
            pixels_per_mm_est=fused_spacing,
            confidence=min(fused_confidence * 1.1, 0.95),  # 多方法提升置信度
            detection_method=f'fusion({methods})'
        )

    def _fallback_estimate(self, gray: np.ndarray) -> GridInfo:
        """检测失败时的后备网格估计"""
        h, w = gray.shape
        # 启发式规则: 较小维度约200个小格
        estimated_spacing = min(h, w) / 200
        estimated_spacing = max(4, estimated_spacing)  # 至少4像素

        return GridInfo(
            small_box_px=estimated_spacing,
            pixels_per_mm_est=estimated_spacing,
            confidence=0.3,  # 低置信度
            detection_method='fallback_heuristic'
        )


# ============================================================================
# 颜色分离网格去除器
# ============================================================================

class ColorBasedGridRemover:
    """
    基于颜色特征去除网格背景

    原理：
    - 网格通常是浅色（高亮度）、低饱和度
    - 心电trace是深色（低亮度）或高饱和度
    - 使用HSV空间分离，避免删除trace

    优点：
    - 快速（纯颜色阈值，无形态学迭代）
    - 直接（不需要检测网格线模式）
    - 通用（适应各种浅色网格：粉色、红色、橙色等）
    """

    def __init__(self, params: AdaptiveParams):
        self.params = params

    def remove_grid(
        self,
        img_bgr: np.ndarray,
        grid_info: GridInfo,
        aggressive: bool = False
    ) -> np.ndarray:
        """
        基于颜色分离去除网格

        参数:
            img_bgr: 输入彩色图像（BGR格式）
            grid_info: 网格信息（用于自适应参数）
            aggressive: 是否使用激进模式（更彻底但可能影响细trace）

        返回:
            去除网格后的图像（白色背景）
        """
        # 1. 转换到HSV颜色空间
        hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
        h, s, v = cv2.split(hsv)

        # 2. 灰度图用于深色检测
        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)

        # 3. 定义网格特征（浅色 + 低饱和度）
        if aggressive:
            # 激进模式：更宽松的阈值
            light_mask = (v > 140)  # 更低的亮度阈值
            low_sat_mask = (s < 120)  # 更高的饱和度容忍
        else:
            # 保守模式：更严格的阈值
            light_mask = (v > 160)  # 较高的亮度阈值
            low_sat_mask = (s < 80)   # 较低的饱和度阈值

        # 网格候选区域
        grid_candidate = light_mask & low_sat_mask

        # 4. 保护深色区域（trace通常是深色）
        # 自适应阈值：根据图像整体亮度调整
        mean_brightness = np.mean(gray)
        if mean_brightness > 200:  # 很亮的图像
            dark_threshold = 140
        elif mean_brightness > 150:  # 中等亮度
            dark_threshold = 120
        else:  # 较暗的图像
            dark_threshold = 100

        dark_mask = gray < dark_threshold

        # 5. 保护高饱和度区域（红色trace）
        high_sat_mask = s > 100

        # 6. 综合保护区域
        trace_protection = dark_mask | high_sat_mask

        # 7. 最终网格掩码 = 网格候选 AND 非trace保护区域
        grid_to_remove = grid_candidate & (~trace_protection)

        # 8. 形态学后处理：清理孤立噪点
        small_box_px = int(grid_info.small_box_px)
        kernel_size = max(2, small_box_px // 8)
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (kernel_size, kernel_size))

        # 开运算：去除小噪点
        grid_to_remove_clean = cv2.morphologyEx(
            grid_to_remove.astype(np.uint8) * 255,
            cv2.MORPH_OPEN,
            kernel
        )

        # 闭运算：填充网格内部小孔
        grid_to_remove_clean = cv2.morphologyEx(
            grid_to_remove_clean,
            cv2.MORPH_CLOSE,
            kernel
        )

        # 9. 替换网格为白色
        img_cleaned = img_bgr.copy()
        img_cleaned[grid_to_remove_clean > 0] = [255, 255, 255]

        return img_cleaned

    def get_grid_removal_mask(
        self,
        img_bgr: np.ndarray,
        grid_info: GridInfo,
        aggressive: bool = False
    ) -> np.ndarray:
        """
        仅返回网格掩码（不修改图像）
        用于调试和可视化
        """
        hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
        h, s, v = cv2.split(hsv)
        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)

        # 网格特征
        if aggressive:
            light_mask = (v > 140)
            low_sat_mask = (s < 120)
        else:
            light_mask = (v > 160)
            low_sat_mask = (s < 80)

        grid_candidate = light_mask & low_sat_mask

        # 保护trace
        mean_brightness = np.mean(gray)
        dark_threshold = 140 if mean_brightness > 200 else (120 if mean_brightness > 150 else 100)
        dark_mask = gray < dark_threshold
        high_sat_mask = s > 100
        trace_protection = dark_mask | high_sat_mask

        # 最终掩码
        grid_mask = grid_candidate & (~trace_protection)

        return (grid_mask.astype(np.uint8) * 255)


# ============================================================================
# 描迹提取器
# ============================================================================

class TraceExtractor:
    """提取心电描迹并进行保护和质量评估"""

    def __init__(self, params: AdaptiveParams, fallback: FallbackStrategy = FallbackStrategy.BALANCED):
        self.params = params
        self.fallback = fallback

    def extract_trace_hint(self, img_color: np.ndarray, gray: np.ndarray) -> np.ndarray:
        """使用颜色和强度分析提取描迹提示"""
        # 基于颜色的检测(红色描迹)
        b, g, r = cv2.split(img_color)
        red_score = cv2.subtract(r, cv2.add(g, b) // 2)

        # 基于强度的检测(深色描迹)
        dark_score = 255 - gray

        # 归一化两个分数
        red_norm = cv2.normalize(red_score, None, 0, 255, cv2.NORM_MINMAX)
        dark_norm = cv2.normalize(dark_score, None, 0, 255, cv2.NORM_MINMAX)

        # 组合(最大值保留最强信号)
        trace_hint = cv2.max(red_norm, dark_norm)

        # 轻度平滑以减少噪声
        trace_hint = cv2.GaussianBlur(trace_hint, (3, 3), 0)

        return trace_hint

    def get_protection_mask(
        self,
        trace_hint: np.ndarray,
        grid_info: GridInfo
    ) -> np.ndarray:
        """
        生成描迹像素的保护掩码
        使用双阈值策略和自适应膨胀
        """
        small_box_px = grid_info.small_box_px
        confidence = grid_info.confidence

        # 自适应块大小
        block_size = self.params.adaptive_block_size(small_box_px, multiplier=2.5)

        # 双阈值策略
        th_high = cv2.adaptiveThreshold(
            trace_hint, 255,
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY,
            block_size, -5
        )

        th_low = cv2.adaptiveThreshold(
            trace_hint, 255,
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY,
            block_size, -15
        )

        # 形态学闭运算(连接断裂的线段)
        k_size = max(2, int(small_box_px // 4))

        # 垂直核
        k_v = cv2.getStructuringElement(cv2.MORPH_RECT, (1, k_size))
        closed_v = cv2.morphologyEx(th_low, cv2.MORPH_CLOSE, k_v)

        # 水平核
        k_h = cv2.getStructuringElement(cv2.MORPH_RECT, (k_size, 1))
        closed_h = cv2.morphologyEx(th_low, cv2.MORPH_CLOSE, k_h)

        # 组合两个方向
        closed = cv2.bitwise_or(closed_v, closed_h)

        # 连通组件过滤
        num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(closed, connectivity=8)

        mask = np.zeros_like(closed)
        for i in range(1, num_labels):
            area = stats[i, cv2.CC_STAT_AREA]
            w = stats[i, cv2.CC_STAT_WIDTH]
            h = stats[i, cv2.CC_STAT_HEIGHT]
            aspect = max(w, h) / (min(w, h) + 1e-6)

            # 改进的过滤逻辑
            is_large = area > small_box_px * 1.5
            is_elongated = aspect > 3
            is_long = max(w, h) > small_box_px * 0.8

            if is_large or (is_elongated and is_long):
                mask[labels == i] = 255

        # 基于置信度的自适应膨胀
        if confidence > 0.7:
            dil_r = max(2, int(small_box_px * 0.04))
        else:
            dil_r = max(3, int(small_box_px * 0.08))

        kernel_dil = cv2.getStructuringElement(
            cv2.MORPH_ELLIPSE,
            (dil_r * 2 + 1, dil_r * 2 + 1)
        )
        mask = cv2.dilate(mask, kernel_dil)

        return mask

    def detect_grid_mask(self, gray: np.ndarray, grid_info: GridInfo) -> np.ndarray:
        """检测用于移除的网格线"""
        small_box_px = grid_info.small_box_px

        # 自适应阈值
        img_bin = cv2.adaptiveThreshold(
            gray, 255,
            cv2.ADAPTIVE_THRESH_MEAN_C,
            cv2.THRESH_BINARY_INV,
            51, 10
        )

        # 垂直线
        k_size = self.params.morphology_kernel_size(small_box_px, ratio=0.5)
        vert_k = cv2.getStructuringElement(cv2.MORPH_RECT, (1, k_size))
        vert = cv2.morphologyEx(img_bin, cv2.MORPH_OPEN, vert_k)

        # 水平线
        hor_k = cv2.getStructuringElement(cv2.MORPH_RECT, (k_size, 1))
        hor = cv2.morphologyEx(img_bin, cv2.MORPH_OPEN, hor_k)

        # 组合
        grid_mask = cv2.bitwise_or(vert, hor)

        return grid_mask

    def inpaint_grid(
        self,
        img: np.ndarray,
        grid_mask: np.ndarray,
        protect_mask: np.ndarray,
        grid_info: GridInfo
    ) -> np.ndarray:
        """在保护描迹的同时修复网格"""
        # 仅在网格存在且描迹不存在的地方修复
        mask = cv2.bitwise_and(grid_mask, cv2.bitwise_not(protect_mask))
        mask8 = (mask > 0).astype('uint8') * 255

        # 自适应修复半径
        radius = max(3, int(grid_info.small_box_px * 0.1))

        # 修复
        inpainted = cv2.inpaint(img, mask8, radius, cv2.INPAINT_TELEA)

        return inpainted

    def extract_final_mask(self, img: np.ndarray, grid_info: GridInfo) -> np.ndarray:
        """
        提取最终的描迹掩码（二值图像）

        注意：不再使用骨架化！保留多像素宽度的trace以便后续blob检测
        """
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) if len(img.shape) == 3 else img

        # 自适应阈值
        block_size = self.params.adaptive_block_size(grid_info.small_box_px, multiplier=2.0)
        th = cv2.adaptiveThreshold(
            gray, 255,
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY_INV,
            block_size, 5
        )

        # 轻度形态学清理（去除孤立噪点）
        k_size = max(2, int(grid_info.small_box_px // 8))  # 更小的kernel
        k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k_size, k_size))
        cleaned = cv2.morphologyEx(th, cv2.MORPH_OPEN, k)

        # 不骨架化！直接返回二值掩码
        # 这样保留了trace的多像素宽度，有利于blob检测和平均
        return cleaned


# ============================================================================
# 平均窗口信号提取器（基于WebPlotDigitizer算法）
# ============================================================================

class AveragingWindowExtractor:
    """
    基于WebPlotDigitizer的平均窗口算法提取信号

    核心改进：
    1. Blob检测：在每列中检测多个分离的曲线段
    2. 加权平均：计算每个blob的精确中心位置
    3. 水平聚合：在xStep范围内平滑相邻点
    4. 多导联支持：自动分离不同的ECG导联

    参考: WebPlotDigitizer - averagingWindowCore.js
    """

    def __init__(self, xStep: int = 10, yStep: int = 10):
        """
        初始化提取器

        参数:
            xStep: 水平聚合窗口大小（像素）
            yStep: 垂直blob分离阈值（像素）
        """
        self.xStep = xStep
        self.yStep = yStep

    def _detect_blobs_in_column(self, column: np.ndarray) -> List[Tuple[float, int]]:
        """
        在单列中检测多个blob（分离的曲线段）

        算法：
        1. 垂直扫描前景像素
        2. 如果距离上一个像素 > yStep，则开始新blob
        3. 否则添加到当前blob
        4. 对每个blob计算加权平均y坐标

        参数:
            column: 列像素值数组 (height,)

        返回:
            [(y_center, pixel_count), ...] 每个blob的中心和像素数
        """
        blobs = []
        current_blob_ys = []
        last_y = -2.0 * self.yStep  # 初始化为足够远的距离

        for y in range(len(column)):
            if column[y] > 0:  # 前景像素
                if y > last_y + self.yStep:
                    # 距离太远，开始新blob
                    if current_blob_ys:
                        # 保存旧blob的加权平均
                        avg_y = np.mean(current_blob_ys)
                        blobs.append((avg_y, len(current_blob_ys)))
                    # 开始新blob
                    current_blob_ys = [y]
                    last_y = y
                else:
                    # 继续当前blob
                    current_blob_ys.append(y)
                    last_y = y

        # 保存最后一个blob
        if current_blob_ys:
            avg_y = np.mean(current_blob_ys)
            blobs.append((avg_y, len(current_blob_ys)))

        return blobs

    def _horizontal_averaging(
        self,
        points: List[Tuple[float, float, int]]
    ) -> List[Tuple[float, float]]:
        """
        水平窗口聚合相邻点

        算法：
        1. 遍历每个候选点
        2. 在xStep范围内查找相邻点
        3. 计算加权平均位置
        4. 标记已处理的点避免重复

        参数:
            points: [(x, y, weight), ...] 候选点列表

        返回:
            [(x, y), ...] 聚合后的点
        """
        if not points:
            return []

        # 按x排序
        points_sorted = sorted(points, key=lambda p: p[0])

        # 添加"已使用"标记
        points_with_flag = [(x, y, w, False) for x, y, w in points_sorted]

        results = []

        for i, (x, y, weight, used) in enumerate(points_with_flag):
            if used:
                continue

            # 初始化平均值
            avg_x = x
            avg_y = y
            total_weight = weight
            matches = 1

            # 标记当前点为已使用
            points_with_flag[i] = (x, y, weight, True)

            # 向右搜索相邻点
            for j in range(i + 1, len(points_with_flag)):
                xj, yj, wj, usedj = points_with_flag[j]

                if usedj:
                    continue

                # 超出x范围，停止搜索
                if xj > x + 2 * self.xStep:
                    break

                # 检查是否在窗口内
                if abs(xj - x) <= self.xStep and abs(yj - y) <= self.yStep:
                    # 加权平均
                    avg_x = (avg_x * total_weight + xj * wj) / (total_weight + wj)
                    avg_y = (avg_y * total_weight + yj * wj) / (total_weight + wj)
                    total_weight += wj
                    matches += 1

                    # 标记为已使用
                    points_with_flag[j] = (xj, yj, wj, True)

            results.append((avg_x, avg_y))

        return results

    def _separate_leads_simple(
        self,
        points: List[Tuple[float, float]]
    ) -> List[np.ndarray]:
        """
        将混合的点分离成不同导联

        策略：
        1. 按x排序所有点
        2. 对每个点，尝试匹配现有导联（y距离和x连续性）
        3. 如果无法匹配，创建新导联
        4. 过滤太短的导联（噪声）

        参数:
            points: [(x, y), ...] 混合的点列表

        返回:
            [array([[x1,y1], [x2,y2], ...]), ...] 每个导联的点数组
        """
        if not points:
            return []

        # 按x排序
        points_sorted = sorted(points, key=lambda p: p[0])

        # 初始化导联列表
        leads = []

        for x, y in points_sorted:
            # 尝试匹配现有导联
            matched = False

            for lead in leads:
                if lead:
                    last_x, last_y = lead[-1]

                    # 检查y距离和x连续性
                    y_close = abs(y - last_y) < self.yStep * 2
                    x_continuous = x - last_x < self.xStep * 3

                    if y_close and x_continuous:
                        lead.append((x, y))
                        matched = True
                        break

            if not matched:
                # 创建新导联
                leads.append([(x, y)])

        # 过滤太短的导联（噪声）
        min_points = 20  # 至少20个点
        leads_filtered = [
            np.array(lead)
            for lead in leads
            if len(lead) >= min_points
        ]

        return leads_filtered

    def extract_signals(
        self,
        binary_mask: np.ndarray,
        multi_lead: bool = True
    ) -> List[np.ndarray]:
        """
        从二值掩码提取信号

        流程：
        1. 逐列扫描，检测blob
        2. 水平聚合平滑
        3. （可选）分离多导联

        参数:
            binary_mask: 二值图像 (height, width)，>0为前景
            multi_lead: 是否分离多导联

        返回:
            [array([[x1,y1], [x2,y2], ...]), ...] 每个导联的(x,y)坐标
        """
        height, width = binary_mask.shape

        # 阶段1：垂直扫描检测blobs
        candidate_points = []

        for x in range(width):
            column = binary_mask[:, x]
            blobs = self._detect_blobs_in_column(column)

            for y_center, pixel_count in blobs:
                # 添加 0.5 偏移到像素中心
                candidate_points.append((
                    x + 0.5,
                    y_center + 0.5,
                    pixel_count  # 权重
                ))

        if not candidate_points:
            return []

        # 阶段2：水平聚合
        smoothed_points = self._horizontal_averaging(candidate_points)

        if not smoothed_points:
            return []

        # 阶段3：分离导联（可选）
        if multi_lead:
            leads = self._separate_leads_simple(smoothed_points)
            return leads
        else:
            # 单导联，返回所有点
            return [np.array(smoothed_points)]


# ============================================================================
# 质量评估器
# ============================================================================

class QualityAssessor:
    """评估每个处理阶段的质量"""

    @staticmethod
    def assess_trace_quality(trace_mask: np.ndarray, img_shape: Tuple) -> Dict:
        """评估最终描迹质量"""
        h, w = img_shape[:2]

        # 覆盖率
        trace_pixels = np.sum(trace_mask > 0)
        coverage = trace_pixels / (h * w)

        # 连续性: 至少有1个描迹像素的列的比例
        cols_with_trace = np.sum(np.any(trace_mask > 0, axis=0))
        continuity = cols_with_trace / w

        # 密度: 每列平均描迹像素数
        density = trace_pixels / w

        return {
            'coverage': float(coverage),
            'continuity': float(continuity),
            'density': float(density)
        }

    @staticmethod
    def compute_overall_quality(
        img_quality: float,
        grid_confidence: float,
        trace_continuity: float
    ) -> QualityScores:
        """计算总体质量分数"""
        # 加权平均
        overall = (
            0.2 * img_quality +
            0.3 * grid_confidence +
            0.5 * trace_continuity
        )

        return QualityScores(
            image_quality=img_quality,
            grid_detection=grid_confidence,
            trace_protection=grid_confidence,  # 与网格检测相关
            trace_continuity=trace_continuity,
            overall=overall
        )


# ============================================================================
# 标定脉冲检测
# ============================================================================

class CalibrationPulseDetector:
    """
    检测并提取方波脉冲的标定信息

    标准心电图标定脉冲:
    - 幅度: 1 mV (10mm)
    - 持续时间: 0.2s (25mm/s时为5mm)
    - 形状: 边缘锐利的矩形
    """

    def __init__(self, grid_info: GridInfo, logger: logging.Logger):
        self.grid_info = grid_info
        self.logger = logger

    def detect(self, image: np.ndarray, skeleton: np.ndarray) -> CalibrationInfo:
        """
        在图像左侧区域检测标定脉冲

        参数:
            image: 预处理图像(灰度或彩色)
            skeleton: 心电描迹的二值骨架

        返回:
            包含基线和电压标定的CalibrationInfo
        """
        height, width = skeleton.shape

        # 定义搜索ROI: 图像左侧20%
        roi_width = int(width * 0.2)
        roi_skeleton = skeleton[:, :roi_width]

        # 预期的脉冲尺寸
        expected_width_px = self.grid_info.small_box_px * 5  # 约5mm
        expected_height_px = self.grid_info.small_box_px * 10  # 约10mm

        # 尝试找到方波模式
        pulse_region = self._find_square_wave_region(
            roi_skeleton, expected_width_px, expected_height_px
        )

        if pulse_region is not None:
            x1, y1, x2, y2 = pulse_region
            confidence = self._validate_pulse(
                roi_skeleton[y1:y2, x1:x2], expected_width_px, expected_height_px
            )

            if confidence > 0.5:
                # 提取标定参数
                baseline_y = float(y2)  # 脉冲底部 = 0mV
                pulse_height_px = float(y2 - y1)
                mV_per_pixel = 1.0 / pulse_height_px  # 标准1mV脉冲

                self.logger.info(
                    f"检测到标定脉冲: baseline_y={baseline_y:.1f}, "
                    f"height={pulse_height_px:.1f}px, confidence={confidence:.2f}"
                )

                return CalibrationInfo(
                    baseline_y=baseline_y,
                    mV_per_pixel=mV_per_pixel,
                    pulse_detected=True,
                    confidence=confidence,
                    pulse_region=(x1, y1, x2, y2),
                    pulse_height_px=pulse_height_px
                )

        # 后备: 使用基于网格的标定
        self.logger.warning("未检测到方波,使用基于网格的标定")
        return self._fallback_calibration(skeleton)

    def _find_square_wave_region(
        self, roi_skeleton: np.ndarray,
        expected_width: float, expected_height: float
    ) -> Optional[Tuple[int, int, int, int]]:
        """
        使用水平投影查找方波模式

        返回 (x1, y1, x2, y2) 或 None
        """
        height, width = roi_skeleton.shape

        # 计算行投影(每行像素数)
        row_projection = np.sum(roi_skeleton > 0, axis=1)

        # 平滑以减少噪声
        if len(row_projection) > 5:
            row_projection = gaussian_filter1d(row_projection, sigma=1.5)

        # 查找平台: 像素计数持续高的区域
        # 预期: 脉冲顶部在宽度上有许多描迹像素
        threshold = expected_width * 0.3  # 至少为预期宽度的30%

        # 查找阈值以上的连续区域
        above_threshold = row_projection > threshold

        # 查找第一个实质性平台
        in_plateau = False
        start_y = 0
        best_region = None

        for y in range(height):
            if above_threshold[y] and not in_plateau:
                start_y = y
                in_plateau = True
            elif not above_threshold[y] and in_plateau:
                plateau_height = y - start_y

                # 检查是否匹配预期脉冲高度
                height_ratio = plateau_height / expected_height
                if 0.6 < height_ratio < 1.5:  # 允许40%容差
                    # 找到候选脉冲区域
                    # 查找水平范围
                    pulse_row = roi_skeleton[start_y:y, :]
                    col_projection = np.sum(pulse_row > 0, axis=0)
                    cols_with_trace = np.where(col_projection > 0)[0]

                    if len(cols_with_trace) > 0:
                        x1 = int(cols_with_trace[0])
                        x2 = int(cols_with_trace[-1])
                        pulse_width = x2 - x1

                        # 检查宽度
                        width_ratio = pulse_width / expected_width
                        if 0.5 < width_ratio < 2.0:  # 允许更宽的容差
                            best_region = (x1, start_y, x2, y)
                            break  # 使用第一个匹配

                in_plateau = False

        return best_region

    def _validate_pulse(
        self, pulse_region: np.ndarray,
        expected_width: float, expected_height: float
    ) -> float:
        """
        验证脉冲特征,返回置信度分数
        """
        if pulse_region.size == 0:
            return 0.0

        height, width = pulse_region.shape

        # 检查1: 尺寸匹配期望值
        width_score = 1.0 - min(abs(width - expected_width) / expected_width, 1.0)
        height_score = 1.0 - min(abs(height - expected_height) / expected_height, 1.0)
        dimension_score = (width_score + height_score) / 2

        # 检查2: 顶部和底部应该是平的(低行方差)
        row_sums = np.sum(pulse_region > 0, axis=1)
        if len(row_sums) > 4:
            top_variance = np.std(row_sums[:len(row_sums)//3])
            bottom_variance = np.std(row_sums[-len(row_sums)//3:])
            mean_width = np.mean(row_sums)
            flatness_score = 1.0 - min((top_variance + bottom_variance) / (2 * mean_width + 1), 1.0)
        else:
            flatness_score = 0.5

        # 检查3: 应该具有矩形形状(覆盖率)
        total_pixels = pulse_region.sum() / 255
        expected_pixels = width * height * 0.8  # 预期约80%覆盖率
        coverage_score = min(total_pixels / max(expected_pixels, 1), 1.0)

        # 加权平均
        confidence = (
            dimension_score * 0.4 +
            flatness_score * 0.3 +
            coverage_score * 0.3
        )

        return float(confidence)

    def _fallback_calibration(self, skeleton: np.ndarray) -> CalibrationInfo:
        """
        后备: 未检测到脉冲时使用基于网格的标定
        """
        height, width = skeleton.shape

        # 使用中心线作为基线估计
        baseline_y = height / 2.0

        # 从网格信息计算mV_per_pixel
        # 标准: 10mm = 1mV
        pixels_per_mm_v = self.grid_info.small_box_px  # 假设1mm网格
        mV_per_pixel = 0.1 / pixels_per_mm_v  # 每1mm为0.1mV

        return CalibrationInfo(
            baseline_y=baseline_y,
            mV_per_pixel=mV_per_pixel,
            pulse_detected=False,
            confidence=0.3,  # 后备的低置信度
            pulse_region=None,
            pulse_height_px=None
        )


# ============================================================================
# 信号提取
# ============================================================================

class SignalExtractor:
    """
    从二值描迹掩码中提取心电信号值

    核心算法（基于WebPlotDigitizer）:
    1. 使用AveragingWindowExtractor检测blob并平滑
    2. 自动分离多导联
    3. 使用标定将y坐标转换为电压
    4. 插值填补空缺并计算时间值
    """

    def __init__(self, calibration: CalibrationInfo, grid_info: GridInfo, logger: logging.Logger):
        self.calibration = calibration
        self.grid_info = grid_info
        self.logger = logger

        # 从网格间距计算采样率
        # 在25mm/s: 1像素 = (1/pixels_per_mm) mm = (1/pixels_per_mm)/25 秒
        self.sampling_rate = grid_info.pixels_per_mm_est * grid_info.paper_speed_mm_s

        # 初始化平均窗口提取器（参数基于网格尺寸）
        xStep = max(3, int(grid_info.small_box_px * 0.5))  # 约半个小格
        yStep = max(3, int(grid_info.small_box_px * 0.4))  # 约0.4个小格
        self.averaging_extractor = AveragingWindowExtractor(xStep=xStep, yStep=yStep)

        self.logger.info(f"平均窗口参数: xStep={xStep}px, yStep={yStep}px")

    def extract_signals(
        self,
        trace_mask: np.ndarray,
        multi_lead: bool = True
    ) -> List[LeadSignal]:
        """
        从二值掩码提取信号

        参数:
            trace_mask: 二值掩码(0或255)，不是骨架！
            multi_lead: 是否检测并提取多个导联

        返回:
            LeadSignal对象列表
        """
        # 使用改进的AveragingWindow算法提取
        lead_points = self.averaging_extractor.extract_signals(trace_mask, multi_lead=multi_lead)

        if len(lead_points) == 0:
            self.logger.warning("未检测到任何导联信号")
            return []

        self.logger.info(f"检测到 {len(lead_points)} 个导联")

        # 转换每个导联的点为LeadSignal
        leads = []
        for i, points in enumerate(lead_points):
            if len(points) == 0:
                continue

            lead_signal = self._points_to_lead_signal(points, lead_idx=i)
            if lead_signal is not None:
                leads.append(lead_signal)

        return leads

    def _points_to_lead_signal(
        self,
        points: np.ndarray,
        lead_idx: int
    ) -> Optional[LeadSignal]:
        """
        将(x, y)点数组转换为LeadSignal

        参数:
            points: array([[x1, y1], [x2, y2], ...])
            lead_idx: 导联索引

        返回:
            LeadSignal对象或None
        """
        if len(points) < 10:
            self.logger.warning(f"导联 {lead_idx}: 点太少 ({len(points)}), 跳过")
            return None

        x_coords = points[:, 0]
        y_coords = points[:, 1]

        # 计算覆盖率
        x_min, x_max = x_coords.min(), x_coords.max()
        coverage = len(points) / (x_max - x_min + 1)

        # 创建均匀采样的信号（插值）
        # 生成均匀的x坐标
        x_uniform = np.arange(x_min, x_max + 1)

        # 插值y坐标
        if len(x_coords) == 1:
            # 只有一个点，无法插值
            signal_y_uniform = np.array([y_coords[0]])
        else:
            # 使用线性插值
            from scipy.interpolate import interp1d
            f = interp1d(x_coords, y_coords, kind='linear', fill_value='extrapolate')
            signal_y_uniform = f(x_uniform)

        # 转换为电压 (mV)
        # y坐标: 图像顶部=0, 底部=height
        # baseline_y: 0mV基线的y坐标
        # 电压 = (baseline_y - y) * mV_per_pixel
        baseline_y_adj = self.calibration.baseline_y
        signal_mv = (baseline_y_adj - signal_y_uniform) * self.calibration.mV_per_pixel

        # 计算时间值
        time_s = np.arange(len(signal_mv)) / self.sampling_rate

        # 计算质量分数
        quality_score = self._calculate_quality(signal_mv, coverage)

        # 计算region (bounding box)
        y_min, y_max = y_coords.min(), y_coords.max()
        region = (int(x_min), int(y_min), int(x_max), int(y_max))

        self.logger.info(
            f"导联 {lead_idx}: {len(signal_mv)} 个采样点, "
            f"范围 [{signal_mv.min():.2f}, {signal_mv.max():.2f}] mV, "
            f"质量={quality_score:.2f}"
        )

        return LeadSignal(
            signal_mv=signal_mv,
            time_s=time_s,
            region=region,
            quality_score=quality_score,
            sampling_rate=self.sampling_rate,
            coverage=coverage
        )

    def _calculate_quality(self, signal_mv: np.ndarray, coverage: float) -> float:
        """
        计算信号质量分数

        因素:
        - 覆盖率: 具有描迹的列的比例
        - 幅度: 信号应在预期的心电图范围内
        - 连续性: 信号不应有极端跳变
        """
        # 覆盖率分数(已经是0-1)
        coverage_score = coverage

        # 幅度合理性检查
        amplitude = np.ptp(signal_mv)  # 峰峰值
        # 正常心电图: 0.5到3.0 mV范围
        if 0.3 < amplitude < 5.0:
            amplitude_score = 1.0
        elif amplitude < 0.3:
            amplitude_score = amplitude / 0.3  # 太小
        else:
            amplitude_score = max(0.0, 1.0 - (amplitude - 5.0) / 5.0)  # 太大

        # 连续性检查(梯度应该合理)
        if len(signal_mv) > 1:
            gradient = np.abs(np.diff(signal_mv))
            max_gradient = np.percentile(gradient, 95)  # 第95百分位
            # 在典型采样率下,梯度应<0.5mV每采样点
            expected_max_gradient = 0.5
            if max_gradient < expected_max_gradient:
                continuity_score = 1.0
            else:
                continuity_score = max(0.0, 1.0 - (max_gradient - expected_max_gradient) / 2.0)
        else:
            continuity_score = 0.5

        # 加权平均
        quality = (
            coverage_score * 0.4 +
            amplitude_score * 0.3 +
            continuity_score * 0.3
        )

        return float(quality)


# ============================================================================
# 主预处理器
# ============================================================================

class ECGPreprocessor:
    """
    生产级心电图图像预处理器

    用法:
        preprocessor = ECGPreprocessor(verbose=True)
        result = preprocessor.process('path/to/ecg.png')
    """

    def __init__(
        self,
        quality_threshold: float = 0.3,
        fallback_strategy: FallbackStrategy = FallbackStrategy.BALANCED,
        grid_removal_method: str = 'color',  # 'color' 或 'morphology'
        aggressive_grid_removal: bool = False,  # 激进模式（更彻底去除网格）
        verbose: bool = False
    ):
        self.quality_threshold = quality_threshold
        self.fallback_strategy = fallback_strategy
        self.grid_removal_method = grid_removal_method
        self.aggressive_grid_removal = aggressive_grid_removal
        self.verbose = verbose

        # 设置日志
        if verbose:
            logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)

        # 实例状态(由process()设置)
        self.preproc_img = None
        self.trace_mask = None
        self.grid_info = None

    def process(self, path: str) -> Dict:
        """
        处理心电图图像

        返回:
            字典包含:
            - preproc_img: 预处理图像
            - trace_mask: 二值描迹掩码
            - grid_info: 网格标定信息
            - quality_scores: 质量评估
            - warnings: 警告列表
            - intermediate_results: 可选的调试信息
        """
        warnings = []

        # 1. 读取图像
        img = cv2.imread(path, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError(f"无法从 {path} 读取图像")

        # 2. 验证输入
        is_valid, val_warnings, img_quality = ImageValidator.validate(img)
        warnings.extend(val_warnings)

        if not is_valid:
            raise ValueError("输入图像质量太低,无法处理")

        # 3. 初始化自适应参数
        params = AdaptiveParams(img.shape)

        # 4. 几何校正
        corrector = GeometricCorrector(params)
        gray_orig = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        img_corrected, deskew_info = corrector.deskew(img, gray_orig)
        gray_corrected = cv2.cvtColor(img_corrected, cv2.COLOR_BGR2GRAY)

        if deskew_info['confidence'] < 0.5:
            warnings.append(f"倾斜校正置信度低 ({deskew_info['confidence']:.2f})")

        self.logger.info(f"倾斜校正: 角度={deskew_info['angle']:.2f}°, 置信度={deskew_info['confidence']:.2f}")

        # 5. 网格检测(多方法)
        detector = GridDetector(params)
        grid_info = detector.detect(gray_corrected)

        if grid_info.confidence < 0.5:
            warnings.append(
                f"网格检测置信度低 ({grid_info.confidence:.2f})。"
                f"标定可能不准确。"
            )

        self.logger.info(
            f"网格: 间距={grid_info.small_box_px:.1f}px, "
            f"置信度={grid_info.confidence:.2f}, "
            f"方法={grid_info.detection_method}"
        )

        # 6. 网格去除（根据选择的方法）
        if self.grid_removal_method == 'color':
            # 新方法：基于颜色分离
            self.logger.info(f"使用颜色分离方法去除网格（激进模式={'开' if self.aggressive_grid_removal else '关'}）")

            color_remover = ColorBasedGridRemover(params)
            img_grid_removed = color_remover.remove_grid(
                img_corrected,
                grid_info,
                aggressive=self.aggressive_grid_removal
            )

            # 用于调试的中间结果
            grid_mask = color_remover.get_grid_removal_mask(
                img_corrected,
                grid_info,
                aggressive=self.aggressive_grid_removal
            )
            protect_mask = None  # 颜色方法不需要单独的保护掩码
            trace_hint = None

        else:
            # 原方法：形态学+inpainting
            self.logger.info("使用形态学+修复方法去除网格")

            extractor = TraceExtractor(params, self.fallback_strategy)

            # 提取描迹提示
            trace_hint = extractor.extract_trace_hint(img_corrected, gray_corrected)

            # 保护掩码
            protect_mask = extractor.get_protection_mask(trace_hint, grid_info)

            # 网格掩码
            grid_mask = extractor.detect_grid_mask(gray_corrected, grid_info)

            # 修复
            img_grid_removed = extractor.inpaint_grid(
                img_corrected, grid_mask, protect_mask, grid_info
            )

        # 7. 对比度增强
        lab = cv2.cvtColor(img_grid_removed, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        l_enhanced = clahe.apply(l)
        lab_enhanced = cv2.merge([l_enhanced, a, b])
        img_enhanced = cv2.cvtColor(lab_enhanced, cv2.COLOR_LAB2BGR)

        # 8. 最终描迹掩码
        # 需要创建extractor实例（如果使用颜色方法的话）
        if self.grid_removal_method == 'color':
            extractor = TraceExtractor(params, self.fallback_strategy)

        trace_mask = extractor.extract_final_mask(img_enhanced, grid_info)

        # 9. 质量评估
        trace_quality = QualityAssessor.assess_trace_quality(trace_mask, img.shape)

        if trace_quality['continuity'] < 0.7:
            warnings.append(
                f"描迹连续性低 ({trace_quality['continuity']:.2f})。"
                f"信号可能不完整。"
            )

        quality_scores = QualityAssessor.compute_overall_quality(
            img_quality,
            grid_info.confidence,
            trace_quality['continuity']
        )

        self.logger.info(f"质量: 总体={quality_scores.overall:.2f}")

        # 10. 存储实例状态用于信号提取
        self.preproc_img = img_enhanced
        self.trace_mask = trace_mask
        self.grid_info = grid_info

        # 11. 构建结果
        result = {
            'preproc_img': img_enhanced,
            'trace_mask': trace_mask,
            'grid_info': grid_info.to_dict(),
            'quality_scores': quality_scores.to_dict(),
            'warnings': warnings,
            'intermediate_results': {
                'deskew_info': deskew_info,
                'trace_hint': trace_hint,
                'protect_mask': protect_mask,
                'grid_mask': grid_mask,
                'trace_quality': trace_quality
            }
        }

        return result

    def extract_signals(
        self,
        multi_lead: bool = True,
        apply_filtering: bool = False
    ) -> List[LeadSignal]:
        """
        预处理后提取心电信号

        必须在process()之后调用以获得有效的trace_mask和grid_info

        参数:
            multi_lead: 是否检测并提取多个导联
            apply_filtering: 是否应用后处理滤波器(未实现)

        返回:
            LeadSignal对象列表

        抛出:
            RuntimeError: 如果尚未调用process()
        """
        if self.trace_mask is None:
            raise RuntimeError(
                "必须在extract_signals()之前调用process()。"
                "trace_mask不可用。"
            )

        self.logger.info("=== 开始信号提取 ===")

        # 1. 检测标定脉冲
        calibration_detector = CalibrationPulseDetector(self.grid_info, self.logger)
        calibration = calibration_detector.detect(self.preproc_img, self.trace_mask)

        self.logger.info(
            f"标定: pulse_detected={calibration.pulse_detected}, "
            f"置信度={calibration.confidence:.2f}, "
            f"mV_per_pixel={calibration.mV_per_pixel:.4f}"
        )

        # 2. 提取信号
        signal_extractor = SignalExtractor(calibration, self.grid_info, self.logger)
        signals = signal_extractor.extract_signals(self.trace_mask, multi_lead=multi_lead)

        self.logger.info(f"已提取 {len(signals)} 个导联信号")

        # 3. 可选的后处理(尚未实现)
        if apply_filtering:
            self.logger.warning("信号滤波尚未实现,返回原始信号")

        return signals


# ============================================================================
# 向后兼容接口
# ============================================================================

def preproc_ecg_image(path: str, **kwargs) -> Dict:
    """
    匹配原始PoC的向后兼容接口

    参数:
        path: 心电图图像路径
        **kwargs: ECGPreprocessor的可选参数

    返回:
        包含preproc_img, trace_mask, grid_info, warnings的字典
    """
    preprocessor = ECGPreprocessor(**kwargs)
    result = preprocessor.process(path)

    # 匹配原始接口
    return {
        'preproc_img': result['preproc_img'],
        'trace_mask': result['trace_mask'],
        'grid_info': result['grid_info'],
        'warnings': result['warnings']
    }


# ============================================================================
# 主入口点
# ============================================================================

if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("用法: python ecg_preproc_optimized.py <心电图图像路径> [选项]")
        print("\n可选标志:")
        print("  --verbose              启用详细日志")
        print("  --debug                保存中间结果")
        print("  --method=<方法>        网格去除方法: 'color'(默认) 或 'morphology'")
        print("  --aggressive           激进模式（更彻底去除网格，可能影响细trace）")
        print("\n示例:")
        print("  python ecg_preproc_optimized.py ecg1.png --verbose")
        print("  python ecg_preproc_optimized.py ecg1.png --method=color --aggressive")
        print("  python ecg_preproc_optimized.py ecg1.png --method=morphology")
        sys.exit(1)

    path = sys.argv[1]
    verbose = '--verbose' in sys.argv
    debug = '--debug' in sys.argv
    aggressive = '--aggressive' in sys.argv

    # 解析方法参数
    grid_removal_method = 'color'  # 默认使用颜色方法
    for arg in sys.argv:
        if arg.startswith('--method='):
            grid_removal_method = arg.split('=')[1]
            if grid_removal_method not in ['color', 'morphology']:
                print(f"错误: 无效的方法 '{grid_removal_method}'。必须是 'color' 或 'morphology'")
                sys.exit(1)

    # 处理
    preprocessor = ECGPreprocessor(
        verbose=verbose,
        grid_removal_method=grid_removal_method,
        aggressive_grid_removal=aggressive
    )
    result = preprocessor.process(path)

    # 保存输出
    cv2.imwrite('preproc.png', result['preproc_img'])
    cv2.imwrite('mask.png', result['trace_mask'])

    print("\n=== 心电图预处理结果 ===")
    print(f"网格信息: {result['grid_info']}")
    print(f"质量分数: {result['quality_scores']}")

    if result['warnings']:
        print("\n警告:")
        for warning in result['warnings']:
            print(f"  - {warning}")

    # 提取信号
    print("\n=== 信号提取 ===")
    signals = preprocessor.extract_signals(multi_lead=True)

    for i, lead in enumerate(signals):
        print(f"\n导联 {i+1}:")
        print(f"  采样点数: {len(lead.signal_mv)}")
        print(f"  持续时间: {lead.time_s[-1]:.2f} s")
        print(f"  幅度范围: [{lead.signal_mv.min():.2f}, {lead.signal_mv.max():.2f}] mV")
        print(f"  采样率: {lead.sampling_rate:.1f} Hz")
        print(f"  覆盖率: {lead.coverage:.1%}")
        print(f"  质量分数: {lead.quality_score:.2f}")

    if debug:
        # 保存中间结果
        inter = result['intermediate_results']
        cv2.imwrite('debug_trace_hint.png', inter['trace_hint'])
        cv2.imwrite('debug_protect_mask.png', inter['protect_mask'])
        cv2.imwrite('debug_grid_mask.png', inter['grid_mask'])
        print("\n调试图像已保存 (debug_*.png)")

    print("\n输出图像已保存: preproc.png, mask.png")
