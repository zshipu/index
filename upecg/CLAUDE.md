# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UPECG is an ECG (electrocardiogram) signal extraction system that processes images of ECG paper recordings (from photos, scans, or PDFs) and converts them into digital waveform data. The system handles grid removal, trace extraction, calibration, and signal reconstruction.

**Core Capabilities:**
- Image preprocessing with grid detection and removal
- Deskewing and perspective correction
- Trace protection during grid removal
- Multi-lead ECG support
- Pixel-to-physical unit calibration (mm, mV, time)

## Running the Code

### Basic Usage

Process a single ECG image:
```bash
python ecg_preproc_poc.py <path_to_ecg_image>
```

This outputs:
- `preproc.png` - Preprocessed image with grid removed
- `mask.png` - Binary trace mask (skeletonized)
- Grid calibration info printed to console

### Dependencies

Required Python packages:
- `opencv-python` (cv2) - Image processing
- `numpy` - Array operations
- `scikit-image` - Morphological operations (skeletonize)
- `scipy` - Signal processing (find_peaks)

Install with:
```bash
pip install opencv-python numpy scikit-image scipy
```

## Architecture & Design

### High-Level Pipeline

The system follows a multi-stage pipeline (see `docs/3.图像预处理与网格分离.md` for detailed explanation):

1. **Image Ingestion** → Read color image
2. **Geometric Correction** → Deskew using Hough line detection
3. **Grid Detection** → Estimate pixel-to-mm ratio via projection analysis
4. **Trace Hint Extraction** → Color separation (red/dark traces)
5. **Protection Mask** → Conservative mask of likely ECG trace pixels
6. **Grid Removal** → Masked inpainting (grid removed, trace preserved)
7. **Contrast Enhancement** → CLAHE normalization
8. **Final Trace Mask** → Skeletonization for downstream signal extraction

### Key Algorithms

**Grid Spacing Estimation** (`estimate_grid_spacing`):
- Uses vertical projection to detect periodic grid lines
- Finds peaks corresponding to vertical lines
- Returns median spacing (small box size in pixels)

**Trace Protection Strategy** (`get_trace_protection_mask`):
- Adaptive thresholding based on grid spacing
- Morphological closing to connect broken trace segments
- Connected component filtering by area/dimension
- Dilation to protect trace neighborhoods

**Grid Detection** (`detect_grid_mask`):
- Morphological opening with vertical/horizontal kernels
- Kernel size proportional to detected grid spacing
- Combines vertical and horizontal line detections

**Masked Inpainting** (`masked_inpaint_color`):
- Only inpaints grid pixels NOT protected by trace mask
- Uses OpenCV TELEA algorithm for fast interpolation
- Preserves trace integrity during grid removal

### Physical Calibration

Standard ECG paper constants:
- **Paper speed**: 25 mm/s (default) or 50 mm/s
- **Amplitude scale**: 10 mm/mV (standard)
- **Small grid**: 1mm × 1mm
- **Large grid**: 5mm × 5mm (5 small boxes)

**Critical formulas** (from detected `pixels_per_mm = g`):
```
time_per_pixel = 0.04 / g  (seconds/pixel at 25mm/s)
sampling_rate = g / 0.04   (Hz)
mV_per_pixel = 0.1 / g     (millivolts/pixel at 10mm/mV)
```

Example: If `g = 8 px/mm`:
- time_per_pixel = 0.005s = 5ms
- sampling_rate = 200 Hz
- mV_per_pixel = 0.0125 mV = 12.5 µV

## Project Structure

```
upecg/
├── ecg_preproc_poc.py          # Main preprocessing implementation
├── docs/                        # Technical documentation
│   ├── PRD.md                  # Product requirements (AI diagnostic system)
│   ├── 1.从图片中提取心电（ECG）信号.md    # Signal extraction overview
│   ├── 2.信号提取概述.md                    # Technical summary
│   └── 3.图像预处理与网格分离.md            # Preprocessing deep-dive
├── ecg1.png                    # Sample input ECG image
├── preproc.png                 # Output: processed image
└── mask.png                    # Output: trace mask
```

## Design Principles

### Trace Preservation First
- **NEVER** remove grid lines directly without protecting trace pixels
- Always generate protection mask before grid removal
- Use conservative (high recall) masks to avoid losing signal

### Parameter Scaling
All image processing parameters scale with detected grid size (`small_box_px`):
- Adaptive threshold block size: `max(11, int(small_box_px * 3) | 1)`
- Morphological kernel sizes: proportional to `small_box_px`
- Protection dilation radius: `max(1, int(round(small_box_px * 0.02)))`

This ensures robustness across different image resolutions.

### Fallback Strategies
- If grid detection fails, estimate based on image resolution: `max(4, int(min(img.shape[:2]) / 200))`
- Return warnings when calibration cannot be established
- Degrade gracefully rather than failing completely

## Important Context from Documentation

### Future Roadmap (docs/PRD.md)
The preprocessing module is Phase A of a larger ECG analysis system:
- **Phase A (PoC)**: Image preprocessing + basic R-peak detection + classification
- **Phase B (Production)**: 12-lead support, multi-format, doctor review workflow
- **Phase C (Clinical)**: Regulatory compliance, hospital integration

### Quality Metrics (docs/3.图像预处理与网格分离.md)
Expected QC metrics to implement:
- `trace_coverage_ratio`: Trace pixels / total ROI pixels
- `trace_continuity_score`: Fraction of columns with trace (target > 0.85)
- `skeleton_branching_rate`: Branch points / length (lower is better)
- `peak_intensity_preservation`: Median intensity ratio (target ~1.0 ± 0.15)

### Known Limitations
- **No OCR**: Paper speed/voltage annotations are not yet extracted (manual or defaults)
- **Single panel**: Multi-panel 12-lead layout detection not implemented
- **No perspective correction**: Advanced homography correction not included in PoC
- **Basic deskew only**: Uses median angle from Hough lines (< 45°)

## Common Pitfalls

1. **Don't modify morphological kernels arbitrarily** - They are calibrated to grid spacing
2. **Don't skip trace protection** - Direct grid removal destroys QRS peaks
3. **Preserve color channels** - Red traces require color separation before grayscale
4. **Handle edge cases** - Low resolution, no grid, heavy rotation all must degrade gracefully
5. **Maintain physical units** - Always return `grid_info` with calibration metadata

## Testing Strategy

When adding features:
1. Test with varied input qualities (sharp scans, blurry photos, tilted images)
2. Verify grid detection across different resolutions (600px to 3000px short side)
3. Check trace preservation: compare input/output R-peak positions
4. Validate calibration: known grid spacing should yield expected `pixels_per_mm`
5. Test fallbacks: images without grids, extreme rotations, partial crops

## Code Style Notes

- Functions are single-purpose with clear names
- Parameter names indicate units: `small_box_px`, `pixels_per_mm`, `dil_r`
- Heuristics are explicit: `max(20, small_box_px*2)` shows threshold logic
- Adaptive sizing: `block = max(11, int(small_box_px*3)|1)` ensures odd values
- Comments explain "why" not "what": `# ensure odd`, `# dark lines show as peaks`
