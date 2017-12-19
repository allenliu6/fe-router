import Router from './src/router'
import params from './src/constant'
import './src/DOMInit'

const router = new Router(params)
export default router

// todo

// html 格式 如何进一步处理
// 钩子  确立生命周期
// 将对象拍平成 map 路由信息   看情况扩展
// 去掉两个冗余对象，整合进 Router中, 函数拼接完成模式策略转换