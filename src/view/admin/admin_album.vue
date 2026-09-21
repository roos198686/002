<template>
    <div class="admin-page">
        <div class="page-title">用户相册</div>

        <div class="filter-bar">
            <el-input v-model="keyword" placeholder="用户名 / 昵称" clearable @keyup.enter="handleSearch" />
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
            <el-radio-group v-model="viewMode">
                <el-radio-button value="grid">网格</el-radio-button>
                <el-radio-button value="table">表格</el-radio-button>
            </el-radio-group>
        </div>

        <!-- 网格视图 -->
        <div v-loading="loading">
            <div v-if="viewMode === 'grid'" class="photo-grid">
                <div v-for="item in list" :key="item.id" class="photo-card">
                    <el-image class="photo-img" :src="baseURL + item.image_url" fit="cover"
                        :preview-src-list="previewList" :initial-index="previewIndex(item.id)" preview-teleported />
                    <div class="photo-meta">
                        <div>{{ item.nickname || '-' }} @{{ item.username }}</div>
                        <div>ID:{{ item.user_id }} · {{ fmtTime(item.created_at) }}</div>
                    </div>
                </div>
                <div v-if="!loading && list.length === 0" style="grid-column:1/-1;text-align:center;color:#999;padding:40px;">
                    暂无相册数据
                </div>
            </div>

            <!-- 表格视图 -->
            <el-table v-else :data="list" border stripe>
                <el-table-column prop="id" label="ID" width="80" align="center" />
                <el-table-column label="图片" width="100" align="center">
                    <template #default="{ row }">
                        <el-image class="thumb" :src="baseURL + row.image_url" fit="cover"
                            :preview-src-list="previewList" :initial-index="previewIndex(row.id)"
                            preview-teleported />
                    </template>
                </el-table-column>
                <el-table-column label="所属用户" min-width="180">
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
                <el-table-column prop="photo_id" label="相册图片标识" min-width="160" show-overflow-tooltip />
                <el-table-column label="同步时间" width="180" align="center">
                    <template #default="{ row }">
                        {{ fmtTime(row.created_at) }}
                    </template>
                </el-table-column>
            </el-table>
        </div>

        <div class="pager-bar">
            <el-pagination background layout="total, sizes, prev, pager, next, jumper" :total="total"
                :current-page="page" :page-size="limit" :page-sizes="[30, 50, 100]"
                @current-change="onPageChange" @size-change="onSizeChange" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import moment from 'moment'
import request from '@/utils/request'
import './admin-common.css'

const baseURL = request.defaults.baseURL || ''

interface PhotoRow {
    id: number
    user_id: number
    username: string
    nickname: string
    avatar: string
    photo_id: string
    image_url: string
    modified: number
    created_at: string
}

const list = ref<PhotoRow[]>([])
const loading = ref(false)
const keyword = ref('')
const page = ref(1)
const limit = ref(30)
const total = ref(0)
const viewMode = ref<'grid' | 'table'>('grid')

const previewList = computed(() => list.value.map(i => baseURL + i.image_url))
const previewIndex = (id: number) => Math.max(0, list.value.findIndex(i => i.id === id))

const fmtTime = (t: string) => t ? moment(t).format('YYYY-MM-DD HH:mm') : '-'

const loadData = async () => {
    loading.value = true
    try {
        const { data: res } = await request.post('/api/admin/userdata/photos', {
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
