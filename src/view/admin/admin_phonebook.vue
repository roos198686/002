<template>
    <div class="admin-page">
        <div class="page-title">用户通讯录</div>

        <div class="filter-bar">
            <el-input v-model="keyword" placeholder="用户名 / 昵称 / 联系人 / 电话" clearable
                @keyup.enter="handleSearch" />
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
        </div>

        <el-table :data="list" v-loading="loading" border stripe>
            <el-table-column prop="id" label="ID" width="80" align="center" />
            <el-table-column label="所属用户" min-width="200">
                <template #default="{ row }">
                    <div class="user-cell">
                        <el-image class="thumb small" :src="baseURL + (row.avatar || '')" fit="cover"
                            :preview-src-list="[baseURL + (row.avatar || '')]" preview-teleported />
                        <div>
                            <div>{{ row.nickname || '-' }}</div>
                            <div class="sub">@{{ row.username }}（ID:{{ row.user_id }}）</div>
                        </div>
                    </div>
                </template>
            </el-table-column>
            <el-table-column prop="name" label="联系人姓名" min-width="140" show-overflow-tooltip />
            <el-table-column prop="phones" label="电话号码" min-width="200" show-overflow-tooltip />
            <el-table-column label="同步时间" width="180" align="center">
                <template #default="{ row }">
                    {{ row.updated_at ? moment(row.updated_at).format('YYYY-MM-DD HH:mm') : '-' }}
                </template>
            </el-table-column>
        </el-table>

        <div class="pager-bar">
            <el-pagination background layout="total, sizes, prev, pager, next, jumper" :total="total"
                :current-page="page" :page-size="limit" :page-sizes="[20, 50, 100]"
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

interface PhoneRow {
    id: number
    user_id: number
    username: string
    nickname: string
    avatar: string
    name: string
    phones: string
    updated_at: string
}

const list = ref<PhoneRow[]>([])
const loading = ref(false)
const keyword = ref('')
const page = ref(1)
const limit = ref(20)
const total = ref(0)

const loadData = async () => {
    loading.value = true
    try {
        const { data: res } = await request.post('/api/admin/userdata/contacts', {
            keyword: keyword.value,
            page: page.value,
            limit: limit.value
        })
        if (res.code === 1) {
            list.value = res.data?.list || []
            total.value = res.data?.total || 0
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
    keyword.value = ''
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

<style scoped>
.user-cell {
    display: flex;
    align-items: center;
    gap: 10px;
}

.user-cell .sub {
    font-size: 12px;
    color: #999;
    margin-top: 2px;
}
</style>
