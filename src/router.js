import { supportsPushState } from './util'
import { DOMInit, postClickCallback } from './DOMInit'

class Router {

    constructor({ mode = 'hash', route = [] }) {
        // 初始化
        this.changeRoute = this.changeRoute.bind(this)
        this.getRenderList = this.getRenderList.bind(this)
        this.renderComponent = this.renderComponent.bind(this)
        this.go = this.go.bind(this)

        this.route = route
        this.root = window.location.origin + hrefPlus

        // 如果不支持 html5 history API 则自动降级 hash 模式
        if (!supportsPushState) mode = 'hash'

        // 模式选择并进行相应初始化
        let hrefPlus = ''
        if (mode === 'hash') {
            hrefPlus = '#/'
            this.history = new hashHistory(route)
        } else if (mode === 'history') {
            hrefPlus = '/'
            this.history = new htmlHistory(route)
        } else {
            throw new Error(' class Router param mode need hash or history')
        }
    }

    // 暂定格式为 /sd/asda/sa   
    // children 是存在组件嵌套视图的真实反映，要求container是包含关系,所以变化时必须要讲父组件全部渲染，性能方面考量 变化对比，少进行 dom 操作
    changeRoute(path) {
        const renderList = this.getRenderList(path),
            { renderComponent } = this
        console.log(renderList)

        renderList.forEach(routeObj => {
            renderComponent(routeObj)
        })
    }

    renderComponent(route) {
        const { container, component, hooks } = route
        document.querySelector(container).innerHTML = component

    }

    getRenderList(path) {
        const pathArr = path.split("/"),
            renderList = []

        pathArr.shift()
        let target = this.route

        if (pathArr.length === 0) {
            for (let i = 0; i < target.length; i++) {
                if (target[i].path === '/') {
                    return target[i]
                }
            }
        }

        for (let i = 0, length = pathArr.length; i < length; i++) {

            for (let j = 0, length2 = target.length; j < length2; j++) {
                if (target[j].path === `/${pathArr[i]}`) {
                    renderList.push(target[j])
                    target = target[j].children
                    if (target) break;
                    else return renderList
                }
            }
        }

        return renderList
    }

    go(href) {
        let pathArr = href.split('/')
        pathArr.shift()

        this.changeRoute(`/${pathArr.join('/')}`)
    }
}

// 接收路由map  只包含具体跳转处理逻辑  黑盒
class htmlHistory {

    constructor(callbacks) {
        // 必须显式绑定？
        this.addListener = this.addListener.bind(this)

        this.order = 0
        this.addListener(callbacks)
    }

    addListener(callbacks) {
        // 监听 popstate 事件，非 pushState replaceState 操作都会触发
        window.addEventListener('popstate', e => {
            // 比较特殊，此时前进后退行为已经进行完毕

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
            callbacks[key]()
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