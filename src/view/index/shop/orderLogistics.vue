<template>
    <div class="merchant-order-container">
        <div class="register-container">
            <div class="register-all" ref="scrollWrap">
                <div class="allar-top">
                    <div @click="goBack" style="margin-left: 10px;cursor: pointer;color: #a88035;width: 30px;">
                        <Icon icon="material-symbols:arrow-back-ios-rounded" width="18" />
                    </div>
                    <div class="allar-top-a">我的訂單</div>
                </div>

                <div class="tab-wrap">
                    <div class="order-tab">
                        <span class="tab-item" :class="{ active: searchParams.status === '2' }" @click="switchTab('2')">已支付</span>
                        <span class="tab-item" :class="{ active: searchParams.status === '3' }" @click="switchTab('3')">已發貨</span>
                        <span class="tab-item" :class="{ active: searchParams.status === '4' }" @click="switchTab('4')">已完成</span>
                    </div>
                </div>

                <div class="order-list">
                    <div class="order-item" v-for="item in orderList" :key="item.id">
                        <div class="order-head">
                            <span class="order-no">訂單號：{{ item.order_no }}</span>
                            <span class="order-status" :class="statusClass(item.status)">
                                {{ getStatusText(item.status) }}
                            </span>
                        </div>
                        <div class="order-goods">
                            <img :src="baseURL + item.goods_cover" class="goods-cover" />
                            <div class="goods-info">
                                <div class="goods-name">{{ item.goods_name }}</div>
                                <div class="goods-spec">
                                    規格：{{ item.color || '無' }} / {{ item.spec || '無' }}
                                </div>
                                <div class="goods-price">
                                    單價：${{ item.price }} x {{ item.number }}
                                    <span class="total">合計：${{ item.total_price }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="order-time">
                            <span>創建時間：{{ formatTime(item.created_at) }}</span>
                            <span v-if="item.pay_time">支付時間：{{ formatTime(item.pay_time) }}</span>
                        </div>
                        <div class="order-action">
                            <div class="buttksl collea" @click="openAddressModal(item.address_id)">收貨地址</div>
                            <div class="buttksl colleb" v-if="item.status != 4" @click="openLogisticsModal(item)">編輯物流</div>
                            <div class="buttksl collec" @click="toPay(item)">查看物流</div>
                        </div>
                    </div>
                </div>

                <div class="load-tip" v-if="loading">載入中.....</div>
                <div class="empty-tip" v-if="orderList.length === 0 && !loading">暫無訂單</div>
                <div class="no-more-tip" v-if="noMore && orderList.length > 0">沒有更多數據了</div>

                <!-- 物流弹窗 -->
                <div class="modal-mask" v-if="logisticsModal.show">
                    <div class="modal-box">
                        <div class="modal-header">
                            <span>編輯訂單物流</span>
                            <span class="close" @click="closeLogisticsModal">×</span>
                        </div>
                        <div class="modal-body">
                            <div class="form-item">
                                <label>訂單號：</label>
                                <input v-model="logisticsForm.order_no" disabled />
                            </div>
                            <div class="form-item" v-if="statusVal == '2'">
                                <label>快遞公司 <span class="red">*</span></label>
                                <input v-model="logisticsForm.express_company" placeholder="例：順豐、中通、圓通" />
                            </div>
                            <div class="form-item" v-if="statusVal == '2'">
                                <label>快遞單號 <span class="red">*</span></label>
                                <input v-model="logisticsForm.express_no" placeholder="請填寫快遞單號" />
                            </div>
                            <div class="form-item">
                                <label>物流狀態</label>
                                <select v-model="logisticsForm.status">
                                    <option value="已發貨" v-if="statusVal == '2'">已發貨</option>
                                    <option value="運輸中" v-if="statusVal == '3'">運輸中</option>
                                    <option value="已簽收" v-if="statusVal == '3'">已簽收</option>
                                </select>
                            </div>
                            <div class="form-item">
                                <label>物流備註</label>
                                <textarea v-model="logisticsForm.content" rows="3" placeholder="可填寫物流備註"></textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <div class="cancel-btn" @click="closeLogisticsModal">取消</div>
                            <div class="submit-btn" @click="saveLogistics">確定提交</div>
                        </div>
                    </div>
                </div>

                <!-- 地址弹窗 -->
                <div class="modal-mask" v-if="addressModal.show">
                    <div class="modal-box">
                        <div class="modal-header">
                            <span>收貨地址</span>
                            <span class="close" @click="closeAddressModal">×</span>
                        </div>
                        <div class="modal-body" v-if="addressInfo">
                            <p>收件人：{{ addressInfo.receiver_name }}</p>
                            <p>聯絡電話：{{ addressInfo.receiver_phone }}</p>
                            <p>國家：{{ addressInfo.country }}</p>
                            <p>地區/省市：{{ addressInfo.region }}</p>
                            <p>詳細地址：{{ addressInfo.detail_address }}</p>
                        </div>
                        <div class="modal-body" v-else>
                            <p>暫無收貨地址資訊</p>
                        </div>
                    </div>
                </div>

                <div class="toast" v-if="toast.show" :class="{ success: toast.isSuccess }">
                    {{ toast.text }}
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import request from '@/utils/request'
import router from '@/router'
import { Icon } from '@iconify/vue'

const scrollWrap = ref<HTMLDivElement | null>(null)
const baseURL = request.defaults.baseURL || ''
const loading = ref(false)
const noMore = ref(false)
const page = ref(1)
const pageSize = 10

// 搜索绑定：输入框直接绑这�?
const searchParams = ref({
    status: '2',
    orderNo: ''
})

const orderList = ref<any[]>([])

const logisticsModal = ref({ show: false, id: 0 })
const logisticsForm = ref({
    order_no: '',
    express_company: '',
    express_no: '',
    status: '已發貨',
    content: ''
})
const statusVal = ref('')

const addressModal = ref({ show: false })
const addressInfo = ref<any>(null)

const toast = ref({ show: false, text: '', isSuccess: false })

const goBack = () => router.go(-1)
const toPay = (item: any) => router.push({ path: '/logistics', query: { order_no: item.order_no } })

const getStatusText = (val: number) => {
    const map: Record<number, string> = { 2: '已支付', 3: '已發付', 4: '已完付' }
    return map[val] || '未知狀態'
}
const statusClass = (val: number) => {
    const map: Record<number, string> = {
        2: 'status-paid',
        3: 'status-send',
        4: 'status-finish'
    }
    return map[val] || ''
}
const formatTime = (s: string) => s ? new Date(s).toLocaleString() : ''
const showToast = (text: string, ok = false) => {
    toast.value = { show: true, text, isSuccess: ok }
    setTimeout(() => toast.value.show = false, 2000)
}

// 切换标签'
const switchTab = (s: string) => {
    searchParams.value.status = s
    page.value = 1
    noMore.value = false
    orderList.value = []
    fetchList()
}

// ========== 核心：点击查询，直接收searchParams.orderNo 传给接口 ==========
const onSearch = () => {
    page.value = 1
    noMore.value = false
    orderList.value = []
    fetchList()
}

// 请求列表：固定取 searchParams.orderNo，不做任何额外处理'
const fetchList = async () => {
    if (loading.value || noMore.value) return
    loading.value = true
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        // 【重点】直接取消searchParams.orderNo 传给 order_no
        const params = {
            touser_id: user.id || 0,
            status: searchParams.value.status,
            order_no: searchParams.value.orderNo, // 原封不动传输入内容或上'
            page: page.value,
            page_size: pageSize
        }

        const res = await request.post('/api/orderLogistics/list', params)
        if (res.data.code === 1) {
            const list = res.data.data || []
            orderList.value.push(...list)
            if (list.length < pageSize) {
                noMore.value = true
            } else {
                page.value++
            }
        }
    } catch (e) {
        showToast('網路異常')
    } finally {
        loading.value = false
    }
}

// 上拉加载'
const handleScroll = () => {
    const el = scrollWrap.value
    if (!el) return
    const { scrollTop, scrollHeight, clientHeight } = el
    if (scrollHeight - scrollTop - clientHeight < 100) {
        fetchList()
    }
}

// 物流弹窗'
const openLogisticsModal = (item: any) => {
    logisticsModal.value.show = true
    logisticsModal.value.id = item.log_id || 0
    statusVal.value = String(item.status)
    logisticsForm.value = {
        order_no: item.order_no,
        express_company: item.express_company || '',
        express_no: item.express_no || '',
        status: item.logistics_status || '已發貨',
        content: item.content || ''
    }
}
const closeLogisticsModal = () => logisticsModal.value.show = false

const saveLogistics = async () => {
    const f = logisticsForm.value
    if (statusVal.value === '2') {
        if (!f.express_company) return showToast('請填寫快遞公司')
        if (!f.express_no) return showToast('請填寫快遞單號')
    }
    try {
        const res = await request.post('/api/orderLogistics/save', { id: logisticsModal.value.id, ...f })
        if (res.data.code === 1) {
            showToast('提交成功', true)
            closeLogisticsModal()
            page.value = 1
            noMore.value = false
            orderList.value = []
            fetchList()
        } else {
            showToast(res.data.msg || '提交失敗')
        }
    } catch (e) {
        showToast('網路異常')
    }
}

// 地址弹窗'
const openAddressModal = async (id: number) => {
    addressModal.value.show = true
    if (!id) {
        addressInfo.value = null
        return
    }
    try {
        const res = await request.post('/api/orderLogistics/detail', { id })
        addressInfo.value = res.data.code === 1 ? res.data.data : null
    } catch (e) {
        addressInfo.value = null
    }
}
const closeAddressModal = () => {
    addressModal.value.show = false
    addressInfo.value = null
}

onMounted(async () => {
    await nextTick()
    scrollWrap.value?.addEventListener('scroll', handleScroll)
    fetchList()
})
onUnmounted(() => {
    scrollWrap.value?.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
:global(html),
:global(body) {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden !important;
  position: fixed;
  width: 100%;
}
.merchant-order-container {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    background: #fff;
    font-family: "Microsoft YaHei", sans-serif;
    overflow: hidden;
}
.register-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: hidden;
}
.register-all {
    width: 100%;
    max-width: 500px;
    height: 100vh !important;
    position: relative;
    background-color: #fff;
    overflow-y: auto;
}
.tab-wrap {
    padding:10px 15px;
    margin-top: 45px;
}
.order-tab {
    display: flex;
    gap: 20px;
    margin-bottom: 0px;
    border-bottom: 1px solid #ff33ee;
}
.tab-item {
    padding-bottom: 5px;
    font-size: 14px;
    cursor: pointer;
    color: #333;
    white-space: nowrap;
    
}
.tab-item.active {
    color: #ff33ee;
    font-weight: bold;
    border-bottom: 3px solid #ff33ee;
}
.search-bar {
    display: flex;
    gap: 10px;
    align-items: center;
}
.search-input {
    flex: 1;
    padding: 6px 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
}
.search-btn {
    padding: 4px 16px;
    background: #ff33ee;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
}
.order-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding:0 15px;
}
.order-item {
    background: #fff;
    border-radius: 8px;
    padding: 10px 15px;
}
.order-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}
.order-no {
    font-size: 14px;
    color: #333;
}
.order-status {
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 12px;
}
.status-paid {
    background: #e6f7ff;
    color: #ff33ee;
}
.status-send {
    background: #f0f2f5;
    color: #666;
}
.status-finish {
    background: #f0fff4;
    color: #00b42a;
}
.order-goods {
    display: flex;
    gap: 12px;
    margin-bottom: 10px;
}
.goods-cover {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 4px;
}
.goods-info {
    flex: 1;
    text-align: left;
}
.goods-name {
    font-size: 13px;
    color: #333;
    line-height: 1.4;
}
.goods-spec {
    font-size: 11px;
    color: #666;
}
.goods-price {
    font-size: 11px;
    color: #666;
}
.total {
    color: #ff33ee;
    font-weight: bold;
    margin-left: 10px;
}
.order-time {
    font-size: 12px;
    color: #666;
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 10px;
    text-align: left;
}
.order-action {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
}
.buttksl {
    font-size: 12px;
    color: #333;
    padding: 2px 8px;
    border-radius: 5px;
    cursor: pointer;
}
.collea {
    background-color: #00b42a;
}
.colleb {
    background-color: #f53f3f;
}
.collec {
    background-color: #ff33ee;
}
.load-tip, .empty-tip, .no-more-tip {
    text-align: center;
    padding: 15px 0;
    color: #666;
    font-size: 13px;
}
.modal-mask {
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.7);
    z-index: 9999;
    display: flex;
    align-items: flex-end;
    justify-content: center;
}
.modal-box {
    width: 100%;
    max-width: 500px;
    height: 80vh;
    background: #fff;
    border-radius: 12px 12px 0 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    animation: slideUp 0.3s ease;
}
.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 15px;
    border-bottom: 1px solid #eee;
    font-size: 16px;
    font-weight: bold;
}
.close {
    font-size: 20px;
    color: #666;
    cursor: pointer;
}
.modal-body {
    padding: 15px 30px;
    flex: 1;
    text-align: left;
}
.form-item {
    margin-bottom: 12px;
}
.form-item label {
    display: block;
    font-size: 14px;
    color: #333;
    margin-bottom: 4px;
}
.red {
    color: #f53f3f;
}
.form-item input,
.form-item select,
.form-item textarea {
    width: 100%;
    box-sizing: border-box;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
}
.modal-footer {
    display: flex;
    gap: 10px;
    padding: 15px;
    border-top: 1px solid #eee;
    justify-content: flex-end;
}
.cancel-btn {
    padding: 3px 16px;
    border: 1px solid #ddd;
    background: #fff;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
}
.submit-btn {
    padding: 3px 16px;
    background: #ff33ee;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
}
.toast {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
    background: rgba(0,0,0,0.7);
    color: #333;
    padding: 10px 20px;
    border-radius: 4px;
    font-size: 14px;
    z-index: 10000;
}
.toast.success {
    background: rgba(0,180,42,0.8);
}
.allar-top {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    max-width: 500px;
    margin: 0 auto;
    z-index: 999;
    display: flex;
    align-items: center;
    background: #f7f7f7;
    height: 45px;
    border-bottom: 1px solid #ddd;
}
.allar-top-a {
    font-size: 15px;
    font-weight: bold;
    color: #8a6520;
    text-align: center;
    flex: 1;
}
@keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
}
::-webkit-scrollbar {
    display: none;
}
</style>