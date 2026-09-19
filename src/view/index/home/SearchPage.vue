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
                    <div class="result-tip" v-if="!goodsList || goodsList.length === 0">暂无匹配商品</div>

                    <div class="inage" v-for="item in goodsList || []" :key="item.dynamic_id">
                        <div style="display: flex;flex-direction: row;">
                            <div class="userteataaq">
                                <img :src="baseURL + (item.avatar || '')"
                                    style="width:100%;height:100%;object-fit:cover;"
                                    loading="lazy">
                            </div>
                            <div style="display: flex;flex-direction: column;flex: 1;">
                                <div>
                                    <div
                                        style="display: flex;flex-direction: row;margin-top: 10px;align-items: center;">
                                        <div class="userteatb-oneaa">{{ item.nickname || '' }}</div>
                                        <div class="userteatb-oneba">
                                            <Icon icon="mingcute:safety-certificate-fill" height="15"
                                                style="color: #f3bb02;" />
                                        </div>
                                        <div class="userteatb-oneb" v-if="item.vip_level && item.vip_level !== '0'">
                                            <Icon icon="mingcute:flower-2-fill" height="15" />
                                        </div>
                                        <div
                                            style="font-size: 11px;padding: 5px 20px 5px 0;text-align: right;margin-left: auto;">
                                            {{ item.created_at ? moment(item.created_at).format('YYYY.MM.DD HH:mm') : ''
                                            }}
                                        </div>
                                    </div>
                                    <div style="font-size: 13px;color:#666;text-align: left;"
                                        @click="goDetail(item.id)">@{{ item.username || '' }}</div>
                                    <div class="contenttext" @click="goDetail(item.id)"
                                        :style="item.content ? 'display: block;' : ' display: none;'">
                                        {{ item.content || '' }}</div>
                                    <!-- 图片区域 多重判断兜底 -->
                                    <div style="margin-top: 10px;" :class="getImgClass(item)"
                                        v-if="item.file_type === 'image'">
                                        <img v-for="imgUrl in item.image_url.split(',')" :key="imgUrl" :src="baseURL + imgUrl"
                                            :onerror="`this.src='${defaultImg}'`" loading="lazy"
                                            @click="openPreview(baseURL + imgUrl)">
                                    </div>
                                    <!-- 视频区域 -->
                                    <div v-if="item.file_type === 'video' && item.video_url"
                                        style="margin-top:8px; text-align:left;">
                                        <video :src="baseURL + item.video_url" controls
                                            style="max-height: 380px;width: auto;max-width: 100%;border-radius: 8px; display: block;"
                                            @click="openFullscreen($event.target)"></video>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- 推荐商品 -->
                <div style="padding:10px 5px;margin-top: 20px;">
                    <div style="color:#333; font-size:14px; font-weight:bold; margin-bottom:10px;">
                        為你推薦商品
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
import moment from 'moment';
const baseURL = request.defaults.baseURL || '';
const router = useRouter()
const searchKey = ref('')
const historyList = ref<string[]>([])
const goodsList = ref<any[]>([])
import { Icon } from '@iconify/vue';
// 标记是否已执行搜索（控制视图切换�?
const isSearched = ref(false)

// ========== 跳转方法 ==========
const goDetail = (dynamicId: any) => {
    router.push({ path: '/dynamicIndex', query: { id: dynamicId } })
};

// ===================== 圖片樣式不正确【新增成功=====================
const getImgClass = (item: any) => {
  // 先分割成真实图片数组'
  const imgArr = item.image_url 
    ? item.image_url.split(',').map(s => s.trim()).filter(Boolean) 
    : []
  const len = imgArr.length
  if (len === 1) return 'imagesdiva'
  if (len === 2) return 'imagesdivb'
  if (len === 3) return 'imagesdivc'
  return 'imagesdivd'
};
// 大圖預覽'
const previewVisible = ref(false);
const previewUrl = ref('');
// ===================== 大圖預覽、影片全部【新增成功=====================
const openPreview = (url: string) => {
    previewUrl.value = url;
    previewVisible.value = true;
    document.body.style.overflow = 'hidden';
};
const openFullscreen = (target: EventTarget) => {
    const videoEl = target as HTMLVideoElement;
    if (!videoEl) return;
    if (document.fullscreenElement) {
        document.exitFullscreen();
    } else {
        if (videoEl.requestFullscreen) {
            videoEl.requestFullscreen();
        } else if ((videoEl as any).webkitRequestFullscreen) {
            (videoEl as any).webkitRequestFullscreen();
        } else if ((videoEl as any).msRequestFullscreen) {
            (videoEl as any).msRequestFullscreen();
        }
    }
};

// 圖片載入失敗兜底�?
const defaultImg = `${baseURL}/static/default.png`;

const userInfo = JSON.parse(localStorage.getItem('user') || '{}')
const userId = userInfo.id || ''
const MAX_HISTORY = 20

// 读取本地缓存'
const getLocalHistory = () => {
    const str = localStorage.getItem('search_index')
    return str ? JSON.parse(str) : []
}

// 保存到本地缓�?
const saveLocalHistory = (list: string[]) => {
    localStorage.setItem('search_index', JSON.stringify(list))
}

// 从后端拉取搜索历史失败'
const getRemoteHistory = async () => {
    if (!userId) return
    try {
        const { data } = await request.post('/api/index/search/list', {
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
        const { data } = await request.post('/api/index/search/goods', {
            keyword,
            page: 1,
            pageSize: 50
        })
        if (data.code === 1) {
            goodsList.value = Array.isArray(data.data.list) ? data.data.list : []
            
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
            await request.post('/api/index/search/add', {
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

    // 请求动态结�?
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
            await request.post('/api/index/search/delete', {
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
            await request.post('/api/index/search/clear', {
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
    width: 20px;
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
    padding: 15px 0;
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

/* 列表异常：*/
.inage {
    color: #666;
    border-bottom: 3px solid #ddd;
    padding-bottom: 20px;
}

.userteataaq {
    margin: 15px 10px 0 15px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 1px solid #fff;
    overflow: hidden;
    background: #fff;
}

.userteatb-oneaa {
    font-weight: bold;
    font-size: 15px;
}

.userteatb-oneb {
    display: flex;
    align-items: center;
    margin-left: 2px;
    color: #ff33ee;
    margin-bottom: 2px;
}

.userteatb-oneba {
    margin-left: 10px;
}

.contenttext {
    font-size: 15px;
    padding: 5px 20px 5px 0;
    color: #333;
    text-align: left;
    white-space: pre-wrap;
    word-break: break-word;
}
/* 图片布局 */
.imagesdiva {
    display: grid;
    grid-template-columns: 1fr;
    gap: 5px;
    width: 95%;
    cursor: pointer;

}

.imagesdiva:has(img:only-child) {
    max-width: 300px;
}

.imagesdiva img {
    width: auto;
    max-width: 100%;
    max-height: 380px;
    object-fit: cover;
    border-radius: 5px;
    display: block;
    background: #fff;
}

.imagesdivb {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 5px;
    width: 95%;
    cursor: pointer;
}

.imagesdivb img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 5px;
    background: #fff;
}

.imagesdivc {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 5px;
    width: 95%;
    cursor: pointer;
}

.imagesdivc img {
    width: 100%;
    height: 155px;
    object-fit: cover;
    border-radius: 5px;
}

.imagesdivc img:last-child {
    grid-column: 1/3;
}

.imagesdivd {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 5px;
    width: 95%;
    cursor: pointer;
}

.imagesdivd img {
    width: 100%;
    height: 155px;
    object-fit: cover;
    border-radius: 5px;
    background: #fff;
}

/* 大图预览 */
.img-preview {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    touch-action: none;
}

.preview-img {
    max-width: 95vw;
    max-height: 95vh;
    width: auto;
    height: auto;
    object-fit: contain;
    pointer-events: none;
}

</style>