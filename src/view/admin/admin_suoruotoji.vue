<template>
    <div class="stat-wrap">
        <div>
            <!-- 筛选栏 -->
            <div class="filter-bar">
                <div class="title">收支统计</div>
                <input v-model="monthuser" type="month" class="month-input" />
                <div class="query-btn" @click="getStats"  :style="userinfo.status != 3 ? '' : 'pointer-events: none;background-color: #555;'">查询</div>
            </div>
            <div style="border: 1px solid #eee;border-radius: 6px;">
                <div class="list-item"
                    style="padding: 5px 23px;margin: 0;display: flex;flex-direction: row;background-color: #ff33ee;color: #fff;border-radius: 6px 6px 0 0;">
                    <div class="rank">序号</div>
                    <div class="name">用户名</div>
                    <div class="name">买入商品</div>
                    <div class="name">商铺收入</div>
                    <div class="name">升级VIP</div>
                    <div class="name">用户充值</div>
                    <div class="name">用户提现</div>
                    <div class="name">转账收入</div>
                    <div class="name">转账支出</div>
                    <div class="total">总计</div>
                    <div class="profit">抽成比例</div>
                    <div class="name">操作</div>
                </div>
                <!-- 列表区域 -->
                <div class="list-container">
                    <div v-for="(item, idx) in list" :key="idx" class="list-item">
                        <div class="rank">{{ idx + 1 }}</div>
                        <div class="name">{{ item.nickname || '-' }}</div>
                        <div class="name">{{ item.amount_ahopa || '-' }}</div>
                        <div class="name">{{ item.amount_ahopb || '-' }}</div>
                        <div class="name">{{ item.amount_vip || '-' }}</div>
                        <div class="name">{{ item.amount_rya || '-' }}</div>
                        <div class="name">{{ item.amount_ryb || '-' }}</div>
                        <div class="name">{{ item.amount_zza || '-' }}</div>
                        <div class="name">{{ item.amount_zzb || '-' }}</div>
                        <div class="total">{{ item.total_all || 0 }}</div>
                        <div class="profit">{{ statisticslist[0]?.staff_rate }}%</div>
                        <div class="name" style="display: flex;">
                            <div @click="openDetail(item.user_id)" style="cursor: pointer;display: flex; background-color: #ff33ee;color: #fff;padding: 0 7px;border-radius: 5px;" :style="userinfo.status != 3 ? '' : 'pointer-events: none;background-color: #555;'">
                                明细</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 收支明细弹窗 遮罩 -->
        <div v-if="detailVisible" class="my-dialog-mask" @click.self="detailVisible = false"></div>
        <!-- 收支明细弹窗 主体 -->
        <div v-if="detailVisible" class="my-dialog" style="width: 60%;max-width: 700px;">
            <div class="my-dialog-head">收支明细</div>
            <div style="max-height: 500px;overflow-y: auto;padding: 10px 30px;font-size: 13px;">
                <table border="1" cellpadding="6" cellspacing="0" style="width: 100%;border-collapse: collapse;">
                    <thead>
                        <tr style="background: #ff33ee;color: #fff;">
                            <th>订单号</th>
                            <th>类型</th>
                            <th>金额</th>
                            <th>创建时间</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="row in userlist" :key="row.id">
                            <td align="center">{{ row.order_no }}</td>
                            <td align="center">{{ row.remark }}</td>
                            <td align="center">{{ row.amount }}</td>
                            <td align="center">{{ moment(row.create_time).format('YYYY.MM.DD HH:mm') }}</td>
                        </tr>
                        <tr v-if="userlist.length === 0">
                            <td colspan="6" align="center">暂无明细数据</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div style="display: flex;flex-direction: row;justify-content: flex-end;gap:10px;padding: 20px 30px;">
                <div class="primaryno" @click="detailVisible = false">关闭</div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from "vue";
import request from '@/utils/request'
import moment from 'moment';
// 用户信息'
const userInfo = reactive(JSON.parse(localStorage.getItem("adminuser") || "{}"))

// 筛选月份、列表数据获取
const monthuser = ref('')
const list = ref<any[]>([])

// 抽成比例数据
const statisticslist = ref<any[]>([])
//收支明细
const userlist = ref<any[]>([])
// 弹窗显示状态'
const detailVisible = ref(false)

// 获取员工收入统计'
const getStats = async () => {
    try {
        const { data } = await request.get('/api/admin/suoruotoji/groupUserWithdrawStats', {
            params: {
                month: monthuser.value || ''
            }
        })
        if (data.code === 1) {
            list.value = data.data
        }
    } catch (e) {
        console.error('数据获取失败', e)
    }
}

// 获取抽成配置'
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

// 打开明细弹窗 + 请求明细数据'
const openDetail = async (userId: any) => {
    try {
        const { data } = await request.get('/api/admin/suoruotoji/getlist', {
            params: { id: userId }
        })
        if (data.code === 1) {
            userlist.value = data.data
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

<style scoped>
.stat-wrap {
    padding: 30px;
    width: 100%;
    box-sizing: border-box;
}

.filter-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
}

.title {
    font-size: 18px;
    font-weight: bold;
    color: #a3329e;
    flex: 1;
    text-align: left;
}

.month-input {
    padding: 6px;
    background: #eee;
    color: #000;
    border: none;
    border-radius: 6px;
}

.query-btn {
    background-color: #ff33ee;
    color: #333;
    padding: 3px 10px;
    border-radius: 4px;
    font-size: 13px;
    cursor: pointer;
}

.list-container {
    max-height: 700px;
    overflow-y: auto;
    padding-bottom: 50px;
}

.list-item {
    font-size: 13px;
    display: flex;
    gap: 10px;
    padding: 5px 23px;
    border-bottom: 1px solid #ddd;
    text-align: left;
}

.rank {
    width: 50px;
}

.name,
.total,
.profit {
    flex: 1;
}

/* 弹窗样式 沿用你原有样�?*/
.my-dialog-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
}

.my-dialog {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #fff;
    border-radius: 8px;
    z-index: 1000;
    box-sizing: border-box;
}

.my-dialog-head {
    font-size: 16px;
    font-weight: bold;
    padding: 10px 20px;
    border-bottom: 1px solid #c2c2c2;
}

.primaryno {
    padding: 3px 16px;
    border: 1px solid #ccc;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    background-color: #f5f5f5;
}
</style>