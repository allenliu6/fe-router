import route from './constant'

export const DOMInit = (mode, num = 3) => {
    
}

export const postClickCallback = callback => {
    // promise
    const target = document.querySelector('#app')

    target.addEventListener('click', e => {
        e.preventDefault()
        callback(e.target.getAttribute('href').split(`${window.location.origin}/`)[1])
    })
}