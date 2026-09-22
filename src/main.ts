import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router/index'
import { createPinia } from 'pinia'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import i18n from '/src/i18n/index.js'

import { updateOperateTime, initCheck, startCheck } from './utils/authTimeout'
import { setupKeyboard } from './utils/keyboard'

// H5 軟鍵盤彈窗適配（防止輸入時頁面被頂起）
setupKeyboard()

// PWA：H5 瀏覽器中註冊 Service Worker，支持“添加到桌面”全屏運行
if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => { /* 注冊失敗不影響使用 */ })
  })
}

const pinia = createPinia()
const app = createApp(App)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app
  .use(pinia)
  .use(i18n)
  .use(ElementPlus)
  .use(router)
  .mount('#app')

// 防抖：用户操作刷新时间
// let debounce = null
// const onUserAction = () => {
//   if (localStorage.getItem('user')) {
//     clearTimeout(debounce)
//     debounce = setTimeout(() => {
//       updateOperateTime()
//     }, 200)
//   }
// }

// 监听操作
// document.addEventListener('mousemove', onUserAction)
// document.addEventListener('keydown', onUserAction)
// document.addEventListener('scroll', onUserAction)

// 页面切回前台
// document.addEventListener('visibilitychange', () => {
//   if (!document.hidden && localStorage.getItem('user')) {
//     updateOperateTime()
//   }
// })

// 初始化 + 启动检测
// initCheck(router)
// startCheck(router)

// 页面标题
const { t } = i18n.global
document.title = '斯婷'