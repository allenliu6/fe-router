import route from './constant'

export const DOMInit = (mode, num = 3) => {
    let hrefPlus = '',
        preHref = '',
        innerHTML = ''

    if (mode === 'hash') {
        hrefPlus = '#'
    } else if (mode === 'history') {
        hrefPlus = '/'
    } else {
        throw new Error(' DOMInit param mode need hash or history')
    }

    preHref = window.location.origin + hrefPlus

    if(typeof route !== 'object') {
        for(let i = 0; i < num; i++) {
            innerHTML += `<a href="${preHref + i}">${i}</a>`
        }
    } else {
        Object.keys(route).forEach( elem => {
            innerHTML += `<a href="${preHref + elem}">${elem}</a>`
        })
    }
    
    document.querySelector('#app').innerHTML = innerHTML
}

export const postClickCallback = callback => {
    // promise
    const target = document.querySelector('#app')

    target.addEventListener('click', e => {
        e.preventDefault()
        callback(e.target.getAttribute('href').split(`${window.location.origin}/`)[1])
    })
}