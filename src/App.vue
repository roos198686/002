<template>
  <router-view />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
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

onMounted(() => {
  window.addEventListener('messageReceived', refreshGlobalUnread)
  window.addEventListener('messageRead', refreshGlobalUnread)
  refreshGlobalUnread()
})

onUnmounted(() => {
  window.removeEventListener('messageReceived', refreshGlobalUnread)
  window.removeEventListener('messageRead', refreshGlobalUnread)
})
</script>