export const supportsPushState = (function () {
    const ua = window.navigator.userAgent

    if (
        (ua.indexOf('Android 2.') !== -1 || ua.indexOf('Android 4.0') !== -1) &&
        ua.indexOf('Mobile Safari') !== -1 &&
        ua.indexOf('Chrome') === -1 &&
        ua.indexOf('Windows Phone') === -1
    ) {
        return false
    }

    return window.history && 'pushState' in window.history
})()

export const diffObject = (target, source) => {
    const patchObj = {
        addList: [],
        deleteList: []
    }

    if (source && source.length) {
        Object.values(source).forEach(value => {

            if (target.path !== value.path) {
                patchObj.deleteList.push(value)
            }
        })
    }

    Object.values(target).forEach(value => {

        if (source.path !== value.path) {
            patchObj.addList.push(value)
        }
    })

    return patchObj
}

// 深度遍历拍平 children 属性

export const deepSearch = target => {
    if (Array.isArray(target)) {
        target.forEach(elem => {
            deepSearch(elem)
        })
    } else if (target.toString() === '[object Object]') {
        let current = target,
            children = target.children

        if (children && children.length) {
            children.forEach(child => {
                let path = child.path
                current[path] = child
                deepSearch(child)
            })
        }
    }
    return target
}

export const arrayToObject = (target, accordingKey) => {
    if (Array.isArray(target)) {
        let newTarget = {}
        target.forEach( item => {
            deepSearch(item)
            newTarget[item.path] = item
        })
        return newTarget
    } else {
        throw new Error('arrayToObject function need an array input')
    }
}