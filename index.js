import { supportsPushState } from './util'
import { DOMInit, postClickCallback } from './DOMInit'

class Router {

    constructor({ mode = 'hash', route = {} }) {
        // 初始化数据
        this.hash = window.location.hash

        // 根据框架需求对 传入路由参数进行处理
        const callbacks = this.callbacks = {}
        Object.keys(route).forEach(key => {
            if (typeof route[key] !== 'function') {
                callbacks[key] = () => {
                    console.log(route[key])
                }
            } else
                callbacks[key] = route[key]
        })

        if (!supportsPushState) mode = 'hash'

        DOMInit(mode)
        if (mode === 'hash') {
            this.history = new hashHistory(callbacks)
        } else if (mode === 'history') {
            this.history = new htmlHistory(callbacks)
        } else {
            throw new Error(' class Router param mode need hash or history')
        }
    }
}


// 接收路由map  只包含具体跳转处理逻辑  黑盒
class htmlHistory {

    constructor(route) {
        this.addListener = this.addListener.bind(this)
        this.callback = this.callback.bind(this)

        const callbacks = this.callbacks = {}
        Object.keys(route).forEach(key => {
            if (typeof route[key] === 'function') {
                callbacks[key] = route[key]
            }
        })

        this.addListener()
        this.order = 0
    }

    addListener() {
        // 监听popstate 事件，非 pushState replaceState 操作都会触发
        window.addEventListener('popstate', e => {
            // 已经前进后退的当前值
            // state里只需要 component信息    每次 change 要将全局保存变量 state 跟当前state进行比较
            if(!e.state.order) {
                console.log('初始页')
                this.order = e.state.order
                return
            }
            if(this.order > e.state.order) {
                console.log('后退')
            } else if(this.order < e.state.order) {
                console.log('前进')
            }
            this.order = e.state.order
        })

        postClickCallback(this.callback)
    }

    callback(elem) {
        let key = elem.innerHTML
        history.pushState({key, order: ++this.order}, '', `${window.location.origin}/${key}`)
    }
}

class hashHistory {

    constructor(route) {
        this.addListener = this.addListener.bind(this)
        this.getHash = this.getHash.bind(this)
        this.setHash = this.setHash.bind(this)
        this.hashChangeCallback = this.hashChangeCallback.bind(this)

        const callbacks = this.callbacks = {}
        Object.keys(route).forEach(key => {
            if (typeof route[key] === 'function') {
                callbacks[key] = route[key]
            }
        })
        this.addListener()
    }

    addListener() {
        window.addEventListener("hashchange", this.hashChangeCallback, false)
    }

    hashChangeCallback(e) {
        const { getHash, callbacks } = this
        let { newURL, oldURL } = e
        newURL = getHash(newURL)
        oldURL = getHash(oldURL)

        callbacks[newURL]()
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

const route = {
    a: 'hello',
    b: '1',
    c: 2
}
new Router({
    mode: 'history',
    route
})