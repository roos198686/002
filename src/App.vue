<template>
  <router-view v-slot="{ Component }">
    <transition :name="transitionName">
      <keep-alive :include="cachedViews">
        <component :is="Component" :key="viewKey" />
      </keep-alive>
    </transition>
  </router-view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Capacitor } from '@capacitor/core'
import request from '@/utils/request'

// 全局未读数量（全局可用，无任何报错）
const globalUnread = ref(0)

// 挂载到全局，解决 TS 报错
;(window as any).globalUnread = globalUnread

const refreshGlobalUnread = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  if (!user.id) return

  request.post('/api/message/unread-total', { userId: user.id })
    .then(res => {
      if (res.data.code === 1) {
        globalUnread.value = res.data.total || 0
      }
    })
}

const router = useRouter()
const route = useRoute()

// ========== 頁面緩存：進入下一頁保留實例與滾動位置，返回不重新加載 ==========
// 組件名需與頁面內 defineOptions({ name }) 一致
const cachedViews = [
  'Home',          // 主框架（含首頁動態、商城、通訊錄等 tab 子頁）
  'CollectList',   // 商品收藏
  'OrdersList',    // 我的訂單
  'CartList'       // 購物車
]

// 主框架下的 tab 子路由共用同一個 Home 實例；其他頁按完整路徑區分（詳情頁參數不同互不覆用）
const viewKey = computed(() => {
  if (route.matched[0] && route.matched[0].path === '/home') return 'Home'
  return route.fullPath
})

// ========== 路由切換過渡動畫（右滑返回 = slide-back，前進 = slide-forward） ==========
const transitionName = ref('slide-forward')
let currentPos = 0
let fromPos = 0
let isPop = false
let suppressTransition = false // 右滑返回已手動完成動畫，跳過 CSS 過渡

// popstate（後退/前進）觸發時 history.state 已是目標頁
const onPopState = () => { isPop = true }

const removeBeforeEach = router.beforeEach(() => {
  const pos = (window.history.state && (window.history.state as any).position) || 0
  if (isPop) {
    fromPos = currentPos
    isPop = false
  } else {
    fromPos = pos
  }
})

const removeAfterEach = router.afterEach(() => {
  if (suppressTransition) {
    transitionName.value = ''
    suppressTransition = false
  } else {
    const toPos = (window.history.state && (window.history.state as any).position) || 0
    transitionName.value = toPos < fromPos ? 'slide-back' : 'slide-forward'
  }
  currentPos = (window.history.state && (window.history.state as any).position) || 0
})

// ========== iOS/Android 邊緣右滑返回：跟手拖拽 + 鬆手完成/回彈 ==========
interface SwipeState {
  active: boolean
  dragging: boolean
  startX: number
  startY: number
  pageEl: HTMLElement | null
  overlayEl: HTMLElement | null
  screenWidth: number
}
let swipe: SwipeState | null = null

const getPageEl = (): HTMLElement | null => {
  // #app 下的第一個 div 即為當前頁面根元素
  return document.querySelector('#app > div') as HTMLElement | null
}

const onEdgeTouchStart = (e: TouchEvent) => {
  const platform = Capacitor.getPlatform()
  if (platform !== 'ios' && platform !== 'android') return
  if (swipe) return

  const t = e.touches[0]
  // 左邊緣 25px 內
  if (t.clientX > 25) return

  const target = e.target as HTMLElement | null
  if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return

  // 需要有歷史記錄才能返回
  const pos = (window.history.state && (window.history.state as any).position) || 0
  if (pos <= 0) return

  swipe = {
    active: true,
    dragging: false,
    startX: t.clientX,
    startY: t.clientY,
    pageEl: null,
    overlayEl: null,
    screenWidth: window.innerWidth
  }
}

const onEdgeTouchMove = (e: TouchEvent) => {
  if (!swipe || !swipe.active) return

  const t = e.touches[0]
  const dx = t.clientX - swipe.startX
  const dy = t.clientY - swipe.startY

  // 首次移動：判斷是否為水平滑動
  if (!swipe.dragging) {
    if (dx > 8 && Math.abs(dy) < 25) {
      swipe.dragging = true
      swipe.pageEl = getPageEl()
      if (swipe.pageEl) {
        swipe.pageEl.style.transition = 'none'
        // 創建背景遮罩，模擬上一頁在下方
        const overlay = document.createElement('div')
        overlay.style.cssText = 'position:fixed;inset:0;background:#999;opacity:0;z-index:1099;pointer-events:none;transition:none;'
        document.body.appendChild(overlay)
        swipe.overlayEl = overlay
      }
    } else if (Math.abs(dy) > 15) {
      // 垂直滑動，取消
      swipe.active = false
      swipe = null
      return
    } else {
      return
    }
  }

  if (!swipe.dragging || !swipe.pageEl) return

  // 阻止頁面滾動
  e.preventDefault()
  e.stopPropagation()

  const dragX = Math.max(0, dx)
  const progress = dragX / swipe.screenWidth
  // 頁面跟隨手指，帶輕微縮放（iOS 風格）
  const scale = 1 - progress * 0.05
  swipe.pageEl.style.transform = `translateX(${dragX}px) scale(${scale})`
  swipe.pageEl.style.transformOrigin = 'left center'
  if (swipe.overlayEl) {
    swipe.overlayEl.style.opacity = String(Math.min(0.3, progress * 0.4))
  }
}

const onEdgeTouchEnd = (e: TouchEvent) => {
  if (!swipe || !swipe.active) {
    swipe = null
    return
  }
  if (!swipe.dragging) {
    swipe = null
    return
  }

  const t = e.changedTouches[0]
  const dx = t.clientX - swipe.startX
  const threshold = swipe.screenWidth * 0.3
  const pageEl = swipe.pageEl
  const overlayEl = swipe.overlayEl

  if (dx >= threshold) {
    // 完成返回：動畫滑出後調用 router.back()
    if (pageEl) {
      pageEl.style.transition = 'transform 0.28s cubic-bezier(0.32, 0.72, 0, 1)'
      pageEl.style.transform = 'translateX(100%)'
    }
    if (overlayEl) {
      overlayEl.style.transition = 'opacity 0.28s'
      overlayEl.style.opacity = '0'
    }
    setTimeout(() => {
      if (pageEl) {
        pageEl.style.transition = ''
        pageEl.style.transform = ''
        pageEl.style.transformOrigin = ''
      }
      if (overlayEl) overlayEl.remove()
      // 抑制 Vue CSS 過渡（頁面已手動滑出）
      suppressTransition = true
      router.back()
    }, 280)
  } else {
    // 回彈
    if (pageEl) {
      pageEl.style.transition = 'transform 0.28s cubic-bezier(0.32, 0.72, 0, 1)'
      pageEl.style.transform = ''
      pageEl.style.transformOrigin = ''
    }
    if (overlayEl) {
      overlayEl.style.transition = 'opacity 0.28s'
      overlayEl.style.opacity = '0'
    }
    setTimeout(() => {
      if (pageEl) pageEl.style.transition = ''
      if (overlayEl) overlayEl.remove()
    }, 300)
  }
  swipe = null
}

onMounted(() => {
  window.addEventListener('messageReceived', refreshGlobalUnread)
  window.addEventListener('messageRead', refreshGlobalUnread)
  // touchmove 不能用 passive，需要 preventDefault 阻止滾動
  window.addEventListener('touchstart', onEdgeTouchStart, { passive: true })
  window.addEventListener('touchmove', onEdgeTouchMove, { passive: false })
  window.addEventListener('touchend', onEdgeTouchEnd, { passive: true })
  window.addEventListener('touchcancel', onEdgeTouchEnd, { passive: true })
  window.addEventListener('popstate', onPopState, { passive: true })
  currentPos = (window.history.state && (window.history.state as any).position) || 0
  refreshGlobalUnread()
})

onUnmounted(() => {
  window.removeEventListener('messageReceived', refreshGlobalUnread)
  window.removeEventListener('messageRead', refreshGlobalUnread)
  window.removeEventListener('touchstart', onEdgeTouchStart)
  window.removeEventListener('touchmove', onEdgeTouchMove)
  window.removeEventListener('touchend', onEdgeTouchEnd)
  window.removeEventListener('touchcancel', onEdgeTouchEnd)
  window.removeEventListener('popstate', onPopState)
  removeBeforeEach()
  removeAfterEach()
})
</script>