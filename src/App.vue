<template>
  <router-view />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
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

// iOS 邊緣右滑返回上一頁（SPA 下 WKWebView 原生手勢不可靠，改用 JS 手勢）
const router = useRouter()
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
  refreshGlobalUnread()
})

onUnmounted(() => {
  window.removeEventListener('messageReceived', refreshGlobalUnread)
  window.removeEventListener('messageRead', refreshGlobalUnread)
  window.removeEventListener('touchstart', onEdgeTouchStart)
  window.removeEventListener('touchmove', onEdgeTouchMove)
})
</script>