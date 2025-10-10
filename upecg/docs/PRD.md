# ultrathink — 用户上传一份心电图后给出分析结论（功能、技术、落地细节）

下面是一份面向产品 + 技术 + 合规的深度方案。开始之前的**假设**（我将基于这些做设计）：

* 需要同时支持短时单导（手环/手表）、长时单导（贴片/移动设备）和标准 12-lead 医用 ECG；原始数据优先（采样率、通道、时长、值数组），也允许图片/PDF 作为次要输入。
* 目标：对上传心电做**自动检测/定性结论 + 关键测量值 + 可视化证据片段**，并支持医生复核/申诉流程与审计。
* 技术栈偏好：Java 服务端 + ClickHouse 做时序/统计分析（你已有背景），模型推理用 Python/ONNX 或 GPU 服务化。

---

# 1 关键功能清单（分层优先级）

**面向用户（C端）**

* 上传（多源）心电：文件/数组、拍照（PNG/PDF）、直接设备接入（SDK/API）。
* 上传时即时质量检查（Signal Quality）与友好反馈（“测量太短/噪声太大，请重测”）。
* AI 初审结论（非诊断声明）：摘要 + 置信度 + 关键证据时间戳/示意图。
* 可一键请求医生复核（付费/免费策略可配置）。
* 可下载完整报告（PDF/JSON），分享或导出到第三方（医生、医院）。

**面向医生 / 审核员（B端）**

* 队列式病例查看、时间轴定位、标注与二次诊断。
* 复核意见写入、签名与最终报告合并。
* 批量审核与统计（误报/漏报率监控）。

**后台 / 管理**

* 模型版本管理、A/B 实验、阈值灰度放量。
* 审计日志、数据访问权限、合规报告。
* 数据质量与模型漂移报警。

---

# 2 用户体验（上传 → 结论）流程

1. 用户选择来源并上传（或设备直连）。
2. 前端快速本地检查（文件完整、时长、采样率）并展示信号预览。
3. 后端立即运行**Signal Quality** 快速检查并返回：若极差，提示重测并终止分析。
4. 若合格，异步/同步进入完整分析流程（见下）：预处理 → 检测/分割 → 模型推理 → 后处理 → 报告生成。
5. 返回简洁结论页：关键结论、证据片段（可跳转查看波形高亮）、建议行动（就医/复测/无异常）。
6. 用户可请求医生复核，或下载/分享报告。

（前端建议显示“AI 结论为参考，非最终诊断”的明显免责声明）

---

# 3 输入与文件格式（建议支持）

* **首选**：原始数值（JSON/CSV/WFDB/EDF/SCP-ECG）包含 `sample_rate`、`lead_count`、`units`、`start_time`。
* **次要**：PNG/JPG/PDF（需要 OCR / 图像到信号恢复，质量不保证，优先提示用户上传原始）。
* **基本约束建议**：支持采样率 125—2000 Hz（推荐 500Hz），导联数 1~12，单次文件最大 10MB（原始数组）或大文件分片上传。

---

# 4 信号处理与机器学习流水线（逐步技术细化）

**Preprocessing**

* 去基线漂移（高通滤波 ~0.5 Hz）、低通滤波（去工频 50/60Hz）、带通（0.5–40Hz）或自适应滤波。
* 抗干扰：SNR 估计、噪声分段检测、工频陷波（可选）。
* 重采样到标准采样率（如 500Hz）并归一化。
* 信号质量评分（输出 0—1），低于阈值中止并提示用户。

**关键检测/特征**

* R-peak 检测（Pan–Tompkins 或 CNN-based peak detector）。
* 逐搏分割（beat segmentation）、平均波形计算。
* 时间特征：HR（瞬时/平均/极值）、PR、QRS、QT/QTc（Bazett/Fridericia）。
* 形态学特征：P 波存在/缺失、宽窄 QRS、ST 段抬高/压低、异常 Q 波、T 波倒置。
* 其他：HRV 时域/频域指标、PVC/PAC 统计、房颤占比估计。

**模型架构（建议）**

* **主分类器**：1D-CNN（ResNet 类）或 1D-Transformer，多任务输出（arrhythmia classes + intervals）。
* **辅助规则器**：基于医学规则的后处理（如 QRS > 120ms 且伴随形态 → 疑似室性传导阻滞）。
* **置信度校准**：温度缩放 / Platt calibration，输出可靠置信度分数。
* **可解释性模块**：Grad-CAM 类时序热力图或 attention map，标注关键片段。

**部署**

* 导出 ONNX，使用 ONNX Runtime / Triton for inference，或 PyTorch + TorchServe。如果需要低延迟，使用 GPU/FPGA 容器化部署。

---

# 5 输出内容与报告模板（必须给到用户的字段）

**简短摘要（human-readable）**
例如：`窦性心律，平均心率 72 bpm，检测到 3 次室性早搏（PVC），建议 24 小时动态监测并就诊。`

**结构化 JSON（示例）**

```json
{
  "report_id": 12345,
  "user_id": 9876,
  "model_version": "ecg-v1.3.0",
  "summary": "窦性心律，少量室性早搏 (PVC)。",
  "diagnoses": [
    {"code":"PVC","label":"Premature ventricular contraction","confidence":0.92,"timestamps":[14.2, 45.7]},
    {"code":"SINUS","label":"Sinus rhythm","confidence":0.98}
  ],
  "measurements": {"avg_hr":72.5,"min_hr":58,"max_hr":145,"qrs_ms":100,"pr_ms":160,"qt_ms":360,"qtc_ms":420},
  "signal_quality": 0.87,
  "evidence_images": ["s3://bucket/reports/12345/lead_I_annot.png"],
  "recommendation": "若出现胸闷/晕厥，请立刻就医；可预约医生复核。"
}
```

**可视化证据**

* 每条诊断伴随时间段（start, end）与对应 ECG snippet（PNG/interactive waveform）。
* 在波形上高亮 R 波、PVC 波形、ST 段等，并可放大查看。

---

# 6 ClickHouse + 数据建模（建议，配合你现有栈）

**原则**：ClickHouse 存时序/聚合/审计统计；关系型（Postgres/MySQL）存用户与审计元数据；原始大数组放对象存储（S3），DB 存路径与索引。

**示例 ClickHouse 表（分析/查询）**

```sql
CREATE TABLE ecg_reports (
  id UInt64,
  user_id UInt64,
  device_id String,
  upload_time DateTime,
  sample_rate UInt16,
  lead_count UInt8,
  duration_seconds Float32,
  signal_quality Float32,
  model_version String,
  diagnosis Array(String),
  diagnosis_confidence Array(Float32),
  avg_hr Float32,
  min_hr Float32,
  max_hr Float32,
  qrs_ms Float32,
  pr_ms Float32,
  qt_ms Float32,
  raw_path String,
  annotated_image_path String,
  review_status Enum8('pending'=0,'reviewed'=1,'approved'=2,'rejected'=3)
) ENGINE = MergeTree()
ORDER BY (user_id, upload_time);
```

* raw_path 指向 S3（或内部对象存储）的原始数据文件。
* 对高频查询（按用户、按日期范围、按诊断类型）建立 Materialized Views 做聚合统计。

---

# 7 API 设计（关键端点 & 示例）

* `POST /api/ecg/upload` — multipart/form-data 上传，返回 `{report_id, status}`（status 可为 "received"/"failed" 等）。
* `GET /api/ecg/report/{report_id}` — 获取完整报告 JSON（含证据图/下载链接）。
* `POST /api/ecg/review/{report_id}` — 医生提交复核意见（需鉴权）。
* `GET /api/ecg/preview/{report_id}?lead=I&from=10&to=20` — 返回小片段 PNG 或 JSON 波形。

**前端友好返回**：立即返回 signal_quality 与 quick-check，如果 quick-check 通过再展示“AI 分析中”并在几秒到几十秒内返回最终结论（取决于模型与队列）。

---

# 8 可观测性、测试与模型验证

**线下验证**

* 使用公开数据集（MIT-BIH、PhysioNet AF DB、PTB-XL 等）做基线对齐与 benchmark。
* 指标：敏感度 (sensitivity/recall)、特异度、F1、AUC、阳性预测值 PPV、阴性预测值 NPV、每类 confusion matrix。
* 分层评估：按年龄段、设备类型、采样率、噪声等级评估性能差异。

**线上监控**

* 每次推理记录 `model_version, input_meta, signal_quality, diagnosis, confidence` 到监控流水表。
* Drift detection：特征分布监控（HR、QRS 分布）与标签分布变化。
* 误报/漏报追踪：建立人工复核样本库并定期回流训练（human-in-the-loop）。

**测试**

* 单元测试：滤波器、R-peak 算法、QRS 测量。
* 集成测试：从上传到报告的端到端流程（包含异常输入）。
* 合成噪声注入，测试鲁棒性。

---

# 9 合规、法律与临床安全（关键点）

* **声明**：AI 提供参考结论，非最终医疗诊断（界面/报告明确）。
* **法规**：若要宣称“诊断”或用于临床决策，需考虑 CE / FDA 或你所在国家的医疗器械法规（产品将成为 Software as a Medical Device 时）。
* **隐私**：支持加密传输（TLS），静态数据加密（SSE-KMS），基于角色的访问控制，审计日志保留策略（可配置）。
* **数据最小化与同意**：上传前获取明确书面/电子同意，保存同意版本（版本化）。
* **医疗记录合规**：在某些区域需存留可审计的医生签名与最终诊断记录。

---

# 10 风险点 & 对策（重点）

* **假阴性（漏报）**：对可能危及生命的事件（如持续室速、大范围 ST 抬高）设置严格阈值与人工复核/告警。
* **假阳性（过度告警）**：通过后处理规则与阈值减少噪声引起的误报；对低置信度结果标注“需进一步确认”。
* **图像转信号的误差**：鼓励用户上传原始信号；图片上传时标注置信度并提示更低可靠性。
* **数据漂移**：在线监控与定期再训练 / 微调（并保存训练集版本与模型版本号）。

---

# 11 部署与扩展建议（架构要点）

* **分层微服务**：Upload Service（Java）、Preproc & Feature Service（Python）、Inference Service（ONNX/Triton）、Report Service（Java/Python）、Worker Queue（Kafka/RabbitMQ）、Storage（S3）、Analytics (ClickHouse)。
* **推理伸缩**：GPU 池 + CPU 池，短作业优先使用 CPU（轻量模型），长/批量用 GPU。
* **灰度发布**：模型版本 + 金丝雀 / 分桶 A/B。
* **缓存**：小波段可缓存已分析片段，避免重复计算。

---

# 12 建议的分阶段落地（不含时间估计）

* **Phase A（PoC）**：仅支持单导/raw 数组 → 做信号质量 + R-peak + 简单分类（AF、PVC、normal）→ 返回 JSON 报告。
* **Phase B（生产）**：扩展到 12-lead、多格式支持、医生复核流程、完整报告导出、模型版本化与监控。
* **Phase C（合规/临床）**：临床验证、注册合规、与医院 HIS/EMR 对接、商业化扩展（付费复核、订阅）。

---

# 13 示例：给用户的一份“AI 分析结论”样例（简洁文本）

> **分析结论（AI 初步）**：窦性心律（平均心率 72 bpm）。在 00:00:14.2、00:00:45.7 检测到疑似室性早搏（PVC），共 3 次。QRS 宽度均 ~110 ms。信号质量良好（0.87）。建议：若近期出现胸闷/晕厥/频繁早搏症状，建议预约心内科医生复查或做 24 小时 Holter 监测。此结论仅供参考，最终诊断请以医生复核为准。

---

