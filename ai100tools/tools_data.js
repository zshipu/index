export const TOOL_SECTIONS = [
  { id: "general", label: "通用大模型", category: "通用大模型" },
  { id: "writing", label: "写作 & 文案", category: "写作 & 文案" },
  { id: "translate", label: "翻译 & 语言", category: "翻译 & 语言" },
  { id: "video", label: "视频生成", category: "视频生成" },
  { id: "image-gen", label: "图片生成 / 设计", category: "图片生成 / 设计" },
  { id: "image-edit", label: "图片编辑 / 证件照", category: "图片编辑 / 证件照" },
  { id: "docs", label: "文档 / PPT / PDF", category: "文档 / PPT / PDF" },
  { id: "career", label: "职场 / 简历 / 面试", category: "职场 / 简历 / 面试" },
  { id: "learning", label: "学习 / 英语", category: "学习 / 英语" },
  { id: "code", label: "代码 / 网站 / 自动化", category: "代码 / 网站 / 自动化" }
];

export const TOOLS = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    sectionId: "general",
    description: "通用对话与写作旗舰，几乎所有场景都能帮你快速起步。",
    logoStyle: { bg: "#10A37F", text: "G" },
    tagsFunctional: ["写作"],
    tagsValue: ["必备", "Free"],
    url: "https://chat.openai.com/"
  },
  {
    id: "claude",
    name: "Claude",
    sectionId: "general",
    description: "长文理解与深度思考表现出色，适合写作与知识工作者。",
    logoStyle: { bg: "#4C4CFF", text: "C" },
    tagsFunctional: ["写作", "长窗口"],
    tagsValue: ["强推"],
    url: "https://claude.ai/"
  },
  {
    id: "gemini",
    name: "Gemini",
    sectionId: "general",
    description: "谷歌多模态大模型，文本、图片、代码一体支持。",
    logoStyle: { bg: "#4285F4", text: "G" },
    tagsFunctional: ["写作", "多模态"],
    tagsValue: ["Free"],
    url: "https://gemini.google.com/"
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    sectionId: "general",
    description: "国产开源强力大模型，推理和代码能力都很能打。",
    logoStyle: { bg: "#1E293B", text: "D" },
    tagsFunctional: ["写作"],
    tagsValue: ["国产之光", "开源"],
    url: "https://www.deepseek.com/"
  },
  {
    id: "llama",
    name: "LLaMA",
    sectionId: "general",
    description: "Meta 开源大模型家族，适合开发者本地和私有化部署。",
    logoStyle: { bg: "#6366F1", text: "L" },
    tagsFunctional: ["写作"],
    tagsValue: ["开源"],
    url: "https://ai.meta.com/llama/"
  },
  {
    id: "qwen",
    name: "Qwen",
    sectionId: "general",
    description: "通义千问系列模型，中文理解与应用生态表现突出。",
    logoStyle: { bg: "#0EA5E9", text: "Q" },
    tagsFunctional: ["写作"],
    tagsValue: ["国产之光"],
    url: "https://qwen.ai/"
  },
  {
    id: "perplexity",
    name: "Perplexity",
    sectionId: "general",
    description: "结合搜索和大模型的回答引擎，实时信息检索强大。",
    logoStyle: { bg: "#111827", text: "P" },
    tagsFunctional: ["总结", "搜索"],
    tagsValue: ["Free"],
    url: "https://www.perplexity.ai/"
  },
  {
    id: "grok",
    name: "Grok",
    sectionId: "general",
    description: "带一点“毒舌”的聊天模型，擅长实时热点和社交话题。",
    logoStyle: { bg: "#020617", text: "G" },
    tagsFunctional: ["写作", "搜索"],
    tagsValue: [],
    url: "https://grok.com/"
  },
  {
    id: "piai",
    name: "Pi.ai",
    sectionId: "general",
    description: "温柔陪伴型 AI 伙伴，更适合日常陪聊与轻量决策。",
    logoStyle: { bg: "#EC4899", text: "Pi" },
    tagsFunctional: ["聊天"],
    tagsValue: ["易上手"],
    url: "https://pi.ai/"
  },
  {
    id: "kimi",
    name: "Kimi",
    sectionId: "general",
    description: "支持超长文档阅读的中文助手，看论文和报告不再痛苦。",
    logoStyle: { bg: "#0EA5E9", text: "K" },
    tagsFunctional: ["写作"],
    tagsValue: ["国产之光"],
    url: "https://kimi.moonshot.cn/"
  },

  {
    id: "jasper",
    name: "Jasper",
    sectionId: "writing",
    description: "营销团队常用的文案助手，适合广告、落地页与邮件。",
    logoStyle: { bg: "#4F46E5", text: "J" },
    tagsFunctional: ["写作"],
    tagsValue: ["强推"],
    url: "https://www.jasper.ai/"
  },
  {
    id: "writesonic",
    name: "WriteSonic",
    sectionId: "writing",
    description: "多场景模板覆盖的写作平台，上手简单功能全面。",
    logoStyle: { bg: "#16A3FE", text: "W" },
    tagsFunctional: ["写作"],
    tagsValue: ["轻量"],
    url: "https://writesonic.com/"
  },
  {
    id: "copyai",
    name: "Copy.ai",
    sectionId: "writing",
    description: "专注营销文案与社媒内容，快速生成多版本创意。",
    logoStyle: { bg: "#6366F1", text: "Ca" },
    tagsFunctional: ["写作"],
    tagsValue: ["易上手"],
    url: "https://www.copy.ai/"
  },
  {
    id: "rytr",
    name: "Rytr",
    sectionId: "writing",
    description: "轻量级写作助手，适合日常短文与工具型应用。",
    logoStyle: { bg: "#F97316", text: "R" },
    tagsFunctional: ["写作"],
    tagsValue: ["Free", "轻量"],
    url: "https://rytr.me/"
  },
  {
    id: "hyperwrite",
    name: "HyperWrite",
    sectionId: "writing",
    description: "浏览器中跟随输入的写作助手，自动补全你的想法。",
    logoStyle: { bg: "#0EA5E9", text: "H" },
    tagsFunctional: ["写作", "自动化"],
    tagsValue: [],
    url: "https://www.hyperwriteai.com/"
  },
  {
    id: "notionai",
    name: "Notion AI",
    sectionId: "writing",
    description: "集成在 Notion 里的写作与整理助手，文档一体化。",
    logoStyle: { bg: "#020617", text: "N" },
    tagsFunctional: ["写作", "办公"],
    tagsValue: [],
    url: "https://www.notion.so/product/ai"
  },
  {
    id: "wordtune",
    name: "WordTune",
    sectionId: "writing",
    description: "句子级润色与改写工具，让英语表达更自然。",
    logoStyle: { bg: "#6366F1", text: "W" },
    tagsFunctional: ["写作", "润色"],
    tagsValue: [],
    url: "https://www.wordtune.com/"
  },
  {
    id: "anyword",
    name: "Anyword",
    sectionId: "writing",
    description: "面向转化率优化的文案平台，支持 A/B 测试思路。",
    logoStyle: { bg: "#0EA5E9", text: "A" },
    tagsFunctional: ["写作", "运营"],
    tagsValue: [],
    url: "https://anyword.com/"
  },
  {
    id: "shortlyai",
    name: "ShortlyAI",
    sectionId: "writing",
    description: "帮助长文创作者扩写段落、续写故事的灵感助手。",
    logoStyle: { bg: "#6366F1", text: "S" },
    tagsFunctional: ["写作", "长文"],
    tagsValue: [],
    url: "https://www.shortlyai.com/"
  },
  {
    id: "deeplwrite",
    name: "DeepL Write",
    sectionId: "writing",
    description: "DeepL 家的写作与润色工具，翻译和改写一体。",
    logoStyle: { bg: "#0F172A", text: "DW" },
    tagsFunctional: ["写作", "翻译"],
    tagsValue: [],
    url: "https://www.deepl.com/write"
  },

  {
    id: "deepl",
    name: "DeepL",
    sectionId: "translate",
    description: "公认高质量的机器翻译，尤其擅长英德等多语互译。",
    logoStyle: { bg: "#0F172A", text: "D" },
    tagsFunctional: ["翻译"],
    tagsValue: ["Free"],
    url: "https://www.deepl.com/"
  },
  {
    id: "gemini-translate",
    name: "Gemini Translate",
    sectionId: "translate",
    description: "基于 Gemini 的翻译体验，支持上下文理解与润色。",
    logoStyle: { bg: "#4285F4", text: "G" },
    tagsFunctional: ["翻译"],
    tagsValue: ["Free"],
    url: "https://gemini.google.com/"
  },
  {
    id: "transmart",
    name: "TranSmart",
    sectionId: "translate",
    description: "面向专业场景的国产翻译平台，术语支持更友好。",
    logoStyle: { bg: "#22C55E", text: "T" },
    tagsFunctional: ["翻译"],
    tagsValue: ["国产之光"],
    url: "https://www.transmart.com/"
  },
  {
    id: "lingvanex",
    name: "LingvaNex",
    sectionId: "translate",
    description: "支持多平台的翻译工具，涵盖网页、桌面与移动端。",
    logoStyle: { bg: "#0EA5E9", text: "L" },
    tagsFunctional: ["翻译"],
    tagsValue: [],
    url: "https://lingvanex.com/"
  },
  {
    id: "glotai",
    name: "GlotAI",
    sectionId: "translate",
    description: "轻量化多语言翻译助手，适合日常段落快速处理。",
    logoStyle: { bg: "#6366F1", text: "G" },
    tagsFunctional: ["翻译"],
    tagsValue: ["轻量"],
    url: "https://glot.ai/"
  },
  {
    id: "papago",
    name: "Papago",
    sectionId: "translate",
    description: "Naver 出品，韩文场景尤其友好，适合日韩内容党。",
    logoStyle: { bg: "#22C55E", text: "P" },
    tagsFunctional: ["翻译"],
    tagsValue: [],
    url: "https://papago.naver.com/"
  },
  {
    id: "youdao",
    name: "Youdao 翻译",
    sectionId: "translate",
    description: "网易有道系翻译工具，支持词典、例句和多端同步。",
    logoStyle: { bg: "#DC2626", text: "Y" },
    tagsFunctional: ["翻译"],
    tagsValue: ["国产之光"],
    url: "https://fanyi.youdao.com/"
  },
  {
    id: "grammarly",
    name: "Grammarly",
    sectionId: "translate",
    description: "主打英文语法纠错与写作建议，适合职场邮件与论文。",
    logoStyle: { bg: "#10B981", text: "G" },
    tagsFunctional: ["英语", "写作"],
    tagsValue: [],
    url: "https://www.grammarly.com/"
  },
  {
    id: "languagetool",
    name: "LanguageTool",
    sectionId: "translate",
    description: "多语言拼写和语法检查工具，支持浏览器扩展。",
    logoStyle: { bg: "#2563EB", text: "LT" },
    tagsFunctional: ["英语", "校对"],
    tagsValue: [],
    url: "https://languagetool.org/"
  },
  {
    id: "youglish",
    name: "YouGlish",
    sectionId: "translate",
    description: "通过真实视频示例展示英文单词发音与语境。",
    logoStyle: { bg: "#EF4444", text: "Y" },
    tagsFunctional: ["英语"],
    tagsValue: ["轻量"],
    url: "https://youglish.com/"
  },

  {
    id: "runway",
    name: "Runway",
    sectionId: "video",
    description: "从文本到视频的一站式创作平台，适合创意短片。",
    logoStyle: { bg: "#111827", text: "R" },
    tagsFunctional: ["视频"],
    tagsValue: ["强推"],
    url: "https://runwayml.com/"
  },
  {
    id: "kling",
    name: "Kling",
    sectionId: "video",
    description: "国产高质量视频生成模型，适合创意表达与剧本实验。",
    logoStyle: { bg: "#0EA5E9", text: "K" },
    tagsFunctional: ["视频"],
    tagsValue: ["国产之光"],
    url: "https://klingai.com/"
  },
  {
    id: "dream-machine",
    name: "Dream Machine",
    sectionId: "video",
    description: "大模型驱动的文本转视频工具，支持创意镜头生成。",
    logoStyle: { bg: "#6366F1", text: "D" },
    tagsFunctional: ["视频"],
    tagsValue: ["Free"],
    url: "https://luma.ai/dream-machine"
  },
  {
    id: "stable-video-diffusion",
    name: "Stable Video Diffusion",
    sectionId: "video",
    description: "开源视频生成模型，适合开发者与研究人员调试。",
    logoStyle: { bg: "#0F172A", text: "Sv" },
    tagsFunctional: ["视频"],
    tagsValue: ["开源"],
    url: "https://stability.ai/"
  },
  {
    id: "pika",
    name: "Pika",
    sectionId: "video",
    description: "轻量化视频生成工具，擅长短视频创意和风格转换。",
    logoStyle: { bg: "#EC4899", text: "P" },
    tagsFunctional: ["视频"],
    tagsValue: ["轻量"],
    url: "https://pika.art/"
  },
  {
    id: "heygen",
    name: "HeyGen",
    sectionId: "video",
    description: "数字人和口播视频生成平台，一键生成真人口播。",
    logoStyle: { bg: "#F97316", text: "H" },
    tagsFunctional: ["视频"],
    tagsValue: ["换脸"],
    url: "https://www.heygen.com/"
  },
  {
    id: "opusclip",
    name: "OpusClip",
    sectionId: "video",
    description: "长视频智能切分为多条竖屏短视频，适合剪辑创作者。",
    logoStyle: { bg: "#6366F1", text: "O" },
    tagsFunctional: ["视频", "剪辑"],
    tagsValue: [],
    url: "https://www.opus.pro/"
  },
  {
    id: "descript",
    name: "Descript",
    sectionId: "video",
    description: "通过文字编辑视频，集剪辑、配音和字幕于一身。",
    logoStyle: { bg: "#020617", text: "D" },
    tagsFunctional: ["视频", "多功能"],
    tagsValue: [],
    url: "https://www.descript.com/"
  },
  {
    id: "capcut-ai",
    name: "CapCut AI",
    sectionId: "video",
    description: "剪映的 AI 能力集合，智能剪辑和模板一键成片。",
    logoStyle: { bg: "#020617", text: "C" },
    tagsFunctional: ["视频"],
    tagsValue: ["Free"],
    url: "https://www.capcut.com/"
  },
  {
    id: "2short",
    name: "2short.ai",
    sectionId: "video",
    description: "自动从长视频中挖掘精彩片段并生成短视频。",
    logoStyle: { bg: "#22C55E", text: "2" },
    tagsFunctional: ["视频"],
    tagsValue: ["轻量"],
    url: "https://2short.ai/"
  },

  {
    id: "midjourney",
    name: "Midjourney",
    sectionId: "image-gen",
    description: "高质量艺术风格图像生成，插画与概念设计利器。",
    logoStyle: { bg: "#020617", text: "Mj" },
    tagsFunctional: ["图片"],
    tagsValue: ["强推"],
    url: "https://www.midjourney.com/"
  },
  {
    id: "ideogram",
    name: "Ideogram",
    sectionId: "image-gen",
    description: "擅长中英文字体与海报排版的文生图工具。",
    logoStyle: { bg: "#6366F1", text: "I" },
    tagsFunctional: ["图片", "字体渲染"],
    tagsValue: [],
    url: "https://ideogram.ai/"
  },
  {
    id: "dalle",
    name: "DALL·E",
    sectionId: "image-gen",
    description: "OpenAI 推出的图像模型，适合多风格创意探索。",
    logoStyle: { bg: "#10A37F", text: "D" },
    tagsFunctional: ["图片"],
    tagsValue: ["Free"],
    url: "https://openai.com/dall-e-3"
  },
  {
    id: "krea",
    name: "Krea",
    sectionId: "image-gen",
    description: "主打实时 AI 绘画与风格探索的视觉创作平台。",
    logoStyle: { bg: "#7C3AED", text: "K" },
    tagsFunctional: ["图片", "实时"],
    tagsValue: [],
    url: "https://krea.ai/"
  },
  {
    id: "leonardo",
    name: "Leonardo",
    sectionId: "image-gen",
    description: "适合游戏与插画场景的多风格图像生成平台。",
    logoStyle: { bg: "#0F172A", text: "L" },
    tagsFunctional: ["图片", "多风格"],
    tagsValue: [],
    url: "https://leonardo.ai/"
  },
  {
    id: "pollinations",
    name: "Pollinations",
    sectionId: "image-gen",
    description: "支持多风格图像生成的免费社区型平台。",
    logoStyle: { bg: "#22C55E", text: "P" },
    tagsFunctional: ["图片"],
    tagsValue: ["Free"],
    url: "https://pollinations.ai/"
  },
  {
    id: "recraft",
    name: "Recraft",
    sectionId: "image-gen",
    description: "专注矢量与品牌视觉的 AI 设计工具。",
    logoStyle: { bg: "#0EA5E9", text: "R" },
    tagsFunctional: ["图片", "矢量"],
    tagsValue: [],
    url: "https://www.recraft.ai/"
  },
  {
    id: "canva",
    name: "Canva",
    sectionId: "image-gen",
    description: "整合 AI 生成功能的在线设计平台，适合小白做图。",
    logoStyle: { bg: "#14B8A6", text: "C" },
    tagsFunctional: ["图片", "设计"],
    tagsValue: [],
    url: "https://www.canva.com/"
  },
  {
    id: "clipdrop",
    name: "Clipdrop",
    sectionId: "image-gen",
    description: "集抠图、生成、放大等功能于一体的视觉工具箱。",
    logoStyle: { bg: "#EF4444", text: "Cd" },
    tagsFunctional: ["图片", "多功能"],
    tagsValue: [],
    url: "https://clipdrop.co/"
  },
  {
    id: "magic-eraser",
    name: "Magic Eraser",
    sectionId: "image-gen",
    description: "快速去除图片中多余元素，一键“橡皮擦”。",
    logoStyle: { bg: "#6366F1", text: "Me" },
    tagsFunctional: ["图片", "去背景"],
    tagsValue: [],
    url: "https://www.magiceraser.io/"
  },

  {
    id: "removebg",
    name: "Remove.bg",
    sectionId: "image-edit",
    description: "一键去除复杂背景，电商和证件照常备工具。",
    logoStyle: { bg: "#0EA5E9", text: "Rb" },
    tagsFunctional: ["图片"],
    tagsValue: ["轻量", "Free"],
    url: "https://www.remove.bg/"
  },
  {
    id: "cleanup-pictures",
    name: "Cleanup.pictures",
    sectionId: "image-edit",
    description: "用画笔涂抹即可去除水印、路人和多余物体。",
    logoStyle: { bg: "#22C55E", text: "Cu" },
    tagsFunctional: ["图片", "去水印"],
    tagsValue: [],
    url: "https://cleanup.pictures/"
  },
  {
    id: "fotor",
    name: "Fotor",
    sectionId: "image-edit",
    description: "支持证件照生成与美化的图片编辑平台。",
    logoStyle: { bg: "#6366F1", text: "F" },
    tagsFunctional: ["图片", "证件照"],
    tagsValue: [],
    url: "https://www.fotor.com/"
  },
  {
    id: "snapedit",
    name: "SnapEdit",
    sectionId: "image-edit",
    description: "上传图片即可智能擦除水印、文字和杂物。",
    logoStyle: { bg: "#F97316", text: "S" },
    tagsFunctional: ["图片", "去水印"],
    tagsValue: [],
    url: "https://snapedit.app/"
  },
  {
    id: "photoroom",
    name: "PhotoRoom",
    sectionId: "image-edit",
    description: "面向电商卖家的批量抠图与商品图生成工具。",
    logoStyle: { bg: "#020617", text: "P" },
    tagsFunctional: ["图片", "电商"],
    tagsValue: [],
    url: "https://www.photoroom.com/"
  },
  {
    id: "pixelcut",
    name: "Pixelcut",
    sectionId: "image-edit",
    description: "手机端友好的电商图和海报生成应用。",
    logoStyle: { bg: "#6366F1", text: "Pc" },
    tagsFunctional: ["图片", "电商"],
    tagsValue: [],
    url: "https://www.pixelcut.ai/"
  },
  {
    id: "myedit-headshot",
    name: "MyEdit Headshot",
    sectionId: "image-edit",
    description: "专注证件照和职业头像的 AI 美化工具。",
    logoStyle: { bg: "#0EA5E9", text: "H" },
    tagsFunctional: ["图片", "证件照"],
    tagsValue: [],
    url: "https://myedit.online/"
  },
  {
    id: "backgroundcut",
    name: "BackgroundCut",
    sectionId: "image-edit",
    description: "批量去背景和智能抠图，适合电商工作流。",
    logoStyle: { bg: "#3B82F6", text: "Bc" },
    tagsFunctional: ["图片", "去背景"],
    tagsValue: [],
    url: "https://www.backgroundcut.co/"
  },
  {
    id: "faceswap",
    name: "FaceSwap",
    sectionId: "image-edit",
    description: "人脸替换与换装玩法，适合创意和素材制作。",
    logoStyle: { bg: "#EC4899", text: "Fs" },
    tagsFunctional: ["图片"],
    tagsValue: ["换脸"],
    url: "https://faceswap.dev/"
  },
  {
    id: "remini",
    name: "Remini",
    sectionId: "image-edit",
    description: "老照片画质修复和人像增强的 AI 工具。",
    logoStyle: { bg: "#22C55E", text: "R" },
    tagsFunctional: ["图片", "修复"],
    tagsValue: [],
    url: "https://remini.ai/"
  },

  {
    id: "gitmind",
    name: "GitMind",
    sectionId: "docs",
    description: "在线思维导图与流程图工具，支持协作与导出。",
    logoStyle: { bg: "#0EA5E9", text: "G" },
    tagsFunctional: ["文档", "思维导图"],
    tagsValue: [],
    url: "https://gitmind.cn/"
  },
  {
    id: "gamma",
    name: "Gamma",
    sectionId: "docs",
    description: "输入大纲自动生成沉浸式网页式演示文稿。",
    logoStyle: { bg: "#6366F1", text: "Ga" },
    tagsFunctional: ["文档", "PPT"],
    tagsValue: [],
    url: "https://gamma.app/"
  },
  {
    id: "tome",
    name: "Tome",
    sectionId: "docs",
    description: "主打视觉感的 AI 幻灯片生成工具，适合讲故事。",
    logoStyle: { bg: "#0F172A", text: "T" },
    tagsFunctional: ["文档", "PPT"],
    tagsValue: [],
    url: "https://tome.app/"
  },
  {
    id: "mindshow",
    name: "MindShow",
    sectionId: "docs",
    description: "基于思维导图结构的一键 PPT 生成平台。",
    logoStyle: { bg: "#22C55E", text: "M" },
    tagsFunctional: ["文档", "PPT"],
    tagsValue: [],
    url: "https://www.mindshow.fun/"
  },
  {
    id: "chatpdf",
    name: "ChatPDF",
    sectionId: "docs",
    description: "上传 PDF 即可对话问答，适合同事报告与论文。",
    logoStyle: { bg: "#3B82F6", text: "P" },
    tagsFunctional: ["文档", "PDF"],
    tagsValue: [],
    url: "https://www.chatpdf.com/"
  },
  {
    id: "pdfai",
    name: "PDF.ai",
    sectionId: "docs",
    description: "从 PDF 中抽取关键信息并做结构化问答。",
    logoStyle: { bg: "#F97316", text: "Ai" },
    tagsFunctional: ["文档", "PDF"],
    tagsValue: [],
    url: "https://pdf.ai/"
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    sectionId: "docs",
    description: "高品质多语种 TTS 语音合成，适合配音与旁白。",
    logoStyle: { bg: "#0F172A", text: "11" },
    tagsFunctional: ["音频", "TTS"],
    tagsValue: [],
    url: "https://elevenlabs.io/"
  },
  {
    id: "voiceflow",
    name: "Voiceflow",
    sectionId: "docs",
    description: "可视化多模态对话与工作流编排平台。",
    logoStyle: { bg: "#6366F1", text: "V" },
    tagsFunctional: ["多模态", "工作流"],
    tagsValue: [],
    url: "https://www.voiceflow.com/"
  },
  {
    id: "readwise",
    name: "Readwise",
    sectionId: "docs",
    description: "集中管理阅读高亮和笔记，并用 AI 做回顾与总结。",
    logoStyle: { bg: "#FACC15", text: "R" },
    tagsFunctional: ["文档", "笔记"],
    tagsValue: [],
    url: "https://readwise.io/"
  },
  {
    id: "siderai",
    name: "Sider AI",
    sectionId: "docs",
    description: "浏览器侧边栏助手，为网页内容提供总结与问答。",
    logoStyle: { bg: "#3B82F6", text: "S" },
    tagsFunctional: ["总结", "网页总结"],
    tagsValue: [],
    url: "https://sider.ai/"
  },

  {
    id: "resume-io",
    name: "Resume.io",
    sectionId: "career",
    description: "模板丰富的在线简历生成器，多语言支持。",
    logoStyle: { bg: "#0EA5E9", text: "R" },
    tagsFunctional: ["职场", "简历"],
    tagsValue: [],
    url: "https://resume.io/"
  },
  {
    id: "kickresume",
    name: "KickResume",
    sectionId: "career",
    description: "从简历到求职信的一体化职场文书助手。",
    logoStyle: { bg: "#6366F1", text: "K" },
    tagsFunctional: ["职场", "简历"],
    tagsValue: [],
    url: "https://www.kickresume.com/"
  },
  {
    id: "rezi",
    name: "Rezi",
    sectionId: "career",
    description: "针对 ATS 优化的简历生成与评分平台。",
    logoStyle: { bg: "#22C55E", text: "Rz" },
    tagsFunctional: ["职场", "ATS"],
    tagsValue: [],
    url: "https://www.rezi.ai/"
  },
  {
    id: "teal",
    name: "Teal",
    sectionId: "career",
    description: "集中管理职位投递与简历版本的求职仪表盘。",
    logoStyle: { bg: "#0EA5E9", text: "T" },
    tagsFunctional: ["职场", "简历"],
    tagsValue: [],
    url: "https://www.tealhq.com/"
  },
  {
    id: "vmock",
    name: "Vmock",
    sectionId: "career",
    description: "面向大学生的简历评分和职业发展建议平台。",
    logoStyle: { bg: "#6366F1", text: "V" },
    tagsFunctional: ["职场", "大学生"],
    tagsValue: [],
    url: "https://www.vmock.com/"
  },
  {
    id: "yoodli",
    name: "Yoodli",
    sectionId: "career",
    description: "通过 AI 分析你的演讲与面试表现，给出改进建议。",
    logoStyle: { bg: "#22C55E", text: "Y" },
    tagsFunctional: ["职场", "面试"],
    tagsValue: [],
    url: "https://www.yoodli.ai/"
  },
  {
    id: "hireez",
    name: "HireEZ",
    sectionId: "career",
    description: "帮助 HR 寻找候选人并自动化招聘流程的工具。",
    logoStyle: { bg: "#0F172A", text: "Hz" },
    tagsFunctional: ["职场", "招聘"],
    tagsValue: [],
    url: "https://hireez.com/"
  },
  {
    id: "indeed-ai",
    name: "Indeed AI",
    sectionId: "career",
    description: "Indeed 平台内的智能匹配和简历优化能力集合。",
    logoStyle: { bg: "#2563EB", text: "In" },
    tagsFunctional: ["职场"],
    tagsValue: [],
    url: "https://www.indeed.com/"
  },
  {
    id: "jobscan",
    name: "Jobscan",
    sectionId: "career",
    description: "对比简历与 JD，给出 ATS 匹配度建议。",
    logoStyle: { bg: "#3B82F6", text: "Js" },
    tagsFunctional: ["职场", "ATS"],
    tagsValue: [],
    url: "https://www.jobscan.co/"
  },
  {
    id: "loopcv",
    name: "LoopCV",
    sectionId: "career",
    description: "自动化批量投递简历的求职机器人。",
    logoStyle: { bg: "#22C55E", text: "L" },
    tagsFunctional: ["职场", "自动化"],
    tagsValue: [],
    url: "https://loopcv.pro/"
  },

  {
    id: "elsa-speak",
    name: "ELSA Speak",
    sectionId: "learning",
    description: "通过语音识别训练英语口语发音与语调。",
    logoStyle: { bg: "#22C55E", text: "E" },
    tagsFunctional: ["英语", "口语"],
    tagsValue: [],
    url: "https://www.elsaspeak.com/"
  },
  {
    id: "talkpal",
    name: "TalkPal",
    sectionId: "learning",
    description: "与 AI 外教对话练习，提升口语流利度。",
    logoStyle: { bg: "#6366F1", text: "T" },
    tagsFunctional: ["英语", "对话"],
    tagsValue: [],
    url: "https://talkpal.ai/"
  },
  {
    id: "lingq",
    name: "LingQ",
    sectionId: "learning",
    description: "通过输入海量阅读和听力内容来习得语言。",
    logoStyle: { bg: "#22C55E", text: "L" },
    tagsFunctional: ["学习", "英语"],
    tagsValue: [],
    url: "https://www.lingq.com/"
  },
  {
    id: "duolingo-max",
    name: "Duolingo Max",
    sectionId: "learning",
    description: "多邻国的高级 AI 版，提供解释与对话练习。",
    logoStyle: { bg: "#22C55E", text: "D" },
    tagsFunctional: ["学习"],
    tagsValue: [],
    url: "https://www.duolingo.com/"
  },
  {
    id: "cognito",
    name: "Cognito",
    sectionId: "learning",
    description: "用间隔重复和卡片系统帮你高效记忆知识点。",
    logoStyle: { bg: "#6366F1", text: "C" },
    tagsFunctional: ["学习"],
    tagsValue: [],
    url: "https://www.cognitohq.com/"
  },
  {
    id: "quizlet-ai",
    name: "Quizlet AI",
    sectionId: "learning",
    description: "自动从教材生成学习卡片，并用测验巩固记忆。",
    logoStyle: { bg: "#3B82F6", text: "Q" },
    tagsFunctional: ["学习"],
    tagsValue: ["轻量"],
    url: "https://quizlet.com/"
  },
  {
    id: "explainpaper",
    name: "ExplainPaper",
    sectionId: "learning",
    description: "上传论文后为你逐段解释重点和难点。",
    logoStyle: { bg: "#0F172A", text: "Ex" },
    tagsFunctional: ["学习", "论文"],
    tagsValue: [],
    url: "https://www.explainpaper.com/"
  },
  {
    id: "scholarai",
    name: "ScholarAI",
    sectionId: "learning",
    description: "辅助查找与整理学术论文的 AI 学习助手。",
    logoStyle: { bg: "#6366F1", text: "Sc" },
    tagsFunctional: ["学习", "论文"],
    tagsValue: [],
    url: "https://scholarai.io/"
  },
  {
    id: "scispace",
    name: "SciSpace",
    sectionId: "learning",
    description: "为科学论文提供解释、可视化和引用管理。",
    logoStyle: { bg: "#0EA5E9", text: "S" },
    tagsFunctional: ["学习", "学术"],
    tagsValue: [],
    url: "https://typeset.io/"
  },
  {
    id: "khanmigo",
    name: "Khanmigo",
    sectionId: "learning",
    description: "可汗学院推出的 AI 学习伴侣，覆盖多学科知识。",
    logoStyle: { bg: "#22C55E", text: "K" },
    tagsFunctional: ["学习", "综合"],
    tagsValue: [],
    url: "https://www.khanacademy.org/khan-labs"
  },

  {
    id: "cursor",
    name: "Cursor",
    sectionId: "code",
    description: "面向程序员的 AI 编辑器，写代码和重构体验极佳。",
    logoStyle: { bg: "#0F172A", text: "C" },
    tagsFunctional: ["代码"],
    tagsValue: ["强推"],
    url: "https://www.cursor.com/"
  },
  {
    id: "replit-ai",
    name: "Replit AI",
    sectionId: "code",
    description: "在线 IDE 中的 AI 助手，适合学习和快速原型。",
    logoStyle: { bg: "#6366F1", text: "R" },
    tagsFunctional: ["代码"],
    tagsValue: ["Free"],
    url: "https://replit.com/"
  },
  {
    id: "github-copilot",
    name: "GitHub Copilot",
    sectionId: "code",
    description: "在主流编辑器中实时补全代码片段和函数。",
    logoStyle: { bg: "#22C55E", text: "Co" },
    tagsFunctional: ["代码"],
    tagsValue: [],
    url: "https://github.com/features/copilot"
  },
  {
    id: "windsurf",
    name: "Windsurf",
    sectionId: "code",
    description: "整合多模型的现代 IDE，适合深度 AI 编程工作流。",
    logoStyle: { bg: "#6366F1", text: "W" },
    tagsFunctional: ["代码"],
    tagsValue: [],
    url: "https://codeium.com/windsurf"
  },
  {
    id: "webflow-ai",
    name: "Webflow AI",
    sectionId: "code",
    description: "可视化搭建网站的同时使用 AI 生成结构和文案。",
    logoStyle: { bg: "#2563EB", text: "W" },
    tagsFunctional: ["网站"],
    tagsValue: [],
    url: "https://webflow.com/ai"
  },
  {
    id: "framer-ai",
    name: "Framer AI",
    sectionId: "code",
    description: "通过提示词生成高保真网页，再细调布局与组件。",
    logoStyle: { bg: "#6366F1", text: "F" },
    tagsFunctional: ["网站"],
    tagsValue: [],
    url: "https://www.framer.com/ai/"
  },
  {
    id: "dora",
    name: "Dora",
    sectionId: "code",
    description: "主打 3D 和动效的可视化建站工具，界面轻盈。",
    logoStyle: { bg: "#0EA5E9", text: "D" },
    tagsFunctional: ["网站"],
    tagsValue: ["轻量"],
    url: "https://www.dora.run/"
  },
  {
    id: "make",
    name: "Make.com",
    sectionId: "code",
    description: "可视化连线式自动化平台，整合各种在线服务。",
    logoStyle: { bg: "#F97316", text: "M" },
    tagsFunctional: ["自动化"],
    tagsValue: [],
    url: "https://www.make.com/"
  },
  {
    id: "zapier-ai",
    name: "Zapier AI",
    sectionId: "code",
    description: "通过 Trigger-Action 把常见 SaaS 串成自动化流程。",
    logoStyle: { bg: "#F97316", text: "Z" },
    tagsFunctional: ["自动化"],
    tagsValue: [],
    url: "https://zapier.com/ai"
  },
  {
    id: "langflow",
    name: "Langflow",
    sectionId: "code",
    description: "可视化搭建 LLM 工作流与代理系统的开源工具。",
    logoStyle: { bg: "#4C1D95", text: "Lf" },
    tagsFunctional: ["工作流"],
    tagsValue: ["开源"],
    url: "https://www.langflow.org/"
  }
];
