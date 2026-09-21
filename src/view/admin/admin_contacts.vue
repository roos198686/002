<template>
    <div class="admin-page">
        <div class="page-title">聊天联系人</div>

        <div class="filter-bar">
            <el-input v-model="searchKey" placeholder="搜索用户名 / 备注" clearable @keyup.enter="handleSearch" />
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
        </div>

        <el-table :data="list" v-loading="loading" border stripe>
            <el-table-column label="头像" width="70" align="center">
                <template #default="{ row }">
                    <el-image class="thumb small" :src="baseURL + (row.avatar || '')" fit="cover"
                        :preview-src-list="[baseURL + (row.avatar || '')]" preview-teleported />
                </template>
            </el-table-column>
            <el-table-column prop="id" label="用户ID" width="90" align="center" />
            <el-table-column prop="name" label="名称" min-width="140" show-overflow-tooltip />
            <el-table-column label="最后消息" min-width="180" show-overflow-tooltip>
                <template #default="{ row }">
                    {{ formatMsg(row.lastMsg) }}
                </template>
            </el-table-column>
            <el-table-column label="时间" width="170" align="center">
                <template #default="{ row }">
                    {{ row.timestamp ? moment(row.timestamp).format('YYYY-MM-DD HH:mm') : '-' }}
                </template>
            </el-table-column>
            <el-table-column label="未读" width="80" align="center">
                <template #default="{ row }">
                    <el-tag v-if="row.unread_count > 0" type="danger">
                        {{ row.unread_count > 99 ? '99+' : row.unread_count }}
                    </el-tag>
                    <span v-else>-</span>
                </template>
            </el-table-column>
        </el-table>

        <div class="pager-bar">
            <el-pagination background layout="total, sizes, prev, pager, next, jumper" :total="total"
                :current-page="page" :page-size="limit" :page-sizes="[10, 20, 50]"
                @current-change="onPageChange" @size-change="onSizeChange" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import moment from 'moment'
import request from '@/utils/request'
import './admin-common.css'

const baseURL = request.defaults.baseURL || ''

interface ContactRow {
    id: number
    name: string
    avatar: string
    lastMsg: string
    timestamp: number
    unread_count: number
}

const list = ref<ContactRow[]>([])
const loading = ref(false)
const searchKey = ref('')
const page = ref(1)
const limit = ref(20)
const total = ref(0)

const formatMsg = (msg: string) => {
    if (!msg) return '-'
    const map: Record<string, string> = {
        '[T]': '[图片]',
        '[Z]': '[转账]',
        '[Y]': '[名片]',
        '[S]': '[视频]'
    }
    return map[msg] || msg
}

const loadData = async () => {
    loading.value = true
    try {
        const { data: res } = await request.post('/api/admin/message/listadmin', {
            keyword: searchKey.value,
            page: page.value,
            limit: limit.value
        })
        if (res.code === 1) {
            list.value = res.data || []
            // 後端未返回總數：滿頁認爲還有下一頁
            total.value = list.value.length === limit.value
                ? page.value * limit.value + 1
                : (page.value - 1) * limit.value + list.value.length
        } else {
            list.value = []
            total.value = 0
        }
    } catch (err) {
        list.value = []
        total.value = 0
    } finally {
        loading.value = false
    }
}

const handleSearch = () => {
    page.value = 1
    loadData()
}

const handleReset = () => {
    searchKey.value = ''
    page.value = 1
    loadData()
}

const onPageChange = (p: number) => {
    page.value = p
    loadData()
}

const onSizeChange = (s: number) => {
    limit.value = s
    page.value = 1
    loadData()
}

onMounted(loadData)
</script>
