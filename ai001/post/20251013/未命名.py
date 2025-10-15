from simple_ecg_inference import ECGAnalyzer, generate_sample_ecg

# 创建分析器
analyzer = ECGAnalyzer()

# 生成示例信号
ecg_signal = generate_sample_ecg('normal')

# 预测
result = analyzer.predict(ecg_signal)
print(f"预测结果: {result['class_name']} (置信度: {result['confidence']:.1f}%)")

# 提取特征
features = analyzer.extract_features(ecg_signal)
print(f"心率: {features['heart_rate']:.1f} BPM")

# 可视化
analyzer.visualize(ecg_signal, result, features)
