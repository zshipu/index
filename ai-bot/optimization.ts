// 图片优化
const imageOptimization = {
    lazyLoading: true,
    webpFormat: true,
    responsiveImages: true,
    imageCDN: true
}

// 页面性能
const performanceOptimization = {
    // 静态页面生成
    staticGeneration: true,
    // 增量静态再生成
    incrementalStaticRegeneration: {
        revalidate: 3600 // 1小时
    },
    // 路由预加载
    routePrefetching: true,
    // 组件代码分割
    codeSplitting: true
} 