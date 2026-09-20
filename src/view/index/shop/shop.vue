<template>
    <div class="main">
        <div class="register-container">
            <div class="register-all">
                <!-- 頂部 商城/購物車/收藏 切換標籤 -->
                <div class="allar-top">
                    <div class="allar-top-a"></div>
                    <div class="allar-top-tabs">
                        <div class="top-tab" :class="{ active: shopTab === 'mall' }" @click="switchShopTab('mall')">商城</div>
                        <div class="top-tab" :class="{ active: shopTab === 'cart' }" @click="switchShopTab('cart')">購物車</div>
                        <div class="top-tab" :class="{ active: shopTab === 'collect' }" @click="switchShopTab('collect')">收藏</div>
                    </div>
                </div>

                <!-- 中间滚动区域 -->
                <div class="alla">
                    <div class="reimengcesu-twoa-d" ref="listContainer" @scroll="handleScroll">
                      <!-- 商城標籤內容（v-show 保留滾動位置） -->
                      <div v-show="shopTab === 'mall'">
                        <!-- 搜索好友：-->
                        <div class="search-wrap">
                            <div class="search-box" @click="$router.push('/shopsearch')">
                                <span class="search-icon">
                                    <Icon icon="si:search-duotone" width="28" />
                                </span>
                                <span class="search-text">
                                    <div class="scroll-outer">
                                        <div class="scroll-wrap" ref="scrollRef">
                                            <div v-for="(item, index) in topViewList" :key="index" class="scroll-item">
                                                {{ item.name }}
                                            </div>
                                            <div v-for="(item, index) in topViewList" :key="`copy_${index}`"
                                                class="scroll-item">
                                                {{ item.name }}
                                            </div>
                                        </div>
                                    </div>
                                </span>
                                <span class="search-btn">搜索</span>
                            </div>
                        </div>
                        <div class="pull-refresh-tip" :style="{ height: pullDistance + 'px' }">
                            <div v-if="pullDistance > 0" class="tip-text">
                                <Icon icon="svg-spinners:12-dots-scale-rotate" width="38" />
                            </div>
                        </div>
                        <!-- 热门推荐 -->
                        <div class="hot-wrap">
                            <div class="fksjklgds">
                                <div class="hot-title">熱門推薦</div>
                                <div class="hot-list">
                                    <div v-for="item in showListtop" :key="item.id" @click="toDetail(item)"
                                        class="hot-item">
                                        <div class="hot-item-card">
                                            <!-- 正方形图片容不可為1:1 -->
                                            <div class="hot-img-box">
                                                <img :src="baseURL + item.cover" class="hot-img">
                                            </div>
                                            <!-- 价格固定在图片最底部 -->
                                            <div class="itemprice">
                                                ${{ item.price }}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 双列商品瀑布布局 -->
                        <div class="two-column-box">
                            <!-- 左列 -->
                            <div class="column-left">
                                <div class="waterfall-item" v-for="item in leftList" :key="item.id"
                                    @click="toDetail(item)">
                                    <div class="waterfall-item-all">
                                        <div class="goods-img-wrap">
                                            <img :src="baseURL + item.cover" class="goods-img">
                                        </div>
                                        <div class="goods-info">
                                            <div class="goods-name">
                                                {{ item.name }}
                                            </div>
                                            <div class="goods-price-row">
                                                <span class="price-label">價格</span>
                                                <span class="price-symbol">$</span>{{ item.price }}
                                                <span class="sales-text">銷量：{{ item.sales }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <!-- 右列 -->
                            <div class="column-right">
                                <div class="waterfall-item" v-for="item in rightList" :key="item.id"
                                    @click="toDetail(item)">
                                    <div class="waterfall-item-all">
                                        <div class="goods-img-wrap">
                                            <img :src="baseURL + item.cover" class="goods-img">
                                        </div>
                                        <div class="goods-info">
                                            <div class="goods-name">
                                                {{ item.name }}
                                            </div>
                                            <div class="goods-price-row">
                                                <span class="price-label">價格</span>
                                                <span class="price-symbol">$</span>{{ item.price }}
                                                <span class="sales-text">銷量：{{ item.sales }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="bottom-empty"></div>
                      </div>

                      <!-- 購物車標籤內容 -->
                      <div v-if="shopTab === 'cart'" class="tab-cart-wrap">
                        <div class="cart-item" v-for="item in cartList" :key="item.id">
                            <div class="cart-goods">
                                <img :src="baseURL + item.goods_cover" class="cart-img" />
                                <div class="cart-info">
                                    <div class="cart-name" @click="toGoodsDetail(item.goods_id)">{{ item.goods_name }}</div>
                                    <div class="cart-spec" v-if="item.color || item.spec">
                                        {{ item.color || '' }} {{ item.spec || '' }}
                                    </div>
                                    <div class="cart-price-row">
                                        <span class="cart-price">$ {{ item.price }}</span>
                                        <span class="cart-num-box">
                                            <span class="cart-num-btn" @click.stop="updateCartNum(item, -1)">-</span>
                                            <span class="cart-num-text">{{ item.number }}</span>
                                            <span class="cart-num-btn" @click.stop="updateCartNum(item, 1)">+</span>
                                        </span>
                                    </div>
                                    <div class="cart-del-btn" @click.stop="delCartItem(item.id)">刪除</div>
                                </div>
                            </div>
                        </div>
                        <div v-if="cartLoading" class="tab-loading-tip">載入中.....</div>
                        <div v-if="!cartLoading && cartList.length === 0" class="tab-empty-tip">購物車暫無商品</div>

                        <!-- 為你推薦 -->
                        <div class="rec-section">
                            <div class="rec-title">為你推薦</div>
                            <div class="rec-waterfall">
                                <div class="rec-item" v-for="item in recList" :key="item.id" @click="toGoodsDetail(item.id)">
                                    <div class="rec-card">
                                        <div class="rec-img-box">
                                            <img :src="baseURL + item.cover" class="rec-img">
                                        </div>
                                        <div class="rec-info">
                                            <div class="rec-name">{{ item.name }}</div>
                                            <div class="rec-price-row">
                                                <span class="rec-price-tag">驚喜價</span>
                                                <span class="rec-price-symbol">$</span>{{ item.price }}
                                                <span class="rec-sales">已售：{{ item.sales }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="tab-bottom-space"></div>
                      </div>

                      <!-- 收藏（收穫商品）標籤內容 -->
                      <div v-if="shopTab === 'collect'" class="tab-collect-wrap">
                        <div class="fav-item" v-for="item in favList" :key="item.collect_id || item.id">
                            <img :src="baseURL + item.cover" class="cart-img fav-img" @click="toGoodsDetail(item.id)" />
                            <div class="cart-info">
                                <div class="cart-name" @click="toGoodsDetail(item.id)">{{ item.name }}</div>
                                <div class="fav-chips" v-if="item.color">
                                    <span class="fav-chip-label">顏色</span>
                                    <span class="fav-chip" v-for="(c, i) in item.color.split('/')" :key="'c'+i">{{ c }}</span>
                                </div>
                                <div class="fav-chips" v-if="item.spec">
                                    <span class="fav-chip-label">規格</span>
                                    <span class="fav-chip" v-for="(s, i) in item.spec.split('/')" :key="'s'+i">{{ s }}</span>
                                </div>
                                <div class="fav-time-row">
                                    <span class="cart-price">$ {{ item.price }}</span>
                                    <span class="fav-time">收藏時間：{{ formatFavTime(item.collect_time) }}</span>
                                </div>
                                <div class="fav-btn-row">
                                    <span class="fav-buy-btn" @click="toGoodsDetail(item.id)">立即購買</span>
                                    <span class="fav-del-btn" @click="cancelFav(item)">取消收藏</span>
                                </div>
                            </div>
                        </div>
                        <div v-if="favLoading" class="tab-loading-tip">載入中.....</div>
                        <div v-if="!favLoading && favList.length === 0" class="tab-empty-tip">暫無收藏商品</div>

                        <!-- 為你推薦 -->
                        <div class="rec-section">
                            <div class="rec-title">為你推薦</div>
                            <div class="rec-waterfall">
                                <div class="rec-item" v-for="item in recList" :key="item.id" @click="toGoodsDetail(item.id)">
                                    <div class="rec-card">
                                        <div class="rec-img-box">
                                            <img :src="baseURL + item.cover" class="rec-img">
                                        </div>
                                        <div class="rec-info">
                                            <div class="rec-name">{{ item.name }}</div>
                                            <div class="rec-price-row">
                                                <span class="rec-price-tag">驚喜價</span>
                                                <span class="rec-price-symbol">$</span>{{ item.price }}
                                                <span class="rec-sales">已售：{{ item.sales }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="tab-bottom-space"></div>
                      </div>
                    </div>
                </div>

                <!-- 購物車底部結算欄（僅購物車標籤顯示） -->
                <div class="shop-cart-bottom" v-if="shopTab === 'cart' && cartList.length > 0">
                    <div class="cart-total">合計：<span class="cart-total-price">${{ cartTotalPrice }}</span></div>
                    <div class="cart-checkout-btn" @click="goCartPage">去結算</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed, onUnmounted, nextTick } from 'vue';
import { Icon } from '@iconify/vue';
import router from "../../../router";
import request from '@/utils/request';

const baseURL = request.defaults.baseURL || '';

interface GoodsItem {
    id: number;
    name: string;
    cover: string;
    price: string | number;
    intro: string;
    stock: number;
    sales: number;
    like: number;
    color?: string;
    spec?: string;
}

// 缓存'
const CACHE_KEY = 'mall_list_cache';
const SCROLL_KEY = 'mall_scroll_top';

// 搜索 & 分类'
const searchKey = ref('');
const activeCate = ref('');
// 原始总数据（中转账消息
const totalList = ref<GoodsItem[]>([]);
// 左右两列 【核心等待審
const leftList = ref<GoodsItem[]>([]);
const rightList = ref<GoodsItem[]>([]);

const loading = ref(false);
const finished = ref(false);
const page = ref(1);
const listContainer = ref<HTMLElement | null>(null);

// 下拉刷新'
const pullDistance = ref(0);
const isPulling = ref(false);
const isRefreshing = ref(false);
let startY = 0;
let scrollTimer: any = null;

//热门推荐'
const showListtop = ref<any[]>([]);

const loadRefreshDatatop = async () => {
    try {
        const { data: res } = await request.post('/api/shop/showListtop', {});
        if (res && res.code === 1) {
            showListtop.value = Array.isArray(res.data) ? res.data : [];
        }
    } catch (err) {

    }
}

// ========== 工具方法：拆分数据到左右两列（末尾追加，不重排） ==========
const splitToColumn = (list: GoodsItem[], isRefresh = false) => {
    if (isRefresh) {
        // 刷新：清空两列重新填寫完整'
        leftList.value = [];
        rightList.value = [];
    }
    // 遍历新数据，依次分配到左右列尾部'
    list.forEach((item, index) => {
        // 偶数放左列、奇数放右列（和原瀑布流顺序一致）'
        const realIndex = isRefresh ? index : totalList.value.length - list.length + index;
        if (realIndex % 2 === 0) {
            leftList.value.push(item);
        } else {
            rightList.value.push(item);
        }
    });
};

// ==================== 搜索（全量刷新） ====================
const handleSearch = () => {
    localStorage.removeItem(CACHE_KEY);
    activeCate.value = '';
    page.value = 1;
    finished.value = false;
    loadRefreshData();
};

// ==================== 下拉刷新 / 分类/搜索 触发【全量刷新登入====================
const loadRefreshData = async () => {
    if (loading.value) return;
    loading.value = true;
    isRefreshing.value = true;
    page.value = 1;
    totalList.value = [];
    finished.value = false;

    try {
        const { data: res } = await request.post('/api/shop/list', {
            page: page.value,
            limit: 10,
            keyword: searchKey.value.trim(),
            category: activeCate.value,
        });

        if (res.code === 1) {
            const list = res.data || [];
            totalList.value = list;
            // 拆分左右列（刷新模式不正确'
            splitToColumn(list, true);
            finished.value = list.length < 10;
            if (!finished.value) page.value++;

            localStorage.setItem(CACHE_KEY, JSON.stringify({
                totalList: totalList.value,
                page: page.value,
                finished: finished.value
            }));
        }
    } catch (err) {
        console.error(err);
    } finally {
        loading.value = false;
        isRefreshing.value = false;
        pullDistance.value = 0;
    }
};

// ==================== 上拉【加载更多】（防跳顶、末尾追加） ====================
const loadMoreData = async () => {
    if (loading.value || finished.value || isRefreshing.value) return;
    loading.value = true;

    const scrollDom = listContainer.value;
    const currentScrollTop = scrollDom ? scrollDom.scrollTop : 0;

    try {
        const { data: res } = await request.post('/api/shop/list', {
            page: page.value,
            limit: 10,
            keyword: searchKey.value.trim(),
            category: activeCate.value,
        });

        if (res.code === 1) {
            const list = res.data || [];
            // 追加到总数据设置
            totalList.value.push(...list);
            // 拆分到左右列（追加模式，不清空）
            splitToColumn(list, false);

            finished.value = list.length < 10;
            if (!finished.value) page.value++;

            // 更新缓存
            localStorage.setItem(CACHE_KEY, JSON.stringify({
                totalList: totalList.value,
                page: page.value,
                finished: finished.value
            }));

            // 恢复滚动位置，杜绝跳�?
            await nextTick();
            if (scrollDom) {
                scrollDom.scrollTop = currentScrollTop;
            }
        }
    } catch (err) {
        console.error(err);
    } finally {
        loading.value = false;
    }
};

// ==================== 滚动监听（上拉加载，僅商城標籤） ====================
const handleScroll = () => {
    const el = listContainer.value;
    if (!el) return;
    if (shopTab.value !== 'mall') return;
    if (loading.value || finished.value || isRefreshing.value) return;

    if (scrollTimer) clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 80) {
            loadMoreData();
        }
    }, 120);
};

// 下拉刷新手势（僅商城標籤）'
const handleTouchStart = (e: TouchEvent) => {
    if (shopTab.value !== 'mall') return;
    if ((listContainer.value?.scrollTop || 0) > 10) return;
    startY = e.touches[0].clientY;
    isPulling.value = true;
};
const handleTouchMove = (e: TouchEvent) => {
    if (shopTab.value !== 'mall') return;
    if (!isPulling.value || isRefreshing.value) return;
    const d = e.touches[0].clientY - startY;
    if (d > 0) {
        pullDistance.value = Math.min(d * 0.6, 120);
        e.preventDefault();
    }
};
const handleTouchEnd = () => {
    if (shopTab.value !== 'mall') {
        pullDistance.value = 0;
        isPulling.value = false;
        return;
    }
    if (pullDistance.value > 70) {
        loadRefreshData();
    } else {
        pullDistance.value = 0;
    }
    isPulling.value = false;
};

// 跳转商品详情'
const toDetail = (item: GoodsItem) => {
    if (listContainer.value) {
        localStorage.setItem(SCROLL_KEY, String(listContainer.value.scrollTop));
    }
    router.push({ path: '/goods-detail', query: { id: item.id.toString() } });
};

// 顶部滚动文字'
const topViewList = ref<any[]>([])
const scrollRef = ref<HTMLDivElement | null>(null)
let scrollTimeraq: number | null = null
const itemHeight = 20
let offsetY = 0

const getTopViewGoods = async () => {
    try {
        const { data } = await request.post('/api/shop/top-view', {
            limit: 10
        })
        if (data.code === 1 && data.data && data.data.length > 0) {
            topViewList.value = data.data
            offsetY = 0
            nextTick(() => {
                scrollStart()
            })
        }
    } catch (err) {
        console.error('獲取熱門瀏覽數據失敗', err)
    }
}

const scrollStart = () => {
    if (!scrollRef.value || topViewList.value.length === 0) return
    if (scrollTimeraq) clearInterval(scrollTimeraq)

    const totalSingleHeight = itemHeight * topViewList.value.length
    scrollTimeraq = window.setInterval(() => {
        offsetY += 1
        if (offsetY >= totalSingleHeight) {
            offsetY = 0
        }
        if (scrollRef.value) {
            scrollRef.value.style.transform = `translateY(-${offsetY}px)`
        }
    }, 100)
}

const scrollPause = () => {
    if (scrollTimeraq) {
        clearInterval(scrollTimeraq)
        scrollTimeraq = null
    }
}

// ==================== 頂部標籤切換（商城/購物車/收藏） ====================
const shopTab = ref<'mall' | 'cart' | 'collect'>('mall');

// ---- 購物車 ----
const cartList = ref<any[]>([]);
const cartLoading = ref(false);
const cartTotalPrice = computed(() => {
    let total = 0;
    cartList.value.forEach(item => { total += Number(item.price || 0) * Number(item.number || 0); });
    return total.toFixed(2);
});
const getUser = () => {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
};
const getCartList = async () => {
    const user = getUser();
    if (!user || !user.id) return;
    cartLoading.value = true;
    try {
        const { data } = await request.get('/api/cart/list', { params: { user_id: user.id } });
        if (data.code === 1) cartList.value = data.data || [];
    } catch (err) { } finally { cartLoading.value = false; }
};
const updateCartNum = async (item: any, type: number) => {
    let num = Number(item.number || 0) + type;
    if (num < 1) num = 1;
    try {
        await request.post('/api/cart/update', { id: item.id, number: num });
        item.number = num;
    } catch (err) { }
};
const delCartItem = async (cartId: number | string) => {
    try {
        await request.post('/api/cart/delete', { ids: [cartId] });
        getCartList();
    } catch (err) { }
};
const goCartPage = () => {
    router.push('/cart');
};

// ---- 收藏（收穫商品，同 collect 頁接口） ----
const favList = ref<any[]>([]);
const favLoading = ref(false);
const getFavList = async () => {
    const user = getUser();
    if (!user || !user.id) return;
    favLoading.value = true;
    try {
        const { data } = await request.get('/api/collect/list', { params: { user_id: user.id } });
        if (data.code === 1) favList.value = data.data || [];
    } catch (err) { } finally { favLoading.value = false; }
};
const cancelFav = async (item: any) => {
    try {
        await request.post('/api/collect/delete', { id: item.collect_id });
        getFavList();
    } catch (err) { }
};
const formatFavTime = (timeStr: string) => {
    if (!timeStr) return '';
    const date = new Date(timeStr);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

// ---- 為你推薦（購物車/收藏標籤下方展示，同原購物車頁） ----
const recList = ref<any[]>([]);
const loadRecGoods = async () => {
    try {
        const { data } = await request.post('/api/shop/list', { page: 1, limit: 20, keyword: '' });
        if (data.code === 1) recList.value = data.data || [];
    } catch (err) { }
};

const toGoodsDetail = (id: any) => {
    router.push({ path: '/goods-detail', query: { id: String(id) } });
};

const switchShopTab = (tab: 'mall' | 'cart' | 'collect') => {
    if (shopTab.value === tab) return;
    shopTab.value = tab;
    if (tab === 'cart') getCartList();
    if (tab === 'collect') getFavList();
};

// 页面挂载'
onMounted(async () => {
    loadRefreshDatatop()
    getTopViewGoods()
    loadRecGoods()
    await nextTick();
    const cache = localStorage.getItem(CACHE_KEY);
    if (cache) {
        const data = JSON.parse(cache);
        totalList.value = data.totalList || [];
        finished.value = data.finished || false;
        page.value = data.page || 1;
        // 缓存数据重新拆分左右�?
        splitToColumn(totalList.value, true);

        const top = localStorage.getItem(SCROLL_KEY);
        await nextTick();
        if (listContainer.value && top) {
            listContainer.value.scrollTop = Number(top);
        }
    } else {
        loadRefreshData();
    }

    const el = listContainer.value;
    if (el) {
        el.addEventListener('touchstart', handleTouchStart, { passive: true });
        el.addEventListener('touchmove', handleTouchMove, { passive: false });
        el.addEventListener('touchend', handleTouchEnd, { passive: true });
    }
});

// 销毁清除定时器&事件'
onUnmounted(() => {
    if (scrollTimer) clearTimeout(scrollTimer);
    if (scrollTimeraq) clearInterval(scrollTimeraq)
    const el = listContainer.value;
    if (el) {
        el.removeEventListener('touchstart', handleTouchStart);
        el.removeEventListener('touchmove', handleTouchMove);
        el.removeEventListener('touchend', handleTouchEnd);
    }
});
</script>

<style scoped>
@import '../../../assets/css/all.css';

.main {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100vw;
    height: 100vh;
    background-color: #fff;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    overscroll-behavior: none;
}

.register-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: hidden;
}

/* 頂部 商城/購物車/收貨 切換標籤 */
.allar-top-tabs {
    flex: 1;
    display: flex;
    gap: 26px;
    margin-right: 30px;
}

.top-tab {
    font-size: 17px;
    font-weight: bold;
    color: #333;
    position: relative;
    padding: 4px 2px;
    cursor: pointer;
}

.top-tab.active {
    color: #ff33ee;
}

.top-tab.active::after {
    content: '';
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: -2px;
    width: 22px;
    height: 3px;
    background: #ff33ee;
    border-radius: 2px;
}

/* 購物車標籤內容 */
.tab-cart-wrap {
    padding-top: 10px;
}

.cart-item {
    background: #f7f7f7;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 10px;
    box-shadow: 0 0 3px 1px rgb(223, 223, 223);
}

.cart-goods {
    display: flex;
}

.cart-img {
    width: 70px;
    height: 70px;
    border-radius: 6px;
    object-fit: cover;
    background: #fff;
    flex-shrink: 0;
}

.cart-info {
    flex: 1;
    padding-left: 12px;
    text-align: left;
    min-width: 0;
}

.cart-name {
    color: #333;
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 4px;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
}

.cart-spec {
    color: #777;
    font-size: 12px;
    margin-bottom: 4px;
}

.cart-price-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.cart-price {
    color: #ff33ee;
    font-size: 15px;
    font-weight: bold;
}

.cart-num-box {
    display: flex;
    align-items: center;
    gap: 3px;
}

.cart-num-btn {
    width: 24px;
    height: 24px;
    line-height: 22px;
    text-align: center;
    background: #fff;
    color: #333;
    border-radius: 4px;
    border: 1px solid #acb2ca;
}

.cart-num-text {
    color: #333;
    padding: 0 5px;
    font-size: 13px;
}

.cart-del-btn {
    display: inline-block;
    margin-top: 6px;
    background: #ff33ee;
    color: #fff;
    font-size: 13px;
    padding: 3px 12px;
    border-radius: 5px;
    cursor: pointer;
}

/* 收藏（收穫商品）條目 */
.tab-collect-wrap {
    padding-top: 10px;
}

.fav-item {
    display: flex;
    align-items: flex-start;
    background: #f0f0f0;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 10px;
    box-shadow: 0 0 3px 1px rgb(223, 223, 223);
}

.fav-img {
    cursor: pointer;
}

.fav-chips {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 5px;
    margin-bottom: 4px;
}

.fav-chip-label {
    color: #333;
    font-size: 11px;
}

.fav-chip {
    background: #8cf7ca;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 11px;
    color: #333;
}

.fav-time-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
}

.fav-time {
    font-size: 11px;
    color: #666;
    white-space: nowrap;
}

.fav-btn-row {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 6px;
}

.fav-buy-btn {
    background: #e3a7ff;
    color: #000;
    font-weight: bold;
    font-size: 13px;
    padding: 3px 18px;
    border-radius: 5px;
    cursor: pointer;
}

.fav-del-btn {
    background: #0b42f7;
    color: #fff;
    font-size: 13px;
    padding: 3px 12px;
    border-radius: 5px;
    cursor: pointer;
}

/* 為你推薦（購物車/收藏標籤下方） */
.rec-section {
    padding: 10px 0;
}

.rec-title {
    color: #333;
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 10px;
    padding-left: 5px;
}

.rec-waterfall {
    width: 100%;
    column-count: 2;
    column-gap: 8px;
}

.rec-item {
    break-inside: avoid;
    padding: 4px 0;
    cursor: pointer;
}

.rec-card {
    background: #e8e8e8;
    border-radius: 6px;
    overflow: hidden;
}

.rec-img-box {
    width: 100%;
    border-radius: 6px;
    overflow: hidden;
}

.rec-img {
    width: 100%;
    height: auto;
    display: block;
    object-fit: cover;
    max-height: 270px;
}

.rec-info {
    padding: 5px 8px 10px 8px;
    text-align: left;
}

.rec-name {
    color: #333;
    font-size: 13px;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
}

.rec-price-row {
    color: #ff33ee;
    font-size: 15px;
    font-weight: bold;
    margin-top: 4px;
}

.rec-price-tag {
    font-size: 11px;
    color: #333;
    font-weight: normal;
    margin-right: 4px;
}

.rec-price-symbol {
    font-size: 11px;
}

.rec-sales {
    font-size: 11px;
    color: #666;
    font-weight: normal;
    margin-left: 6px;
}

.tab-loading-tip {
    color: #777;
    text-align: center;
    padding: 20px;
    font-size: 13px;
}

.tab-empty-tip {
    color: #777;
    text-align: center;
    padding: 60px 0;
    font-size: 13px;
}

.tab-bottom-space {
    height: 70px;
}

/* 購物車底部結算欄 */
.shop-cart-bottom {
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 500px;
    min-height: 56px;
    padding: 8px 14px;
    padding-bottom: calc(8px + env(safe-area-inset-bottom));
    box-sizing: border-box;
    background: #f7f7f7;
    display: flex;
    align-items: center;
    z-index: 99;
}

.cart-total {
    flex: 1;
    color: #333;
    font-size: 14px;
    text-align: left;
}

.cart-total-price {
    color: #ff33ee;
    font-weight: bold;
    font-size: 16px;
}

.cart-checkout-btn {
    background: #ff33ee;
    color: #fff;
    padding: 8px 26px;
    border-radius: 20px;
    font-weight: bold;
    font-size: 14px;
    cursor: pointer;
}

.alla {
    flex: 1;
    padding-top: calc(45px + env(safe-area-inset-top));
    overflow: hidden;
    position: relative;
}

.reimengcesu-twoa-d {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    box-sizing: border-box;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-y: contain;
    padding: 0 5px 0 5px;
}

.reimengcesu-twoa-d::-webkit-scrollbar {
    display: none;
}

/* 搜索区域 */
.search-wrap {
    padding: 7px 5px;
    flex: 1;
    display: flex;
    margin-top: 5px;
}

.search-box {
    flex: 1;
    height: 42px;
    padding: 0 5px;
    /* background-color: #fff; */
    border: 2px solid #fab7ef;
    border-radius: 10px;
    display: flex;
    align-items: center;
    overflow: hidden;
    box-sizing: border-box;
}

.search-icon {
    margin-top: 5px;
    color: #eb04c4;
}

.search-text {
    flex: 1;
    padding: 0 10px;
    text-align: left;
    /* color: #333; */
    font-size: 13px;
    overflow: hidden;
    box-sizing: border-box;
}

.scroll-outer {
    height: 20px;
    overflow: hidden;
    position: relative;
}

.scroll-wrap {
    transition: none;
}

.scroll-item {
    height: 20px;
    line-height: 20px;
    white-space: nowrap;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 80%;
    width: 100%;
    display: inline-block;
    box-sizing: border-box;
}

.search-btn {
    background-color: #ff33ee;
    color: #fff;
    font-size: 13px;
    padding: 5px 10px;
    border-radius: 5px;
}

/* 下拉刷新提示 */
.pull-refresh-tip {
    width: 100%;
}

.tip-text {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
}

/* 热门推荐区域 */
.hot-wrap {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin: 5px;
    gap: 5px;
}

.fksjklgds {
    flex: 1;
    font-size: 13px;
    padding: 7px 0;
    border-radius: 6px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    background-color: #c3fdf3;
    box-shadow: 0 0 3px 1px rgb(242, 255, 251);
}

.hot-title {
    text-align: left;
    width: 100%;
    margin-left: 15px;
    color: #333;
    font-weight: 800;
}

.hot-list {
    display: flex;
    flex-direction: row;
    padding: 5px 5px 0 5px;
    gap: 5px;
    width: 100%;
    box-sizing: border-box;
}

.hot-item {
    flex: 1;
    display: flex;
}

.hot-item-card {
    width: 100%;
    border-radius: 6px;
    overflow: hidden;
    position: relative;
}

.hot-img-box {
    width: 100%;
    padding-top: 100%;
    position: relative;
}

.hot-img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.itemprice {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 3px 0;
    text-align: center;
    color: #e2e2e2;
    font-size: 12px;
    background-color: rgba(34, 34, 34, 0.5);
}

/* 双列商品布局 */
.two-column-box {
    display: flex;
    width: 100%;
    /* padding: 5px 0; */
}

.column-left,
.column-right {
    flex: 1;
    display: flex;
    flex-direction: column;
    /* gap: 10px; */
}

.waterfall-item {
    width: 100%;
}

.waterfall-item-all {
    /* background: #f7f7f7; */
    border-radius: 6px;
    margin-right: 10px;
    /* box-shadow: 0 0 3px 1px rgb(226, 226, 226); */
}

.goods-img-wrap {
    width: 100%;
    border-radius: 6px;
    overflow: hidden;
}

.goods-img {
    width: 100%;
    height: auto;
    object-fit: cover;
    max-height: 270px;
}

.goods-info {
    padding: 5px 10px 10px 10px;
    text-align: left;
}

.goods-name {
    color: #333;
    font-size: 14px;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
}

.goods-price-row {
    color: #ff33ee;
    font-size: 16px;
    font-weight: bold;
}

.price-label {
    font-size: 11px;
    color: #777;
    margin-right: 5px;
}

.price-symbol {
    font-size: 11px;
    color: #ff33ee;
}

.sales-text {
    font-size: 11px;
    color: #777;
    margin-right: 5px;
    font-weight: 100;
}

/* 底部占位 */
.bottom-empty {
    height: 30px;
}
</style>