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
        console.log(this.routes)
        this.oldRenderList = {}
        this.order = 0

        // 如果不支持 html5 history API 则自动降级 hash 模式
        if (!supportsPushState) mode = 'hash'

        // 模式选择并进行相应初始化
        let hrefPlus = ''
        if (mode === 'hash') {
            hrefPlus = '#/'
            hashHistory()
        } else if (mode === 'history') {
            hrefPlus = '/'
            this.createHTMLHistory()
        } else {
            throw new Error(' class Router param mode need hash or history')
        }
        this.root = window.location.origin + hrefPlus
    }

    // 暂定格式为 sd/asda/sa   
    // children 是存在组件嵌套视图的真实反映，要求container是包含关系,所以变化时必须要讲父组件全部渲染，性能方面考量 diff，少进行 dom 操作，已经完成组件层面的diff
    changeRoute(path) {
        const { renderComponents, oldRenderList, cancelComponents, getRenderList } = this,
            renderList = getRenderList(path)

        const { addList, deleteList } = diffObject(renderList, oldRenderList)
        console.log(addList, deleteList)
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

    go(href) {
        let pathArr = href.split('/')
        pathArr.shift()

        this.changeRoute(pathArr.join('/'))
    }

    createHTMLHistory() {
        const { routes, go } = this.routes

        // 监听 popstate 事件，非 pushState replaceState 操作都会触发
        window.addEventListener('popstate', e => {
            // 比较特殊的事件回调，此时前进后退行为已经进行完毕

            if (e.state === null) {
                console.log('初始页')
                this.order = 0
                return
            }

            const { order: newOrder, key } = e.state,
                { order: oldOrder } = this

            if (oldOrder > newOrder) {
                console.log('后退')
            } else if (oldOrder < newOrder) {
                console.log('前进')
            }
            this.order = newOrder

            // 比对逻辑 state里只需要 component信息  每次 change 要将全局保存变量 state 跟当前state进行diff 然后渲染component
            go(href)
        })
    }
}

class hashHistory {

    constructor(callbacks) {
        this.addListener = this.addListener.bind(this)
        this.getHash = this.getHash.bind(this)
        this.setHash = this.setHash.bind(this)

        this.handelEventEmit = this.hashChangeCallback(callbacks)
        this.addListener(callbacks)
    }

    addListener(callbacks) {
        window.addEventListener("hashchange", this.handelEventEmit, false)
    }

    hashChangeCallback(callbacks) {
        const { getHash } = this

        return e => {
            let { newURL, oldURL } = e
            newURL = getHash(newURL)
            oldURL = getHash(oldURL)

            callbacks[newURL]()
        }
    }

    getHash(url) {
        return url.split("#").pop()
    }

    setHash(hash, isPushHistory = true) {
        const { location } = window
        if (isPushHistory) {
            location.hash = hash
        } else {
            location.replace(location.origin + `#${hash}`)
        }
    }
}

export default Router