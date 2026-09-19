<template>
    <div class="maina">
        <div class="all">
            <div class="search-box">
                <span class="search-label">输入用户名：</span>
                <input v-model="searchName" placeholder="请输入用户名精确搜索" @input="handleSearch" class="input" />
            </div>

            <div class="role-tabs">
                <div class="tab-item" :class="{ active: logType === 2 }" @click="changeType(2)">充值记录</div>
                <div class="tab-item" :class="{ active: logType === 1 }" @click="changeType(1)">提现记录</div>
            </div>
            <div ref="scrollWrap" class="user-table-wrap" @scroll="handleScroll">
                <div class="role-tabsa">
                    <div class="tab-itema" :class="{ active: status === 0 }" @click="changeStatus(0)">未完成</div>
                    <div class="tab-itema" :class="{ active: status === 1 }" @click="changeStatus(1)">已完成</div>
                </div>
                <!-- 表头 -->
                <div class="user-item"
                    style="display: flex; align-items: center; padding: 5px 15px;background-color: #ff33ee;color: #fff;">
                    <div class="user-info">
                        <span style="width:18%">订单号</span>
                        <span style="width:7%">用户ID</span>
                        <span style="width:12%">用户ID</span>
                        <span style="width:12%">金额</span>
                        <span style="width:10%">币种</span>
                        <span style="width:22%">钱包地址</span>
                        <span style="width:16%">时间</span>
                        <span style="width:10%">状态</span>
                    </div>
                    <div style="width:100px;font-size: 13px;">操作</div>
                </div>

                <!-- 列表 -->
                <div v-for="item in list" :key="item.id" class="user-item">
                    <div class="user-info">
                        <span style="width:18%">{{ item.order_no }}</span>
                        <span style="width:7%">{{ item.user_id }}</span>
                        <span style="width:12%">{{ item.username }}</span>
                        <span style="width:12%">{{ item.amount }}</span>
                        <span style="width:10%">{{ item.coin_type }}</span>
                        <span style="width:22%">{{ item.wallet_address }}</span>
                        <span style="width:16%">{{ moment(item.create_time).format('YY/MM/DD HH:mm:ss') }}</span>
                        <span style="width:10%">{{ item.status === 0 ? '待处理' : item.status === 1 ? '已完理' : '已冻成'
                        }}</span>
                    </div>
                    <div style="width:100px;display: flex;">
                        <div >
                            <!-- e这里自动区分 充值已确提现 调用不同接口 -->
                            <div class="primary" v-if="item.status === 0" :style="userinfo.status != 3 ? '' : 'pointer-events: none;background-color: #555;'"
                                @click="logType === 2 ? confirmRecharge(item.id) : confirmWithdraw(item.id)">
                                确认完成
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="list.length === 0 && !loading" class="empty-tip">暂无记录</div>
                <div v-else>
                    <div v-if="loading" class="load-txt">加载中.....</div>
                    <div v-if="noMore" class="load-txt">没有更多了</div>
                </div>
            </div>
        </div>
        <!-- 提示 -->
        <div class="copy-toast" v-if="showToast">
            <div style="font-size:30px;">
                <Icon icon="iconoir:xmark" width="58" v-if="!yesno" />
                <Icon icon="iconoir:check" width="58" v-else />
            </div>
            <div style="font-size:16px; margin-top:10px;">{{ showtext }}</div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import request from '@/utils/request'
import router from '@/router'
import moment from 'moment';
import { Icon } from '@iconify/vue';
const showToast = ref(false);
const showtext = ref('');
const yesno = ref(false);
const searchName = ref('')
const logType = ref(2) // 1=提现 2=充值已确'
const status = ref(0)

const list = ref<any[]>([])
const scrollWrap = ref<HTMLDivElement | null>(null)

const page = ref(1)
const pageSize = 20
const loading = ref(false)
const noMore = ref(false)

const resetPage = () => {
    page.value = 1
    list.value = []
    noMore.value = false
}
const userInfo = reactive(JSON.parse(localStorage.getItem("adminuser") || "{}"));
const getList = async () => {

    const statusat = userInfo.status
    const remark = userInfo.group_level
    console.log(statusat, remark)
    if (loading.value || noMore.value) return
    loading.value = true
    try {
        const res = await request.get('/api/admin/publiczl/listAll', {
            params: {
                type: logType.value,
                status: status.value,
                page: page.value,
                limit: pageSize,
                statusat: statusat,
                remark: remark
            }
        })
        const arr = res.data.data || []
        console.log(arr)
        list.value = [...list.value, ...arr]
        if (arr.length < pageSize) noMore.value = true
        page.value++
    } catch (err) {
        console.log(err)
    } finally {
        loading.value = false
    }
}

const handleScroll = () => {
    if (!scrollWrap.value) return
    const { scrollTop, scrollHeight, clientHeight } = scrollWrap.value
    if (scrollHeight - scrollTop - clientHeight < 80) getList()
}

const changeType = (val: number) => {
    logType.value = val
    resetPage()
    getList()
}

const changeStatus = (val: number) => {
    status.value = val
    resetPage()
    getList()
}

const handleSearch = () => {
    resetPage()
    if (!searchName.value) return getList()
    request.get('/api/admin/publiczl/search', {
        params: {
            username: searchName.value,
            type: logType.value,
            status: status.value
        }
    }).then(res => {
        list.value = res.data.data || []
    })
}

// ==============================================
// �?【充值确认】接口（logType=2U.j
const confirmRecharge = async (id: number) => {
    await request.post('/api/admin/publiczl/confirmRecharge', { id })
    resetPage()
    getList()
    showtext.value = '充值已确认完成';
    yesno.value = true;
    showToast.value = true;
    setTimeout(() => showToast.value = false, 1500);
}

// px【提现确认】接口（logType=1h.j
const confirmWithdraw = async (id: number) => {
    await request.post('/api/admin/publiczl/confirmWithdraw', { id })
    resetPage()
    getList()
    showtext.value = '提现已确认完成';
    yesno.value = true;
    showToast.value = true;
    setTimeout(() => showToast.value = false, 1500);
}
// ==============================================

onMounted(() => {

    const adminStr = localStorage.getItem('adminuser');

    if (!adminStr) {
        router.replace('/admin_login');
    }
    getList()
})
</script>

<style scoped>
.user-item {
    display: flex;
    text-align: left;
    padding: 6px 15px;
    border-bottom: 1px solid #eee;
}

.user-info {
    flex: 1;
    display: flex;
    align-items: center;
    font-size: 13px;
}

.user-info span {
    overflow: hidden;
    white-space: nowrap;
    font-size: 13px;
}

.maina {
    padding: 20px;
}

.search-box {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-bottom: 15px;
}

.search-label {
    white-space: nowrap;
    font-size: 13px;
}

.search-box :deep(.input) {
    width: 260px;
}

.role-tabs {
    display: flex;
    gap: 10px;
}

.role-tabsa {
    display: flex;
    border-radius: 6px 6px 0 0;
    padding: 3px 0;
}

.tab-item {
    padding: 2px 16px;
    border: 1px solid #ccc;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
}

.tab-item:hover {
    background: #fcebfc;
}

.tab-item.active {
    background: #ff33ee;
    color: #333;
    border-color: #ff33ee;
}


.tab-itema {
    margin: 3px 16px;
    cursor: pointer;
    font-size: 13px;
    color: #3f3f3f;
}

.tab-itema:hover {
    color: #ff33ee;
}

.tab-itema.active {
    color: #ff33ee;
    font-weight: bold;
    border-bottom: 3px solid #ff33ee;
}

.user-table-wrap {
    border: 1px solid #eee;
    border-radius: 6px;
    max-height: 600px;
    overflow-y: auto;
    margin-top: 15px;
}

.user-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 15px;
    border-bottom: 1px solid #d3d2d2;
    background: #eeeeee;
}

.user-info {
    display: flex;
    gap: 18px;
    font-size: 14px;
}

.primary {
    background-color: #02804b;
    color: #fff;
    padding: 2px 10px;
    border-radius: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    font-size: 13px;
}

.empty-tip,
.load-txt {
    text-align: center;
    padding: 30px 0;
    color: #666;
    font-size: 13px;
}

.user-table-wrap::-webkit-scrollbar {
    display: none;
}

/* 弹窗 */
.copy-toast {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(46, 46, 46, 0.8);
    color: #333;
    padding: 20px;
    border-radius: 8px;
    z-index: 9999;
    min-width: 250px;
}

:global(.input) {
    border: 1px solid #ccc;
    padding: 5px;
    border-radius: 4px;
    outline: none;
}

:global(.input:focus) {
    border: 1px solid #ccc;
    /* 强制提权，覆盖全局样式 */
    /* border-color: #ff33ee !important; */
}
</style>