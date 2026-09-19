<template>
    <div class="main">
        <div class="search-page">
            <div class="register-all">
                <!-- 顶部搜索失败-->
                <div class="search-header">
                    <div class="back-btn" @click="handleBack">
                        <Icon icon="material-symbols:arrow-back-ios-rounded" width="18" />
                    </div>
                    <div class="search-input-wrap">
                        <input v-model="searchKey" type="text" placeholder="請輸入關鍵字" @keyup.enter="handleSearch" />
                        <div class="search-btn" @click="handleSearch">搜索</div>
                    </div>
                </div>

                <!-- 搜索历史区域 -->
                <div class="history-wrap" v-if="!isSearched && historyList.length > 0">
                    <div class="history-title">
                        <span>搜索記錄</span>
                        <span class="clear-all" @click="clearAllHistory">清空全部</span>
                    </div>
                    <div class="history-list">
                        <div class="history-item" v-for="(item, index) in historyList" :key="index"
                            @click="clickHistory(item)">
                            {{ item }}
                            <span class="del-btn" @click.stop="delHistory(index)">×</span>
                        </div>
                    </div>
                </div>

                <!-- 无历史记录提交失敗-->
                <div class="empty-history" v-if="!isSearched && historyList.length === 0">
                    暫無搜索記錄
                </div>

                <!-- 搜索结果区域 -->
                <div class="result-wrap" v-if="isSearched">
                    <div class="result-tip" v-if="goodsList.length === 0">暂无匹配商品</div>
                    <div class="goods-item" v-for="item in goodsList" :key="item.id">
                        <div class="goods-cover">
                            <img :src="baseURL + item.cover" alt="" />
                        </div>
                        <div class="goods-info">
                            <div class="goods-name">{{ item.name }}</div>
                            <div class="goods-price">${{ item.price }}</div>
                            <div class="goods-desc">
                                销量：{{ item.sales }} &nbsp; 库存：{{ item.stock }}
                            </div>
                        </div>
                        <div style="display: flex;flex-direction: column;">
                            <div class="xkdilskdf">查看详情</div>
                        </div>
                    </div>
                </div>
                <!-- 推荐商品 -->
                <div style="padding:10px 5px;border-top: 3px solid #000;margin-top: 20px;">
                    <div style="color:#333; font-size:14px; font-weight:bold; margin-bottom:10px;">
                        為你推薦
                    </div>
                    <div class="waterfall-box">
                        <div class="waterfall-item" v-for="item in showList" :key="item.id" @click="toDetail(item.id)">
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
                                    <div style="color:#ff40ff; font-size:16px; font-weight:bold; margin-top:4px;">
                                        <span style="font-size:11px; color:#333; margin-right:5px;">驚喜價</span>
                                        <span style="font-size:11px;">$</span>{{ item.price }}
                                        <span
                                            style="font-size:11px; color:#666; margin-right:5px;font-weight: 100;">已售：{{
                                            item.sales }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import request from '@/utils/request'
const baseURL = request.defaults.baseURL || '';
const router = useRouter()
const searchKey = ref('')
const historyList = ref<string[]>([])
const goodsList = ref<any[]>([])
import { Icon } from '@iconify/vue';
// 标记是否已执行搜索（控制视图切换�?
const isSearched = ref(false)

const userInfo = JSON.parse(localStorage.getItem('user') || '{}')
const userId = userInfo.id || ''
const MAX_HISTORY = 20

// 读取本地缓存'
const getLocalHistory = () => {
    const str = localStorage.getItem('search_history')
    return str ? JSON.parse(str) : []
}

// 保存到本地缓�?
const saveLocalHistory = (list: string[]) => {
    localStorage.setItem('search_history', JSON.stringify(list))
}

// 从后端拉取搜索历史失败'
const getRemoteHistory = async () => {
    if (!userId) return
    try {
        const { data } = await request.post('/api/shop/search/list', {
            user_id: userId,
            limit: MAX_HISTORY
        })
        if (data.code === 1) {
            const remoteList = data.data.map((item: any) => item.keyword)
            historyList.value = remoteList
            saveLocalHistory(remoteList)
        }
    } catch (err) {
        console.error('拉取云端历史失败', err)
        historyList.value = getLocalHistory()
    }
}

// 搜索商品接口'
const searchGoods = async (keyword: string) => {
    try {
        const { data } = await request.post('/api/shop/search/goods', {
            keyword,
            page: 1,
            pageSize: 50
        })
        if (data.code === 1) {
            goodsList.value = data.data.list
            console.log(goodsList.value)
        }
    } catch (err) {
        console.error('商品搜索失败', err)
        goodsList.value = []
    }
}

// 执行搜索'
const handleSearch = async () => {
    const key = searchKey.value.trim()
    if (!key) return

    // 标记进入搜索结果�?
    isSearched.value = true

    // 登录用户保存搜索记录到后台系统'
    if (userId) {
        try {
            await request.post('/api/shop/search/add', {
                user_id: userId,
                keyword: key
            })
        } catch (err) {
            console.error('保存云端记录失败', err)
        }
    }

    // 本地历史：去重、置顶、限条数
    const idx = historyList.value.findIndex(item => item === key)
    if (idx > -1) {
        historyList.value.splice(idx, 1)
    }
    historyList.value.unshift(key)
    if (historyList.value.length > MAX_HISTORY) {
        historyList.value.pop()
    }
    saveLocalHistory(historyList.value)

    // 请求商品结果
    await searchGoods(key)
}

// 点击历史关键词搜索失败'
const clickHistory = (val: string) => {
    searchKey.value = val
    handleSearch()
}

// 删除单条历史'
const delHistory = async (index: number) => {
    const delKeyword = historyList.value[index]
    historyList.value.splice(index, 1)
    saveLocalHistory(historyList.value)

    if (userId) {
        try {
            await request.post('/api/shop/search/delete', {
                user_id: userId,
                keyword: delKeyword
            })
        } catch (err) {
            console.error('删除云端记录失败', err)
        }
    }
}

// 清空全部历史'
const clearAllHistory = async () => {
    historyList.value = []
    saveLocalHistory(historyList.value)

    if (userId) {
        try {
            await request.post('/api/shop/search/clear', {
                user_id: userId
            })
        } catch (err) {
            console.error('清空云端记录失败', err)
        }
    }
}

// 取消/返回：回到历史列表，清空结果'
const handleBack = () => {
    if (isSearched.value) {
        isSearched.value = false
        goodsList.value = []
    } else {
        router.back()
    }
}
const showList = ref<any[]>([]);
//推荐商品'
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
const toDetail = (id: any) => {
    router.push({ path: '/goods-detail', query: { id: id.toString() } });
};
onMounted(async () => {
    loadGoods()
    if (userId) {
        await getRemoteHistory()
    } else {
        historyList.value = getLocalHistory()
    }
})
</script>

<style scoped>
.main {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    background: #fff;
    overflow: hidden;
}

.search-page {
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
    height: 100vh;
    position: relative;
    background-color: #fff;
    overflow-y: auto;
}

/* 顶部搜索失败*/
.search-header {
    display: flex;
    align-items: center;
    padding: calc(8px + env(safe-area-inset-top)) 15px 8px 15px;
    background: #f7f7f7;
    gap: 10px;
    position: sticky;
    top: 0;
    z-index: 10;
}

.back-btn {
    font-size: 13px;
    color: #333;
    cursor: pointer;
    width: 30px;
    text-align: center;
    margin-top: 5px;
}

.search-input-wrap {
    flex: 1;
    display: flex;
    height: 34px;
    align-items: center;
}

.search-input-wrap input {
    flex: 1;
    padding: 0 10px;
    border: none;
    outline: none;
    background: #fff;
    color: #333;
    border-radius: 4px;
    font-size: 14px;
    height: 30px;
}

.search-btn {
    padding: 0 10px;
    border: none;
    background: #ff33ee;
    color: #fff;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    height: 25px;
    line-height: 25px;
    border: 1px solid #ff33ee;
    margin-left: 10px;
}

/* 搜索历史 */
.history-wrap {
    margin-top: 15px;
    padding: 0 15px;
}

.history-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 15px;
    margin-bottom: 10px;
    color: #666;
}

.clear-all {
    font-size: 13px;
    color: #777;
    cursor: pointer;
}

.history-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.history-item {
    padding: 6px 12px;
    background: #fff;
    border-radius: 4px;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    color: #666;
}

.del-btn {
    color: #777;
    font-size: 16px;
    line-height: 1;
}

/* 空记录失败*/
.empty-history {
    text-align: center;
    margin-top: 60px;
    font-size: 14px;
    color: #666;
}

/* 搜索结果区域 */
.result-wrap {
    padding: 15px;
}

.result-tip {
    text-align: center;
    color: #777;
    padding: 40px 0;
    font-size: 14px;
}

.goods-item {
    display: flex;
    background: #fff;
    border-radius: 6px;
    padding: 10px;
    margin-bottom: 12px;
    gap: 12px;
}

.goods-cover {
    width: 80px;
    height: 80px;
    flex-shrink: 0;
}

.goods-cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 4px;
}

.goods-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: left;
}

.goods-name {
    color: #333;
    font-size: 14px;
    margin-bottom: 6px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
}

.goods-price {
    color: #ff33ee;
    font-size: 15px;
    margin-bottom: 4px;
}

.goods-desc {
    color: #666;
    font-size: 12px;
}

.xkdilskdf {
    display: flex;
    background-color: #019409;
    font-size: 12px;
    border-radius: 5px;
    padding: 2px 5px;
    color: #333;
}

/* 瀑布时间：*/
.waterfall-box {
    width: 100%;
    column-count: 2;
    column-gap: 0;
}

.waterfall-item {
    break-inside: avoid;
    padding: 5px;
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