// ==========================================
// 工具数据 - 从资源文件提取的完整工具列表
// 已包含所有1000+个AI工具和资源
// ==========================================
const toolsData = [
  // 精选推荐
  {
    name: "AI好记",
    icon: "📝",
    description: "一键把B站/小红书/抖音/小宇宙等音视频转成图文笔记和思维导图",
    url: "https://aihaoji.com/zh?utm_source=invite&utm_content=E8yXL4pu",
    category: "featured",
    tags: ["笔记", "音视频转文字", "思维导图"]
  },
  {
    name: "AI应用榜单Top100",
    icon: "🏆",
    description: "全网最好用的100个AI应用榜单,精选优质工具",
    url: "https://www.turingscat.com/ai-top-100",
    category: "featured",
    tags: ["导航", "榜单", "推荐"]
  },
  {
    name: "Lovart.AI",
    icon: "🎨",
    description: "世界首个设计领域Agent,可以生成图片、音频、视频",
    url: "https://www.lovart.ai/home",
    category: "featured",
    tags: ["设计", "Agent", "多模态"]
  },
  {
    name: "Hatch canvas",
    icon: "🖼️",
    description: "对标lovart的图片设计网站,专业设计工具",
    url: "https://hatchcanvas.com/",
    category: "design",
    tags: ["设计", "图片生成", "创作"]
  },
  {
    name: "Flux-kontext",
    icon: "🌟",
    description: "黑森林工作室最新AI图像模型,高质量生成",
    url: "https://bfl.ai/models/flux-kontext",
    category: "image",
    tags: ["图像生成", "模型", "AI绘画"]
  },
  {
    name: "Flowith",
    icon: "🤖",
    description: "通用型智能体工具,多功能AI助手",
    url: "https://flowith.io/community",
    category: "chatbot",
    tags: ["Agent", "智能体", "通用"]
  },
  {
    name: "Videotutor",
    icon: "🎥",
    description: "一句话生成科普讲解视频,教育内容创作利器",
    url: "https://videotutor.io/",
    category: "video",
    tags: ["视频生成", "科普", "教育"]
  },
  {
    name: "沉浸式翻译",
    icon: "🌐",
    description: "看外网英文内容必备插件,免费双语翻译",
    url: "https://immersivetranslate.com/",
    category: "office",
    tags: ["翻译", "浏览器插件", "双语"]
  },
  {
    name: "音乐魔石",
    icon: "🎵",
    description: "免费下载全网无损音乐,海量曲库",
    url: "https://yym4.com/",
    category: "audio",
    tags: ["音乐下载", "无损", "免费"]
  },
  {
    name: "爱给网",
    icon: "🎬",
    description: "免费下载音效、配乐、视频等素材,在线设计工具",
    url: "https://www.aigei.com/",
    category: "design",
    tags: ["素材", "音效", "免费"]
  },

  // AI工具导航
  {
    name: "AI工具集",
    icon: "🔧",
    description: "1000+AI工具合集,分类齐全,每天更新AI行业资讯",
    url: "https://ai-bot.cn/",
    category: "featured",
    tags: ["导航", "工具合集", "资讯"]
  },
  {
    name: "新榜AI工具导航",
    icon: "📊",
    description: "新榜旗下AI工具导航网页,专业媒体推荐",
    url: "https://nav.newrank.cn/?source=10000&l=nav_title",
    category: "featured",
    tags: ["导航", "新媒体", "工具"]
  },
  {
    name: "AI神器集",
    icon: "⚡",
    description: "每天都在收集最新的AI工具,保持更新",
    url: "https://hao.logosc.cn/",
    category: "featured",
    tags: ["导航", "AI工具", "更新"]
  },
  {
    name: "Latent Box",
    icon: "🎁",
    description: "AI、创意和艺术领域的精选合集",
    url: "https://latentbox.com/zh",
    category: "featured",
    tags: ["创意", "艺术", "精选"]
  },
  {
    name: "通往AGI之路",
    icon: "🚀",
    description: "国内公认优质AI领域门户网站",
    url: "https://www.waytoagi.com/",
    category: "learning",
    tags: ["AI学习", "门户", "教程"]
  },
  {
    name: "吾爱破解",
    icon: "🔓",
    description: "吾爱大佬的论坛,专门提供破解软件",
    url: "https://www.52pojie.cn/",
    category: "featured",
    tags: ["破解", "软件", "论坛"]
  },
  {
    name: "喜欢书签",
    icon: "🔖",
    description: "一个可以帮你找到各种网站的网站导航",
    url: "https://www.likebookmark.com/#category-585",
    category: "featured",
    tags: ["导航", "书签", "资源"]
  },

  // DeepSeek相关
  {
    name: "DeepSeek",
    icon: "🧠",
    description: "国产大模型,强大的AI对话能力",
    url: "https://chat.deepseek.com/",
    category: "chatbot",
    tags: ["大模型", "对话", "免费"]
  },
  {
    name: "硅基流动",
    icon: "💻",
    description: "2000万token免费送,在线部署DeepSeek到自己电脑",
    url: "https://cloud.siliconflow.cn/i/ErgVHfDU",
    category: "coding",
    tags: ["DeepSeek", "部署", "开发"]
  },
  {
    name: "Cherry Studio",
    icon: "🍒",
    description: "支持多平台的AI客户端,支持Win、macOS、Linux",
    url: "https://cherry-ai.com/zh-cn/download",
    category: "chatbot",
    tags: ["客户端", "多平台", "工具"]
  },
  {
    name: "Chatbox AI",
    icon: "💬",
    description: "AI客户端应用和智能助手,支持众多先进的AI模型",
    url: "https://chatboxai.app/zh#download",
    category: "chatbot",
    tags: ["客户端", "多模型", "助手"]
  },
  {
    name: "Ollama",
    icon: "🦙",
    description: "本地部署DeepSeek必备工具",
    url: "https://ollama.com/download",
    category: "coding",
    tags: ["本地部署", "开源", "工具"]
  },
  {
    name: "国家超算平台",
    icon: "🖥️",
    description: "24小时免费在线使用DeepSeek,不卡顿",
    url: "https://chat.scnet.cn/#/home",
    category: "chatbot",
    tags: ["免费", "DeepSeek", "超算"]
  },
  {
    name: "腾讯ima",
    icon: "📚",
    description: "个人知识库搭建平台,已接入DeepSeek",
    url: "https://ima.qq.com/",
    category: "office",
    tags: ["知识库", "腾讯", "DeepSeek"]
  },
  {
    name: "腾讯元宝",
    icon: "💎",
    description: "已接入DeepSeek,唯一可以抓取公众号内容的大模型",
    url: "https://yuanbao.tencent.com/",
    category: "chatbot",
    tags: ["腾讯", "公众号", "大模型"]
  },
  {
    name: "秘塔AI搜索",
    icon: "🔍",
    description: "可免费使用DeepSeek R1模型,支持联网搜索",
    url: "https://metaso.cn/?s=xiezuocat&s2=xiezuocat",
    category: "chatbot",
    tags: ["AI搜索", "联网", "免费"]
  },
  {
    name: "海鹦office AI助手",
    icon: "📄",
    description: "把DeepSeek接入WPS的插件",
    url: "https://www.office-ai.cn/",
    category: "office",
    tags: ["WPS", "插件", "办公"]
  },
  {
    name: "WPS",
    icon: "📝",
    description: "已接入满血版DeepSeek,支持联网搜索",
    url: "https://www.wps.cn/",
    category: "office",
    tags: ["办公软件", "DeepSeek", "联网"]
  },

  // 自媒体运营工具
  {
    name: "八爪鱼采集器",
    icon: "🐙",
    description: "批量自动化采集抖音、小红书等平台爆款内容",
    url: "https://affiliate.bazhuayu.com/2ngIsn",
    category: "social",
    tags: ["数据采集", "爆款分析", "自媒体"]
  },
  {
    name: "新榜工具包",
    icon: "🔧",
    description: "新媒体必备导航网址,运营工具合集",
    url: "https://nav.newrank.cn/?source=10000&l=nav_title",
    category: "social",
    tags: ["新媒体", "运营", "导航"]
  },
  {
    name: "iThinkai",
    icon: "✍️",
    description: "一键改写爆文,小红书、公众号、抖音爆款",
    url: "https://app.ithinkai.cn/?inviteCode=E3E5C31A",
    category: "social",
    tags: ["爆文改写", "内容创作", "自媒体"]
  },
  {
    name: "草料二维码",
    icon: "📱",
    description: "能把网址变成二维码,支持美化定制",
    url: "https://cli.im/",
    category: "social",
    tags: ["二维码", "工具", "营销"]
  },
  {
    name: "小码至营",
    icon: "🔗",
    description: "免费缩短网站,生成短链接",
    url: "https://portal.xiaomark.com/",
    category: "social",
    tags: ["短链接", "营销", "工具"]
  },
  {
    name: "创作罐头",
    icon: "📤",
    description: "一键自动同步多平台内容发布",
    url: "https://www.czgts.cn/special/invite?inviteCode=QZ1094571",
    category: "social",
    tags: ["多平台", "内容分发", "自媒体"]
  },
  {
    name: "Link3.cc",
    icon: "🔗",
    description: "超聚合链接营销工具,用一个链接聚合分享所有信息",
    url: "https://link3.cc/auths?id=m32svytm",
    category: "social",
    tags: ["链接", "营销", "聚合"]
  },
  {
    name: "点点数据",
    icon: "📊",
    description: "查看APP下载排行榜,数据分析",
    url: "https://app.diandian.com/",
    category: "social",
    tags: ["数据分析", "排行榜", "APP"]
  },

  // 公众号编辑排版
  {
    name: "壹伴",
    icon: "📝",
    description: "公众号管理插件、排版,免费送1个月会员",
    url: "https://yiban.io/invitation?invite_code=UG6KVA",
    category: "social",
    tags: ["公众号", "排版", "插件"]
  },
  {
    name: "135编辑器",
    icon: "✏️",
    description: "公众号排版工具,海量模板",
    url: "https://www.135editor.com/",
    category: "social",
    tags: ["公众号", "排版", "编辑器"]
  },
  {
    name: "秀米",
    icon: "🎨",
    description: "公众号排版,多种SVG模版",
    url: "https://xiumi.us/#/",
    category: "social",
    tags: ["公众号", "排版", "SVG"]
  },
  {
    name: "封面大师",
    icon: "🖼️",
    description: "适合公众号、小红书等平台封面设计",
    url: "https://cover.iwhy.dev/",
    category: "design",
    tags: ["封面设计", "公众号", "小红书"]
  },
  {
    name: "壁纸样机生成器",
    icon: "📱",
    description: "自动生成手机、pad等设备截图样机",
    url: "https://mjcn.club/",
    category: "design",
    tags: ["样机", "截图", "设计"]
  },
  {
    name: "微文档",
    icon: "📄",
    description: "可以在公众号文章内插入附件,支持多种文件格式",
    url: "https://mpdoc.com/",
    category: "social",
    tags: ["公众号", "附件", "文档"]
  },
  {
    name: "艺爪AI自媒体神器",
    icon: "🎨",
    description: "AI自动生成知识卡片、姓氏头像、名人语录、字幕拼图",
    url: "https://zmt.ezboti.com/p/3aaa",
    category: "social",
    tags: ["AI生成", "自媒体", "卡片"]
  },

  // 公众号写作工具
  {
    name: "讯飞绘文",
    icon: "✍️",
    description: "选题、配图、成文,体验一站式创作,多平台分发",
    url: "https://turbodesk.xfyun.cn/client-pro?inviteCode=HwxQ3D0GQIkqUmELpKoqwA",
    category: "office",
    tags: ["写作", "AI创作", "多平台"]
  },
  {
    name: "句子控",
    icon: "📖",
    description: "海量金句、台词、诗词素材库",
    url: "https://www.juzikong.com/",
    category: "office",
    tags: ["素材", "文案", "写作"]
  },
  {
    name: "深言达意",
    icon: "💬",
    description: "不知道怎么表达的时候用这个,找词找句子找素材",
    url: "https://www.shenyandayi.com/",
    category: "office",
    tags: ["写作辅助", "措辞", "素材"]
  },
  {
    name: "历史上的今天",
    icon: "📅",
    description: "根据日历盘点历史上的今天发生过的大事记",
    url: "https://baike.baidu.com/calendar/",
    category: "social",
    tags: ["选题", "历史", "热点"]
  },
  {
    name: "时间线",
    icon: "⏱️",
    description: "输入人物名称、历史事件,自动生成时间线理清脉络",
    url: "https://www.wiseal.cn/",
    category: "office",
    tags: ["时间线", "整理", "可视化"]
  },
  {
    name: "热搜引擎",
    icon: "🔥",
    description: "可以通过日期和关键词检索,找到各类平台历史的热搜记录",
    url: "https://www.zhaoyizhe.com/",
    category: "social",
    tags: ["热搜", "选题", "数据"]
  },
  {
    name: "今日热榜",
    icon: "📊",
    description: "汇聚全网各大平台热搜",
    url: "https://hot.vvhan.com/",
    category: "social",
    tags: ["热搜", "热点", "榜单"]
  },
  {
    name: "流光卡片",
    icon: "🎴",
    description: "输入文字自动排版生成海报,适合做书单号",
    url: "https://fireflycard.shushiai.com/",
    category: "design",
    tags: ["卡片生成", "海报", "书单"]
  },
  {
    name: "MD2Card",
    icon: "📇",
    description: "将Markdown文档转换为精美的知识卡片,支持多种风格",
    url: "https://md2card.com/zh",
    category: "design",
    tags: ["卡片", "Markdown", "转换"]
  },

  // 视频下载工具
  {
    name: "cobalt",
    icon: "⬇️",
    description: "免费视频下载神器,支持8K 4K等高清下载",
    url: "https://cobalt.tools/?utm_source=appinn.com",
    category: "social",
    tags: ["视频下载", "高清", "免费"]
  },
  {
    name: "下载狗",
    icon: "🐕",
    description: "全网视频高清下载工具,输入链接自动提取",
    url: "https://www.xiazaitool.com/?ref=9349j8W",
    category: "social",
    tags: ["视频下载", "无水印", "工具"]
  },
  {
    name: "KukTool",
    icon: "🔧",
    description: "130多个平台,视频和图片无水印下载",
    url: "https://dy.kukutool.com/zh-Hans-SG",
    category: "social",
    tags: ["视频下载", "无水印", "多平台"]
  },
  {
    name: "飞鱼视频下载助手",
    icon: "🐟",
    description: "支持批量下载抖音、小红书、B站等平台视频",
    url: "https://www.feiyudo.com/",
    category: "social",
    tags: ["视频下载", "批量", "无水印"]
  },

  // 电影台词工具
  {
    name: "33台词",
    icon: "🎬",
    description: "根据台词自动搜索电影画面,支持截图和视频下载",
    url: "https://33.agilestudio.cn/",
    category: "social",
    tags: ["台词", "电影", "素材"]
  },
  {
    name: "找台词",
    icon: "🎥",
    description: "影视经典片段混剪必备",
    url: "http://www.zhaotaici.cn/",
    category: "social",
    tags: ["台词", "影视", "混剪"]
  },
  {
    name: "拼字幕",
    icon: "📝",
    description: "一键生成电影多行字幕拼图,字体样式较多",
    url: "https://www.pinzimu.com/",
    category: "design",
    tags: ["字幕", "拼图", "电影"]
  },

  // 图标下载
  {
    name: "HQ ICON",
    icon: "🏷️",
    description: "所有APP的LOGO都可以搜到,免费下载透明图片",
    url: "https://icon.yukonga.top/",
    category: "design",
    tags: ["图标", "LOGO", "免费"]
  },
  {
    name: "Thiings",
    icon: "🎨",
    description: "超好看的图标网站,PNG免抠",
    url: "https://www.thiings.co/things",
    category: "design",
    tags: ["图标", "PNG", "设计"]
  },
  {
    name: "Iconfont",
    icon: "🎯",
    description: "ICON图标库、矢量插画库、3D插画库",
    url: "https://www.iconfont.cn/?spm=a313x.collections_index.i3.2.66fb3a81im91p8",
    category: "design",
    tags: ["图标", "矢量", "3D"]
  },
  {
    name: "字节跳动图标库",
    icon: "💫",
    description: "字节跳动开源图标库",
    url: "https://iconpark.oceanengine.com/home",
    category: "design",
    tags: ["图标", "开源", "字节"]
  },
  {
    name: "iconbrew",
    icon: "🍺",
    description: "免费下载图标",
    url: "https://iconbrew.com/",
    category: "design",
    tags: ["图标", "免费", "下载"]
  },

  // 抠图工具
  {
    name: "remove.bg",
    icon: "🎨",
    description: "免费背景一键消除,实时更换各种背景",
    url: "https://www.remove.bg/zh",
    category: "image",
    tags: ["抠图", "背景去除", "免费"]
  },
  {
    name: "批量抠图工具",
    icon: "🖼️",
    description: "在线移除背景,支持批量处理",
    url: "https://images.batchtool.com/zh",
    category: "image",
    tags: ["抠图", "批量处理", "在线"]
  },
  {
    name: "腾讯ARC",
    icon: "🛡️",
    description: "免费图像修复、抠图,在线使用",
    url: "https://arc.tencent.com/zh/ai-demos/faceRestoration",
    category: "image",
    tags: ["图像修复", "抠图", "腾讯"]
  },
  {
    name: "抠抠图",
    icon: "✂️",
    description: "永久免费的在线抠图工具,免登录抠图、无限制下载高清大图",
    url: "https://www.koukoutu.com/",
    category: "image",
    tags: ["抠图", "免费", "高清"]
  },
  {
    name: "jpghd",
    icon: "🖼️",
    description: "老照片无损修复",
    url: "https://jpghd.com/",
    category: "image",
    tags: ["照片修复", "老照片", "无损"]
  },

  // 数字人工具
  {
    name: "硅语Meta平台",
    icon: "🤖",
    description: "上百个公模免费使用,支持1080P、2K、4K数字人克隆",
    url: "http://meta.guiji.ai/",
    category: "video",
    tags: ["数字人", "视频生成", "克隆"]
  },
  {
    name: "蝉妈妈蝉镜数字人",
    icon: "🦗",
    description: "免费定制数字人、克隆声音,支持批量生成视频",
    url: "https://www.chanjing.cc/refc/?type=hzBuy&id=CNZXYD4yCFluYdtCjKQw7KtsRYvGdqaH0YP0zw2N2ow",
    category: "video",
    tags: ["数字人", "声音克隆", "批量生成"]
  },
  {
    name: "魔法有言3D数字人",
    icon: "🎭",
    description: "3D数字人短视频生成平台",
    url: "https://www.youyan3d.com/?from=drlx_yhaigc",
    category: "video",
    tags: ["3D数字人", "视频生成", "短视频"]
  },

  // 资源下载
  {
    name: "安娜的档案",
    icon: "📚",
    description: "人类历史上最大的完全开放的图书馆",
    url: "https://zh.annas-archive.org/",
    category: "learning",
    tags: ["电子书", "图书馆", "免费"]
  },
  {
    name: "Z-Library",
    icon: "📖",
    description: "世界上最大的电子图书馆",
    url: "https://zh.z-lib.blog/",
    category: "learning",
    tags: ["电子书", "图书", "下载"]
  },
  {
    name: "一单书",
    icon: "📕",
    description: "豆包、微信读书优质书单推荐,支持电子书下载",
    url: "https://yidanshu.com/",
    category: "learning",
    tags: ["电子书", "书单", "推荐"]
  },
  {
    name: "Pexels",
    icon: "📷",
    description: "免费图片素材",
    url: "https://www.pexels.com/zh-cn/",
    category: "design",
    tags: ["图片素材", "免费", "高清"]
  },
  {
    name: "Pixabay",
    icon: "🖼️",
    description: "免费无版权4K图片、视频、音频素材",
    url: "https://pixabay.com/zh/",
    category: "design",
    tags: ["素材", "无版权", "4K"]
  },
  {
    name: "自由字体",
    icon: "🔤",
    description: "免费可商用字体下载",
    url: "https://ziyouziti.com/",
    category: "design",
    tags: ["字体", "免费", "商用"]
  },

  // AI通用大模型
  {
    name: "Kimi",
    icon: "🌙",
    description: "月之暗面出品,长文本对话专家",
    url: "https://kimi.moonshot.cn/",
    category: "chatbot",
    tags: ["大模型", "长文本", "对话"]
  },
  {
    name: "豆包",
    icon: "🎒",
    description: "字节跳动出品AI助手",
    url: "https://www.doubao.com/chat/",
    category: "chatbot",
    tags: ["字节", "对话", "助手"]
  },
  {
    name: "文心一言",
    icon: "🔵",
    description: "百度出品大语言模型",
    url: "https://yiyan.baidu.com/?utm_source=ai-bot.cn",
    category: "chatbot",
    tags: ["百度", "大模型", "对话"]
  },
  {
    name: "通义千问",
    icon: "☁️",
    description: "阿里云出品大语言模型",
    url: "https://tongyi.aliyun.com/qianwen/?spm=5176.2810346&code=sw31xf0id8&utm_content=se_1017929191",
    category: "chatbot",
    tags: ["阿里", "大模型", "对话"]
  },
  {
    name: "海螺AI",
    icon: "🐚",
    description: "MiniMax出品,支持多模态生成",
    url: "https://hailuoai.com/",
    category: "chatbot",
    tags: ["多模态", "对话", "生成"]
  },
  {
    name: "天工AI",
    icon: "🛠️",
    description: "昆仑万维出品AI助手",
    url: "https://www.tiangong.cn/",
    category: "chatbot",
    tags: ["对话", "搜索", "Agent"]
  },
  {
    name: "讯飞星火",
    icon: "✨",
    description: "科大讯飞出品认知大模型",
    url: "https://xinghuo.xfyun.cn/?a=0",
    category: "chatbot",
    tags: ["讯飞", "认知", "对话"]
  },
  {
    name: "智谱清言",
    icon: "💬",
    description: "清华出品ChatGLM大模型",
    url: "https://chatglm.cn/main/alltoolsdetail?lang=zh",
    category: "chatbot",
    tags: ["清华", "大模型", "多功能"]
  },
  {
    name: "扣子",
    icon: "🔘",
    description: "字节跳动AI Bot开发平台",
    url: "https://www.coze.com/?ref=ai-bot.cn",
    category: "chatbot",
    tags: ["Bot开发", "字节", "平台"]
  },

  // AI搜索
  {
    name: "纳米AI搜索",
    icon: "🔬",
    description: "AI驱动的搜索引擎",
    url: "https://www.n.cn/",
    category: "chatbot",
    tags: ["AI搜索", "搜索引擎", "智能"]
  },
  {
    name: "Perplexity",
    icon: "🔎",
    description: "海外AI搜索引擎",
    url: "https://www.perplexity.ai/",
    category: "chatbot",
    tags: ["AI搜索", "海外", "引用"]
  },

  // AI编程
  {
    name: "Trae",
    icon: "💻",
    description: "AI编程助手",
    url: "https://www.trae.ai/",
    category: "coding",
    tags: ["编程", "代码生成", "助手"]
  },
  {
    name: "Cursor",
    icon: "🖱️",
    description: "AI代码编辑器",
    url: "https://www.cursor.com/",
    category: "coding",
    tags: ["IDE", "代码", "编辑器"]
  },
  {
    name: "码上飞CodeFlying",
    icon: "🚀",
    description: "用AI开发应用,一句话生成网站",
    url: "https://www.codeflying.net/api/tenant/acceptSignUpCode?&Wxpbmd=19027&signup_code=dXcKTSNwpDNy&env=pc#",
    category: "coding",
    tags: ["低代码", "网站生成", "开发"]
  },

  // AI 3D模型
  {
    name: "TripoAI",
    icon: "🧊",
    description: "AI生成3D模型",
    url: "https://www.tripo3d.ai/",
    category: "image",
    tags: ["3D", "模型生成", "AI"]
  },
  {
    name: "混元3D",
    icon: "🎲",
    description: "腾讯出品3D生成工具",
    url: "https://3d.hunyuan.tencent.com/",
    category: "image",
    tags: ["3D", "腾讯", "生成"]
  },

  // AI图片生成
  {
    name: "Midjourney",
    icon: "🎨",
    description: "AI图片生成天花板,需要魔法",
    url: "https://www.midjourney.com/home",
    category: "image",
    tags: ["AI绘画", "生图", "专业"]
  },
  {
    name: "LibLib AI",
    icon: "📚",
    description: "国内AI生图天花板,每天有免费额度",
    url: "https://www.liblib.art/?sourceId=000522&bd_vid=11416323099388410291",
    category: "image",
    tags: ["AI绘画", "国产", "免费"]
  },
  {
    name: "ComfyUI",
    icon: "🎛️",
    description: "AI生图工作流软件,支持API调用",
    url: "https://www.comfy.org/zh-cn/download",
    category: "image",
    tags: ["工作流", "本地部署", "专业"]
  },
  {
    name: "即梦AI",
    icon: "💭",
    description: "生图质量较好,免费额度",
    url: "https://jimeng.jianying.com/",
    category: "image",
    tags: ["AI绘画", "免费", "剪映"]
  },
  {
    name: "星流AI",
    icon: "⭐",
    description: "AI生图工具,上百种增强模型可选",
    url: "https://www.xingliu.art/",
    category: "image",
    tags: ["AI绘画", "模型", "增强"]
  },
  {
    name: "堆友",
    icon: "🎨",
    description: "万物生花超多AI生成图片模版直接套用",
    url: "https://d.design/?sharecode=I-_ULGwyHn",
    category: "image",
    tags: ["模板", "快速生成", "设计"]
  },
  {
    name: "Whisk",
    icon: "🥄",
    description: "谷歌图片融合工具,可以把两张不同的图片融合在一起",
    url: "https://labs.google/fx/tools/whisk/unsupported-country",
    category: "image",
    tags: ["谷歌", "图片融合", "创意"]
  },
  {
    name: "Seaart",
    icon: "🌊",
    description: "写实 动漫 AI美女绘画生成器",
    url: "https://www.seaart.me/zhCN",
    category: "image",
    tags: ["AI绘画", "写实", "动漫"]
  },
  {
    name: "文心一格",
    icon: "🖼️",
    description: "AI艺术和创意绘画辅助",
    url: "https://yige.baidu.com/",
    category: "image",
    tags: ["百度", "艺术", "创意"]
  },
  {
    name: "秒画",
    icon: "⚡",
    description: "让无绘画经验都可创作出专业水准的艺术作品",
    url: "https://miaohua.sensetime.com/?utm_source=ai-bot.cn",
    category: "image",
    tags: ["商汤", "快速", "艺术"]
  },
  {
    name: "KreaAI",
    icon: "✍️",
    description: "随便画个草图,就能实时渲染成高质量作品",
    url: "https://www.krea.ai/home",
    category: "image",
    tags: ["实时", "草图", "渲染"]
  },
  {
    name: "图片转提示词",
    icon: "🔄",
    description: "上传图片自动识别提示词",
    url: "https://image2prompt.net/",
    category: "image",
    tags: ["提示词", "图片分析", "反推"]
  },
  {
    name: "神采AI",
    icon: "🏛️",
    description: "建筑师、室内设计师、产品设计师和游戏动漫设计师的必备工具",
    url: "https://www.ishencai.com/?vsource=i_97x0g4mht7",
    category: "image",
    tags: ["建筑设计", "室内设计", "专业"]
  },

  // 海报设计
  {
    name: "Canva可画",
    icon: "🎨",
    description: "批量生成海报、PPT模版",
    url: "https://www.canva.cn/join/jfh-rjy-kzs",
    category: "design",
    tags: ["设计", "海报", "模板"]
  },
  {
    name: "稿定设计AI",
    icon: "📐",
    description: "提供多种AI设计工具,包括AI做图、AI文案、AI商品图",
    url: "https://www.gaoding.com/ai",
    category: "design",
    tags: ["设计", "电商", "AI"]
  },
  {
    name: "美图设计室",
    icon: "📷",
    description: "通过文本描述快速生成高质量图片和插画",
    url: "https://www.designkit.com/?from=ai-bot.cn",
    category: "design",
    tags: ["美图", "设计", "插画"]
  },
  {
    name: "Motiff妙多",
    icon: "🎯",
    description: "AI生成UI效果",
    url: "https://motiff.com/",
    category: "design",
    tags: ["UI设计", "界面", "AI"]
  },
  {
    name: "优设网",
    icon: "🎓",
    description: "设计师必备网站,各类AI设计工具、教程齐全",
    url: "https://www.uisdc.com/",
    category: "learning",
    tags: ["设计教程", "资源", "社区"]
  },
  {
    name: "在线PS",
    icon: "🖌️",
    description: "免安装,浏览器在线使用PS",
    url: "https://ps.gaoding.com/#/",
    category: "design",
    tags: ["PS", "在线", "图片编辑"]
  },

  // Logo生成
  {
    name: "Logo Galleria",
    icon: "🏷️",
    description: "描述需求,AI自动生成logo",
    url: "https://logogalleria.com/zh-CN",
    category: "design",
    tags: ["Logo", "品牌", "生成"]
  },
  {
    name: "标小智",
    icon: "🎨",
    description: "LOGO生成神器",
    url: "https://www.logosc.cn/",
    category: "design",
    tags: ["Logo", "品牌", "智能"]
  },

  // AI视频工具
  {
    name: "Sora",
    icon: "🎬",
    description: "AI视频生成天花板",
    url: "https://sora.com/library",
    category: "video",
    tags: ["OpenAI", "视频生成", "顶级"]
  },
  {
    name: "可灵AI",
    icon: "🎥",
    description: "老照片动起来效果非常好",
    url: "https://klingai.kuaishou.com/",
    category: "video",
    tags: ["视频生成", "快手", "照片动画"]
  },
  {
    name: "智谱清影",
    icon: "🎞️",
    description: "视频集成大模型,支持文生视频和图生视频",
    url: "https://chatglm.cn/video",
    category: "video",
    tags: ["清华", "视频生成", "多模态"]
  },
  {
    name: "Vidu AI",
    icon: "🎬",
    description: "多模态视频生成大模型,主体保持一致性",
    url: "http://www.vidu.studio/",
    category: "video",
    tags: ["视频生成", "国产", "一致性"]
  },
  {
    name: "Pika",
    icon: "⚡",
    description: "1.5版本新增6款视频特效,可以做AI捏捏",
    url: "https://pika.art/",
    category: "video",
    tags: ["视频生成", "特效", "海外"]
  },
  {
    name: "Haiper",
    icon: "🤗",
    description: "可以做照片人物拥抱视频",
    url: "https://haiper.ai/",
    category: "video",
    tags: ["视频生成", "特效", "人物"]
  },
  {
    name: "Pixverse",
    icon: "🌌",
    description: "V3模型新增多款特效",
    url: "https://app.pixverse.ai/home",
    category: "video",
    tags: ["视频生成", "特效", "升级"]
  },
  {
    name: "众影AI",
    icon: "🐼",
    description: "熊猫头沙雕动画制作神器,输入剧本自动生成视频",
    url: "https://m.zy.tensorbay.cn/register?invite_code=127448",
    category: "video",
    tags: ["沙雕动画", "熊猫头", "自动生成"]
  },

  // 视频翻译换脸
  {
    name: "face swap",
    icon: "😎",
    description: "视频、照片换脸,在线免费使用",
    url: "https://aifaceswapper.io/cn",
    category: "video",
    tags: ["换脸", "视频处理", "免费"]
  },
  {
    name: "Videolingo",
    icon: "🌐",
    description: "Netflix级字幕切割、翻译、对齐、甚至加上配音",
    url: "https://videolingo.io/zh",
    category: "video",
    tags: ["视频翻译", "字幕", "配音"]
  },
  {
    name: "分派翻译",
    icon: "🔄",
    description: "支持视频翻译、图片翻译、30多国语言互译",
    url: "https://www.wnoq.com/",
    category: "video",
    tags: ["翻译", "多语言", "视频"]
  },
  {
    name: "Vozo",
    icon: "🎙️",
    description: "视频翻译",
    url: "https://www.vozo.ai/",
    category: "video",
    tags: ["视频翻译", "对口型", "配音"]
  },
  {
    name: "Qcut",
    icon: "✂️",
    description: "视频翻译、对口型、AI换脸",
    url: "http://qcut.pro/",
    category: "video",
    tags: ["视频处理", "翻译", "换脸"]
  },
  {
    name: "Domo AI",
    icon: "🎌",
    description: "将上传的图片和视频转绘为二次元风格的动漫",
    url: "https://domoai.app/?ref=ai-bot.cn",
    category: "video",
    tags: ["动漫化", "风格转换", "二次元"]
  },
  {
    name: "Viggle",
    icon: "🕺",
    description: "AI替换视频人物",
    url: "https://viggle.ai/create",
    category: "video",
    tags: ["人物替换", "视频编辑", "AI"]
  },

  // AI音频工具
  {
    name: "魔音工坊",
    icon: "🎤",
    description: "短视频最热门的配音基本都在这",
    url: "https://www.moyin.com/?channelCode=YHAIGC_20250227",
    category: "audio",
    tags: ["配音", "AI语音", "热门"]
  },
  {
    name: "TTS Maker",
    icon: "🔊",
    description: "完全免费的文本转语音工具",
    url: "https://ttsmaker.cn/",
    category: "audio",
    tags: ["TTS", "免费", "配音"]
  },
  {
    name: "讯飞智作",
    icon: "🎙️",
    description: "AI文字转语音、语音合成、智能配音",
    url: "https://peiyin.xfyun.cn/?utm_source=ai-bot.cn",
    category: "audio",
    tags: ["讯飞", "配音", "语音合成"]
  },
  {
    name: "海螺AI配音",
    icon: "🐚",
    description: "免费AI配音,支持多国语言+多种音色,声音克隆待上线",
    url: "https://hailuoai.com/audio",
    category: "audio",
    tags: ["配音", "多语言", "音色"]
  },
  {
    name: "Noiz AI",
    icon: "🎵",
    description: "免费的视频翻译+声音克隆网站",
    url: "https://noiz.ai/",
    category: "audio",
    tags: ["声音克隆", "视频翻译", "免费"]
  },
  {
    name: "fish.audio",
    icon: "🐠",
    description: "3秒克隆任何人声音,已经上线几百个配音模型",
    url: "https://fish.audio/zh-CN/",
    category: "audio",
    tags: ["声音克隆", "配音", "快速"]
  },
  {
    name: "Anyvoice",
    icon: "🎤",
    description: "免费声音克隆网站,3秒即可克隆声音",
    url: "https://anyvoice.net/zh",
    category: "audio",
    tags: ["声音克隆", "免费", "快速"]
  },
  {
    name: "Mureka",
    icon: "🎼",
    description: "昆仑万维开发的AI音乐创作工具",
    url: "https://www.mureka.ai/?invite_code=Q32Mzy",
    category: "audio",
    tags: ["音乐生成", "创作", "AI"]
  },
  {
    name: "海绵音乐",
    icon: "🎵",
    description: "输入一句话灵感或者歌词即可快速生成音乐",
    url: "https://www.haimian.com/featured",
    category: "audio",
    tags: ["音乐生成", "网易", "AI"]
  },
  {
    name: "udio",
    icon: "🎶",
    description: "免费的AI音乐创作工具,每月可生成1200首歌曲",
    url: "https://www.udio.com/?utm_source=ai-bot.cn",
    category: "audio",
    tags: ["音乐生成", "免费", "创作"]
  },
  {
    name: "网易天音",
    icon: "🎼",
    description: "专业音乐生成工具,支持AI编曲、AI作词、AI生成歌",
    url: "https://tianyin.music.163.com/#/",
    category: "audio",
    tags: ["网易", "音乐生成", "专业"]
  },
  {
    name: "人声伴奏分离",
    icon: "🎚️",
    description: "免费的人声伴奏分离工具,网页版在线使用",
    url: "https://vocalremover.org/zh/splitter-ai",
    category: "audio",
    tags: ["音频处理", "人声分离", "免费"]
  },

  // AI办公工具
  {
    name: "67tool即时工具",
    icon: "🛠️",
    description: "好用的在线工具箱,办公常用",
    url: "https://www.67tool.com/",
    category: "office",
    tags: ["工具箱", "在线", "办公"]
  },
  {
    name: "文状元",
    icon: "📄",
    description: "公文写作必备,宣传条口写材料神器",
    url: "https://www.wenzhuangyuan.cn/",
    category: "office",
    tags: ["公文写作", "AI写作", "材料"]
  },
  {
    name: "讯飞写作",
    icon: "✍️",
    description: "支持对话式交互,快速生成新闻、广告等各类文本内容",
    url: "https://huixie.iflyrec.com/list?from=ai-bot",
    category: "office",
    tags: ["讯飞", "AI写作", "文案"]
  },
  {
    name: "火山写作",
    icon: "🌋",
    description: "快速生成多篇高质量文章,提高写作效率",
    url: "https://huixie.iflyrec.com/list?from=ai-bot",
    category: "office",
    tags: ["字节", "写作", "高效"]
  },
  {
    name: "秘塔写作猫",
    icon: "🐱",
    description: "支持全文写作、广告语、论文、短视频文案等",
    url: "https://xiezuocat.com/",
    category: "office",
    tags: ["写作", "校对", "润色"]
  },
  {
    name: "笔灵AI",
    icon: "📝",
    description: "提供免费的AI文章改写、论文辅助、商业计划书撰写等服务",
    url: "https://ibiling.cn/template",
    category: "office",
    tags: ["写作", "论文", "改写"]
  },
  {
    name: "蛙蛙写作",
    icon: "🐸",
    description: "为创作者提供续写、润色、扩写、改写等服务,主要支持小说、剧本",
    url: "https://wawawriter.com/app/",
    category: "office",
    tags: ["小说写作", "剧本", "长文"]
  },
  {
    name: "不坑盒子",
    icon: "📦",
    description: "免费的WPS office办公插件",
    url: "https://www.bukenghezi.com/",
    category: "office",
    tags: ["WPS", "插件", "免费"]
  },

  // AI生成PPT
  {
    name: "Gamma",
    icon: "📊",
    description: "AI生成PPT天花板",
    url: "https://gamma.app/zh-cn",
    category: "office",
    tags: ["PPT", "演示", "AI"]
  },
  {
    name: "AiPPT",
    icon: "📑",
    description: "自动生成PPT大纲文案,文档秒变PPT,提供海量精品模板",
    url: "https://www.aippt.cn/?utm_type=Navweb&utm_source=ai-bot&utm_page=aippt&utm_plan=ppt&utm_unit=AIPPT&utm_keyword=50608",
    category: "office",
    tags: ["PPT", "自动生成", "模板"]
  },
  {
    name: "讯飞智文",
    icon: "📄",
    description: "文档一键生成PPT",
    url: "https://zhiwen.xfyun.cn/",
    category: "office",
    tags: ["PPT", "讯飞", "文档"]
  },
  {
    name: "islide",
    icon: "🎯",
    description: "Word、脑图转PPT,文字、图片AI编辑,海量正版模板素材",
    url: "https://www.islide.cc/?mtm_campaign=ai-bot",
    category: "office",
    tags: ["PPT", "插件", "模板"]
  },
  {
    name: "美图AI PPT",
    icon: "📊",
    description: "支持简短语句快速生成一套精美PPT",
    url: "https://www.designkit.com/ppt/?from=home",
    category: "office",
    tags: ["PPT", "美图", "快速"]
  },
  {
    name: "Mindshow",
    icon: "🧠",
    description: "提供一键智能生成PPT、自动设计图片、多格式文档导入等功能",
    url: "https://www.mindshow.fun/#/home",
    category: "office",
    tags: ["PPT", "导入", "智能"]
  },

  // 思维导图
  {
    name: "ProcessOn",
    icon: "🔄",
    description: "在线协作绘图,支持思维导图、流程图、原型图等",
    url: "https://www.processon.com/",
    category: "office",
    tags: ["思维导图", "流程图", "协作"]
  },
  {
    name: "TreeMio树图",
    icon: "🌳",
    description: "通过一句话生成详细的思维导图",
    url: "https://shutu.cn/",
    category: "office",
    tags: ["思维导图", "AI生成", "快速"]
  },
  {
    name: "博思白板",
    icon: "🎨",
    description: "支持实时编辑、绘图、头脑风暴等功能",
    url: "https://boardmix.cn/ai-whiteboard/?code=lQWShGuAfPiX",
    category: "office",
    tags: ["白板", "协作", "思维导图"]
  },
  {
    name: "Xmind",
    icon: "💡",
    description: "高效的可视化思维工具",
    url: "https://xmind.cn/",
    category: "office",
    tags: ["思维导图", "专业", "跨平台"]
  },
  {
    name: "知犀",
    icon: "🦌",
    description: "免费的在线思维导图和图示工具",
    url: "https://www.zhixi.com/",
    category: "office",
    tags: ["思维导图", "免费", "在线"]
  },

  // 会议记录
  {
    name: "飞书妙记",
    icon: "📝",
    description: "飞书智能会议纪要和快捷语音识别转文字",
    url: "https://www.feishu.cn/product/minutes",
    category: "office",
    tags: ["会议记录", "飞书", "语音转文字"]
  },
  {
    name: "讯飞听见",
    icon: "👂",
    description: "实时字幕、实时翻译、自动生成会议记录",
    url: "https://meeting.iflyrec.com/",
    category: "office",
    tags: ["会议记录", "讯飞", "实时"]
  },

  // 简历工具
  {
    name: "YOO 简历",
    icon: "📋",
    description: "写简历、简历分析、岗位探测、岗位投递,一站式解决求职难题",
    url: "https://www.yoojober.com/",
    category: "office",
    tags: ["简历", "求职", "AI"]
  },
  {
    name: "入职啦简历",
    icon: "📄",
    description: "在线平台,提供简单、快速的简历制作服务",
    url: "https://ruzhila.cn/app/",
    category: "office",
    tags: ["简历", "在线", "制作"]
  },
  {
    name: "简历模版免费下载",
    icon: "📥",
    description: "大量简历模板免费下载",
    url: "https://jianlixiazai.cn/",
    category: "office",
    tags: ["简历", "模板", "免费"]
  },
  {
    name: "腾讯帮小忙",
    icon: "🔧",
    description: "在线工具合集,解决各种办公需求",
    url: "https://tool.browser.qq.com/",
    category: "office",
    tags: ["工具箱", "腾讯", "在线"]
  },

  // 翻译工具
  {
    name: "有道翻译",
    icon: "🌐",
    description: "可以提供一站式翻译服务",
    url: "https://fanyi.youdao.com/?msclkid=4875bd2cc4d81dfbcf74db97d52d9263#/AITranslate?keyfrom=aibingvip",
    category: "office",
    tags: ["翻译", "有道", "多语言"]
  },
  {
    name: "网易见外",
    icon: "👀",
    description: "集视频、直播、语音转写、文档直翻功能为一体的AI智能语音转写听翻平台",
    url: "https://sight.youdao.com/?utm_source=ai-bot.cn",
    category: "office",
    tags: ["翻译", "语音转写", "视频"]
  },
  {
    name: "阿里翻译",
    icon: "🔄",
    description: "覆盖200+语言的智能机器翻译服务",
    url: "https://translate.alibaba.com/?ref=ai-bot.cn",
    category: "office",
    tags: ["翻译", "阿里", "多语言"]
  },
  {
    name: "火山翻译",
    icon: "🌋",
    description: "权威词典、支持多种查词方式,10+语种丰富音色免费开放",
    url: "https://translate.volcengine.com/",
    category: "office",
    tags: ["翻译", "字节", "词典"]
  },

  // 学习网站
  {
    name: "软件自学网",
    icon: "💻",
    description: "软件下载免费、课程学习免费",
    url: "https://www.rjzxw.com/",
    category: "learning",
    tags: ["自学", "软件", "教程"]
  },
  {
    name: "学吧导航",
    icon: "🧭",
    description: "自学技能必备网址,40万人在用",
    url: "https://www.xue8nav.com/",
    category: "learning",
    tags: ["导航", "自学", "技能"]
  },
  {
    name: "网易公开课",
    icon: "🎓",
    description: "收录了大量免费公开课程",
    url: "https://open.163.com/",
    category: "learning",
    tags: ["网易", "公开课", "免费"]
  },
  {
    name: "一席",
    icon: "🎤",
    description: "听君一席话,胜读十年书",
    url: "https://yixi.tv/",
    category: "learning",
    tags: ["演讲", "知识", "分享"]
  },
  {
    name: "doyoudo",
    icon: "🎬",
    description: "一个专门做软件教学的视频网站",
    url: "http://www.doyoudo.com/",
    category: "learning",
    tags: ["设计", "视频教程", "软件"]
  },
  {
    name: "学堂在线",
    icon: "🏛️",
    description: "由清华大学发起并运营的中国首个大规模开放在线课程平台",
    url: "https://www.xuetangx.com/",
    category: "learning",
    tags: ["清华", "慕课", "在线课程"]
  },
  {
    name: "Classcentral",
    icon: "🌍",
    description: "免费查找全球高质量公开课在线学习",
    url: "https://www.classcentral.com/",
    category: "learning",
    tags: ["公开课", "全球", "免费"]
  },
  {
    name: "国家数字图书馆",
    icon: "📚",
    description: "国家级数字图书馆,海量资源",
    url: "https://www.nlc.cn/web/index.shtml",
    category: "learning",
    tags: ["图书馆", "国家级", "资源"]
  },
  {
    name: "终身教育平台",
    icon: "🎓",
    description: "国家开放大学终身教育平台",
    url: "https://le.ouchn.cn/home",
    category: "learning",
    tags: ["终身学习", "国家级", "教育"]
  },
  {
    name: "国家高等教育智慧教育平台",
    icon: "🏫",
    description: "国家级高等教育资源平台",
    url: "https://higher.smartedu.cn/home",
    category: "learning",
    tags: ["高等教育", "国家级", "智慧"]
  },
  {
    name: "中国大学MOOC",
    icon: "🎓",
    description: "国内优质中文MOOC学习平台",
    url: "https://www.icourse163.org/",
    category: "learning",
    tags: ["慕课", "大学", "免费"]
  },

  // 教师工具
  {
    name: "Our Teacher",
    icon: "👨‍🏫",
    description: "DeepSeek教师版,一站式AI备课、教学神器",
    url: "https://www.ourteacher.cc/?ref=480251",
    category: "learning",
    tags: ["教师", "备课", "AI"]
  },
  {
    name: "蜜蜂家校",
    icon: "🐝",
    description: "可以帮助老师批改作业的AI工具",
    url: "http://xy.mifengjiaoyu.com/",
    category: "learning",
    tags: ["教师", "批改作业", "AI"]
  },
  {
    name: "教师宝",
    icon: "💼",
    description: "幼师、中小学、K12老师必备AI工具",
    url: "https://teacherai.cc/?cid=213&share_id=213",
    category: "learning",
    tags: ["教师", "K12", "AI"]
  },
  {
    name: "希沃白板",
    icon: "📊",
    description: "老师做课件必备的AI工具,大量课件模版可以直接用",
    url: "https://easinote.seewo.com/",
    category: "learning",
    tags: ["教师", "课件", "白板"]
  },
  {
    name: "国家中小学智慧教育平台",
    icon: "🏫",
    description: "为广大中小学校提供专业化、精品化、体系化的资源服务",
    url: "https://basic.smartedu.cn/",
    category: "learning",
    tags: ["中小学", "国家级", "教育"]
  },
  {
    name: "人教点读",
    icon: "📖",
    description: "人民教育出版社官方出品,是专为中小学生量身打造的优质学习资源平台",
    url: "https://www.pep.com.cn/products/sz/ydxx/rjdd/",
    category: "learning",
    tags: ["点读", "人教版", "中小学"]
  },
  {
    name: "可汗学院中文版",
    icon: "🎓",
    description: "全球免费在线学习平台",
    url: "https://zh.khanacademy.org/",
    category: "learning",
    tags: ["可汗学院", "免费", "全球"]
  }
];

// ==========================================
// 状态管理
// ==========================================
let currentCategory = 'all';
let searchQuery = '';
let displayedTools = 20;
const toolsPerPage = 20;
let filteredTools = [...toolsData];

// ==========================================
// DOM元素
// ==========================================
const searchInput = document.getElementById('searchInput');
const toolsGrid = document.getElementById('toolsGrid');
const emptyState = document.getElementById('emptyState');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const themeToggle = document.getElementById('themeToggle');
const categoryTabs = document.querySelectorAll('.filter-tab');

// ==========================================
// 主题切换
// ==========================================
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('.theme-icon');
    icon.textContent = theme === 'light' ? '🌙' : '☀️';
}

// ==========================================
// 工具筛选和搜索
// ==========================================
function filterTools() {
    filteredTools = toolsData.filter(tool => {
        const matchesCategory = currentCategory === 'all' || tool.category === currentCategory;
        const matchesSearch = !searchQuery ||
            tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tool.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

        return matchesCategory && matchesSearch;
    });

    displayedTools = toolsPerPage;
    renderTools();
}

// ==========================================
// 渲染工具卡片
// ==========================================
function renderTools() {
    const toolsToShow = filteredTools.slice(0, displayedTools);

    if (toolsToShow.length === 0) {
        toolsGrid.style.display = 'none';
        emptyState.style.display = 'block';
        loadMoreBtn.style.display = 'none';
        return;
    }

    toolsGrid.style.display = 'grid';
    emptyState.style.display = 'none';

    toolsGrid.innerHTML = toolsToShow.map(tool => `
        <div class="tool-card" onclick="window.open('${tool.url}', '_blank')">
            <div class="tool-header">
                <div class="tool-icon">${tool.icon}</div>
                <div class="tool-info">
                    <h3 class="tool-name">${tool.name}</h3>
                    <span class="tool-category">${getCategoryName(tool.category)}</span>
                </div>
            </div>
            <p class="tool-description">${tool.description}</p>
            <div class="tool-tags">
                ${tool.tags.map(tag => `<span class="tool-tag">${tag}</span>`).join('')}
            </div>
            <a href="${tool.url}" class="tool-link" target="_blank" onclick="event.stopPropagation()">
                访问网站 →
            </a>
        </div>
    `).join('');

    // 更新加载更多按钮状态
    if (displayedTools >= filteredTools.length) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'inline-block';
    }

    // 更新统计数字
    updateStats();
}

// ==========================================
// 辅助函数
// ==========================================
function getCategoryName(category) {
    const categoryMap = {
        'all': '全部',
        'featured': '精选',
        'chatbot': 'AI对话',
        'image': '图片生成',
        'video': '视频工具',
        'audio': '音频工具',
        'office': '办公工具',
        'coding': '编程开发',
        'learning': '学习资源',
        'design': '设计素材',
        'social': '自媒体'
    };
    return categoryMap[category] || category;
}

function updateStats() {
    const totalToolsElement = document.getElementById('totalTools');
    if (totalToolsElement) {
        totalToolsElement.textContent = `${toolsData.length}+`;
    }
}

// ==========================================
// 事件监听
// ==========================================

// 主题切换
themeToggle.addEventListener('click', toggleTheme);

// 搜索功能
searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim();
    filterTools();
});

// 分类筛选
categoryTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
        const category = e.currentTarget.getAttribute('data-category');

        // 更新激活状态
        categoryTabs.forEach(t => t.classList.remove('active'));
        e.currentTarget.classList.add('active');

        // 更新当前分类并筛选
        currentCategory = category;
        filterTools();

        // 平滑滚动到工具区域，考虑sticky header和filter的高度
        const headerHeight = document.querySelector('.header').offsetHeight;
        const filtersHeight = document.querySelector('.filters').offsetHeight;
        const offset = headerHeight + filtersHeight + 24; // 24px额外间距
        const elementPosition = toolsGrid.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    });
});

// 加载更多
loadMoreBtn.addEventListener('click', () => {
    displayedTools += toolsPerPage;
    renderTools();
});

// 键盘快捷键
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K 聚焦搜索框
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
    }

    // ESC 清空搜索
    if (e.key === 'Escape' && document.activeElement === searchInput) {
        searchInput.value = '';
        searchQuery = '';
        filterTools();
    }
});

// ==========================================
// 性能优化 - 防抖
// ==========================================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 优化搜索输入
const optimizedSearch = debounce((value) => {
    searchQuery = value.trim();
    filterTools();
}, 300);

searchInput.addEventListener('input', (e) => {
    optimizedSearch(e.target.value);
});

// ==========================================
// 初始化
// ==========================================
function init() {
    initTheme();
    filterTools();

    // 添加加载动画
    document.body.classList.add('loaded');

    console.log(`
    🚀 知识铺 AI工具导航
    📊 已加载 ${toolsData.length} 个工具
    💡 提示: 按 Ctrl+K 快速搜索
    `);
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// ==========================================
// 平滑滚动到顶部
// ==========================================
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// 添加返回顶部按钮（可选）
let scrollTopBtn = null;
window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
        if (!scrollTopBtn) {
            scrollTopBtn = document.createElement('button');
            scrollTopBtn.innerHTML = '↑';
            scrollTopBtn.className = 'scroll-top-btn';
            scrollTopBtn.onclick = scrollToTop;
            document.body.appendChild(scrollTopBtn);

            // 添加样式
            const style = document.createElement('style');
            style.textContent = `
                .scroll-top-btn {
                    position: fixed;
                    bottom: 32px;
                    right: 32px;
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    border: none;
                    background: var(--primary);
                    color: white;
                    font-size: 24px;
                    cursor: pointer;
                    box-shadow: var(--shadow-lg);
                    transition: var(--transition);
                    z-index: 1000;
                    animation: fadeIn 0.3s ease-out;
                }
                .scroll-top-btn:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 40px rgba(99, 102, 241, 0.4);
                }
            `;
            document.head.appendChild(style);
        }
    } else {
        if (scrollTopBtn) {
            scrollTopBtn.remove();
            scrollTopBtn = null;
        }
    }
});
