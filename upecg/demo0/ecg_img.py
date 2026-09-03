import cv2
import numpy as np
from scipy import signal, ndimage
from scipy.interpolate import interp1d
import matplotlib.pyplot as plt
from typing import Dict, List, Tuple, Optional
import pandas as pd


class ECGImageExtractor:
    """
    从心电图图像中提取信号的完整解决方案
    支持标准12导联心电图截图
    """
    
    def __init__(self, 
                 paper_speed: float = 25.0,  # mm/s
                 paper_gain: float = 10.0,   # mm/mV
                 sampling_rate: int = 500):   # Hz
        """
        初始化提取器
        
        Args:
            paper_speed: 走纸速度 (mm/s)，标准为25或50
            paper_gain: 增益 (mm/mV)，标准为10
            sampling_rate: 目标采样率 (Hz)
        """
        self.paper_speed = paper_speed
        self.paper_gain = paper_gain
        self.sampling_rate = sampling_rate
        
        # 标准心电图网格参数
        self.small_grid_mm = 1.0  # 小格1mm
        self.large_grid_mm = 5.0  # 大格5mm
        
        self.image = None
        self.gray_image = None
        self.grid_removed = None
        self.signals = {}
        self.lead_positions = {}
        
        # 标准12导联名称
        self.standard_leads = ['I', 'II', 'III', 'aVR', 'aVL', 'aVF',
                              'V1', 'V2', 'V3', 'V4', 'V5', 'V6']
    
    def load_image(self, image_path: str):
        """
        加载心电图图像
        
        Args:
            image_path: 图像文件路径
        """
        self.image = cv2.imread(image_path)
        if self.image is None:
            raise ValueError(f"无法加载图像: {image_path}")
        
        self.gray_image = cv2.cvtColor(self.image, cv2.COLOR_BGR2GRAY)
        print(f"✓ 图像加载成功: {self.image.shape}")
        
        return self.image
    
    def detect_grid_spacing(self) -> Tuple[float, float]:
        """
        自动检测网格间距（像素）
        
        Returns:
            (horizontal_spacing, vertical_spacing) 像素间距
        """
        # 使用霍夫变换检测网格线
        edges = cv2.Canny(self.gray_image, 30, 100)
        
        # 检测水平线
        horizontal_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (40, 1))
        horizontal_lines = cv2.morphologyEx(edges, cv2.MORPH_OPEN, horizontal_kernel)
        
        # 检测垂直线
        vertical_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, 40))
        vertical_lines = cv2.morphologyEx(edges, cv2.MORPH_OPEN, vertical_kernel)
        
        # 计算水平方向的网格间距
        h_projection = np.sum(horizontal_lines, axis=1)
        h_peaks, _ = signal.find_peaks(h_projection, distance=10)
        if len(h_peaks) > 1:
            h_spacing = np.median(np.diff(h_peaks))
        else:
            h_spacing = 20  # 默认值
        
        # 计算垂直方向的网格间距
        v_projection = np.sum(vertical_lines, axis=0)
        v_peaks, _ = signal.find_peaks(v_projection, distance=10)
        if len(v_peaks) > 1:
            v_spacing = np.median(np.diff(v_peaks))
        else:
            v_spacing = 20  # 默认值
        
        print(f"✓ 检测到网格间距: 水平={h_spacing:.1f}px, 垂直={v_spacing:.1f}px")
        
        # 估计大格的像素数（5个小格）
        self.pixels_per_large_grid_h = h_spacing * 5
        self.pixels_per_large_grid_v = v_spacing * 5
        self.pixels_per_mm_h = h_spacing
        self.pixels_per_mm_v = v_spacing
        
        return h_spacing, v_spacing
    
    def remove_grid(self, 
                   method: str = 'morphology',
                   grid_color_threshold: int = 180) -> np.ndarray:
        """
        去除网格线，保留心电波形
        
        Args:
            method: 去除方法 ('morphology', 'color', 'adaptive')
            grid_color_threshold: 网格颜色阈值（用于color方法）
            
        Returns:
            去除网格后的图像
        """
        if method == 'color':
            # 基于颜色的网格去除（适用于彩色网格）
            # 将粉红色网格变为白色
            hsv = cv2.cvtColor(self.image, cv2.COLOR_BGR2HSV)
            
            # 定义粉红色范围
            lower_pink = np.array([140, 20, 100])
            upper_pink = np.array([180, 255, 255])
            
            mask = cv2.inRange(hsv, lower_pink, upper_pink)
            self.grid_removed = self.gray_image.copy()
            self.grid_removed[mask > 0] = 255
            
        elif method == 'morphology':
            # 基于形态学的网格去除
            # 二值化
            _, binary = cv2.threshold(self.gray_image, 0, 255, 
                                     cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            
            # 反转（让波形为白色）
            binary_inv = cv2.bitwise_not(binary)
            
            # 检测并去除细线（网格）
            # 水平线
            horizontal_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (40, 1))
            horizontal_lines = cv2.morphologyEx(binary_inv, cv2.MORPH_OPEN, 
                                               horizontal_kernel, iterations=2)
            
            # 垂直线
            vertical_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, 40))
            vertical_lines = cv2.morphologyEx(binary_inv, cv2.MORPH_OPEN, 
                                             vertical_kernel, iterations=2)
            
            # 组合网格线
            grid_lines = cv2.add(horizontal_lines, vertical_lines)
            
            # 从原图中去除网格
            self.grid_removed = cv2.subtract(binary_inv, grid_lines)
            
        elif method == 'adaptive':
            # 自适应方法：结合颜色和形态学
            # 先用颜色方法
            gray_filtered = self.gray_image.copy()
            
            # 将浅色区域（网格）增强为白色
            gray_filtered[gray_filtered > grid_color_threshold] = 255
            
            # 再用形态学清理
            _, binary = cv2.threshold(gray_filtered, 127, 255, cv2.THRESH_BINARY_INV)
            
            # 去除小的噪点
            kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
            self.grid_removed = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel)
        
        print(f"✓ 网格去除完成 (方法: {method})")
        
        return self.grid_removed
    
    def detect_lead_regions(self, n_leads: int = 12) -> Dict[str, Tuple]:
        """
        检测各个导联的位置
        
        Args:
            n_leads: 导联数量（通常为12）
            
        Returns:
            导联名称到位置(y_start, y_end)的字典
        """
        height, width = self.gray_image.shape
        
        # 通常12导联分为两列或多行
        # 简化处理：平均分割
        if n_leads == 12:
            # 常见布局：每行2-3个导联，共4-6行
            # 或者单列12个导联
            
            # 检测波形密集区域
            # 计算每行的黑色像素数量
            if self.grid_removed is not None:
                work_image = self.grid_removed
            else:
                work_image = self.gray_image
            
            row_projection = np.sum(work_image < 200, axis=1)
            
            # 平滑投影
            row_projection_smooth = ndimage.gaussian_filter1d(row_projection, sigma=10)
            
            # 找到波形区域（投影值较高的区域）
            threshold = np.mean(row_projection_smooth) * 0.5
            wave_regions = row_projection_smooth > threshold
            
            # 找到连续区域
            labeled, num_features = ndimage.label(wave_regions)
            
            lead_regions = []
            for i in range(1, num_features + 1):
                region_indices = np.where(labeled == i)[0]
                if len(region_indices) > 50:  # 过滤太小的区域
                    y_start = region_indices[0]
                    y_end = region_indices[-1]
                    lead_regions.append((y_start, y_end))
            
            # 排序并分配给导联
            lead_regions.sort(key=lambda x: x[0])
            
            # 如果检测到的区域数量不等于导联数，使用均匀分割
            if len(lead_regions) != n_leads:
                print(f"  警告: 检测到{len(lead_regions)}个区域，使用均匀分割")
                lead_height = height // n_leads
                lead_regions = [(i * lead_height, (i + 1) * lead_height) 
                               for i in range(n_leads)]
            
            # 分配导联名称
            for i, lead_name in enumerate(self.standard_leads[:n_leads]):
                if i < len(lead_regions):
                    self.lead_positions[lead_name] = lead_regions[i]
        
        print(f"✓ 检测到 {len(self.lead_positions)} 个导联区域")
        
        return self.lead_positions
    
    def extract_waveform_from_region(self, 
                                    region: Tuple[int, int],
                                    lead_name: str) -> np.ndarray:
        """
        从指定区域提取波形信号
        
        Args:
            region: (y_start, y_end) 区域坐标
            lead_name: 导联名称
            
        Returns:
            归一化的信号数组
        """
        y_start, y_end = region
        
        if self.grid_removed is not None:
            roi = self.grid_removed[y_start:y_end, :]
        else:
            roi = self.gray_image[y_start:y_end, :]
            _, roi = cv2.threshold(roi, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
        
        # 骨架化提取中心线
        skeleton = cv2.ximgproc.thinning(roi) if hasattr(cv2, 'ximgproc') else roi
        
        # 对每一列找到波形的位置
        height, width = skeleton.shape
        signal_points = []
        
        for x in range(width):
            column = skeleton[:, x]
            # 找到该列中的波形点
            wave_pixels = np.where(column > 0)[0]
            
            if len(wave_pixels) > 0:
                # 使用中位数作为该点的位置
                y_pos = np.median(wave_pixels)
                signal_points.append(y_pos)
            else:
                # 如果该列没有波形，使用插值
                if len(signal_points) > 0:
                    signal_points.append(signal_points[-1])
                else:
                    signal_points.append(height / 2)
        
        signal_points = np.array(signal_points)
        
        # 转换为心电信号值（反转Y轴，归一化）
        # Y轴向下是正，需要反转
        signal_normalized = (height / 2 - signal_points) / self.pixels_per_mm_v
        
        # 转换为mV（使用标准增益）
        signal_mv = signal_normalized / self.paper_gain
        
        # 平滑处理
        if len(signal_mv) > 10:
            signal_mv = ndimage.gaussian_filter1d(signal_mv, sigma=1)
        
        print(f"  导联 {lead_name}: 提取 {len(signal_mv)} 个采样点")
        
        return signal_mv
    
    def extract_all_leads(self) -> Dict[str, np.ndarray]:
        """
        提取所有导联的信号
        
        Returns:
            导联名称到信号数组的字典
        """
        if not self.lead_positions:
            self.detect_lead_regions()
        
        print("\n开始提取信号...")
        
        for lead_name, region in self.lead_positions.items():
            try:
                signal_data = self.extract_waveform_from_region(region, lead_name)
                
                # 重采样到标准采样率
                original_length = len(signal_data)
                original_time = original_length / (self.pixels_per_mm_h * self.paper_speed)
                target_length = int(original_time * self.sampling_rate)
                
                if target_length > 0 and original_length > 1:
                    x_old = np.linspace(0, 1, original_length)
                    x_new = np.linspace(0, 1, target_length)
                    f = interp1d(x_old, signal_data, kind='cubic', fill_value='extrapolate')
                    signal_resampled = f(x_new)
                    
                    self.signals[lead_name] = signal_resampled
                else:
                    self.signals[lead_name] = signal_data
                    
            except Exception as e:
                print(f"  ✗ 导联 {lead_name} 提取失败: {str(e)}")
        
        print(f"\n✓ 成功提取 {len(self.signals)} 个导联")
        
        return self.signals
    
    def preprocess_signals(self, 
                          bandpass: bool = True,
                          lowcut: float = 0.5,
                          highcut: float = 40.0) -> Dict[str, np.ndarray]:
        """
        预处理提取的信号
        
        Args:
            bandpass: 是否应用带通滤波
            lowcut: 低截止频率
            highcut: 高截止频率
            
        Returns:
            预处理后的信号字典
        """
        processed = {}
        
        for lead_name, sig in self.signals.items():
            # 去除趋势
            sig_detrend = signal.detrend(sig)
            
            # 带通滤波
            if bandpass and len(sig) > 100:
                sos = signal.butter(4, [lowcut, highcut], 
                                   btype='band', 
                                   fs=self.sampling_rate, 
                                   output='sos')
                sig_filtered = signal.sosfiltfilt(sos, sig_detrend)
            else:
                sig_filtered = sig_detrend
            
            processed[lead_name] = sig_filtered
        
        print("✓ 信号预处理完成")
        
        return processed
    
    def visualize_extraction_steps(self):
        """
        可视化提取过程的各个步骤
        """
        fig, axes = plt.subplots(2, 2, figsize=(15, 10))
        
        # 原始图像
        axes[0, 0].imshow(cv2.cvtColor(self.image, cv2.COLOR_BGR2RGB))
        axes[0, 0].set_title('原始心电图图像', fontsize=12, fontweight='bold')
        axes[0, 0].axis('off')
        
        # 灰度图
        axes[0, 1].imshow(self.gray_image, cmap='gray')
        axes[0, 1].set_title('灰度图', fontsize=12, fontweight='bold')
        axes[0, 1].axis('off')
        
        # 去网格后
        if self.grid_removed is not None:
            axes[1, 0].imshow(self.grid_removed, cmap='gray')
            axes[1, 0].set_title('去除网格后', fontsize=12, fontweight='bold')
            axes[1, 0].axis('off')
        
        # 导联区域标注
        img_with_regions = cv2.cvtColor(self.image.copy(), cv2.COLOR_BGR2RGB)
        for lead_name, (y_start, y_end) in self.lead_positions.items():
            cv2.rectangle(img_with_regions, (0, y_start), 
                         (img_with_regions.shape[1], y_end), (255, 0, 0), 2)
            cv2.putText(img_with_regions, lead_name, (10, y_start + 20),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 0), 2)
        
        axes[1, 1].imshow(img_with_regions)
        axes[1, 1].set_title('导联区域检测', fontsize=12, fontweight='bold')
        axes[1, 1].axis('off')
        
        plt.tight_layout()
        plt.show()
    
    def plot_extracted_signals(self, leads: Optional[List[str]] = None, 
                              duration: Optional[float] = None):
        """
        绘制提取的信号
        
        Args:
            leads: 要绘制的导联列表（None表示全部）
            duration: 显示时长（秒）
        """
        if not self.signals:
            print("错误: 还没有提取信号")
            return
        
        if leads is None:
            leads = list(self.signals.keys())
        
        n_leads = len(leads)
        fig, axes = plt.subplots(n_leads, 1, figsize=(14, 2*n_leads))
        
        if n_leads == 1:
            axes = [axes]
        
        for i, lead_name in enumerate(leads):
            if lead_name not in self.signals:
                continue
            
            sig = self.signals[lead_name]
            
            if duration:
                n_samples = int(duration * self.sampling_rate)
                sig = sig[:min(n_samples, len(sig))]
            
            time_axis = np.arange(len(sig)) / self.sampling_rate
            
            axes[i].plot(time_axis, sig, linewidth=0.8, color='#1e40af')
            axes[i].set_ylabel(f'{lead_name}\n(mV)', fontsize=10)
            axes[i].grid(True, alpha=0.3, linestyle='--')
            axes[i].set_xlim(0, time_axis[-1])
            
            if i < n_leads - 1:
                axes[i].set_xticks([])
        
        axes[-1].set_xlabel('时间 (秒)', fontsize=11)
        fig.suptitle('提取的心电信号', fontsize=14, fontweight='bold')
        
        plt.tight_layout()
        plt.show()
    
    def export_to_csv(self, output_path: str):
        """
        导出信号到CSV文件
        
        Args:
            output_path: 输出文件路径
        """
        if not self.signals:
            print("错误: 还没有提取信号")
            return
        
        # 找到最长的信号
        max_length = max(len(sig) for sig in self.signals.values())
        
        # 创建时间轴
        time_axis = np.arange(max_length) / self.sampling_rate
        
        # 构建DataFrame
        data = {'Time(s)': time_axis}
        
        for lead_name, sig in self.signals.items():
            # 填充到相同长度
            padded_sig = np.pad(sig, (0, max_length - len(sig)), 
                               mode='constant', constant_values=np.nan)
            data[lead_name] = padded_sig
        
        df = pd.DataFrame(data)
        df.to_csv(output_path, index=False)
        
        print(f"✓ 信号已导出到: {output_path}")
    
    def get_signal_quality_metrics(self) -> Dict:
        """
        评估信号提取质量
        
        Returns:
            质量指标字典
        """
        metrics = {}
        
        for lead_name, sig in self.signals.items():
            metrics[lead_name] = {
                'length': len(sig),
                'duration_s': len(sig) / self.sampling_rate,
                'mean': np.mean(sig),
                'std': np.std(sig),
                'snr_db': 20 * np.log10(np.std(sig) / (np.std(np.diff(sig)) + 1e-10))
            }
        
        return metrics


# 完整使用流程
def process_ecg_image(image_path: str, 
                     paper_speed: float = 25.0,
                     sampling_rate: int = 500,
                     output_csv: Optional[str] = None):
    """
    完整的心电图图像处理流程
    
    Args:
        image_path: 图像路径
        paper_speed: 走纸速度 (mm/s)
        sampling_rate: 采样率 (Hz)
        output_csv: CSV输出路径（可选）
    """
    print("=" * 60)
    print("心电图图像信号提取")
    print("=" * 60)
    
    # 初始化提取器
    extractor = ECGImageExtractor(
        paper_speed=paper_speed,
        sampling_rate=sampling_rate
    )
    
    # 1. 加载图像
    print("\n[步骤 1/6] 加载图像...")
    extractor.load_image(image_path)
    
    # 2. 检测网格
    print("\n[步骤 2/6] 检测网格参数...")
    extractor.detect_grid_spacing()
    
    # 3. 去除网格
    print("\n[步骤 3/6] 去除网格线...")
    extractor.remove_grid(method='adaptive')
    
    # 4. 检测导联
    print("\n[步骤 4/6] 检测导联区域...")
    extractor.detect_lead_regions()
    
    # 5. 提取信号
    print("\n[步骤 5/6] 提取信号...")
    signals = extractor.extract_all_leads()
    
    # 6. 预处理
    print("\n[步骤 6/6] 信号预处理...")
    processed_signals = extractor.preprocess_signals()
    extractor.signals = processed_signals
    
    # 显示结果
    print("\n" + "=" * 60)
    print("提取完成!")
    print("=" * 60)
    
    # 质量评估
    print("\n信号质量评估:")
    metrics = extractor.get_signal_quality_metrics()
    for lead, metric in list(metrics.items())[:3]:  # 显示前3个
        print(f"\n{lead}:")
        print(f"  时长: {metric['duration_s']:.2f}秒")
        print(f"  SNR: {metric['snr_db']:.1f} dB")
    
    # 导出
    if output_csv:
        extractor.export_to_csv(output_csv)
    
    return extractor


# 使用示例
if __name__ == "__main__":
    # 处理你上传的心电图图像
    print("""
使用方法:
    
    extractor = process_ecg_image(
        image_path='ecg_image.png',  # 你的心电图图像路径
        paper_speed=25.0,             # 标准走纸速度
        sampling_rate=500,            # 目标采样率
        output_csv='extracted_ecg.csv'  # 输出文件
    )
    
    # 可视化提取过程
    extractor.visualize_extraction_steps()
    
    # 绘制提取的信号
    extractor.plot_extracted_signals(duration=5.0)
    
    # 访问特定导联
    lead_ii_signal = extractor.signals['II']
    """)
    
    extractor = process_ecg_image(
        image_path='ecg1.png',  # 你的心电图图像路径
        paper_speed=25.0,             # 标准走纸速度
        sampling_rate=250,            # 目标采样率
        output_csv='extracted_ecg.csv'  # 输出文件
    )
    
    # 可视化提取过程
    extractor.visualize_extraction_steps()
    
    # 绘制提取的信号
    extractor.plot_extracted_signals(duration=5.0)
    
    # 访问特定导联
    lead_ii_signal = extractor.signals['II']

    print("\n提示: 请将图像路径替换为实际文件路径")
    print("建议图像要求:")
    print("  - 分辨率: 至少 1000x800 像素")
    print("  - 格式: PNG, JPG")
    print("  - 清晰度: 波形线条清晰，无模糊")
    print("  - 对比度: 波形与背景有明显区分")
