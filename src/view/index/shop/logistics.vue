<template>
    <div class="main">
        <div class="logistics-container">
            <!-- 頂部 -->
            <div class="top-bar">
                <div @click="goBack" class="back-icon">
                    <Icon icon="material-symbols:arrow-back-ios-rounded" width="18" />
                </div>
                <div class="title">物流追蹤</div>
            </div>

            <!-- 黑色卡片 -->
            <div class="logistics-card">
                <!-- 收貨地址 -->
                <div class="address">
                    <div style="font-size: 13px;color:#666;display: flex;align-items: flex-start;">
                        <div>
                            <Icon icon="mdi:address-marker-outline" height="20" style="color: #09ee68;" />
                        </div>
                        <div style="margin-left: 5px;">
                            <div class="address-text">收貨地址：{{ orderInfo.country }} | {{ orderInfo.region }} | {{
                                orderInfo.detail_address }}</div>
                            <div class="address-text">{{ orderInfo.receiver_name }} | {{ orderInfo.receiver_phone }}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 物流時間：-->
                <div class="timeline" v-if="logistics.length > 0">
                    <div class="row" v-if="logistics[0]?.express_no">
                        快遞：{{ logistics[0].express_company }} | {{ logistics[0].express_no }}
                    </div>

                    <div class="t-item done" v-for="(item, index) in showLogistics" :key="index">
                        <div class="dot"></div>
                        <div class="line" v-if="index !== showLogistics.length - 1"></div>
                        <div class="text">{{ item.status == '1' ? '訂單已建立' : item.status }}</div>
                        <div class="time">{{ item.status == '1' ? '商品已下單' : item.content }}</div>
                        <div class="time">{{ formatTime(item.create_time) }}</div>
                    </div>

                    <div class="expand-btn" v-if="logistics.length > 2">
                        <div style="cursor: pointer;text-align: right;margin-left: auto;color:#333;" @click="isExpand = !isExpand">
                            {{ isExpand ? '收起' : '查看更多' }}
                        </div>
                    </div>
                </div>

                <!-- 商品資訊 -->
                <div class="goods" v-if="orderInfo.goods_name">
                    <img :src="baseURL + orderInfo.goods_cover" class="goods-img" />
                    <div class="goods-info">
                        <div class="name">{{ orderInfo.goods_name }}</div>
                        <div class="spec">
                            <span style="margin-right: 8px;">顏色：{{ orderInfo.color || '' }}</span>
                            <span style="margin-right: 8px;">規格：{{ orderInfo.spec || '' }}</span>
                            <span>數量：{{ orderInfo.number || 1 }}</span>
                        </div>
                        <div class="price">
                            <span style="font-size: 11px;color:#666;">實付金額：</span>
                            <span style="font-size: 11px;">$</span>
                            <span>{{ orderInfo.total_price }}</span>
                        </div>
                        <div class="spec">訂單編號：{{ orderInfo.order_no }}</div>
                        <div class="spec">下單時間：{{ formatTime(orderInfo.created_at) }}</div>
                    </div>
                </div>
            </div>

            <!-- 為你推薦 -->
            <div style="padding:10px;margin-top:10px;">
                <div style="color:#333; font-size:14px; font-weight:bold; margin-bottom:10px;">
                    為你推薦
                </div>
                <div class="waterfall-box">
                    <div class="waterfall-item" v-for="item in showList" :key="item.id" @click="toDetail(item.id)">
                        <div class="waterfall-item-all">
                            <div style="width:100%;border-radius:6px; overflow:hidden;">
                                <img :src="baseURL + item.cover"
                                    style="width:100%; height:auto; object-fit:cover;max-height: 270px; ">
                            </div>
                            <div style="padding:5px 10px 10px 10px;text-align: left;">
                                <div
                                    style="color:#333; font-size:14px; line-height:1.4; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2;-webkit-box-orient: vertical;">
                                    {{ item.name }}
                                </div>
                                <div style="color:#ff40ff; font-size:16px; font-weight:bold; margin-top:4px;">
                                    <span style="font-size:11px; color:#333; margin-right:5px;">專屬價格</span>
                                    <span style="font-size:11px;">$</span>{{ item.price }}
                                </div>
                                <div
                                    style="color:#666; font-size:11px; display:flex; justify-content:space-between; margin-top:4px;">
                                    <span>銷量:{{ item.sales }}</span>
                                    <span>收藏：{{ item.like }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div style="height:40px;"></div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import router from '../../../router'
import { Icon } from '@iconify/vue'
import request from '@/utils/request'

const route = useRoute()
const order_no = route.query.order_no
const baseURL = request.defaults.baseURL || ''

const isExpand = ref(false)
const orderInfo = ref({})
const logistics = ref([])
const showList = ref([])

const toDetail = (id) => {
    router.push({ path: '/goods-detail', query: { id: id.toString() } })
}

const showLogistics = computed(() => {
    if (isExpand.value) return logistics.value
    if (logistics.value.length <= 2) return logistics.value
    return [logistics.value[0], logistics.value[logistics.value.length - 1]]
})

const formatTime = (timeStr) => {
    if (!timeStr) return ''
    const d = new Date(timeStr)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hh = String(d.getHours()).padStart(2, '0')
    const mm = String(d.getMinutes()).padStart(2, '0')
    return `${y}-${m}-${day} ${hh}:${mm}`
}

const getOrder = async () => {
    try {
        const res = await request.get('/api/logistics/info', { params: { order_no } })
        if (res.data.code === 1) orderInfo.value = res.data.data
    } catch (e) { }
}

const getLogisticsData = async () => {
    try {
        const res = await request.get('/api/logistics/detail', { params: { order_no } })
        if (res.data.code === 1) logistics.value = res.data.data
    } catch (e) { }
}

const loadGoods = async () => {
    try {
        const { data } = await request.post('/api/shop/list', { page: 1, limit: 20, keyword: '' })
        if (data.code === 1) showList.value = data.data
    } catch (err) { }
}

const goBack = () => router.go(-1)

onMounted(() => {
    getOrder()
    getLogisticsData()
    loadGoods()
})
</script>

<style scoped>
.expand-btn {
    font-size: 11px;
    display: flex;
}

.main {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    background: #f5f5f5;
    align-items: center;
    font-family: "Microsoft YaHei", sans-serif;
    overflow: hidden;
}

.logistics-container {
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
    height: 100%;
    overflow-y: auto;
    padding-bottom: 40px;
    background-color: #fff;
}

.top-bar {
    position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 500px;
    z-index: 999;
    display: flex;
    align-items: center;
    background: #f7f7f7;
   height: 45px;
    border-bottom: 1px solid #ddd;
}

.back-icon {
    margin-left: 10px;
    cursor: pointer;
    color: #8a6520;
    width: 30px;
}

.title {
    font-size: 15px;
    font-weight: bold;
    color: #8a6520;
    text-align: center;
    width: 100%;
    margin-right: 40px;
}

.logistics-card {
    background: #f5f5f5;
    margin: 50px 10px 10px 10px;
    border-radius: 6px;
}

.row {
    font-size: 12px;
    color: #fc55f3;
    line-height: 1.8;
    text-align: left;
    padding-bottom: 10px;
}

.goods {
    display: flex;
    padding: 15px;
    text-align: left;
    align-items: flex-start;
}

.goods-img {
    width: 70px;
    height: 70px;
    border-radius: 6px;
    object-fit: cover;
    background: #fff;
}

.goods-info {
    flex: 1;
    margin-left: 12px;
}

.name {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 8px;
    display: flex;
    align-items: flex-start;
    line-height: 1;
    padding: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-all;
    color: #5fff5f;
}

.spec {
    font-size: 11px;
    color: #777;
    margin-bottom: 4px;
}

.price {
    color: #f15bff;
    font-size: 15px;
    font-weight: bold;
    margin-bottom: 5px;
}

.timeline {
    padding: 15px 25px;
    border-bottom: 3px solid #1b1b1b;
}

.t-item {
    position: relative;
    padding-bottom: 25px;
    padding-left: 25px;
    text-align: left;
}

.t-item:last-child {
    padding-bottom: 0;
}

.dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #ccc;
    position: absolute;
    left: 0;
    top: 0;
}

.line {
    width: 2px;
    background: #02fd38;
    position: absolute;
    left: 5px;
    top: 12px;
    bottom: 0;
}

.t-item.done .dot,
.t-item.done .line {
    background: #02fd38;
}

.text {
    font-weight: bold;
    font-size: 14px;
    color: #333;
    display: flex;
    align-items: flex-start;
    line-height: 1;
    margin: 0;
    padding: 0;
}

.time {
    font-size: 12px;
    color: #666;
    margin-top: 4px;
}

.address {
    text-align: left;
    padding: 15px;
    border-bottom: 3px solid #1b1b1b;
}

.address-text {
    font-size: 13px;
    color: #666;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-all;
}

.waterfall-box {
    width: 100%;
    column-count: 2;
    column-gap: 10px;
}

.waterfall-item {
    break-inside: avoid;
    padding: 5px 0;
}

.waterfall-item-all {
    background: #e8e8e8;
    border-radius: 6px;
    overflow: hidden;
}

::-webkit-scrollbar {
    display: none;
}
</style>