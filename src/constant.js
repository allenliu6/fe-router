
// 暂时每个 route 都有 container  每次内容完全替换
// 标准格式  '/a/b'

const params = {
    mode: 'history',
    route: [{
        path: '/',
        name: 'home',
        container: '#app',
        component: '<span>home</span>',
        hooks: {},
        children: [{
            path: '/hello',
            name: 'hello',
            container: '#hello',
            component: '<span>hello</span>',
            hooks: {},
        }]
    },
    {
        path: '/anthor',
        name: 'anthor',
        container: '#anthor',
        component: '<span>anthor</span>',
        hooks: {},
    }]
}

export default params