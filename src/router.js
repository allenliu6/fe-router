import { supportsPushState, diffObject, arrayToObject } from './util'
import { DOMInit, postClickCallback } from './DOMInit'

class Router {

    constructor({ mode = 'hash', routes = [] }) {
        // 初始化  必须显式绑定？
        this.createHTMLHistory = this.createHTMLHistory.bind(this)
        this.createHashHistory = this.createHashHistory.bind(this)
        this.go = this.go.bind(this)
        this.changeRoute = this.changeRoute.bind(this)
        this.uninstallComponents = this.uninstallComponents.bind(this)
        this.installComponents = this.installComponents.bind(this)
        
        this.getRenderList = this.getRenderList.bind(this)
        this.hrefToPath = this.hrefToPath.bind(this)

        this.routes = arrayToObject(routes)
        this.oldRenderList = {}
        this.order = 0

        // 如果不支持 html5 history API 则自动降级 hash 模式
        if (!supportsPushState) mode = 'hash'

        // 模式选择并进行相应初始化
        let hrefEnding = ''
        if (mode === 'hash') {
            hrefEnding = '#/'
            this.createHashHistory()
        } else if (mode === 'history') {
            hrefEnding = '/'
            this.createHTMLHistory()
        } else {
            throw new Error(' class Router param mode need hash or history')
        }
        this.mode = mode
        this.hrefEnding = hrefEnding
        // 不能轻率判断 根页面
        this.root = window.location.origin + hrefEnding
    }

    // path 暂定格式为 sd/asda/sa，即location.pathname.slice(1)
    // children 是存在组件嵌套视图的真实反映，要求container是包含关系,所以变化时必须要讲父组件全部渲染，性能方面考量 diff，少进行 dom 操作，已经完成组件层面的diff
    changeRoute(path) {
        const { installComponents, oldRenderList, uninstallComponents, getRenderList } = this,
            renderList = Array.isArray(path) ? path : getRenderList(path)

        renderList.forEach( item => {
            let hooks = item.hooks
            hooks && hooks.afterURLChange && hooks.afterURLChange()
        })

        const { addList, deleteList } = diffObject(renderList, oldRenderList)
        if (oldRenderList && oldRenderList.length) uninstallComponents(deleteList)

        renderList.forEach( item => {
            let hooks = item.hooks
            hooks && hooks.beforeComponentRender && hooks.beforeComponentRender()
        })

        installComponents(addList)

        renderList.forEach( item => {
            let hooks = item.hooks
            hooks && hooks.afterComponentRender && hooks.afterComponentRender()
        })

        this.oldRenderList = renderList
    }

    installComponents(routes) {
        routes.forEach(route => {
            const { container, component, hooks } = route
            document.querySelector(container).innerHTML = component
        })
    }

    uninstallComponents(routes) {
        routes.forEach(route => {
            const { container, component, hooks } = route
            document.querySelector(container).innerHTML = ''
        })
    }

    getRenderList(path) {
        const pathArr = path.split('/'),
            renderList = []

        let target = this.routes

        if (path === '') {
            renderList.push(target['/'])
        }

        if (pathArr.length === 0) {
            return target['/']
        }

        for (let i = 0, length = pathArr.length; i < length; i++) {

            if (target[`/${pathArr[i]}`]) {
                target = target[`/${pathArr[i]}`]
                renderList.push(target)
                if (!target) return renderList
            }
        }

        return renderList
    }

    // 可以对外暴露接口，接收完整URL  history专用
    go(href) {
        const { hrefToPath, changeRoute, hrefEnding, getRenderList } = this

        let path = hrefToPath(href),
            location = window.location,
            newHref = '',
            renderList = []

        // history stack 逻辑
        if (location.pathname && location.pathname.length > 1) {
            newHref = location.href.replace(location.pathname, hrefEnding + path)
        } else {
            newHref = location.origin + hrefEnding + path + location.search
        }
        if (newHref === location.href) return
        
        // 路由钩子逻辑，暂时单独处理，后续考虑加入整体路由处理器
        renderList = getRenderList(path)
        renderList.forEach( item => {
            let hooks = item.hooks
            hooks && hooks.beforeURLChange && hooks.beforeURLChange()
        })

        this.order++
        window.history.pushState({
            order: this.order,
            path,
            oldPath: location.pathname
        }, path, newHref)

        // 渲染逻辑
        changeRoute(renderList)
    }

    // 考虑到各种情况  从 URL 到 location.pathname.slice(1)
    hrefToPath(href) {
        const { hrefEnding, mode } = this
        let path = href.split('?')[0],
            pathArr = path.split(hrefEnding)

        pathArr.shift()
        return pathArr.join('/')
    }

    createHTMLHistory() {
        const { changeRoute, go } = this

        // 根据初始页面URL 初始化展现路由
        changeRoute(window.location.pathname.slice(1))

        document.addEventListener('click', e => {
            const target = e.target
            if(target.tagName.toLowerCase() === 'a') {
                e.preventDefault()
                go(target.getAttribute('href'))
            }
        })

        // 监听 popstate 事件，非 pushState replaceState 操作都会触发
        window.addEventListener('popstate', e => {
            // 比较特殊的事件回调，此时前进后退行为已经进行完毕

            if (e.state === null) {
                console.log('初始页')
                this.order = 0
                changeRoute('')
                return
            }

            const { order: newOrder, path } = e.state,
                { order: oldOrder } = this

            if (oldOrder > newOrder) {
                console.log('后退')
            } else if (oldOrder < newOrder) {
                console.log('前进')
            }
            this.order = newOrder

            // 比对逻辑 state里只需要 component信息  每次 change 要将全局保存变量 state 跟当前state进行diff 然后渲染component
            changeRoute(path)
        })
    }

    createHashHistory() {
        const { changeRoute, hrefEnding = '#/' } = this

        // 根据初始页面URL 初始化展现路由
        changeRoute(window.location.hash)

        window.addEventListener('hashchange', e => {
            // hash already changed
            let { newURL, oldURL } = e
            // 默认前提 '#/' 只在整个 URL 存在一次
            newURL = newURL.split(hrefEnding).pop()
            oldURL = oldURL.split(hrefEnding).pop()

            if(newURL === oldURL) return

            changeRoute(newURL)
        }, false)
    }
}

export default Router