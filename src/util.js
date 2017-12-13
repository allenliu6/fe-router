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

// 建立对象  源对象  要拍平的key  直接取path作为新key
export const deepSearch = (target, source, key) => {
    const sourceArr = source[key]
    if(arrayIsNotEmpty(sourceArr)) {
        sourceArr.forEach( item => {
            target[item.path] = item
        })
    }
    // else 如对象情况
}

// 深度遍历
// this.routeMap = route.map( item => {
//     const pathObj = pathMap[item.path] = {
//             content: item.component,
//         },
//         children = item.children
        
//     if(children && children.length > 0 && Array.isArray(children)) {
//         children.forEach( elem => {
//             pathObj[elem.path] = {

//             }
//         })
//     }
// })

const arrayIsNotEmpty = arr => {
    return Array.isArray(arr) && arr.length > 0
}