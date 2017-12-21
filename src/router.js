import { supportsPushState, diffObject, arrayToObject } from './util'
import { DOMInit, postClickCallback } from './DOMInit'

class Router {

    constructor({ mode = 'hash', routes = [] }) {
        // 初始化  必须显式绑定？
        this.changeRoute = this.changeRoute.bind(this)
        this.getRenderList = this.getRenderList.bind(this)
        this.renderComponents = this.renderComponents.bind(this)
        this.cancelComponents = this.cancelComponents.bind(this)
        this.go = this.go.bind(this)
        this.createHTMLHistory = this.createHTMLHistory.bind(this)

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
        this.root = window.location.origin + hrefEnding
    }

    // path 暂定格式为 sd/asda/sa，即location.pathname.slice(1)
    // children 是存在组件嵌套视图的真实反映，要求container是包含关系,所以变化时必须要讲父组件全部渲染，性能方面考量 diff，少进行 dom 操作，已经完成组件层面的diff
    changeRoute(path) {
        const { renderComponents, oldRenderList, cancelComponents, getRenderList } = this,
            renderList = getRenderList(path)

        const { addList, deleteList } = diffObject(renderList, oldRenderList)
        if (oldRenderList && oldRenderList.length) cancelComponents(deleteList)
        renderComponents(addList)

        this.oldRenderList = renderList
    }

    renderComponents(routes) {
        routes.forEach(route => {
            const { container, component, hooks } = route
            document.querySelector(container).innerHTML = component
        })
    }

    cancelComponents(routes) {
        routes.forEach(route => {
            const { container, component, hooks } = route
            document.querySelector(container).innerHTML = ''
        })
    }

    getRenderList(path) {
        const pathArr = path.split("/"),
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

    // 对外暴露接口，接收完整URL
    go(href) {
        let pathArr = href.split('/'),
            path,
            newHref = '',
            location = window.location

        pathArr.shift()
        path = pathArr.join('/')

        // history stack 逻辑
        if (location.pathname && location.pathname.length > 1) {
            newHref = location.href.replace(location.pathname, `/${path}`)
        } else {
            newHref = `${location.origin}/${path + location.search}`
        }
        if (newHref === location.href) return

        this.order++
        window.history.pushState({
            order: this.order,
            path,
            oldPath: location.pathname
        }, path, newHref)

        // 渲染逻辑
        this.changeRoute(path)
    }

    createHTMLHistory() {
        const { changeRoute } = this

        // 根据初始页面URL 初始化展现路由
        changeRoute(window.location.pathname.slice(1))

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
        window.addEventListener("hashchange", e => {
                let { newURL, oldURL } = e
                newURL = getHash(newURL)
                oldURL = getHash(oldURL)

                callbacks[newURL]()
            }, false)

        function getHash(url) {
            return url.split("#").pop()
        }

        function setHash(hash, isPushHistory = true) {
            const { location } = window
            if (isPushHistory) {
                location.hash = hash
            } else {
                location.replace(location.origin + `#${hash}`)
            }
        }
    }
}

export default Router