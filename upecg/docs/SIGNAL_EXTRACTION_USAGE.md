# Signal Extraction Usage Guide

## Quick Start

### Basic Usage

```python
from ecg_preproc_optimized import ECGPreprocessor

# 1. Initialize preprocessor
preprocessor = ECGPreprocessor(verbose=True)

# 2. Preprocess ECG image
result = preprocessor.process('ecg1.png')

# 3. Extract signals with square wave calibration
signals = preprocessor.extract_signals(multi_lead=True)

# 4. Access signal data
for i, lead in enumerate(signals):
    print(f"Lead {i+1}:")
    print(f"  Signal values (mV): {lead.signal_mv}")
    print(f"  Time values (s): {lead.time_s}")
    print(f"  Duration: {lead.time_s[-1]:.2f} s")
    print(f"  Sampling rate: {lead.sampling_rate:.1f} Hz")
    print(f"  Quality score: {lead.quality_score:.2f}")
```

### Command Line Usage

```bash
# Basic usage with signal extraction
python3 ecg_preproc_optimized.py ecg1.png --verbose

# Output will show:
# - Preprocessing results
# - Calibration pulse detection
# - Extracted signals for each lead
```

## API Reference

### `ECGPreprocessor.extract_signals()`

**Signature**:
```python
def extract_signals(
    self,
    multi_lead: bool = True,
    apply_filtering: bool = False
) -> List[LeadSignal]
```

**Parameters**:
- `multi_lead` (bool): Whether to detect and extract multiple leads
  - `True`: Automatically detect separate ECG strips (default)
  - `False`: Treat entire image as single lead
- `apply_filtering` (bool): Apply post-processing filters
  - Currently not implemented, returns raw signals

**Returns**:
- List of `LeadSignal` objects, one per detected lead

**Raises**:
- `RuntimeError`: If called before `process()`

### `LeadSignal` Object

**Attributes**:
```python
@dataclass
class LeadSignal:
    signal_mv: np.ndarray      # Voltage values in millivolts
    time_s: np.ndarray         # Time values in seconds
    region: Tuple[int, int]    # (y_start, y_end) in image
    quality_score: float       # 0-1, signal quality
    sampling_rate: float       # Hz
    coverage: float            # 0-1, trace completeness
```

**Methods**:
```python
lead.to_dict()  # Convert to dictionary for JSON export
```

### `CalibrationInfo` Object

**Attributes**:
```python
@dataclass
class CalibrationInfo:
    baseline_y: float              # Y-coordinate of 0mV baseline
    mV_per_pixel: float            # Voltage per pixel
    pulse_detected: bool           # Whether square wave found
    confidence: float              # 0-1, detection confidence
    pulse_region: Optional[Tuple]  # (x1, y1, x2, y2) if detected
    pulse_height_px: Optional[float]  # Height in pixels
```

## Examples

### Example 1: Export Signals to CSV

```python
import numpy as np
import csv

# Extract signals
preprocessor = ECGPreprocessor()
preprocessor.process('ecg1.png')
signals = preprocessor.extract_signals()

# Export each lead to CSV
for i, lead in enumerate(signals):
    filename = f'lead_{i+1}_signal.csv'
    with open(filename, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['Time_s', 'Voltage_mV'])
        for t, v in zip(lead.time_s, lead.signal_mv):
            writer.writerow([t, v])
    print(f"Saved {filename}")
```

### Example 2: Plot Signals with Matplotlib

```python
import matplotlib.pyplot as plt

# Extract signals
preprocessor = ECGPreprocessor()
preprocessor.process('ecg1.png')
signals = preprocessor.extract_signals()

# Plot all leads
fig, axes = plt.subplots(len(signals), 1, figsize=(12, 3*len(signals)))
if len(signals) == 1:
    axes = [axes]

for i, lead in enumerate(signals):
    axes[i].plot(lead.time_s, lead.signal_mv, 'b-', linewidth=0.5)
    axes[i].set_title(f'Lead {i+1} (Quality: {lead.quality_score:.2f})')
    axes[i].set_xlabel('Time (s)')
    axes[i].set_ylabel('Voltage (mV)')
    axes[i].grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig('ecg_signals.png', dpi=300)
print("Saved ecg_signals.png")
```

### Example 3: Export to JSON

```python
import json

# Extract signals
preprocessor = ECGPreprocessor()
result = preprocessor.process('ecg1.png')
signals = preprocessor.extract_signals()

# Build complete result
output = {
    'preprocessing': {
        'grid_info': result['grid_info'],
        'quality_scores': result['quality_scores']
    },
    'signals': [lead.to_dict() for lead in signals]
}

# Save to JSON
with open('ecg_signals.json', 'w') as f:
    json.dump(output, f, indent=2)
print("Saved ecg_signals.json")
```

### Example 4: Single Lead Processing

```python
# Force single lead extraction (no region detection)
preprocessor = ECGPreprocessor()
preprocessor.process('ecg1.png')
signals = preprocessor.extract_signals(multi_lead=False)

# Will return one signal covering entire image height
lead = signals[0]
print(f"Single lead: {len(lead.signal_mv)} samples, {lead.time_s[-1]:.1f}s duration")
```

### Example 5: Quality Filtering

```python
# Extract only high-quality signals
preprocessor = ECGPreprocessor()
preprocessor.process('ecg1.png')
signals = preprocessor.extract_signals()

# Filter by quality threshold
high_quality = [lead for lead in signals if lead.quality_score > 0.7]
print(f"Found {len(high_quality)}/{len(signals)} high-quality leads")

for lead in high_quality:
    print(f"  Quality {lead.quality_score:.2f}: "
          f"{len(lead.signal_mv)} samples, "
          f"coverage {lead.coverage:.1%}")
```

## Understanding Calibration

### Square Wave Calibration (Automatic)

The system automatically detects the calibration pulse (square wave) in the ECG image:

1. **Location**: Searches left 20% of image
2. **Expected shape**: Rectangular pulse, ~5mm wide, ~10mm high
3. **Standard amplitude**: 1 mV
4. **Baseline extraction**: Bottom of pulse = 0 mV (user's requirement ✅)

**When detected**:
```
Calibration: pulse_detected=True, confidence=0.85, mV_per_pixel=0.0125
```

**Fallback** (if not detected):
- Uses grid spacing for calibration
- Estimates baseline at image center
- Lower confidence score (~0.3)

### Accessing Calibration Data

```python
# Get calibration info (internal, not typically needed)
from ecg_preproc_optimized import CalibrationPulseDetector

calibration_detector = CalibrationPulseDetector(
    preprocessor.grid_info,
    preprocessor.logger
)
calibration = calibration_detector.detect(
    preprocessor.preproc_img,
    preprocessor.trace_mask
)

print(f"Baseline Y: {calibration.baseline_y}")
print(f"mV per pixel: {calibration.mV_per_pixel:.4f}")
print(f"Pulse detected: {calibration.pulse_detected}")
print(f"Confidence: {calibration.confidence:.2f}")
```

## Quality Interpretation

### Quality Score Breakdown

The `quality_score` (0-1) combines three factors:

1. **Coverage (40% weight)**: Fraction of columns with trace
   - Good: >0.85 (>85% coverage)
   - Fair: 0.5-0.85
   - Poor: <0.5

2. **Amplitude (30% weight)**: Signal range validation
   - Good: 0.3-5.0 mV (physiological ECG range)
   - Fair: 0.15-0.3 mV or 5-10 mV
   - Poor: <0.15 mV or >10 mV

3. **Continuity (30% weight)**: Signal smoothness
   - Good: <0.5 mV/sample gradient
   - Fair: 0.5-1.5 mV/sample
   - Poor: >1.5 mV/sample (noisy/broken)

### Interpreting Scores

```python
if lead.quality_score > 0.8:
    print("Excellent quality - reliable for analysis")
elif lead.quality_score > 0.6:
    print("Good quality - suitable for most purposes")
elif lead.quality_score > 0.4:
    print("Fair quality - may need filtering")
else:
    print("Poor quality - unreliable, consider rejecting")
```

## Troubleshooting

### No Signals Extracted

**Symptom**: `extract_signals()` returns empty list

**Causes**:
- No trace detected in preprocessing
- All leads filtered out due to low quality

**Solution**:
```python
# Check preprocessing quality first
result = preprocessor.process('ecg1.png')
print(f"Trace quality: {result['quality_scores']}")

# Try single lead mode
signals = preprocessor.extract_signals(multi_lead=False)
```

### Low Quality Scores

**Symptom**: All `quality_score < 0.5`

**Causes**:
- Poor image quality (blurry, low contrast)
- Heavy grid interference
- Broken/disconnected traces

**Solution**:
- Use higher resolution scan (>600px short side)
- Ensure good lighting/contrast in original photo
- Check trace protection settings

### Calibration Pulse Not Detected

**Symptom**: `pulse_detected=False, confidence=0.3`

**Causes**:
- No calibration pulse in image
- Pulse in unexpected location (not left side)
- Pulse obscured by other markings

**Impact**:
- Falls back to grid-based calibration
- Signal amplitudes may be less accurate
- Still produces usable results

**Solution** (if pulse exists but not detected):
- Manually verify pulse location
- Check if pulse is in left 20% of image
- May need to adjust detection parameters

### Incorrect Baseline

**Symptom**: Signal values seem offset (all positive or all negative)

**Cause**: Baseline estimation failed

**Debug**:
```python
# Check calibration
print(f"Baseline Y: {calibration.baseline_y}")
print(f"Image height: {preprocessor.preproc_img.shape[0]}")

# Expected: baseline near middle or at pulse bottom
```

## Performance Notes

- **Speed**: ~0.5-2s per image (depends on resolution)
- **Memory**: Scales with image size, ~100MB for 3000x2000 image
- **Multi-lead**: Minimal overhead, ~+10% time vs single lead

## Dependencies

Required packages (from requirements.txt):
```
opencv-python>=4.5.0
numpy>=1.20.0
scikit-image>=0.18.0
scipy>=1.6.0
```

Install with:
```bash
pip install -r requirements.txt
```
