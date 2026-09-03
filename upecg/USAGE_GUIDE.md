# ECG信号提取快速指南

## 基本用法

### 1. 默认模式(颜色网格去除)
```bash
python3 ecg_preproc_optimized.py ecg1.png --verbose
```

输出:
- `preproc.png` - 去网格后的图像
- `mask.png` - 二值描迹掩码
- 控制台显示导联信号统计

### 2. 形态学模式(更保守,保留更多trace)
```bash
python3 ecg_preproc_optimized.py ecg1.png --verbose --method=morphology
```

**推荐**: 当颜色方法效果不佳时使用

### 3. 激进模式(更彻底去除网格)
```bash
python3 ecg_preproc_optimized.py ecg1.png --verbose --aggressive
```

**警告**: 可能误删细trace

### 4. 调试模式(保存中间结果)
```bash
python3 ecg_preproc_optimized.py ecg1.png --verbose --debug
```

额外输出:
- `debug_trace_hint.png` (仅morphology方法)
- `debug_protect_mask.png` (仅morphology方法)
- `debug_grid_mask.png`

## 方波标定说明

### 自动检测流程
1. 提取多个导联的边界框
2. 在每个导联左侧30%区域搜索方波
3. 使用水平投影检测矩形波特征
4. 验证尺寸(宽度~5mm, 高度~10mm)

### 检测状态说明

**成功检测**:
```
INFO: 导联 0: 检测到方波 baseline_y=150.0, height=220.0px, confidence=0.75
INFO: 成功检测 3/6 个导联方波
```

**检测失败(使用后备标定)**:
```
WARNING: 多导联模式未检测到任何方波
WARNING: 未检测到方波,使用基于网格的标定
INFO: 标定: pulse_detected=False, 置信度=0.30
```

### 后备标定机制
当方波检测失败时,系统自动使用**网格标定**:
- `baseline_y = 图像高度 / 2`
- `mV_per_pixel = 0.1 / pixels_per_mm`
- 基于标准10mm/mV刻度

## 输出信号解读

### 导联信息示例
```
导联 1:
  采样点数: 1119        # 信号长度
  持续时间: 2.03 s      # 时间范围
  幅度范围: [0.57, 1.49] mV  # 电压范围
  采样率: 550.0 Hz      # 从网格间距计算
  覆盖率: 13.7%         # 包含trace的列比例
  质量分数: 0.65        # 综合质量评估
```

### 质量分数评估
- **>0.7**: 优秀,信号完整连续
- **0.5-0.7**: 良好,可用于分析
- **0.3-0.5**: 中等,可能有断点
- **<0.3**: 较差,需人工检查

### 覆盖率说明
- **>15%**: 完整导联
- **10-15%**: 正常
- **5-10%**: 稀疏(可能是短节段)
- **<5%**: 非常稀疏(可能是噪点)

## 常见问题

### Q1: 方波总是检测不到?
**A**: 可能原因:
1. 图像不包含标准方波(12导联打印输出常见)
2. 方波在图像裁剪边缘外
3. 颜色网格去除误删了方波

**解决方案**:
- 尝试`--method=morphology` (保留更多信息)
- 后备网格标定通常足够准确
- 如果需要精确标定,考虑OCR提取注释信息

### Q2: 信号质量分数偏低?
**A**: 可能原因:
1. 输入图像分辨率低(<1500px)
2. 对比度低
3. 网格去除过于激进

**解决方案**:
- 使用更高分辨率图像
- 尝试`--method=morphology`
- 关闭`--aggressive`标志

### Q3: 导联数量不正确?
**A**: 可能原因:
1. 导联自动分离算法参数需调整
2. 图像质量影响blob检测

**解决方案**:
- 检查`mask.png`确认trace提取质量
- 调整`AveragingWindowExtractor`的`xStep`和`yStep`参数

### Q4: 幅度值看起来不对?
**A**: 可能原因:
1. 方波未检测到,使用后备标定
2. 纸速或电压刻度非标准(25mm/s, 10mm/mV)

**解决方案**:
- 手动验证网格间距检测是否准确
- 如有注释信息,手动调整`paper_speed`和`voltage_scale`

## 性能优化

### 处理速度
- 颜色方法: ~0.5s (快速)
- 形态学方法: ~2s (较慢但更准确)

### 内存占用
- 典型图像(1120x664): ~50MB
- 高分辨率(3000x2000): ~200MB

## 算法选择建议

| 图像特征 | 推荐方法 | 参数 |
|---------|---------|------|
| 粉色/浅色网格 | color (默认) | 无 |
| 红色trace明显 | color | 无 |
| 细trace易损失 | morphology | --method=morphology |
| 低对比度 | morphology | --method=morphology |
| 网格残留严重 | color | --aggressive |
| 需要最高质量 | morphology | --method=morphology --debug |

## Python API使用

```python
from ecg_preproc_optimized import ECGPreprocessor

# 创建预处理器
preprocessor = ECGPreprocessor(
    verbose=True,
    grid_removal_method='color',  # 或 'morphology'
    aggressive_grid_removal=False
)

# 处理图像
result = preprocessor.process('ecg1.png')

# 访问结果
preproc_img = result['preproc_img']
trace_mask = result['trace_mask']
grid_info = result['grid_info']
quality = result['quality_scores']

# 提取信号
signals = preprocessor.extract_signals(multi_lead=True)

# 访问每个导联
for i, lead in enumerate(signals):
    print(f"导联{i+1}: {len(lead.signal_mv)}个采样点")
    print(f"  时间: {lead.time_s[-1]:.2f}s")
    print(f"  幅度: [{lead.signal_mv.min():.2f}, {lead.signal_mv.max():.2f}] mV")
```

## 技术支持

- 详细技术文档: `CALIBRATION_PULSE_IMPROVEMENT.md`
- WebPlotDigitizer算法: `WPD_ALGORITHM_IMPLEMENTATION.md`
- 颜色网格去除: `COLOR_GRID_REMOVAL.md`
- 项目指南: `CLAUDE.md`

---

**版本**: ecg_preproc_optimized.py (2025-10-11)
**作者**: Claude Code (基于WebPlotDigitizer算法优化)
