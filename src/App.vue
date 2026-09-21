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

// popstate（後退/前進）觸發時 history.state 已是目標頁
const onPopState = () => { isPop = true }

const removeBeforeEach = router.beforeEach(() => {
  const pos = (window.history.state && (window.history.state as any).position) || 0
  if (isPop) {
    // 後退/前進：用上次記錄的位置作為來源頁
    fromPos = currentPos
    isPop = false
  } else {
    // push/replace：此時 state 仍是來源頁
    fromPos = pos
  }
})

const removeAfterEach = router.afterEach(() => {
  const toPos = (window.history.state && (window.history.state as any).position) || 0
  transitionName.value = toPos < fromPos ? 'slide-back' : 'slide-forward'
  currentPos = toPos
})

// iOS 邊緣右滑返回上一頁（SPA 下 WKWebView 原生手勢不可靠，改用 JS 手勢）
let edgeTouchX = 0
let edgeTouchY = 0
let edgeSwiped = false

const onEdgeTouchStart = (e: TouchEvent) => {
  if (Capacitor.getPlatform() !== 'ios') return
  const target = e.target as HTMLElement | null
  if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
    edgeSwiped = true
    return
  }
  edgeSwiped = false
  edgeTouchX = e.touches[0].clientX
  edgeTouchY = e.touches[0].clientY
}

const onEdgeTouchMove = (e: TouchEvent) => {
  if (Capacitor.getPlatform() !== 'ios' || edgeSwiped) return
  const dx = e.touches[0].clientX - edgeTouchX
  const dy = e.touches[0].clientY - edgeTouchY
  if (edgeTouchX <= 30 && dx > 70 && Math.abs(dy) < 60) {
    edgeSwiped = true
    const pos = (window.history.state && (window.history.state as any).position) || 0
    if (pos > 0) router.back()
  }
}

onMounted(() => {
  window.addEventListener('messageReceived', refreshGlobalUnread)
  window.addEventListener('messageRead', refreshGlobalUnread)
  window.addEventListener('touchstart', onEdgeTouchStart, { passive: true })
  window.addEventListener('touchmove', onEdgeTouchMove, { passive: true })
  window.addEventListener('popstate', onPopState, { passive: true })
  currentPos = (window.history.state && (window.history.state as any).position) || 0
  refreshGlobalUnread()
})

onUnmounted(() => {
  window.removeEventListener('messageReceived', refreshGlobalUnread)
  window.removeEventListener('messageRead', refreshGlobalUnread)
  window.removeEventListener('touchstart', onEdgeTouchStart)
  window.removeEventListener('touchmove', onEdgeTouchMove)
  window.removeEventListener('popstate', onPopState)
  removeBeforeEach()
  removeAfterEach()
})
</script>