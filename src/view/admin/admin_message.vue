<template>
    <div class="admin-page msg-page">
        <div class="page-title">聊天查询</div>

        <div class="msg-body">
            <!-- 左侧联系人区域 -->
            <div class="left-contact">
                <div class="filter-bar left-filter">
                    <el-input
                        v-model="searchKey"
                        placeholder="输入昵称/用户名搜索"
                        clearable
                        size="small"
                        @keyup.enter="refreshContacts"
                    />
                    <el-button size="small" type="primary" @click="refreshContacts">搜索</el-button>
                    <el-button size="small" @click="handleReset">重置</el-button>
                </div>

                <div class="left-table">
                    <el-table
                        ref="mainTableRef"
                        :data="groupedContacts"
                        border
                        stripe
                        size="small"
                        height="100%"
                        v-loading="loading"
                        row-key="userId"
                        @expand-change="onExpandChange"
                    >
                        <el-table-column type="expand">
                            <template #default="{ row }">
                                <div class="sub-panel" v-loading="subLoading[row.userId]">
                                    <el-table
                                        :data="row.subList"
                                        size="small"
                                        :row-class-name="subRowClass"
                                        @row-click="(item) => toChat(item.id, row.userId, item.name, item.avatar)"
                                    >
                                        <el-table-column label="头像" width="56" align="center">
                                            <template #default="{ row: item }">
                                                <el-image
                                                    class="thumb small"
                                                    :src="baseURL + item.avatar"
                                                    fit="cover"
                                                />
                                            </template>
                                        </el-table-column>
                                        <el-table-column prop="name" label="用户名" min-width="90" show-overflow-tooltip />
                                        <el-table-column label="最后消息" min-width="100" show-overflow-tooltip>
                                            <template #default="{ row: item }">{{ formatLastMsg(item.lastMsg) }}</template>
                                        </el-table-column>
                                        <el-table-column label="时间" width="118">
                                            <template #default="{ row: item }">{{ formatTime(item.timestamp) }}</template>
                                        </el-table-column>
                                        <el-table-column label="未读" width="64" align="center">
                                            <template #default="{ row: item }">
                                                <el-tag v-if="item.unread_count > 0" type="danger" size="small">
                                                    {{ item.unread_count > 99 ? '99+' : item.unread_count }}
                                                </el-tag>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="操作" width="86" align="center">
                                            <template #default="{ row: item }">
                                                <el-button
                                                    size="small"
                                                    type="primary"
                                                    :disabled="userInfo.status === 3"
                                                    @click.stop="toChat(item.id, row.userId, item.name, item.avatar)"
                                                >查看聊天</el-button>
                                            </template>
                                        </el-table-column>
                                        <template #empty>暂无会话</template>
                                    </el-table>
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column label="头像" width="56" align="center">
                            <template #default="{ row }">
                                <el-image class="thumb small" :src="baseURL + row.avatar" fit="cover" />
                            </template>
                        </el-table-column>
                        <el-table-column prop="name" label="用户名" min-width="110" show-overflow-tooltip />
                        <el-table-column label="时间" width="118">
                            <template #default="{ row }">
                                {{ row.last_msg_time ? moment(row.last_msg_time).format('YY/MM/DD HH:mm') : '' }}
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" width="92" align="center">
                            <template #default="{ row }">
                                <el-button size="small" type="primary" @click="viewGroup(row)">查看会话</el-button>
                            </template>
                        </el-table-column>
                        <template #empty>暂无联系人</template>
                    </el-table>
                </div>

                <div class="pager-bar left-pager">
                    <el-pagination
                        small
                        background
                        layout="total, sizes, prev, pager, next, jumper"
                        :page-sizes="[10, 20, 50]"
                        :total="total"
                        v-model:current-page="page"
                        v-model:page-size="pageSize"
                        @size-change="onSizeChange"
                        @current-change="onPageChange"
                    />
                </div>
            </div>

            <!-- 右侧聊天区域 -->
            <div class="right-chat">
                <div v-if="!currentChatId" class="chat-empty">请点击左侧联系人开始聊天</div>
                <div v-else class="chat-content">
                    <div ref="chatListRef" class="chat-list">
                        <div v-if="msgList.length === 0" class="empty-msg">暂无聊天记录</div>

                        <!-- 只循环一次，通过class区分左右 -->
                        <div
                            v-for="msg in msgList"
                            :key="msg.id"
                            class="msg-item"
                            :class="msg.from_id === activeMainUserId ? 'right-msg' : 'left-msg'"
                        >
                            <!-- 头像 -->
                            <div class="user-info">
                                <el-image
                                    class="msg-avatar"
                                    :src="msg.from_id === activeMainUserId ? baseURL + selfAvatar : baseURL + chatTargetAvatar"
                                    fit="cover"
                                />
                            </div>
                            <!-- 消息内容 -->
                            <div class="msg-box">
                                <div
                                    class="nickname"
                                    :style="msg.from_id === activeMainUserId ? 'text-align: right;' : 'text-align: left'"
                                >
                                    {{ msg.from_id === activeMainUserId ? selfName : chatTargetName }}
                                </div>
                                <div class="msg-text" v-if="msg.msg_type === 1">{{ msg.content }}</div>
                                <div class="msg-img" v-else-if="msg.msg_type === 2">
                                    <el-image
                                        :src="baseURL + msg.content"
                                        :preview-src-list="[baseURL + msg.content]"
                                        fit="cover"
                                        preview-teleported
                                    />
                                </div>
                                <div class="msg-other" v-else-if="msg.msg_type === 3">【转账消息】{{ msg.content }}</div>
                                <div class="msg-video" v-else-if="msg.msg_type === 6">
                                    <video class="message-video" controls preload="metadata" loading="lazy">
                                        <source :src="baseURL + msg.content" type="video/mp4">
                                    </video>
                                </div>
                                <div class="msg-goods" v-else-if="msg.msg_type === 7">【商品消息】</div>
                                <div class="msg-unknown" v-else>【未知消息】</div>

                                <div class="msg-time">{{ moment(msg.create_time).format('YY/MM/DD HH:mm:ss') }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, watch, onActivated, nextTick, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { TableInstance } from 'element-plus'
import request from '@/utils/request'
import moment from 'moment'
import './admin-common.css'

interface AdminUser {
    status?: number
}

interface SubContact {
    id: number
    name: string
    avatar: string
    lastMsg: string
    unread_count: number
    timestamp: number
}

interface ContactGroup {
    userId: number
    name: string
    avatar: string
    last_msg_time?: string
    expanded: boolean
    subList: SubContact[]
}

interface ChatMsg {
    id: number
    from_id: number
    msg_type: number
    content: string
    create_time: string | number
}

const { t } = useI18n()
const baseURL: string = request.defaults.baseURL || ''
const route = useRoute()
const userInfo = reactive<AdminUser>(JSON.parse(localStorage.getItem('adminuser') || '{}'))

const chatListRef = ref<HTMLDivElement | null>(null)
const mainTableRef = ref<TableInstance | null>(null)
const groupedContacts = ref<ContactGroup[]>([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)
const searchKey = ref('')
const subLoading = ref<Record<number, boolean>>({})

const msgList = ref<ChatMsg[]>([])
const currentChatId = ref<number | null>(null)
const activeMainUserId = ref<number | null>(null)

// 聊天对方信息
const chatTargetName = ref('')
const chatTargetAvatar = ref('')
// 自身信息
const selfName = ref('')
const selfAvatar = ref('')

// 最后消息类型映射：[T]图片 [Z]转账 [Y]约会卡 [S]视频
const formatLastMsg = (lastMsg: string) => {
    return lastMsg === '[T]' ? t('image')
        : lastMsg === '[Z]' ? t('transfer')
            : lastMsg === '[Y]' ? t('card')
                : lastMsg === '[S]' ? t('video')
                    : lastMsg
}

const formatTime = (timestamp: number) => {
    if (!timestamp) return ''
    return moment(timestamp).format('YY/MM/DD HH:mm')
}

const subRowClass = ({ row }: { row: SubContact }) => {
    return currentChatId.value === row.id ? 'current-chat-row' : ''
}

// 点击联系人切换聊天记录
const toChat = async (friendId: number, mainId: number, name: string, avatar: string) => {
    currentChatId.value = friendId
    activeMainUserId.value = mainId
    chatTargetName.value = name
    chatTargetAvatar.value = avatar

    const group = groupedContacts.value.find(g => g.userId === mainId)
    if (group) {
        selfName.value = group.name
        selfAvatar.value = group.avatar
    }

    msgList.value = []
    try {
        const { data: res } = await request.post('/api/admin/message/getMessageList', {
            mainUserId: mainId,
            friendId: friendId
        })
        if (res.code === 1) {
            msgList.value = res.data || []
            await nextTick()
            if (chatListRef.value) {
                chatListRef.value.scrollTop = chatListRef.value.scrollHeight
            }
        }
    } catch (err) {
        console.error('加载聊天记录失败', err)
    }
}

// 加载某个分组的二级会话列表
const loadSubList = async (group: ContactGroup) => {
    if (group.subList.length > 0 || subLoading.value[group.userId]) return
    subLoading.value[group.userId] = true
    try {
        const { data: res } = await request.post('/api/admin/message/getSubList', {
            userId: group.userId
        })
        if (res.code === 1) {
            group.subList = res.data || []
        }
    } catch (err) {
        console.error('加载二级列表失败：', err)
    } finally {
        subLoading.value[group.userId] = false
    }
}

// 展开图标回调：互斥展开 + 懒加载二级列表
const onExpandChange = (row: ContactGroup, expandedRows: ContactGroup[]) => {
    const expanded = expandedRows.some(g => g.userId === row.userId)
    if (!expanded) {
        row.expanded = false
        return
    }
    // 互斥：收起其他分组
    groupedContacts.value.forEach(g => {
        if (g.userId !== row.userId && g.expanded) {
            g.expanded = false
            mainTableRef.value?.toggleRowExpansion(g, false)
        }
    })
    row.expanded = true
    loadSubList(row)
}

// 点击“查看会话”按钮：加载并展开
const viewGroup = async (group: ContactGroup) => {
    await loadSubList(group)
    mainTableRef.value?.toggleRowExpansion(group, true)
    group.expanded = true
}

// 加载一级分组列表（分页参数 page / limit 保持不变）
const loadMore = async () => {
    if (loading.value) return
    loading.value = true
    try {
        const { data: res } = await request.post('/api/admin/message/adminlistadmin', {
            keyword: searchKey.value,
            page: page.value,
            limit: pageSize.value
        })
        if (res.code === 1) {
            const list: Array<{ id: number; name: string; avatar: string; last_msg_time?: string }> = res.data || []
            groupedContacts.value = list.map(item => ({
                userId: item.id,
                name: item.name,
                avatar: item.avatar,
                last_msg_time: item.last_msg_time,
                expanded: false,
                subList: []
            }))
            // 后端未返回总数，按本页条数推算：满页则认为还有下一页
            if (list.length < pageSize.value) {
                total.value = (page.value - 1) * pageSize.value + list.length
            } else {
                total.value = page.value * pageSize.value + 1
            }
        } else {
            groupedContacts.value = []
            total.value = 0
        }
    } catch (err) {
        console.error('加载一级列表失败：', err)
        groupedContacts.value = []
        total.value = 0
    } finally {
        loading.value = false
    }
}

// 刷新列表并清空当前聊天
const refreshContacts = async () => {
    page.value = 1
    subLoading.value = {}
    msgList.value = []
    currentChatId.value = null
    activeMainUserId.value = null
    chatTargetName.value = ''
    chatTargetAvatar.value = ''
    selfName.value = ''
    selfAvatar.value = ''
    await nextTick()
    loadMore()
}

const handleReset = () => {
    searchKey.value = ''
    refreshContacts()
}

const onSizeChange = () => {
    page.value = 1
    loadMore()
}

const onPageChange = () => {
    loadMore()
}

watch(() => route.path, (newPath) => {
    if (newPath === '/contacts') refreshContacts()
})

onMounted(() => {
    refreshContacts()
})

onActivated(() => refreshContacts())

onUnmounted(() => {
    window.removeEventListener('messageRead', refreshContacts as EventListener)
})
</script>

<style scoped>
.msg-page {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 32px);
}

.msg-body {
    flex: 1;
    min-height: 0;
    display: flex;
    gap: 14px;
}

/* 左侧联系人 */
.left-contact {
    width: 520px;
    flex-shrink: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    border: 1px solid #eee;
    border-radius: 6px;
    padding: 10px;
    box-sizing: border-box;
}

.left-filter {
    margin-bottom: 10px;
    flex-shrink: 0;
}

.left-filter .el-input {
    width: 180px;
}

.left-table {
    flex: 1;
    min-height: 0;
}

.left-pager {
    margin-top: 10px;
    flex-shrink: 0;
    justify-content: center;
}

.sub-panel {
    padding: 6px 10px;
    background: #fef5ff;
}

.sub-panel :deep(.current-chat-row) {
    background-color: #ffd4fb !important;
}

/* 右侧聊天区域 */
.right-chat {
    flex: 1;
    height: 100%;
    min-width: 0;
    overflow: hidden;
}

.chat-empty {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
    font-size: 14px;
}

.chat-content {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.chat-list {
    flex: 1;
    padding-top: 10px;
    overflow-y: auto;
    margin-bottom: 100px;
}

.chat-list::-webkit-scrollbar {
    display: none;
}

.empty-msg {
    text-align: center;
    color: #666;
    padding: 20px 0;
}

/* 消息布局 */
.msg-item {
    display: flex;
    margin-bottom: 10px;
    align-items: flex-start;
    gap: 10px;
    padding-right: 20px;
}

.left-msg {
    justify-content: flex-start;
}

.right-msg {
    flex-direction: row-reverse;
}

.user-info {
    display: flex;
    flex-direction: row;
    align-items: center;
}

.msg-avatar {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    object-fit: cover;
}

.nickname {
    font-size: 14px;
    color: #666;
    text-align: left;
}

.msg-box {
    max-width: 60%;
}

.msg-text {
    padding: 8px 12px;
    background: #f5f5f5;
    border-radius: 6px;
    font-size: 14px;
    line-height: 1.5;
}

.msg-img :deep(.el-image) {
    max-width: 180px;
    border-radius: 6px;
    vertical-align: top;
}

.msg-goods,
.msg-other,
.msg-unknown {
    padding: 8px 12px;
    background: #f5f5f5;
    border-radius: 6px;
    font-size: 14px;
    color: #333;
}

.msg-video {
    border-radius: 6px;
}

.msg-time {
    font-size: 11px;
    color: #666;
    margin-top: 4px;
    text-align: left;
}

.message-video {
    max-width: 220px;
    max-height: 280px;
    border-radius: 8px;
    background: #fff;
    outline: none;
}
</style>
