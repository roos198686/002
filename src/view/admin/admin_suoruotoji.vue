<template>
    <div class="admin-page">
        <div class="page-title">收支统计</div>

        <div class="filter-bar">
            <el-date-picker v-model="monthuser" type="month" placeholder="选择月份" value-format="YYYY-MM"
                clearable />
            <el-button type="primary" @click="getStats">查询</el-button>
        </div>

        <el-table :data="list" border stripe v-loading="loading">
            <el-table-column type="index" label="序号" width="70" align="center" />
            <el-table-column prop="nickname" label="用户名" min-width="120" show-overflow-tooltip />
            <el-table-column prop="amount_ahopa" label="买入商品" min-width="100" align="right">
                <template #default="{ row }">{{ row.amount_ahopa ?? '-' }}</template>
            </el-table-column>
            <el-table-column prop="amount_ahopb" label="商铺收入" min-width="100" align="right">
                <template #default="{ row }">{{ row.amount_ahopb ?? '-' }}</template>
            </el-table-column>
            <el-table-column prop="amount_vip" label="升级VIP" min-width="100" align="right">
                <template #default="{ row }">{{ row.amount_vip ?? '-' }}</template>
            </el-table-column>
            <el-table-column prop="amount_rya" label="用户充值" min-width="100" align="right">
                <template #default="{ row }">{{ row.amount_rya ?? '-' }}</template>
            </el-table-column>
            <el-table-column prop="amount_ryb" label="用户提现" min-width="100" align="right">
                <template #default="{ row }">{{ row.amount_ryb ?? '-' }}</template>
            </el-table-column>
            <el-table-column prop="amount_zza" label="转账收入" min-width="100" align="right">
                <template #default="{ row }">{{ row.amount_zza ?? '-' }}</template>
            </el-table-column>
            <el-table-column prop="amount_zzb" label="转账支出" min-width="100" align="right">
                <template #default="{ row }">{{ row.amount_zzb ?? '-' }}</template>
            </el-table-column>
            <el-table-column prop="total_all" label="总计" min-width="100" align="right">
                <template #default="{ row }">
                    <span style="color:#ff33ee;font-weight:bold">{{ row.total_all || 0 }}</span>
                </template>
            </el-table-column>
            <el-table-column label="抽成比例" min-width="90" align="center">
                <template #default>{{ statisticslist[0]?.staff_rate ?? '-' }}%</template>
            </el-table-column>
            <el-table-column label="操作" width="90" align="center" fixed="right">
                <template #default="{ row }">
                    <el-button type="primary" size="small" :disabled="userInfo.status == 3"
                        @click="openDetail(row.user_id)">
                        明细
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <el-dialog v-model="detailVisible" title="收支明细" width="700px">
            <el-table :data="userlist" border stripe max-height="500">
                <el-table-column prop="order_no" label="订单号" min-width="200" show-overflow-tooltip />
                <el-table-column prop="remark" label="类型" width="120" align="center" />
                <el-table-column prop="amount" label="金额" width="110" align="right" />
                <el-table-column label="创建时间" width="160" align="center">
                    <template #default="{ row }">
                        {{ moment(row.create_time).format('YYYY-MM-DD HH:mm') }}
                    </template>
                </el-table-column>
            </el-table>
            <template #footer>
                <el-button @click="detailVisible = false">关闭</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from "vue";
import request from '@/utils/request'
import moment from 'moment';
import './admin-common.css'

interface StatRow {
    user_id: number
    nickname: string
    amount_ahopa: number | string
    amount_ahopb: number | string
    amount_vip: number | string
    amount_rya: number | string
    amount_ryb: number | string
    amount_zza: number | string
    amount_zzb: number | string
    total_all: number
}

interface DetailRow {
    id: number
    order_no: string
    remark: string
    amount: number | string
    create_time: string
}

const userInfo = reactive(JSON.parse(localStorage.getItem("adminuser") || "{}"))

const monthuser = ref('')
const list = ref<StatRow[]>([])
const loading = ref(false)
const statisticslist = ref<any[]>([])
const userlist = ref<DetailRow[]>([])
const detailVisible = ref(false)

const getStats = async () => {
    loading.value = true
    try {
        const { data } = await request.get('/api/admin/suoruotoji/groupUserWithdrawStats', {
            params: {
                month: monthuser.value || ''
            }
        })
        if (data.code === 1) {
            list.value = data.data || []
        }
    } catch (e) {
        console.error('数据获取失败', e)
    } finally {
        loading.value = false
    }
}

const recommendlist = async () => {
    try {
        const status = userInfo.status
        const { data } = await request.get('/api/admin/suoruotoji/recommendlist', {
            params: { status }
        })
        if (data.code === 1) {
            statisticslist.value = data.data
        }
    } catch (e) {
        console.error('抽成配置获取失败', e)
    }
}

const openDetail = async (userId: number) => {
    try {
        const { data } = await request.get('/api/admin/suoruotoji/getlist', {
            params: { id: userId }
        })
        if (data.code === 1) {
            userlist.value = data.data || []
            detailVisible.value = true
        }
    } catch (e) {
        console.error('明细获取失败', e)
    }
}

onMounted(() => {
    recommendlist()
    getStats()
})
</script>
