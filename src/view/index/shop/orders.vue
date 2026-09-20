<template>
    <div class="main">
        <div class="register-container">
            <div class="register-all">
                <!-- 顶部 -->
                <div class="allar-top">
                    <div @click="goBack" style="margin-left: 10px;cursor: pointer;color: #000;width: 30px;">
                        <Icon icon="material-symbols:arrow-back-ios-rounded" width="18" />
                    </div>
                    <div class="allar-top-a">我的訂單</div>
                </div>
                <!-- 状态切換成功-->
                <div class="order-tabs"
                    style="position: fixed;top: calc(45px + env(safe-area-inset-top));left: 0;right: 0;max-width: 500px;margin: 0 auto;z-index: 998;">
                    <div class="tab-item" :class="activeTab === '' ? 'active' : ''" @click="switchTab('')">全部</div>
                    <div class="tab-item" :class="activeTab === '2' ? 'active' : ''" @click="switchTab('2')">待出貨</div>
                    <div class="tab-item" :class="activeTab === '3' ? 'active' : ''" @click="switchTab('3')">待收貨</div>
                    <div class="tab-item" :class="activeTab === '4' ? 'active' : ''" @click="switchTab('4')">已完成</div>
                </div>

                <!-- 内容或上传-->
                <div class="content-wrapper" style="top: calc(75px + env(safe-area-inset-top));" id="orderScroll">
                    <div class="cuekdil">
                        <div class="order-list">
                            <div class="order-item" v-for="item in orderList" :key="item.order_no">
                                <div class="order-goods" style="align-items: flex-start;">
                                    <div style="display: flex;">
                                        <img :src="baseURL + item.goods_cover" class="goods-img" />
                                    </div>
                                    <div class="goods-info">
                                        <div class="order-top">
                                            <span style="color:#666;">訂單編號：{{ item.order_no }}</span>
                                            <span
                                                :style="item.status == 2 ? 'color:#00b578' : item.status == 3 ? 'color:#cc9b5a' : 'color:#ff33ee'">
                                                {{ item.status == 2 ? '待出貨' : item.status == 3 ? '待收貨' : '已完貨' }}
                                            </span>
                                        </div>
                                        <div class="goods-name" @click="toDetail(item.goods_id)">{{ item.goods_name }}
                                        </div>
                                        <div class="goods-spec" v-if="item.color || item.spec">
                                            顏色：{{ item.color || '' }} 規格':{{ item.spec || '' }} 數量':× {{ item.number }}
                                        </div>
                                        <div class="price">
                                            <span style="color:#666;font-size: 12px;font-weight: 100;">訂單金額：</span>
                                            <span style="font-size: 12px;">$</span>{{ item.total_price }}
                                        </div>
                                        <div style="display: flex;justify-content: left;margin-top: 5px;gap: 10px;">
                                            <div style="background-color: aqua;" class="pay-btn" v-if="item.status == 3"
                                                @click="saveLogistics(item)">
                                                收貨
                                            </div>
                                            <div class="pay-btn" v-if="item.status >= 2" @click="toPay(item)">
                                                查看物流
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- 加载提示 -->
                            <div style="color:#666;text-align:center;padding:20px 0;font-size:14px;" v-if="loading">
                                載入中.....</div>
                            <div style="color:#666;text-align:center;padding:50px 0;font-size: 13px;"
                                v-if="orderList.length === 0 && !loading">暫無訂單</div>
                        </div>

                        <!-- 为你推荐 -->
                        <div style="padding:10px 0;margin-top:10px;">
                            <div style="color:#333; font-size:14px; font-weight:bold; margin-bottom:10px;">
                                為你推薦
                            </div>
                            <div class="waterfall-box">
                                <div class="waterfall-item" v-for="item in showList" :key="item.id"
                                    @click="toDetail(item.id)">
                                    <div class="waterfall-item-all">
                                        <div style="width:100%; border-radius:6px; overflow:hidden;">
                                            <img :src="baseURL + item.cover"
                                                style="width:100%; height:auto; object-fit:cover;max-height: 270px; ">
                                        </div>
                                        <div style="padding:5px 10px 10px 10px;text-align: left;">
                                            <div
                                                style="color:#333; font-size:14px; line-height:1.4; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2;-webkit-box-orient: vertical;">
                                                {{ item.name }}
                                            </div>
                                            <div
                                                style="color:#ff40ff; font-size:16px; font-weight:bold; margin-top:4px;">
                                                <span style="font-size:11px; color:#333; margin-right:5px;">驚喜價</span>
                                                <span style="font-size:11px;">$</span>{{ item.price }}
                                                <span
                                                    style="font-size:11px; margin-right:5px;color:#666;font-weight: 100;">已售：{{
                                                    item.sales }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style="height:40px;"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 提示 -->
        <div class="copy-toast" v-if="showToast">
            <div style="font-size: 30PX;">
                <Icon icon="iconoir:xmark" width="58" v-if="!yesno" />
                <Icon icon="iconoir:check" width="58" v-if="yesno" />
            </div>
            <div style="font-size: 16px;">{{ showtext }}</div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch, onUnmounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import router from '../../../router';
import { Icon } from '@iconify/vue';
import request from '@/utils/request';

const baseURL = request.defaults.baseURL || ''
const route = useRoute();

const orderList = ref<any[]>([]);
const activeTab = ref('');
const page = ref(1);
const limit = 10;
const loading = ref(false);
const noMore = ref(false);
const showToast = ref(false);
const showtext = ref('');
const yesno = ref(false);
const scrollKey = 'order_scroll_top';
const lockLoad = ref(false);
const showList = ref<any[]>([]);

const toDetail = (id: number) => {
    router.push({ path: '/goods-detail', query: { id: id.toString() } });
};

const goBack = () => {
    localStorage.setItem(scrollKey, String(document.getElementById('orderScroll')?.scrollTop || 0));
    router.go(-1);
};

const getUserInfo = () => {
    const u = localStorage.getItem('user');
    if (!u) return null;
    return JSON.parse(u);
};

const getOrderList = async () => {
    const user = getUserInfo();
    if (!user || !user.id) return;
    if (loading.value || noMore.value) return;

    loading.value = true;
    lockLoad.value = true;

    try {
        const { data } = await request.get('/api/orders/list', {
            params: {
                user_id: user.id,
                status: activeTab.value,
                page: page.value,
                limit,
            }
        });

        if (data.code === 1) {
            const list = data.data || [];
            console.log(list)
            if (page.value === 1) orderList.value = [];
            orderList.value.push(...list);
            if (list.length < limit) noMore.value = true;
            else page.value++;
        }
    } catch (err) {
        showtext.value = '請求失敗';
        showToast.value = true;
        yesno.value = false;
        setTimeout(() => showToast.value = false, 1000);
    } finally {
        loading.value = false;
        setTimeout(() => lockLoad.value = false, 300);
    }
};

const switchTab = (status: string) => {
    activeTab.value = status;
    page.value = 1;
    noMore.value = false;
    orderList.value = [];
    getOrderList();
};

const handleScroll = () => {
    if (lockLoad.value) return;
    const dom = document.getElementById('orderScroll');
    if (!dom) return;
    const h = dom.scrollHeight - dom.scrollTop - dom.clientHeight;
    if (h < 100 && !loading.value && !noMore.value) {
        getOrderList();
    }
};

let touchStart = 0;
const handleTouchStart = (e: any) => touchStart = e.touches[0].pageY;
const handleTouchEnd = (e: any) => {
    const dom = document.getElementById('orderScroll');
    if (!dom) return;
    if (dom.scrollTop < 10 && e.changedTouches[0].pageY - touchStart > 80) {
        page.value = 1;
        noMore.value = false;
        getOrderList();
    }
};
//查看物流'
const toPay = (item: any) => {
    router.push({
        path: '/logistics',
        query: {
            order_no: item.order_no,
        }
    });
};

//签收'
const saveLogistics = async (item: any) => {
    try {
        const params = {
            id: item.id,
            order_no: item.order_no,
            express_company: '',
            express_no: '',
            status: '已簽收',
            content: '用戶已簽收'
        }
        const res = await request.post('/api/orderLogistics/save', params)
        if (res.data.code === 1) {
             page.value = 1
            noMore.value = false
            await getOrderList()
            showtext.value = '簽收成功';
            showToast.value = true;
            yesno.value = true;
            
            setTimeout(() => showToast.value = false, 1000);
        } else {
            showtext.value = '簽收失敗';
            showToast.value = true;
            yesno.value = false;
            setTimeout(() => showToast.value = false, 1000);
        }
    } catch (err) {
        showtext.value = '網路異常';
        showToast.value = true;
        yesno.value = false;
        setTimeout(() => showToast.value = false, 1000)
    }
}

const loadGoods = async () => {
    try {
        const { data } = await request.post('/api/shop/list', {
            page: 1,
            limit: 20,
            keyword: ''
        });
        if (data.code === 1) {
            showList.value = data.data;
        }
    } catch (err) { }
};

onMounted(async () => {
    await nextTick();
    const dom = document.getElementById('orderScroll');
    const top = localStorage.getItem(scrollKey) || 0;
    if (dom) dom.scrollTop = Number(top);

    dom?.addEventListener('scroll', handleScroll);
    dom?.addEventListener('touchstart', handleTouchStart);
    dom?.addEventListener('touchend', handleTouchEnd);

    if (orderList.value.length === 0) getOrderList();
    loadGoods();
});

onUnmounted(() => {
    const dom = document.getElementById('orderScroll');
    dom?.removeEventListener('scroll', handleScroll);
    dom?.removeEventListener('touchstart', handleTouchStart);
    dom?.removeEventListener('touchend', handleTouchEnd);
});

watch(() => route.path, () => { }, { immediate: true });
</script>

<style scoped>
/* 顶部状态*/
.order-tabs {
    display: flex;
    padding-top: 5px;
    background: #fff;
}

.tab-item {
    flex: 1;
    text-align: center;
    color: #333;
    font-size: 14px;
    padding: 6px 0;
    cursor: pointer;
}

.tab-item.active {
    color: #f801cf;
    font-weight: bold;
    position: relative;
}

.tab-item.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 30px;
    height: 3px;
    background: #f801cf;
    border-radius: 1px;
}

.main {
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
    background: #fff;
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
    padding-top: env(safe-area-inset-top);
    box-sizing: content-box;
}

.allar-top-a {
    font-size: 15px;
    font-weight: bold;
    color: #000;
    text-align: center;
    width: 100%;
    margin-right: 40px;
}

.content-wrapper {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    overflow-y: auto;
    overflow-x: hidden;
    box-sizing: border-box;
    background: #fff !important;
    padding: 10px;
}

.cuekdil {
    width: 100%;
    min-height: 100%;
    padding-bottom: 10px;

}

.order-item {
    background: #e8e8e8;
    padding: 18px;
    margin-bottom: 4px;
    border-radius: 6px;
}

.order-top {
    display: flex;
    justify-content: space-between;
    color: #666;
    font-size: 12px;
    margin-bottom: 5px;
}

.order-goods {
    display: flex;
    align-items: center;
    gap: 10px;
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
}

.goods-name {
    color: #333;
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 5px;
    text-align: left;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    word-break: break-all;
}

.goods-spec {
    color: #777;
    font-size: 11px;
    text-align: left;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    word-break: break-all;
}

.price {
    color: #f15bff;
    font-size: 16px;
    font-weight: bold;
    text-align: left;
}

.pay-btn {
    display: inline-block;
    background: #f15bff;
    color: #000;
    font-size: 13px;
    padding: 3px 10px;
    border-radius: 5px;
    cursor: pointer;
    text-align: left;

}

/* 瀑布时间：*/
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

.copy-toast {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.82);
    color: #fff;
    padding: 18px 24px;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    z-index: 9999;
    min-width: 160px;
    max-width: 70%;
    text-align: center;
    font-size: 14px;
    line-height: 1.6;
    box-sizing: border-box;
}

::-webkit-scrollbar {
    display: none;
}
</style>