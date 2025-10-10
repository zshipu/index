# Bug Fix: cv2.subtract 参数错误

## 问题

```python
# 错误的代码 (line 448)
dark_score = cv2.subtract(np.uint8(255), gray)
```

**错误信息**：
```
cv2.error: OpenCV(4.10.0) :-1: error: (-5:Bad argument) in function 'subtract'
> Overload resolution failed:
>  - src1 is not a numpy array, neither a scalar
```

## 根本原因

`cv2.subtract(src1, src2)` 要求两个参数都是 numpy 数组，但 `np.uint8(255)` 是一个标量值，不是数组。

## 解决方案

使用 numpy 的广播机制代替 `cv2.subtract`：

```python
# 修复后的代码
dark_score = 255 - gray
```

这样更简洁且正确。

## 已修复

文件 `ecg_preproc_optimized.py` 第 448 行已修复。

## 测试

修复后请重新运行：

```bash
python ecg_preproc_optimized.py ecg1.png --verbose
```

应该可以正常工作了！
