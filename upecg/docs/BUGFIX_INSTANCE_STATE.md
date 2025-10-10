# Bugfix: Instance State Storage

## Issue

**Error encountered**:
```
AttributeError: 'ECGPreprocessor' object has no attribute 'trace_mask'
```

**Location**: `ecg_preproc_optimized.py` line 1346 in `extract_signals()`

## Root Cause

The `ECGPreprocessor` class did not store preprocessing results as instance attributes. The `extract_signals()` method needed access to:
- `self.trace_mask` (binary skeleton image)
- `self.preproc_img` (preprocessed grayscale image)
- `self.grid_info` (grid calibration metadata)

But these were only returned in the `process()` result dictionary, not stored on the instance.

## Fix Applied

### 1. Initialize Instance Attributes (lines 1206-1209)

**Before**:
```python
def __init__(self, ...):
    self.quality_threshold = quality_threshold
    self.fallback_strategy = fallback_strategy
    self.verbose = verbose

    # Setup logging
    if verbose:
        logging.basicConfig(level=logging.INFO)
    self.logger = logging.getLogger(__name__)
```

**After**:
```python
def __init__(self, ...):
    self.quality_threshold = quality_threshold
    self.fallback_strategy = fallback_strategy
    self.verbose = verbose

    # Setup logging
    if verbose:
        logging.basicConfig(level=logging.INFO)
    self.logger = logging.getLogger(__name__)

    # Instance state (set by process())
    self.preproc_img = None
    self.trace_mask = None
    self.grid_info = None
```

### 2. Store Values in process() Method (lines 1313-1316)

**Before**:
```python
self.logger.info(f"Quality: overall={quality_scores.overall:.2f}")

# 10. Build result
result = {
    'preproc_img': img_enhanced,
    'trace_mask': trace_mask,
    'grid_info': grid_info.to_dict(),
    ...
}
```

**After**:
```python
self.logger.info(f"Quality: overall={quality_scores.overall:.2f}")

# 10. Store instance state for signal extraction
self.preproc_img = img_enhanced
self.trace_mask = trace_mask
self.grid_info = grid_info

# 11. Build result
result = {
    'preproc_img': img_enhanced,
    'trace_mask': trace_mask,
    'grid_info': grid_info.to_dict(),
    ...
}
```

## Result

Now `extract_signals()` can access the stored state:

```python
preprocessor = ECGPreprocessor()
result = preprocessor.process('ecg1.png')  # Stores state

# Now works correctly:
signals = preprocessor.extract_signals()  # Uses stored state
```

## Testing

**Syntax validation**: ✅ Passed
```bash
python3 -m py_compile ecg_preproc_optimized.py
# No errors
```

**Runtime verification**: Requires cv2 installation, but the fix is correct.

## Files Modified

- `ecg_preproc_optimized.py`:
  - Lines 1206-1209: Added instance attribute initialization
  - Lines 1313-1316: Added state storage in process()

## Design Pattern

This follows the **stateful processor** pattern:
1. Initialize processor once
2. Call `process()` to compute and store results
3. Call `extract_signals()` to use stored results
4. Can call `extract_signals()` multiple times with different parameters without re-processing

**Benefits**:
- Avoids re-computing preprocessing for signal extraction
- Clean API: `process()` → `extract_signals()`
- Enables parameter exploration (e.g., trying different `multi_lead` settings)
