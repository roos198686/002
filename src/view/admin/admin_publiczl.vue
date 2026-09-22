<template>
    <div class="admin-page">
        <div class="page-title">资金管理（充值/提现记录）</div>

        <!-- 充值 / 提现 切换 -->
        <el-tabs v-model="logType" @tab-change="changeType">
            <el-tab-pane label="充值记录" :name="2" />
            <el-tab-pane label="提现记录" :name="1" />
        </el-tabs>

        <!-- 顶部筛选栏 -->
        <div class="filter-bar">
            <el-input v-model="searchName" placeholder="请输入用户名精确搜索" clearable style="width: 240px"
                @keyup.enter="handleSearch" />
            <el-select v-model="status" style="width: 140px" @change="changeStatus">
                <el-option label="未完成" :value="0" />
                <el-option label="已完成" :value="1" />
            </el-select>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
        </div>

        <!-- 记录表格 -->
        <el-table :data="list" border stripe v-loading="loading" style="width: 100%">
            <el-table-column prop="order_no" label="订单号" min-width="180" show-overflow-tooltip />
            <el-table-column prop="user_id" label="用户ID" width="90" align="center" />
            <el-table-column prop="username" label="用户名" width="130" show-overflow-tooltip />
            <el-table-column label="金额" width="120" align="right">
                <template #default="{ row }">{{ formatMoney(row.amount) }}</template>
            </el-table-column>
            <el-table-column prop="coin_type" label="币种" width="110" align="center" />
            <el-table-column prop="wallet_address" label="钱包地址" min-width="200" show-overflow-tooltip />
            <el-table-column label="时间" width="160" align="center">
                <template #default="{ row }">{{ moment(row.create_time).format('YY/MM/DD HH:mm:ss') }}</template>
            </el-table-column>
            <el-table-column label="状态" width="100" align="center">
                <template #default="{ row }">
                    <el-tag v-if="row.status === 0" type="warning">待处理</el-tag>
                    <el-tag v-else-if="row.status === 1" type="success">已完成</el-tag>
                    <el-tag v-else type="info">已冻结</el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="110" align="center" fixed="right">
                <template #default="{ row }">
                    <el-button size="small" type="primary" :disabled="row.status !== 0 || userInfo.status === 3"
                        @click="logType === 2 ? confirmRecharge(row.id) : confirmWithdraw(row.id)">
                        确认完成
                    </el-button>
                </template>
            </el-table-column>
            <template #empty>暂无记录</template>
        </el-table>

        <!-- 分页器：列表接口服务端分页；搜索接口一次返回全量，不展示分页器 -->
        <div v-if="!isSearchMode" class="pager-bar">
            <el-pagination background layout="total, sizes, prev, pager, next, jumper" :page-sizes="[10, 20, 50]"
                :total="total" v-model:current-page="page" v-model:page-size="pageSize" @size-change="onSizeChange"
                @current-change="onPageChange" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import request from '@/utils/request'
import moment from 'moment'
import { ElMessage, ElMessageBox } from 'element-plus'
import './admin-common.css'

interface AdminUser {
    status?: number
    group_level?: number | string
}

interface FundRecord {
    id: number
    order_no: string
    user_id: number
    username: string
    amount: number | string
    coin_type: string
    wallet_address: string
    create_time: string | number
    status: number
}

const router = useRouter()
const userInfo = reactive<AdminUser>(JSON.parse(localStorage.getItem('adminuser') || '{}'))

const searchName = ref('')
const logType = ref<number>(2) // 1=提现 2=充值
const status = ref<number>(0)

const list = ref<FundRecord[]>([])
const loading = ref(false)

// 服务端分页（后端未返回总数，按本页条数推算：满页则认为还有下一页）
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)
const isSearchMode = ref(false)

const formatMoney = (val: number | string) => {
    const num = Number(val || 0)
    return isNaN(num) ? '0.00' : num.toFixed(2)
}

const getList = async () => {
    const statusat = userInfo.status
    const remark = userInfo.group_level
    loading.value = true
    try {
        const res = await request.get('/api/admin/publiczl/listAll', {
            params: {
                type: logType.value,
                status: status.value,
                page: page.value,
                limit: pageSize.value,
                statusat,
                remark
            }
        })
        const arr: FundRecord[] = res.data.data || []
        list.value = arr
        if (arr.length < pageSize.value) {
            total.value = (page.value - 1) * pageSize.value + arr.length
        } else {
            total.value = page.value * pageSize.value + 1
        }
        isSearchMode.value = false
    } catch (err) {
        console.log(err)
        ElMessage.error('获取记录失败')
    } finally {
        loading.value = false
    }
}

const reloadFirstPage = () => {
    page.value = 1
    getList()
}

const changeType = () => {
    reloadFirstPage()
}

const changeStatus = () => {
    reloadFirstPage()
}

const onSizeChange = () => {
    page.value = 1
    getList()
}

const onPageChange = () => {
    getList()
}

const handleSearch = () => {
    if (!searchName.value) {
        reloadFirstPage()
        return
    }
    loading.value = true
    request.get('/api/admin/publiczl/search', {
        params: {
            username: searchName.value,
            type: logType.value,
            status: status.value
        }
    }).then(res => {
        list.value = res.data.data || []
        isSearchMode.value = true
    }).catch(err => {
        console.log(err)
        ElMessage.error('搜索失败')
    }).finally(() => {
        loading.value = false
    })
}

const handleReset = () => {
    searchName.value = ''
    reloadFirstPage()
}

// 【充值确认】接口（logType=2）
const confirmRecharge = async (id: number) => {
    try {
        await ElMessageBox.confirm('确认该笔充值已完成吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        })
    } catch {
        return
    }
    try {
        await request.post('/api/admin/publiczl/confirmRecharge', { id })
        ElMessage.success('充值已确认完成')
        reloadFirstPage()
    } catch (err) {
        console.log(err)
        ElMessage.error('操作失败')
    }
}

// 【提现确认】接口（logType=1）
const confirmWithdraw = async (id: number) => {
    try {
        await ElMessageBox.confirm('确认该笔提现已完成吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        })
    } catch {
        return
    }
    try {
        await request.post('/api/admin/publiczl/confirmWithdraw', { id })
        ElMessage.success('提现已确认完成')
        reloadFirstPage()
    } catch (err) {
        console.log(err)
        ElMessage.error('操作失败')
    }
}

onMounted(() => {
    const adminStr = localStorage.getItem('adminuser')
    if (!adminStr) {
        router.replace('/admin_login')
    }
    getList()
})
</script>

<style scoped></style>
