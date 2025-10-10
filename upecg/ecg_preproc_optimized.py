"""
ECG Image Preprocessing - Optimized Version
===========================================

Production-grade ECG signal extraction with:
- Modular architecture
- Multi-method grid detection fusion
- Adaptive parameters
- Quality assessment framework
- Robust error handling

Author: Claude Code (Optimized from PoC)
"""

import cv2
import numpy as np
from skimage.morphology import skeletonize
from scipy.signal import find_peaks
from scipy.ndimage import gaussian_filter1d
from typing import Dict, Optional, Tuple, List
import logging
from dataclasses import dataclass
from enum import Enum


# ============================================================================
# Configuration & Data Structures
# ============================================================================

class FallbackStrategy(Enum):
    CONSERVATIVE = "conservative"  # High recall, may include noise
    BALANCED = "balanced"          # Balance precision/recall
    AGGRESSIVE = "aggressive"      # High precision, may miss trace


@dataclass
class QualityScores:
    """Quality assessment scores for different processing stages"""
    image_quality: float  # 0-1, input image quality
    grid_detection: float  # 0-1, grid detection confidence
    trace_protection: float  # 0-1, trace protection reliability
    trace_continuity: float  # 0-1, final trace continuity
    overall: float  # 0-1, weighted average

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
    """Grid calibration information"""
    small_box_px: float
    pixels_per_mm_est: float
    confidence: float
    detection_method: str
    paper_speed_mm_s: float = 25.0  # Standard 25mm/s
    voltage_scale_mm_mV: float = 10.0  # Standard 10mm/mV

    def to_dict(self) -> Dict:
        return {
            'small_box_px': float(self.small_box_px),
            'pixels_per_mm_est': float(self.pixels_per_mm_est),
            'confidence': float(self.confidence),
            'detection_method': self.detection_method,
            'paper_speed_mm_s': float(self.paper_speed_mm_s),
            'voltage_scale_mm_mV': float(self.voltage_scale_mm_mV)
        }


# ============================================================================
# Adaptive Parameters
# ============================================================================

class AdaptiveParams:
    """Automatically scale parameters based on image resolution"""

    def __init__(self, img_shape: Tuple[int, int], base_resolution: int = 1500):
        self.height, self.width = img_shape[:2]
        self.scale = min(self.height, self.width) / base_resolution
        self.scale = max(0.3, min(self.scale, 3.0))  # Clamp to reasonable range

    def canny_thresholds(self, gray: np.ndarray) -> Tuple[int, int]:
        """Adaptive Canny thresholds based on image statistics"""
        median_val = np.median(gray)
        lower = int(max(0, 0.66 * median_val))
        upper = int(min(255, 1.33 * median_val))
        return lower, upper

    def hough_threshold(self) -> int:
        """Adaptive Hough transform threshold"""
        return max(100, int(self.width * self.scale / 20))

    def hough_min_line_length(self) -> int:
        """Minimum line length for Hough detection"""
        return max(50, int(self.width * self.scale / 6))

    def adaptive_block_size(self, grid_px: float, multiplier: float = 2.5) -> int:
        """Adaptive block size for threshold operations"""
        block = int(grid_px * multiplier)
        return block if block % 2 == 1 else block + 1

    def morphology_kernel_size(self, grid_px: float, ratio: float = 0.4) -> int:
        """Kernel size for morphological operations"""
        return max(3, int(grid_px * ratio))


# ============================================================================
# Image Validator
# ============================================================================

class ImageValidator:
    """Validate input image quality and properties"""

    MIN_RESOLUTION = 600
    RECOMMENDED_RESOLUTION = 1500

    @staticmethod
    def validate(img: np.ndarray) -> Tuple[bool, List[str], float]:
        """
        Validate image quality

        Returns:
            (is_valid, warnings, quality_score)
        """
        warnings = []
        scores = []

        # Check resolution
        h, w = img.shape[:2]
        min_dim = min(h, w)

        if min_dim < ImageValidator.MIN_RESOLUTION:
            warnings.append(f"Low resolution ({min_dim}px). Minimum {ImageValidator.MIN_RESOLUTION}px recommended.")
            res_score = min_dim / ImageValidator.MIN_RESOLUTION
        elif min_dim < ImageValidator.RECOMMENDED_RESOLUTION:
            warnings.append(f"Below recommended resolution. {ImageValidator.RECOMMENDED_RESOLUTION}px ideal.")
            res_score = 0.7 + 0.3 * (min_dim / ImageValidator.RECOMMENDED_RESOLUTION)
        else:
            res_score = 1.0
        scores.append(res_score)

        # Check if image is blank or corrupted
        if img.size == 0:
            return False, ["Image is empty or corrupted"], 0.0

        # Check brightness distribution
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) if len(img.shape) == 3 else img
        mean_brightness = np.mean(gray)
        std_brightness = np.std(gray)

        if mean_brightness < 30 or mean_brightness > 225:
            warnings.append(f"Unusual brightness (mean={mean_brightness:.0f}). May affect detection.")
            brightness_score = 0.5
        else:
            brightness_score = 1.0
        scores.append(brightness_score)

        # Check contrast
        if std_brightness < 20:
            warnings.append("Low contrast detected. Trace extraction may be difficult.")
            contrast_score = 0.5
        else:
            contrast_score = min(1.0, std_brightness / 50)
        scores.append(contrast_score)

        # Overall quality
        quality_score = np.mean(scores)
        is_valid = quality_score >= 0.3  # Very lenient threshold

        return is_valid, warnings, quality_score


# ============================================================================
# Geometric Corrector
# ============================================================================

class GeometricCorrector:
    """Correct image geometry (deskew, perspective)"""

    def __init__(self, params: AdaptiveParams):
        self.params = params

    def deskew(self, img: np.ndarray, gray: np.ndarray) -> Tuple[np.ndarray, Dict]:
        """
        Deskew image using Hough line detection

        Returns:
            (deskewed_image, info_dict)
        """
        # Edge detection with adaptive thresholds
        lower, upper = self.params.canny_thresholds(gray)
        edges = cv2.Canny(gray, lower, upper)

        # Hough line detection
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

        # Extract angles from near-horizontal lines
        angles = []
        for line in lines[:, 0]:
            x1, y1, x2, y2 = line
            angle = np.degrees(np.arctan2(y2 - y1, x2 - x1))
            # Keep angles close to horizontal
            if abs(angle) < 45:
                angles.append(angle)

        if len(angles) == 0:
            return img, {'angle': 0.0, 'confidence': 0.0, 'method': 'insufficient_lines'}

        # Use median angle (robust to outliers)
        angle_deg = np.median(angles)
        confidence = 1.0 - min(np.std(angles) / 10.0, 1.0)  # Lower std = higher confidence

        # Only rotate if angle is significant
        if abs(angle_deg) < 0.5:
            return img, {'angle': angle_deg, 'confidence': confidence, 'method': 'skipped_small_angle'}

        # Rotate image
        h, w = img.shape[:2]
        center = (w // 2, h // 2)
        M = cv2.getRotationMatrix2D(center, angle_deg, 1.0)

        # Handle both color and grayscale
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
# Grid Detector (Multi-method Fusion)
# ============================================================================

class GridDetector:
    """Detect grid spacing using multiple methods and fusion"""

    def __init__(self, params: AdaptiveParams):
        self.params = params

    def detect(self, gray: np.ndarray) -> Optional[GridInfo]:
        """
        Detect grid using multi-method fusion

        Returns:
            GridInfo or None if detection fails
        """
        results = []

        # Method A: Projection analysis
        result_proj = self._detect_projection(gray)
        if result_proj:
            results.append(result_proj)

        # Method B: Hough line clustering
        result_hough = self._detect_hough(gray)
        if result_hough:
            results.append(result_hough)

        # Fusion strategy
        if len(results) == 0:
            return self._fallback_estimate(gray)
        elif len(results) == 1:
            return results[0]
        else:
            return self._fuse_results(results)

    def _detect_projection(self, gray: np.ndarray) -> Optional[GridInfo]:
        """Method A: Vertical and horizontal projection analysis"""
        h, w = gray.shape

        # Vertical projection (detect vertical lines)
        proj_v = np.mean(255 - gray, axis=0)
        proj_v_smooth = gaussian_filter1d(proj_v, sigma=2.0)

        # Adaptive peak detection
        prominence = np.percentile(proj_v_smooth, 75) - np.percentile(proj_v_smooth, 50)
        peaks_v, _ = find_peaks(
            proj_v_smooth,
            distance=5,
            prominence=max(prominence * 0.4, 5)
        )

        # Horizontal projection (detect horizontal lines)
        proj_h = np.mean(255 - gray, axis=1)
        proj_h_smooth = gaussian_filter1d(proj_h, sigma=2.0)
        peaks_h, _ = find_peaks(
            proj_h_smooth,
            distance=5,
            prominence=max(prominence * 0.4, 5)
        )

        # Need sufficient peaks
        if len(peaks_v) < 4 or len(peaks_h) < 4:
            return None

        # Compute spacings
        diffs_v = np.diff(peaks_v)
        diffs_h = np.diff(peaks_h)

        # Use median (robust to outliers)
        small_v = np.median(diffs_v)
        small_h = np.median(diffs_h)

        # Check consistency
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
        """Method B: Hough line detection and clustering"""
        edges = cv2.Canny(gray, 50, 150)

        # Detect lines
        lines = cv2.HoughLines(edges, 1, np.pi/180, threshold=100)

        if lines is None or len(lines) < 8:
            return None

        # Separate vertical and horizontal lines
        vertical_rhos = []
        horizontal_rhos = []

        for line in lines[:, 0]:
            rho, theta = line
            angle_deg = np.degrees(theta)

            # Vertical lines (around 90°)
            if 85 <= angle_deg <= 95:
                vertical_rhos.append(abs(rho))
            # Horizontal lines (around 0° or 180°)
            elif angle_deg < 5 or angle_deg > 175:
                horizontal_rhos.append(abs(rho))

        if len(vertical_rhos) < 4 or len(horizontal_rhos) < 4:
            return None

        # Sort and compute spacings
        vertical_rhos = sorted(vertical_rhos)
        horizontal_rhos = sorted(horizontal_rhos)

        v_diffs = np.diff(vertical_rhos)
        h_diffs = np.diff(horizontal_rhos)

        # Filter outliers (very large or small spacings)
        v_diffs = v_diffs[(v_diffs > 3) & (v_diffs < 100)]
        h_diffs = h_diffs[(h_diffs > 3) & (h_diffs < 100)]

        if len(v_diffs) == 0 or len(h_diffs) == 0:
            return None

        small_v = np.median(v_diffs)
        small_h = np.median(h_diffs)
        avg_spacing = (small_v + small_h) / 2

        consistency = 1.0 - abs(small_v - small_h) / max(small_v, small_h)
        confidence = min(consistency * 0.85, 0.85)  # Slightly lower than projection

        return GridInfo(
            small_box_px=avg_spacing,
            pixels_per_mm_est=avg_spacing,
            confidence=confidence,
            detection_method='hough'
        )

    def _fuse_results(self, results: List[GridInfo]) -> GridInfo:
        """Fuse multiple detection results"""
        # Weighted average by confidence
        weights = np.array([r.confidence for r in results])
        weights = weights / np.sum(weights)

        fused_spacing = np.sum([r.small_box_px * w for r, w in zip(results, weights)])
        fused_confidence = np.mean([r.confidence for r in results])

        methods = '+'.join([r.detection_method for r in results])

        return GridInfo(
            small_box_px=fused_spacing,
            pixels_per_mm_est=fused_spacing,
            confidence=min(fused_confidence * 1.1, 0.95),  # Boost for multi-method
            detection_method=f'fusion({methods})'
        )

    def _fallback_estimate(self, gray: np.ndarray) -> GridInfo:
        """Fallback grid estimation when detection fails"""
        h, w = gray.shape
        # Heuristic: ~200 small boxes across smaller dimension
        estimated_spacing = min(h, w) / 200
        estimated_spacing = max(4, estimated_spacing)  # At least 4 pixels

        return GridInfo(
            small_box_px=estimated_spacing,
            pixels_per_mm_est=estimated_spacing,
            confidence=0.3,  # Low confidence
            detection_method='fallback_heuristic'
        )


# ============================================================================
# Trace Extractor
# ============================================================================

class TraceExtractor:
    """Extract ECG trace with protection and quality assessment"""

    def __init__(self, params: AdaptiveParams, fallback: FallbackStrategy = FallbackStrategy.BALANCED):
        self.params = params
        self.fallback = fallback

    def extract_trace_hint(self, img_color: np.ndarray, gray: np.ndarray) -> np.ndarray:
        """Extract trace hint using color and intensity analysis"""
        # Color-based detection (red traces)
        b, g, r = cv2.split(img_color)
        red_score = cv2.subtract(r, cv2.add(g, b) // 2)

        # Intensity-based detection (dark traces)
        dark_score = cv2.subtract(np.uint8(255), gray)

        # Normalize both scores
        red_norm = cv2.normalize(red_score, None, 0, 255, cv2.NORM_MINMAX)
        dark_norm = cv2.normalize(dark_score, None, 0, 255, cv2.NORM_MINMAX)

        # Combine (max preserves strongest signal)
        trace_hint = cv2.max(red_norm, dark_norm)

        # Light smoothing to reduce noise
        trace_hint = cv2.GaussianBlur(trace_hint, (3, 3), 0)

        return trace_hint

    def get_protection_mask(
        self,
        trace_hint: np.ndarray,
        grid_info: GridInfo
    ) -> np.ndarray:
        """
        Generate protection mask for trace pixels
        Uses dual-threshold strategy and adaptive dilation
        """
        small_box_px = grid_info.small_box_px
        confidence = grid_info.confidence

        # Adaptive block size
        block_size = self.params.adaptive_block_size(small_box_px, multiplier=2.5)

        # Dual threshold strategy
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

        # Morphological closing (connect broken segments)
        k_size = max(2, int(small_box_px // 4))

        # Vertical kernel
        k_v = cv2.getStructuringElement(cv2.MORPH_RECT, (1, k_size))
        closed_v = cv2.morphologyEx(th_low, cv2.MORPH_CLOSE, k_v)

        # Horizontal kernel
        k_h = cv2.getStructuringElement(cv2.MORPH_RECT, (k_size, 1))
        closed_h = cv2.morphologyEx(th_low, cv2.MORPH_CLOSE, k_h)

        # Combine both directions
        closed = cv2.bitwise_or(closed_v, closed_h)

        # Connected component filtering
        num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(closed, connectivity=8)

        mask = np.zeros_like(closed)
        for i in range(1, num_labels):
            area = stats[i, cv2.CC_STAT_AREA]
            w = stats[i, cv2.CC_STAT_WIDTH]
            h = stats[i, cv2.CC_STAT_HEIGHT]
            aspect = max(w, h) / (min(w, h) + 1e-6)

            # Improved filtering logic
            is_large = area > small_box_px * 1.5
            is_elongated = aspect > 3
            is_long = max(w, h) > small_box_px * 0.8

            if is_large or (is_elongated and is_long):
                mask[labels == i] = 255

        # Adaptive dilation based on confidence
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
        """Detect grid lines for removal"""
        small_box_px = grid_info.small_box_px

        # Adaptive threshold
        img_bin = cv2.adaptiveThreshold(
            gray, 255,
            cv2.ADAPTIVE_THRESH_MEAN_C,
            cv2.THRESH_BINARY_INV,
            51, 10
        )

        # Vertical lines
        k_size = self.params.morphology_kernel_size(small_box_px, ratio=0.5)
        vert_k = cv2.getStructuringElement(cv2.MORPH_RECT, (1, k_size))
        vert = cv2.morphologyEx(img_bin, cv2.MORPH_OPEN, vert_k)

        # Horizontal lines
        hor_k = cv2.getStructuringElement(cv2.MORPH_RECT, (k_size, 1))
        hor = cv2.morphologyEx(img_bin, cv2.MORPH_OPEN, hor_k)

        # Combine
        grid_mask = cv2.bitwise_or(vert, hor)

        return grid_mask

    def inpaint_grid(
        self,
        img: np.ndarray,
        grid_mask: np.ndarray,
        protect_mask: np.ndarray,
        grid_info: GridInfo
    ) -> np.ndarray:
        """Inpaint grid while protecting trace"""
        # Inpaint only where grid exists AND trace doesn't
        mask = cv2.bitwise_and(grid_mask, cv2.bitwise_not(protect_mask))
        mask8 = (mask > 0).astype('uint8') * 255

        # Adaptive inpaint radius
        radius = max(3, int(grid_info.small_box_px * 0.1))

        # Inpaint
        inpainted = cv2.inpaint(img, mask8, radius, cv2.INPAINT_TELEA)

        return inpainted

    def extract_final_mask(self, img: np.ndarray, grid_info: GridInfo) -> np.ndarray:
        """Extract final trace mask with skeletonization"""
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) if len(img.shape) == 3 else img

        # Adaptive threshold
        block_size = self.params.adaptive_block_size(grid_info.small_box_px, multiplier=2.0)
        th = cv2.adaptiveThreshold(
            gray, 255,
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY_INV,
            block_size, 5
        )

        # Morphological cleaning
        k_size = max(2, int(grid_info.small_box_px // 6))
        k = cv2.getStructuringElement(cv2.MORPH_RECT, (1, k_size))
        cleaned = cv2.morphologyEx(th, cv2.MORPH_OPEN, k)

        # Skeletonize
        skeleton = skeletonize((cleaned > 0).astype(np.uint8))
        skeleton = (skeleton * 255).astype(np.uint8)

        return skeleton


# ============================================================================
# Quality Assessor
# ============================================================================

class QualityAssessor:
    """Assess quality at each processing stage"""

    @staticmethod
    def assess_trace_quality(trace_mask: np.ndarray, img_shape: Tuple) -> Dict:
        """Assess final trace quality"""
        h, w = img_shape[:2]

        # Coverage ratio
        trace_pixels = np.sum(trace_mask > 0)
        coverage = trace_pixels / (h * w)

        # Continuity: fraction of columns with at least 1 trace pixel
        cols_with_trace = np.sum(np.any(trace_mask > 0, axis=0))
        continuity = cols_with_trace / w

        # Density: average trace pixels per column
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
        """Compute overall quality scores"""
        # Weighted average
        overall = (
            0.2 * img_quality +
            0.3 * grid_confidence +
            0.5 * trace_continuity
        )

        return QualityScores(
            image_quality=img_quality,
            grid_detection=grid_confidence,
            trace_protection=grid_confidence,  # Correlated with grid detection
            trace_continuity=trace_continuity,
            overall=overall
        )


# ============================================================================
# Main Preprocessor
# ============================================================================

class ECGPreprocessor:
    """
    Production-grade ECG image preprocessor

    Usage:
        preprocessor = ECGPreprocessor(verbose=True)
        result = preprocessor.process('path/to/ecg.png')
    """

    def __init__(
        self,
        quality_threshold: float = 0.3,
        fallback_strategy: FallbackStrategy = FallbackStrategy.BALANCED,
        verbose: bool = False
    ):
        self.quality_threshold = quality_threshold
        self.fallback_strategy = fallback_strategy
        self.verbose = verbose

        # Setup logging
        if verbose:
            logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)

    def process(self, path: str) -> Dict:
        """
        Process ECG image

        Returns:
            Dictionary with:
            - preproc_img: Preprocessed image
            - trace_mask: Binary trace mask
            - grid_info: Grid calibration info
            - quality_scores: Quality assessment
            - warnings: List of warnings
            - intermediate_results: Optional debug info
        """
        warnings = []

        # 1. Read image
        img = cv2.imread(path, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError(f"Failed to read image from {path}")

        # 2. Validate input
        is_valid, val_warnings, img_quality = ImageValidator.validate(img)
        warnings.extend(val_warnings)

        if not is_valid:
            raise ValueError("Input image quality too low for processing")

        # 3. Initialize adaptive parameters
        params = AdaptiveParams(img.shape)

        # 4. Geometric correction
        corrector = GeometricCorrector(params)
        gray_orig = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        img_corrected, deskew_info = corrector.deskew(img, gray_orig)
        gray_corrected = cv2.cvtColor(img_corrected, cv2.COLOR_BGR2GRAY)

        if deskew_info['confidence'] < 0.5:
            warnings.append(f"Low deskew confidence ({deskew_info['confidence']:.2f})")

        self.logger.info(f"Deskew: angle={deskew_info['angle']:.2f}°, confidence={deskew_info['confidence']:.2f}")

        # 5. Grid detection (multi-method)
        detector = GridDetector(params)
        grid_info = detector.detect(gray_corrected)

        if grid_info.confidence < 0.5:
            warnings.append(
                f"Low grid detection confidence ({grid_info.confidence:.2f}). "
                f"Calibration may be inaccurate."
            )

        self.logger.info(
            f"Grid: spacing={grid_info.small_box_px:.1f}px, "
            f"confidence={grid_info.confidence:.2f}, "
            f"method={grid_info.detection_method}"
        )

        # 6. Trace extraction
        extractor = TraceExtractor(params, self.fallback_strategy)

        # Extract trace hint
        trace_hint = extractor.extract_trace_hint(img_corrected, gray_corrected)

        # Protection mask
        protect_mask = extractor.get_protection_mask(trace_hint, grid_info)

        # Grid mask
        grid_mask = extractor.detect_grid_mask(gray_corrected, grid_info)

        # Inpaint
        img_inpainted = extractor.inpaint_grid(
            img_corrected, grid_mask, protect_mask, grid_info
        )

        # 7. Contrast enhancement
        lab = cv2.cvtColor(img_inpainted, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        l_enhanced = clahe.apply(l)
        lab_enhanced = cv2.merge([l_enhanced, a, b])
        img_enhanced = cv2.cvtColor(lab_enhanced, cv2.COLOR_LAB2BGR)

        # 8. Final trace mask
        trace_mask = extractor.extract_final_mask(img_enhanced, grid_info)

        # 9. Quality assessment
        trace_quality = QualityAssessor.assess_trace_quality(trace_mask, img.shape)

        if trace_quality['continuity'] < 0.7:
            warnings.append(
                f"Low trace continuity ({trace_quality['continuity']:.2f}). "
                f"Signal may be incomplete."
            )

        quality_scores = QualityAssessor.compute_overall_quality(
            img_quality,
            grid_info.confidence,
            trace_quality['continuity']
        )

        self.logger.info(f"Quality: overall={quality_scores.overall:.2f}")

        # 10. Build result
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


# ============================================================================
# Backward-compatible Interface
# ============================================================================

def preproc_ecg_image(path: str, **kwargs) -> Dict:
    """
    Backward-compatible interface matching original PoC

    Args:
        path: Path to ECG image
        **kwargs: Optional arguments for ECGPreprocessor

    Returns:
        Dictionary with preproc_img, trace_mask, grid_info, warnings
    """
    preprocessor = ECGPreprocessor(**kwargs)
    result = preprocessor.process(path)

    # Match original interface
    return {
        'preproc_img': result['preproc_img'],
        'trace_mask': result['trace_mask'],
        'grid_info': result['grid_info'],
        'warnings': result['warnings']
    }


# ============================================================================
# Main Entry Point
# ============================================================================

if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python ecg_preproc_optimized.py <path_to_ecg_image>")
        print("\nOptional flags:")
        print("  --verbose    Enable detailed logging")
        print("  --debug      Save intermediate results")
        sys.exit(1)

    path = sys.argv[1]
    verbose = '--verbose' in sys.argv
    debug = '--debug' in sys.argv

    # Process
    preprocessor = ECGPreprocessor(verbose=verbose)
    result = preprocessor.process(path)

    # Save outputs
    cv2.imwrite('preproc.png', result['preproc_img'])
    cv2.imwrite('mask.png', result['trace_mask'])

    print("\n=== ECG Preprocessing Results ===")
    print(f"Grid Info: {result['grid_info']}")
    print(f"Quality Scores: {result['quality_scores']}")

    if result['warnings']:
        print("\nWarnings:")
        for warning in result['warnings']:
            print(f"  - {warning}")

    if debug:
        # Save intermediate results
        inter = result['intermediate_results']
        cv2.imwrite('debug_trace_hint.png', inter['trace_hint'])
        cv2.imwrite('debug_protect_mask.png', inter['protect_mask'])
        cv2.imwrite('debug_grid_mask.png', inter['grid_mask'])
        print("\nDebug images saved (debug_*.png)")

    print("\nOutput images saved: preproc.png, mask.png")
