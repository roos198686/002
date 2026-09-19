<template>
    <div class="main">
        <div class="register-container">
            <div class="register-all">
                <!-- 顶部标题 -->
                <div class="allar-top">
                    <div class="allar-top-a"></div>
                    <div class="allar-top-r">商城</div>
                </div>

                <!-- 中间滚动区域 -->
                <div class="alla">
                    <div class="reimengcesu-twoa-d" ref="listContainer" @scroll="handleScroll">
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
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, onUnmounted, nextTick } from 'vue';
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

// ==================== 滚动监听（上拉加载） ====================
const handleScroll = () => {
    const el = listContainer.value;
    if (!el) return;
    if (loading.value || finished.value || isRefreshing.value) return;

    if (scrollTimer) clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 80) {
            loadMoreData();
        }
    }, 120);
};

// 下拉刷新手势'
const handleTouchStart = (e: TouchEvent) => {
    if ((listContainer.value?.scrollTop || 0) > 10) return;
    startY = e.touches[0].clientY;
    isPulling.value = true;
};
const handleTouchMove = (e: TouchEvent) => {
    if (!isPulling.value || isRefreshing.value) return;
    const d = e.touches[0].clientY - startY;
    if (d > 0) {
        pullDistance.value = Math.min(d * 0.6, 120);
        e.preventDefault();
    }
};
const handleTouchEnd = () => {
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

// 页面挂载'
onMounted(async () => {
    loadRefreshDatatop()
    getTopViewGoods()
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
    color: #333;
    font-size: 12px;
    font-weight: bold;
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