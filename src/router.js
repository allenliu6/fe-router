import { supportsPushState } from './util'
import { DOMInit, postClickCallback } from './DOMInit'

// 将对象拍平成 map 路由信息   看情况扩展
// DOM 操作在 Router对象中     去掉两个冗余对象，整合进 Router中
// 钩子
class Router {

    constructor({ mode = 'hash', route = [] }) {
        // 如果不支持 html5 history API 则自动降级 hash 模式
        if (!supportsPushState) mode = 'hash'

        // 模式选择并进行相应初始化
        let hrefPlus = ''
        if (mode === 'hash') {
            hrefPlus = '#/'
            this.history = new hashHistory(callbacks)
        } else if (mode === 'history') {
            hrefPlus = '/'
            this.history = new htmlHistory(callbacks)
        } else {
            throw new Error(' class Router param mode need hash or history')
        }

        this.root = window.location.origin + hrefPlus
    }

    changeRoute(path) {
        document.querySelector('#')
    }
}

// 接收路由map  只包含具体跳转处理逻辑  黑盒
class htmlHistory {

    constructor(callbacks) {
        // 必须显式绑定？
        this.addListener = this.addListener.bind(this)
        this.callback = this.callback.bind(this)

        this.order = 0
        this.handelEventEmit = this.callback(callbacks)
        this.addListener(callbacks)
    }

    addListener(callbacks) {
        // 监听 popstate 事件，非 pushState replaceState 操作都会触发
        window.addEventListener('popstate', e => {
            // 比较特殊，此时前进后退行为已经进行完毕

            if(e.state === null) {
                console.log('初始页')
                this.order = 0
                return
            }

            const { order: newOrder, key } = e.state,
                { order: oldOrder } = this

            if(oldOrder > newOrder) {
                console.log('后退')
            } else if(oldOrder < newOrder) {
                console.log('前进')
            }
            this.order = newOrder

            // 比对逻辑 state里只需要 component信息  每次 change 要将全局保存变量 state 跟当前state进行diff 然后渲染component
            // ...
            callbacks[key]()
        })

        postClickCallback(this.handelEventEmit)
    }

    callback(callbacks){
        return key => {
            history.pushState({key, order: ++this.order}, '', `${window.location.origin}/${key}`)
            callbacks[key]()
        }
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