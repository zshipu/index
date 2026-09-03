"""
Unit Tests for ECG Preprocessor Optimized
==========================================

Test coverage for the optimized ECG preprocessing pipeline
"""

import unittest
import numpy as np
import cv2
import tempfile
import os
from ecg_preproc_optimized import (
    ECGPreprocessor,
    ImageValidator,
    AdaptiveParams,
    GridDetector,
    GeometricCorrector,
    TraceExtractor,
    QualityAssessor,
    GridInfo,
    FallbackStrategy
)


class TestImageValidator(unittest.TestCase):
    """Test image validation logic"""

    def test_valid_image(self):
        # Create synthetic valid image
        img = np.random.randint(50, 200, (1500, 2000, 3), dtype=np.uint8)
        is_valid, warnings, quality = ImageValidator.validate(img)

        self.assertTrue(is_valid)
        self.assertGreater(quality, 0.5)

    def test_low_resolution_warning(self):
        # Low resolution image
        img = np.random.randint(50, 200, (400, 600, 3), dtype=np.uint8)
        is_valid, warnings, quality = ImageValidator.validate(img)

        self.assertGreater(len(warnings), 0)
        self.assertLess(quality, 0.8)

    def test_low_contrast_warning(self):
        # Low contrast image (uniform gray)
        img = np.full((1500, 2000, 3), 128, dtype=np.uint8)
        is_valid, warnings, quality = ImageValidator.validate(img)

        self.assertTrue(any('contrast' in w.lower() for w in warnings))

    def test_empty_image(self):
        # Empty image
        img = np.array([])
        is_valid, warnings, quality = ImageValidator.validate(img)

        self.assertFalse(is_valid)
        self.assertEqual(quality, 0.0)


class TestAdaptiveParams(unittest.TestCase):
    """Test adaptive parameter scaling"""

    def test_parameter_scaling(self):
        # Small image
        params_small = AdaptiveParams((800, 1000))
        # Large image
        params_large = AdaptiveParams((3000, 4000))

        # Thresholds should scale appropriately
        self.assertLess(
            params_small.hough_threshold(),
            params_large.hough_threshold()
        )

    def test_canny_thresholds(self):
        params = AdaptiveParams((1500, 2000))
        gray = np.random.randint(50, 200, (1500, 2000), dtype=np.uint8)

        lower, upper = params.canny_thresholds(gray)

        # Upper should be greater than lower
        self.assertGreater(upper, lower)
        # Both should be in valid range
        self.assertGreaterEqual(lower, 0)
        self.assertLessEqual(upper, 255)

    def test_adaptive_block_size_odd(self):
        params = AdaptiveParams((1500, 2000))

        # Should always return odd number
        for grid_px in [5, 10, 15, 20]:
            block = params.adaptive_block_size(grid_px)
            self.assertEqual(block % 2, 1)


class TestGeometricCorrector(unittest.TestCase):
    """Test geometric correction"""

    def create_tilted_image(self, angle_deg):
        """Create synthetic tilted image with grid"""
        img = np.full((1000, 1500, 3), 255, dtype=np.uint8)

        # Draw horizontal lines
        for y in range(0, 1000, 50):
            cv2.line(img, (0, y), (1500, y), (0, 0, 0), 2)

        # Rotate
        h, w = img.shape[:2]
        center = (w // 2, h // 2)
        M = cv2.getRotationMatrix2D(center, angle_deg, 1.0)
        rotated = cv2.warpAffine(img, M, (w, h), borderValue=(255, 255, 255))

        return rotated

    def test_deskew_detection(self):
        params = AdaptiveParams((1000, 1500))
        corrector = GeometricCorrector(params)

        # Create tilted image
        angle_original = 5.0
        img = self.create_tilted_image(angle_original)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # Deskew
        img_corrected, info = corrector.deskew(img, gray)

        # Should detect angle close to original
        self.assertIsNotNone(info['angle'])
        # Detected angle should be within reasonable range
        self.assertLess(abs(info['angle'] - angle_original), 2.0)

    def test_no_deskew_for_aligned(self):
        params = AdaptiveParams((1000, 1500))
        corrector = GeometricCorrector(params)

        # Already aligned image
        img = self.create_tilted_image(0.0)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        img_corrected, info = corrector.deskew(img, gray)

        # Should detect small angle
        self.assertLess(abs(info['angle']), 1.0)


class TestGridDetector(unittest.TestCase):
    """Test grid detection methods"""

    def create_grid_image(self, small_box_px=10):
        """Create synthetic ECG grid"""
        img = np.full((1000, 1500), 255, dtype=np.uint8)

        # Draw vertical lines (small grid)
        for x in range(0, 1500, small_box_px):
            cv2.line(img, (x, 0), (x, 1000), (200, 200, 200), 1)

        # Draw horizontal lines (small grid)
        for y in range(0, 1000, small_box_px):
            cv2.line(img, (0, y), (1500, y), (200, 200, 200), 1)

        # Draw bold lines (large grid, every 5 small boxes)
        for x in range(0, 1500, small_box_px * 5):
            cv2.line(img, (x, 0), (x, 1000), (150, 150, 150), 2)

        for y in range(0, 1000, small_box_px * 5):
            cv2.line(img, (0, y), (1500, y), (150, 150, 150), 2)

        return img

    def test_projection_method(self):
        params = AdaptiveParams((1000, 1500))
        detector = GridDetector(params)

        # Create grid with known spacing
        small_box_px = 10
        gray = self.create_grid_image(small_box_px)

        result = detector._detect_projection(gray)

        self.assertIsNotNone(result)
        self.assertIsInstance(result, GridInfo)
        # Detected spacing should be close to actual
        self.assertLess(abs(result.small_box_px - small_box_px), 2)

    def test_grid_detection_fusion(self):
        params = AdaptiveParams((1000, 1500))
        detector = GridDetector(params)

        small_box_px = 12
        gray = self.create_grid_image(small_box_px)

        result = detector.detect(gray)

        self.assertIsNotNone(result)
        self.assertGreater(result.confidence, 0.5)
        # Should use fusion or single method
        self.assertIsNotNone(result.detection_method)

    def test_fallback_for_no_grid(self):
        params = AdaptiveParams((1000, 1500))
        detector = GridDetector(params)

        # Image with no grid
        gray = np.random.randint(50, 200, (1000, 1500), dtype=np.uint8)

        result = detector.detect(gray)

        # Should use fallback
        self.assertIsNotNone(result)
        self.assertEqual(result.detection_method, 'fallback_heuristic')
        self.assertLess(result.confidence, 0.5)


class TestTraceExtractor(unittest.TestCase):
    """Test trace extraction logic"""

    def create_trace_image(self, grid_px=10):
        """Create synthetic ECG with trace"""
        # Grid background
        img = np.full((1000, 1500, 3), 255, dtype=np.uint8)

        # Draw light grid
        for x in range(0, 1500, grid_px):
            cv2.line(img, (x, 0), (x, 1000), (230, 230, 230), 1)
        for y in range(0, 1000, grid_px):
            cv2.line(img, (0, y), (1500, y), (230, 230, 230), 1)

        # Draw red ECG trace (sine wave)
        points = []
        for x in range(0, 1500):
            y = 500 + int(100 * np.sin(x * 0.05))
            points.append((x, y))

        for i in range(len(points) - 1):
            cv2.line(img, points[i], points[i+1], (0, 0, 255), 2)  # Red

        return img

    def test_trace_hint_extraction(self):
        params = AdaptiveParams((1000, 1500))
        extractor = TraceExtractor(params)

        img = self.create_trace_image()
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        trace_hint = extractor.extract_trace_hint(img, gray)

        # Should return valid image
        self.assertEqual(trace_hint.shape, (1000, 1500))
        # Should have higher values where trace is
        self.assertGreater(np.max(trace_hint), 100)

    def test_protection_mask_generation(self):
        params = AdaptiveParams((1000, 1500))
        extractor = TraceExtractor(params)

        img = self.create_trace_image(grid_px=10)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        trace_hint = extractor.extract_trace_hint(img, gray)

        grid_info = GridInfo(
            small_box_px=10.0,
            pixels_per_mm_est=10.0,
            confidence=0.9,
            detection_method='test'
        )

        protect_mask = extractor.get_protection_mask(trace_hint, grid_info)

        # Should return binary mask
        self.assertEqual(protect_mask.shape, (1000, 1500))
        unique_vals = np.unique(protect_mask)
        self.assertTrue(np.all(np.isin(unique_vals, [0, 255])))


class TestQualityAssessor(unittest.TestCase):
    """Test quality assessment"""

    def test_trace_quality_metrics(self):
        # Create synthetic trace mask
        mask = np.zeros((1000, 1500), dtype=np.uint8)

        # Draw continuous line
        for x in range(0, 1500):
            y = 500 + int(50 * np.sin(x * 0.05))
            mask[max(0, y-2):min(1000, y+3), x] = 255

        quality = QualityAssessor.assess_trace_quality(mask, (1000, 1500))

        self.assertIn('coverage', quality)
        self.assertIn('continuity', quality)
        self.assertIn('density', quality)

        # Should have high continuity (line spans all columns)
        self.assertGreater(quality['continuity'], 0.9)

    def test_overall_quality_computation(self):
        scores = QualityAssessor.compute_overall_quality(
            img_quality=0.8,
            grid_confidence=0.7,
            trace_continuity=0.9
        )

        self.assertIsNotNone(scores.overall)
        self.assertGreater(scores.overall, 0.5)
        self.assertLessEqual(scores.overall, 1.0)


class TestECGPreprocessorIntegration(unittest.TestCase):
    """Integration tests for full pipeline"""

    def create_test_image_file(self):
        """Create temporary test image"""
        # Simple synthetic ECG
        img = np.full((1000, 1500, 3), 255, dtype=np.uint8)

        # Grid
        for x in range(0, 1500, 10):
            cv2.line(img, (x, 0), (x, 1000), (220, 220, 220), 1)
        for y in range(0, 1000, 10):
            cv2.line(img, (0, y), (1500, y), (220, 220, 220), 1)

        # Trace
        for x in range(0, 1500):
            y = 500 + int(100 * np.sin(x * 0.05))
            cv2.circle(img, (x, y), 2, (0, 0, 255), -1)

        # Save to temp file
        fd, path = tempfile.mkstemp(suffix='.png')
        os.close(fd)
        cv2.imwrite(path, img)

        return path

    def test_full_pipeline(self):
        """Test complete preprocessing pipeline"""
        test_path = self.create_test_image_file()

        try:
            preprocessor = ECGPreprocessor(verbose=False)
            result = preprocessor.process(test_path)

            # Check all expected outputs
            self.assertIn('preproc_img', result)
            self.assertIn('trace_mask', result)
            self.assertIn('grid_info', result)
            self.assertIn('quality_scores', result)
            self.assertIn('warnings', result)

            # Check shapes
            self.assertEqual(result['preproc_img'].shape[:2], (1000, 1500))
            self.assertEqual(result['trace_mask'].shape, (1000, 1500))

            # Check grid info structure
            self.assertIn('small_box_px', result['grid_info'])
            self.assertIn('confidence', result['grid_info'])

            # Check quality scores
            self.assertIn('overall', result['quality_scores'])

        finally:
            os.unlink(test_path)

    def test_backward_compatibility(self):
        """Test backward-compatible interface"""
        from ecg_preproc_optimized import preproc_ecg_image

        test_path = self.create_test_image_file()

        try:
            result = preproc_ecg_image(test_path)

            # Should match original interface
            self.assertIn('preproc_img', result)
            self.assertIn('trace_mask', result)
            self.assertIn('grid_info', result)
            self.assertIn('warnings', result)

        finally:
            os.unlink(test_path)


if __name__ == '__main__':
    unittest.main()
