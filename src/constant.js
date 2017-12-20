
// 暂时每个 route 都有 container  每次内容完全替换
// 标准格式  '/a/b'

import home from './components/home/index'
import hello from './components/hello/index'
import another from './components/another/index'

const params = {
    mode: 'history',
    routes: [{
        path: '/',
        name: 'home',
        container: '#app',
        component: home,
        hooks: {}
    },
    {
        path: '/home',
        name: 'home',
        container: '#app',
        component: home,
        hooks: {},
        children: [{
            path: '/hello',
            name: 'hello',
            container: '#hello',
            component: hello,
            hooks: {},
        }]
    },
    {
        path: '/another',
        name: 'another',
        container: '#another',
        component: another,
        hooks: {},
    }]
}

export default params