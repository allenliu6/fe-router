import { supportsPushState } from './util'

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

        if(supportsPushState) mode = 'hash'

        if (mode === 'hash') {
            this.history = new hashHistory(callbacks)
        } else if (mode === 'history') {
            this.history = new htmlHistory(callbacks)
        } else {
            throw new Error('param mode need hash or history')
        }
    }
}


// 接收路由map  只包含具体跳转处理逻辑  黑盒
class htmlHistory {

    constructor(route) {
        const callbacks = this.callbacks = {}
        Object.keys(route).forEach(key => {
            if (typeof route[key] === 'function') {
                callbacks[key] = route[key]
            }
        })

        this.addListener()
    }

    addListener() {
        // 监听popstate 事件，非 pushState replaceState 操作都会触发
        window.addEventListener('popstate', e => {
            e.preventDefault()
            console.log(e.state)
        })
    }

    push(){
        history.pushState({}, '', )
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
    mode: 'hash',
    route
})