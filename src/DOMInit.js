import router from '../index'

document.addEventListener('click', e => {
    const target = e.target
    if(target.tagName.toLowerCase() === 'a') {
        e.preventDefault()
        
        router.go(target.getAttribute('href'))
    }
})