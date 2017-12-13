# fe-router
仿前端路由轮子


主逻辑在router.js 中，其他文件为辅助展现测试逻辑

两种模式，hash history


预期接口

{
    mode: 
    route: {
        path:
        name:
        container:   // 最外层
        component: {}
        children: []
        hooks: {}
    }
}

TODO：

1. 规范地址形式，支持多级地址
2. 加入生命周期，设置相应钩子
3. 