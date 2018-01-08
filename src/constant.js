// 暂时每个 route 都有 container  每次内容完全替换
// 标准格式  '/a/b'
// 目前傻瓜式触发钩子    考虑组件自身生命周期   如果不重新渲染是否要触发钩子

import home from './components/home'
import hello from './components/hello'
import another from './components/another'

const params = {
    mode: 'history',
    routes: [{
        path: '/',
        name: 'home',
        container: '#app',
        component: home,
        hooks: {
            beforeURLChange:() => {},   // URL改变之前（history模式下专用，hash模式下将被忽略）
            afterURLChange: () => {},    // URL改变之后组件未渲染之前
            shouldComponentDiff: () => {},   // 组件是否进行DIFF算法  即是否要强制刷新所有组件   暂不实现
            beforeComponentRender: () => {},    // 组件渲染之后组件进行自身逻辑之前
            afterComponentRender: () => {}   // 组件进行完自身逻辑后
        }
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
        hooks: {
            beforeURLChange:() => {console.log(1)},   // URL改变之前（history模式下专用，hash模式下将被忽略）
            afterURLChange: () => {console.log(2)},    // URL改变之后组件未渲染之前
            shouldComponentDiff: () => {console.log(3)},   // 组件是否进行DIFF算法  即是否要强制刷新所有组件   暂不实现
            beforeComponentRender: () => {console.log(4)},    // 组件渲染之后组件进行自身逻辑之前   
            afterComponentRender: () => {console.log(5)}   // 组件进行完自身逻辑后
        }
    }]
}

export default params