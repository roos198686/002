<template>
    <div class="main">
        <div class="register-container">
            <div class="register-all">
                <!-- 移除顶部标签�?-->
                <div class="allar-top">
                    <div class="allar-top-a"></div>
                    <div class="allar-top-r">推薦</div>
                </div>

                <!-- 内容区域 -->
                <div class="content-wrapper" ref="scrollWrap" @scroll="handleScroll" @touchstart="handleTouchStart"
                    @touchmove="handleTouchMove" @touchend="handleTouchEnd" @scrollend="onScrollEnd">
                    <!-- 搜索好友：-->
                    <div class="search-box-wrap">
                        <div @click="$router.push('/search')" class="search-box">
                            <span>
                                <Icon icon="si:search-duotone" width="28" class="search-icon" />
                            </span>
                            <span class="scroll-view-outer">
                                <!-- 外层可视窗口：固定高、溢出隐藏、相对定要$-->
                                <div class="scroll-view-clip" @mouseenter="scrollPause" @mouseleave="scrollStart">
                                    <!-- 滚动内容层：绝对定位，实现上下位數字或-->
                                    <div class="scroll-wrap" ref="scrollRef">
                                        <div v-for="(item, index) in topViewList" :key="index" class="scroll-item">
                                            {{ item.content }}
                                        </div>
                                        <div v-for="(item, index) in topViewList" :key="`copy_${index}`"
                                            class="scroll-item">
                                            {{ item.content }}
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
                    <div class="cuekdil">
                        <div class="reimengcesu">
                            <div class="inage" v-for="item in dynamicList" :key="item.dynamic_id"
                                :data-dynamicid="item.dynamic_id"
                                :ref="(el: HTMLElement | null) => el && viewObserver?.observe(el)">
                                <!-- 原有列表内容不变 -->
                                <div class="dynamic-row">
                                    <div class="userteataaq" @click="artist(item)">
                                        <img :src="baseURL + item.avatar" :onerror="`this.src='${defaultImg}'`"
                                            loading="lazy">
                                    </div>
                                    <div class="dynamic-right">
                                        <div>
                                            <div @click="goDetail(item.id)" class="user-header-row">
                                                <div class="userteatb-oneaa">{{ item.nickname }}</div>
                                                <div class="userteatb-oneb"
                                                    v-if="item.vip_level && item.vip_level !== '0'">
                                                    <Icon icon="mingcute:flower-2-fill" height="15" />
                                                </div>
                                                <div class="publish-time">
                                                    {{ moment(item.created_at).format('YYYY.MM.DD HH:mm') }}
                                                </div>
                                            </div>
                                            <div class="username-text" @click="goDetail(item.id)">@{{ item.username }}
                                            </div>
                                            <div class="contenttext" @click="goDetail(item.id)" v-if="item.content">
                                                {{ item.content }}</div>
                                            <!-- 图片区域 -->
                                            <div class="img-container" :class="getImgClass(item)"
                                                v-if="item.file_type === 'image' && item.images.length">
                                                <img v-for="imgUrl in item.images" :key="imgUrl" :src="baseURL + imgUrl"
                                                    :onerror="`this.src='${defaultImg}'`" loading="lazy"
                                                    @click="openPreview(baseURL + imgUrl)">
                                            </div>
                                            <!-- 视频区域 -->
                                            <div v-if="item.file_type === 'video' && item.video_url" class="video-wrap">
                                                <video :src="baseURL + item.video_url" muted playsinline preload="auto"
                                                    @click="openFullscreen($event.target)"></video>
                                            </div>
                                        </div>
                                        <div class="action-bar">
                                            <div class="action-item" @click="openCommentModal(item)">
                                                <span>
                                                    <Icon icon="majesticons:chat-line" height="18" />
                                                </span>
                                                <span class="action-num">{{ item.comment_num ? item.comment_num : 0
                                                    }}</span>
                                            </div>
                                            <div class="action-item" @click="toggleLike(item)">
                                                <span>
                                                    <Icon v-if="item.isLike" icon="iconoir:heart-solid" height="18"
                                                        class="like-active" />
                                                    <Icon v-else icon="iconoir:heart" height="18" />
                                                </span>
                                                <span class="action-num">{{ item.like_num ? item.like_num : 0 }}</span>
                                            </div>
                                            <div class="action-item">
                                                <span>
                                                    <Icon icon="material-symbols:equalizer-rounded" height="18" />
                                                </span>
                                                <span class="action-num">{{ item.view_num ? item.view_num : 0 }}</span>
                                            </div>
                                            <div class="action-item" @click="toggleCollect(item)">
                                                <span>
                                                    <Icon v-if="item.isCollect"
                                                        icon="material-symbols:bookmarks-rounded" height="18"
                                                        class="collect-active" />
                                                    <Icon v-else icon="material-symbols:bookmarks-outline"
                                                        height="18" />
                                                </span>
                                                <span class="action-num">{{ item.collect_num ? item.collect_num : 0
                                                    }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div v-if="loading && !finished" class="loading-tip">
                                <Icon icon="svg-spinners:12-dots-scale-rotate" width="38" />
                            </div>
                        </div>
                    </div>
                    <!-- 右下角悬浮发布按讚失敗-->

                </div>
                <div class="float-publish-btn" @click="goToPublish" v-if="userlevel > '1'">
                    <Icon icon="material-symbols:add" />
                </div>
            </div>
        </div>

        <!-- 評論彈窗 【新增成功-->
        <div v-if="showCommentModal" @touchmove.prevent class="comment-modal">
            <div class="comment-modal-inner">
                <!-- 頂部資料-->
                <div class="comment-header">
                    <div class="cancel-btn" @click="closeCommentModal">取消</div>
                    <div>
                        <div class="buttdgrc"
                            :class="{ disabledBtn: !(imgList.length > 0 || videoItem || commentInput) }"
                            @click="sendComment">發送評論</div>
                    </div>
                </div>
                <div class="upload-btn-wrap">
                    <!-- 圖片上傳 -->
                    <label class="upload-label">
                        <input type="file" accept="image/*" multiple class="file-input" @change="handleImageUpload" />
                        <div class="upload-btn">
                            <Icon icon="majesticons:image" height="30px" />
                        </div>
                    </label>
                    <!-- 影片上傳 -->
                    <label class="upload-label">
                        <input type="file" accept="video/*" class="file-input" @change="handleVideoUpload" />
                        <div class="upload-btn">
                            <Icon icon="fluent:video-28-filled" height="30px" />
                        </div>
                    </label>
                </div>
                <!-- 輸入區：-->
                <div class="textarea-wrap">
                    <textarea ref="textDom" v-model="commentInput" placeholder="請輸入評論.." inputmode="text"
                        @input="changeHeight"></textarea>
                </div>

                <!-- 底部上傳區：-->
                <div class="preview-container">
                    <!-- 圖片預覽 -->
                    <div v-for="(item, idx) in imgList" :key="idx" class="img-preview-item">
                        <img :src="item.preview" />
                        <span @click="delImg(idx)" class="close-preview">×</span>
                    </div>
                    <!-- 影片預覽 -->
                    <div v-if="videoItem" class="video-preview-item">
                        <video :src="videoItem.preview"></video>
                        <span @click="delVideo" class="close-preview">×</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="img-preview" v-if="previewVisible" @click="closePreview">
            <img :src="previewUrl" class="preview-img" />
        </div>

        <div class="custom-moda" v-if="showToast">
            <div class="toast-icon">
                <Icon icon="iconoir:xmark" width="58" v-if="yesno" />
                <Icon icon="iconoir:check" width="58" v-if="yesnoa" />
                <Icon icon="svg-spinners:12-dots-scale-rotate" width="58" v-if="loginno" />
            </div>
            <div>{{ showtext }}</div>
        </div>
        <div v-if="alertVisible" class="custom-modal" @click="alertVisible = false">
            <div class="modal-box" @click.stop>
                <Icon icon="iconoir:xmark" width="58" v-if="!yesno" />
                <Icon icon="iconoir:check" width="58" v-if="yesno" />
                <div class="modal-text">{{ alertMsg }}</div>
            </div>
        </div>

    </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref, nextTick, onActivated } from 'vue';
import { Icon } from '@iconify/vue';
import router from '../../../router';
import request from '@/utils/request';
import moment from 'moment';
import { useDynamicStore } from '@/stores/dynamic'
const dynamicStore = useDynamicStore()
const baseURL = request.defaults.baseURL || '';
// 圖片載入失敗兜底�?
const defaultImg = `${baseURL}/static/default.png`;

// ========== 本地缓存常量 & 工具方法 ==========
const CACHE_KEY = 'tab_all_cache';

// 初始化缓存结构：3个标签独立数据设置
const initCache = () => [
    { list: [] as any[], page: 1, finished: false, scrollTop: 0, loaded: false },
];

// 读取本地缓存
const getCache = () => {
    const str = localStorage.getItem(CACHE_KEY);
    if (!str) return initCache();
    try {
        return JSON.parse(str);
    } catch {
        return initCache();
    }
};
// 【新增】跳转到发布页面'
const goToPublish = () => {
    // 替换成你实际的发布页路由地址'
    router.push('/dynamicPublish')
}
// 写入本地缓存'
const setCache = (data: any[]) => {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
};



// 从本地读取上次激活标�?
const lastActiveTab = Number(localStorage.getItem('last_active_tab')) || 0;
const activeTab = ref(lastActiveTab);

// 列表视图变量'
const dynamicList = ref<any[]>([]);
const loading = ref(false);
const finished = ref(false);
const page = ref(1);
const scrollWrap = ref<HTMLElement | null>(null);

// 下拉刷新'
const pullDistance = ref(0);
const isPulling = ref(false);
const isRefreshing = ref(false);

// Toast
const showToast = ref(false);
const yesno = ref(false);
const yesnoa = ref(false);
const loginno = ref(false);
const showtext = ref('');

// 操作失敗'
let likeLock = false;
let collectLock = false;
const userData = JSON.parse(localStorage.getItem('user') || '{}');
const currentUser = ref({ id: userData.id || '' });
// ===================== 評論相關變數 【新增成功=====================
const showCommentModal = ref(false);
const alertVisible = ref(false);
const alertMsg = ref('');
const curDynamicId = ref('');
const commentInput = ref('')
const textDom = ref<HTMLTextAreaElement | null>(null)
// 上傳檔案暫存'
const imgList = ref<{ file: File; preview: string }[]>([])
const videoItem = ref<{ file: File; preview: string } | null>(null)
// 大圖預覽'
const previewVisible = ref(false);
const previewUrl = ref('');

// ========== 跳转方法 ==========
const goDetail = (dynamicId: any) => {
    router.push({ path: '/dynamicIndex', query: { id: dynamicId } })
};
const artist = (item: any) => {
    if (item?.user_id) router.push({ path: '/artist', query: { id: String(item.user_id) } });
};

// ===================== 圖片樣式不正确【新增成功=====================
const getImgClass = (item: any) => {
    const len = Array.isArray(item.images) ? item.images.length : 0
    if (len === 1) return 'imagesdiva'
    if (len === 2) return 'imagesdivb'
    if (len === 3) return 'imagesdivc'
    return 'imagesdivd'
};

// ===================== 大圖預覽、影片全部【新增成功=====================
const openPreview = (url: string) => {
    previewUrl.value = url;
    previewVisible.value = true;
    document.body.style.overflow = 'hidden';
};
const closePreview = () => {
    previewVisible.value = false;
    document.body.style.overflow = 'auto';
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

// ===================== 評論彈窗開關 【新增成功=====================
const openCommentModal = (item: any) => {
    curDynamicId.value = item.dynamic_id;
    showCommentModal.value = true;
    // 新增：DOM 渲染完成后聚焦输入框，唤起键�?
    nextTick(() => {
        textDom.value?.focus()
    })
};
const closeCommentModal = () => {
    showCommentModal.value = false;
    textDom.value?.blur();
};

// ===================== 文本域自增高 【新增成功=====================
const changeHeight = () => {
    if (!textDom.value) return
    textDom.value.style.height = 'auto'
    textDom.value.style.height = textDom.value.scrollHeight + 'px'
};

// ===================== 圖片/影片上傳、刪除成功【新增成功=====================
const handleImageUpload = (e: Event) => {
    const target = e.target as HTMLInputElement
    const files = target.files
    if (!files) return

    if (videoItem.value) {
        URL.revokeObjectURL(videoItem.value.preview)
        videoItem.value = null
    }

    const remain = 4 - imgList.value.length
    if (remain <= 0) {
        alertVisible.value = true;
        alertMsg.value = '最多只能上傳張圖片';
        setTimeout(() => alertVisible.value = false, 2000);
        target.value = ''
        return
    }

    const addNum = Math.min(files.length, remain)
    for (let i = 0; i < addNum; i++) {
        const file = files[i]
        const preview = URL.createObjectURL(file)
        imgList.value.push({ file, preview })
    }
    target.value = ''
};
const handleVideoUpload = (e: Event) => {
    const target = e.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) return

    if (imgList.value.length > 0) {
        imgList.value.forEach(item => URL.revokeObjectURL(item.preview))
        imgList.value = []
    }

    if (videoItem.value) {
        URL.revokeObjectURL(videoItem.value.preview)
    }
    const preview = URL.createObjectURL(file)
    videoItem.value = { file, preview }
    target.value = ''
};
const delImg = (index: number) => {
    URL.revokeObjectURL(imgList.value[index].preview)
    imgList.value.splice(index, 1)
};
const delVideo = () => {
    if (videoItem.value) {
        URL.revokeObjectURL(videoItem.value.preview)
        videoItem.value = null
    }
};

// ===================== 發送評論失敗【新增論失敗=====================
const sendComment = async () => {
    if (!curDynamicId.value) {
        alertVisible.value = true;
        alertMsg.value = '無法取得動態編號';
        setTimeout(() => alertVisible.value = false, 2000);
        return;
    }
    if (!currentUser.value.id) {
        alertVisible.value = true;
        alertMsg.value = '請先登入會員';
        setTimeout(() => alertVisible.value = false, 2000);
        return;
    }
    if (!commentInput.value.trim() && imgList.value.length === 0 && !videoItem.value) {
        alertVisible.value = true;
        alertMsg.value = '評論內容不可為空';
        setTimeout(() => alertVisible.value = false, 2000);
        return;
    }

    const formData = new FormData();
    formData.append('dynamic_id', curDynamicId.value);
    formData.append('user_id', currentUser.value.id);
    formData.append('reply_id', '');
    formData.append('content', commentInput.value.trim());

    imgList.value.forEach((item, i) => {
        formData.append('images', item.file);
    });
    if (videoItem.value) {
        formData.append('video', videoItem.value.file);
    }

    try {
        const { data } = await request.post('/api/dynamiclndex/add', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if (data.code === 1) {
            // 清空表單'
            commentInput.value = '';
            imgList.value.forEach(item => URL.revokeObjectURL(item.preview));
            imgList.value = [];
            if (videoItem.value) {
                URL.revokeObjectURL(videoItem.value.preview);
                videoItem.value = null;
            }
            showCommentModal.value = false;
            // 本地列表更新評論內容不可'
            const target = dynamicList.value.find(d => d.dynamic_id === curDynamicId.value);
            if (target) target.comment_num = (target.comment_num || 0) + 1;
            dynamicStore.incCommentNum(curDynamicId.value)
            // 同步本地緩存'
            const tabCache = getCache();
            const currTab = activeTab.value;
            const cacheItem = tabCache[currTab].list.find((d: any) => d.dynamic_id === curDynamicId.value);
            if (cacheItem) cacheItem.comment_num = (cacheItem.comment_num || 0) + 1;
            setCache(tabCache);
        } else {
            console.error('發送評論失敗', data);
        }
    } catch (err) {
        console.error(err);
    }
};

// ===================== 釋放預覽資源 【新增成功=====================
const revokeAllObjectUrl = () => {
    imgList.value.forEach(item => {
        URL.revokeObjectURL(item.preview)
    })
    if (videoItem.value) {
        URL.revokeObjectURL(videoItem.value.preview)
    }
};

// ========== Toast 提示 ==========
const toast = (text: string, type: 'success' | 'error' | 'loading' = 'success', duration = 2000) => {
    showtext.value = text;
    yesno.value = false;
    yesnoa.value = false;
    loginno.value = false;
    if (type === 'success') yesnoa.value = true;
    if (type === 'error') yesno.value = true;
    if (type === 'loading') loginno.value = true;
    showToast.value = true;
    if (type !== 'loading') {
        setTimeout(() => showToast.value = false, duration);
    }
};

// ========== 数组去重 ==========
const deduplicateList = (list: any[]) => {
    const idSet = new Set();
    return list.filter(item => {
        if (idSet.has(item.dynamic_id)) return false;
        idSet.add(item.dynamic_id);
        return true;
    });
};

// ========== 请求列表 ==========
const getUserDetail = async (isRefresh = false) => {
    loading.value = true;
    if (isRefresh) isRefreshing.value = true;

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
        loading.value = false;
        isRefreshing.value = false;
        pullDistance.value = 0;
        return;
    }

    const currTab = activeTab.value;
    const tabCache = getCache();
    const cache = tabCache[currTab];

    // 下拉刷新：重置当前标�?
    if (isRefresh) {
        cache.page = 1;
        cache.finished = false;
        cache.list = [];
    }

    const excludeIds = cache.list.map(item => item.dynamic_id);
    try {
        const { data: res } = await request.post('/api/index/userimages', {
            page: cache.page,
            limit: 10,
            userId: user.id,
            isRefresh: isRefresh,
            excludeIds: excludeIds,
            tabType: currTab
        });

        if (res.code === 1) {
            const newList = res.data.map((item: any) => ({
                ...item,
                images: (item.images || item.image_url || '').toString()
                    .split(',').filter((i: string) => i && i.trim())
            }));

            if (isRefresh) {
                cache.list = deduplicateList(newList);
            } else {
                cache.list = deduplicateList([...cache.list, ...newList]);
            }

            cache.finished = !res.more;
            if (res.more) cache.page++;
            cache.loaded = true;

            // 同步到本地缓�?
            setCache(tabCache);

            // 同步视图'
            dynamicStore.setDynamicList(cache.list)
            dynamicList.value = cache.list;
            finished.value = cache.finished;
            page.value = cache.page;
        }
    } catch (err) {
        console.error(err);
    } finally {
        loading.value = false;
        isRefreshing.value = false;
        pullDistance.value = 0;
    }
};

// ========== 滚动监听（实时存滚动位置到本地） ==========
const handleScroll = () => {
    const tabCache = getCache();
    if (!scrollWrap.value || loading.value || tabCache[activeTab.value].finished || isRefreshing.value) return;
    const el = scrollWrap.value;
    const bottomDistance = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (bottomDistance < 300) {
        getUserDetail(false);
    }
};
let startY = 0;
// ========== 下拉刷新触摸事件 ==========
const handleTouchStart = (e: TouchEvent) => {
    if ((scrollWrap.value?.scrollTop || 0) > 5) return;
    startY = e.touches[0].clientY;
    isPulling.value = true;
};
const handleTouchMove = (e: TouchEvent) => {
    if (!isPulling.value || isRefreshing.value) return;
    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - startY);
    pullDistance.value = Math.min(distance * 0.5, 120);
};
const handleTouchEnd = () => {
    if (pullDistance.value > 70) {
        getUserDetail(true);
    } else {
        pullDistance.value = 0;
    }
    isPulling.value = false;
};
// 精准恢复滚动位置，避开图片/视频异步加载'
const setScrollPos = (pos: number) => {
    if (!scrollWrap.value) return
    scrollWrap.value.scrollTop = pos
    setTimeout(() => {
        if (scrollWrap.value) scrollWrap.value.scrollTop = pos
    }, 80)
    setTimeout(() => {
        if (scrollWrap.value) scrollWrap.value.scrollTop = pos
    }, 200)
}
// ========== 标签切换 ==========
const switchTab = (index: number) => {
    if (activeTab.value === index) return;

    const tabCache = getCache();
    const currTab = activeTab.value;
    if (scrollWrap.value) {
        tabCache[currTab].scrollTop = scrollWrap.value.scrollTop;
        setCache(tabCache);
    }

    localStorage.setItem('last_active_tab', String(index));
    activeTab.value = index;

    const targetCache = tabCache[index];

    // ========== 此处修改开始聊天==========
    // 切换标签前，先同意註冊Pinia 最新状态到目标标签缓存'
    targetCache.list = targetCache.list.map(item => {
        const storeItem = dynamicStore.getDynamicById(item.dynamic_id)
        return storeItem ? {
            ...item,
            isLike: storeItem.isLike,
            like_num: storeItem.like_num,
            isCollect: storeItem.isCollect,
            collect_num: storeItem.collect_num,
            comment_num: storeItem.comment_num
        } : item
    })
    dynamicList.value = targetCache.list;
    // ========== 此处修改结束 ==========

    finished.value = targetCache.finished;
    page.value = targetCache.page;

    nextTick(() => {
        setScrollPos(targetCache.scrollTop)
    })

    if (!targetCache.loaded) {
        getUserDetail(true);
    }
};


let scrollTimer: number | null = null
// 滚动完全停止后，保存最终位數字或'
const onScrollEnd = () => {
    if (scrollTimer) clearTimeout(scrollTimer)
    scrollTimer = window.setTimeout(() => {
        const nowTab = activeTab.value
        const tabCache = getCache()
        if (scrollWrap.value) {
            tabCache[nowTab].scrollTop = scrollWrap.value.scrollTop
            setCache(tabCache)
        }
    }, 100)
}
// ========== 点赞 ==========
const toggleLike = async (item: any) => {
    if (likeLock) return;
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
        toast('請先登入', 'error');
        return;
    }
    const originIsLike = !!item.isLike;
    const originNum = Number(item.like_num || 0);
    likeLock = true;
    try {
        const { data: res } = await request.post('/api/dynamiclndex/like', {
            dynamic_id: item.dynamic_id,
            user_id: user.id
        });
        if (res.code === 1) {
            const newLike = res.action === 'like'
            const newNum = newLike ? originNum + 1 : Math.max(originNum - 1, 0)
            // 全局同步'
            dynamicStore.updateLike(item.dynamic_id, newLike, newNum)
            // 本地视图'
            item.isLike = newLike
            item.like_num = newNum

            const tabCache = getCache();
            const currTab = activeTab.value;
            const cacheList = tabCache[currTab].list;
            const cacheItem = cacheList.find(c => c.dynamic_id === item.dynamic_id);
            if (cacheItem) {
                cacheItem.isLike = item.isLike;
                cacheItem.like_num = item.like_num;
            }
            setCache(tabCache);

        } else {
            item.isLike = originIsLike;
            item.like_num = originNum;
            toast(res.msg || '操作失敗', 'error');
        }
    } catch (err) {
        item.isLike = originIsLike;
        item.like_num = originNum;
        toast('網路異常', 'error');
    } finally {
        likeLock = false;
    }
};

// ========== 收藏 ==========
const toggleCollect = async (item: any) => {
    if (collectLock) return;
    const uid = currentUser.value.id;
    if (!uid) {
        toast('請先登入', 'error');
        return;
    }
    const oldIsCollect = !!item.isCollect;
    const oldCollectNum = Number(item.collect_num || 0);
    collectLock = true;

    try {
        const { data: res } = await request.post('/api/dynamiclndex/collect', {
            dynamic_id: item.dynamic_id,
            user_id: uid
        });

        if (res.code === 1) {
            const newCollect = res.action === 'collect'
            const newNum = newCollect ? oldCollectNum + 1 : Math.max(oldCollectNum - 1, 0)
            // 全局同步'
            dynamicStore.updateCollect(item.dynamic_id, newCollect, newNum)
            // 本地视图'
            item.isCollect = newCollect
            item.collect_num = newNum

            const tabCache = getCache();
            const currTab = activeTab.value;
            const cacheItem = tabCache[currTab].list.find((c: { dynamic_id: any; }) => c.dynamic_id === item.dynamic_id);
            if (cacheItem) {
                cacheItem.isCollect = item.isCollect;
                cacheItem.collect_num = item.collect_num;
            }
            setCache(tabCache);

        } else {
            item.isCollect = oldIsCollect;
            item.collect_num = oldCollectNum;
            toast(res.msg || '操作失敗', 'error');
        }
    } catch (err) {
        item.isCollect = oldIsCollect;
        item.collect_num = oldCollectNum;
        toast('網路異常', 'error');
    } finally {
        collectLock = false;
    }
};
onActivated(() => {
    nextTick(() => {
        const tabCache = getCache()
        const currTab = activeTab.value

        // 遍历并从 Pinia 同步最新状态
        const newList = tabCache[currTab].list.map((item: { dynamic_id: string | number; }) => {
            const storeItem = dynamicStore.getDynamicById(item.dynamic_id)
            if (!storeItem) return item
            return {
                ...item,
                isLike: storeItem.isLike,
                like_num: storeItem.like_num,
                isCollect: storeItem.isCollect,
                collect_num: storeItem.collect_num,
                comment_num: storeItem.comment_num
            }
        })

        // 关键：用新数组替换，触发响应�?
        dynamicList.value = [...newList]

        finished.value = tabCache[currTab].finished
        page.value = tabCache[currTab].page

        setScrollPos(tabCache[currTab].scrollTop)
    })
})

// 1. 定义列表数据、DOM、定时器'
const topViewList = ref<any[]>([])
const scrollRef = ref<HTMLDivElement | null>(null)
let scrollTimeraq: number | null = null
// 单条高度（和样式 height 对应�?
const itemHeight = 20
// 记录当前偏移�?
let offsetY = 0

// 2. 请求后端接口：获取失败view_nuw 前十数据'
const getTopViewGoods = async () => {
    try {
        const { data } = await request.post('/api/index/top-view', {
            limit: 10
        })
        if (data.code === 1 && data.data && data.data.length > 0) {
            topViewList.value = data.data
            offsetY = 0 // 重置偏移'
            nextTick(() => {
                scrollStart()
            })
        }
    } catch (err) {
        console.error('獲取熱門失敗', err)
    }
}

// 3. 开始滚动：從下往商品頁
const scrollStart = () => {
    if (!scrollRef.value || topViewList.value.length === 0) return
    // 清除旧定时器
    if (scrollTimeraq) clearInterval(scrollTimeraq)

    const totalSingleHeight = itemHeight * topViewList.value.length
    scrollTimeraq = window.setInterval(() => {
        offsetY += 1
        // 滚动到第一组列表末尾，瞬间归位，实现无联系人
        if (offsetY >= totalSingleHeight) {
            offsetY = 0
        }
        // 使用 transform 向上位移
        if (scrollRef.value) {
            scrollRef.value.style.transform = `translateY(-${offsetY}px)`
        }
    }, 100) // 数值越小滚动越快'
}

// 4. 暫停滾動（滑鼠移入）'
const scrollPause = () => {
    if (scrollTimeraq) {
        clearInterval(scrollTimeraq)
        scrollTimeraq = null
    }
}

// 元素可视区监�?
let viewObserver: IntersectionObserver | null = null
const reportedSet = new Set<string>()
// 浏览量上傳4張'
const reportView = (dynamicId: string | number) => {
    const userId = currentUser.value.id ?? ''
    // 拼接唯一标识'
    const uniqueKey = `${userId}_${dynamicId}`

    // 已上报直接返回'
    if (reportedSet.has(uniqueKey)) return

    reportedSet.add(uniqueKey)
    request.post('/api/index/dynamiclndex/view', {
        dynamic_id: dynamicId
    }).catch(err => console.error('阅览上报失败：', err))
}


const userlevel = ref('')
// ========== 页面载入 ==========
onMounted(() => {
    getTopViewGoods()
    const tabCache = getCache();
    const currTab = activeTab.value;
    const cache = tabCache[currTab];
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    userlevel.value = user.role_level

    dynamicList.value = cache.list;
    finished.value = cache.finished;
    page.value = cache.page;

    setScrollPos(cache.scrollTop)

    if (!cache.loaded) {
        getUserDetail(true);
    }

    // 只保留滚动容器的触摸事件，删除标签栏事件'
    const el = scrollWrap.value;
    if (el) {
        el.addEventListener('touchstart', handleTouchStart, { passive: true });
        el.addEventListener('touchmove', handleTouchMove, { passive: true });
        el.addEventListener('touchend', handleTouchEnd, { passive: true });
    }
    // 初始化可视监听：元素进入屏幕就上报，重复进出重复触发
    viewObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const dom = entry.target as HTMLElement;
            const id = dom.dataset.dynamicid;

            // 1. 原有：浏览量上报逻辑'
            if (id && entry.isIntersecting) {
                reportView(id);
            }

            // 2. 新增：视频自动播�?暂停逻辑'
            const videoList = dom.querySelectorAll('video');
            videoList.forEach(video => {
                const videoEl = video as HTMLVideoElement;
                if (entry.isIntersecting) {
                    // 进入可视区：播放
                    videoEl.play().catch(() => { });
                } else {
                    // 离开可视区：暂停'
                    videoEl.pause();
                }
            });
        })
    }, { threshold: 0.1 })
});

// ========== 页面卸载 ==========
onUnmounted(() => {
    const tabCache = getCache();
    const nowTab = activeTab.value;
    if (scrollWrap.value) {
        tabCache[nowTab].scrollTop = scrollWrap.value.scrollTop;
        setCache(tabCache);
    }

    // 釋放本地預覽資源'
    revokeAllObjectUrl();
    previewVisible.value = false;
    document.body.style.overflow = 'auto';
    if (scrollTimeraq) clearInterval(scrollTimeraq)

    const el = scrollWrap.value;
    if (el) {
        el.removeEventListener('touchstart', handleTouchStart);
        el.removeEventListener('touchmove', handleTouchMove);
        el.removeEventListener('touchend', handleTouchEnd);
    }
    // 新增：页面卸载暂停所有视频'
    const allVideos = document.querySelectorAll('video');
    allVideos.forEach(video => {
        (video as HTMLVideoElement).pause();
    });
    // 销毁监�?
    if (viewObserver) {
        viewObserver.disconnect()
        viewObserver = null
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
    overflow: hidden;
    display: flex;
    flex-direction: column;
    overscroll-behavior: none;
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



/* 搜索区域 */
.search-box-wrap {
    padding: 7px 15px;
    margin-top: 5px;
}

.search-box {
    display: flex;
    align-items: center;
    height: 42px;
    padding: 0 5px;
    border-radius: 10px;
    border: 2px solid #fab7ef;
    color: #333;
}

.search-icon {
    margin-top: 5px;
    color: #d605b3;
}

.scroll-view-outer {
    flex: 1;
    padding: 0 10px;
    text-align: left;
    font-size: 13px;
}

.scroll-view-clip {
    height: 20px;
    overflow: hidden;
    position: relative;
    width: 100%;
}

.scroll-wrap {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    transition: none;
}

.scroll-item {
    height: 20px;
    line-height: 20px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 80%;
}

.search-btn {
    background-color: #ff33ee;
    color: #fff;
    font-size: 13px;
    padding: 5px 10px;
    border-radius: 5px;
}

/* 滚动容器 */
.content-wrapper {
    position: absolute;
    top: 40px;
    left: 0;
    right: 0;
    bottom: 0;
    overflow-y: auto;
    overflow-x: hidden;
    box-sizing: border-box;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-y: contain;
    padding-bottom: 120px;
    background: #f8f8f82d;
}

.pull-refresh-tip {
    height: 0;
}

.tip-text {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
    height: 100%;
}

.cuekdil {
    width: 100%;
    min-height: 100%;
}

/* 动态列表项 */
.inage {
    color: #666;
    border-bottom: 5px solid #f1efef;
    padding-bottom: 20px;
}

.dynamic-row {
    display: flex;
    flex-direction: row;
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

.userteataaq img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.dynamic-right {
    display: flex;
    flex-direction: column;
    flex: 1;
}

.user-header-row {
    display: flex;
    flex-direction: row;
    margin-top: 10px;
    align-items: center;
}

.userteatb-oneaa {
    font-weight: bold;
    font-size: 15px;
    color: #000;
}

.userteatb-oneb {
    display: flex;
    align-items: center;
    margin: 5px;
    color: #ff33ee;
}

.publish-time {
    font-size: 11px;
    padding: 5px 20px 5px 0;
    text-align: right;
    margin-left: auto;
    color: #333;
}

.username-text {
    font-size: 13px;
    color: #333;
    text-align: left;
}

.contenttext {
    font-size: 15px;
    padding: 5px 20px 5px 0;
    color: #474747;
    text-align: left;
    white-space: pre-wrap;
    word-break: break-word;
}

/* 图片布局 */
.img-container {
    margin-top: 10px;
}

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

/* 视频区域 */
.video-wrap {
    margin-top: 8px;
    text-align: left;
    position: relative;
}

.video-wrap video {
    max-height: 380px;
    width: auto;
    max-width: 100%;
    border-radius: 8px;
    display: block;
    background: #fff;
}

/* 底部操作失敗*/
.action-bar {
    display: flex;
    flex-direction: row;
    font-size: 13px;
    margin-top: 10px;
    align-items: center;
    color: #666;
}

.action-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    flex: 1;
}

.action-item:nth-child(n+4) {
    margin-left: 10px;
}

.action-num {
    font-size: 12px;
}

.like-active {
    color: #ff33ee;
}

.collect-active {
    color: #ff33ee;
}

.loading-tip {
    color: #666;
    text-align: center;
    padding: 15px 0;
}

/* 评论弹窗 */
.comment-modal {
    position: fixed;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    display: flex;
    justify-content: center;
    overflow: hidden;
    touch-action: none;
}

.comment-modal-inner {
    width: 100%;
    max-width: 500px;
    background: #fff;
    display: flex;
    flex-direction: column;
}

.comment-header {
    background-color: #f7f7f7;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px 15px;
    /* border-bottom: 1px solid #2c2c2c; */
    font-size: 15px;
}

.cancel-btn {
    color: #000;
}

.buttdgrc {
    background-color: rgb(105, 0, 131);
    padding: 5px 15px;
    font-size: 14px;
    border-radius: 4px;
    color: #333;
    cursor: pointer;
    text-align: center;
}

.buttdgrc.disabledBtn {
    pointer-events: none;
    cursor: not-allowed;
    opacity: 0.6;
    color: #666;
}

.upload-btn-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 10px 15px 0 15px;
}

.upload-label {
    cursor: pointer;
}

.file-input {
    display: none;
}

.upload-btn {
    border: 1px solid #ccc;
    padding: 3px 7px;
    border-radius: 6px;
    background-color: #eee;
    display: flex;
    align-items: center;
}

.textarea-wrap {
    overflow-y: auto;
    margin: 15px 15px 0 15px;
}

.textarea-wrap textarea {
    font-size: 15px;
    width: 97%;
    border: none;
    resize: none;
    overflow: hidden;
    outline: none;
    background: transparent;
    color: #000;
}

.preview-container {
    padding: 0 15px;
    color: #000;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 10px;
}

.img-preview-item {
    width: 47%;
    height: 150px;
    position: relative;
}

.img-preview-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 4px;
}

.video-preview-item {
    width: 75%;
    height: auto;
    position: relative;
}

.video-preview-item video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 4px;
}

.close-preview {
    position: absolute;
    top: -6px;
    right: -6px;
    background: #fff;
    color: #333;
    border-radius: 50%;
    width: 18px;
    height: 18px;
    text-align: center;
    line-height: 18px;
    font-size: 12px;
    cursor: pointer;
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



.tip-text {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
    height: 100%;
}

/* 【新增】右下角悬浮发布按钮 */
.float-publish-btn {
    position: fixed;
    right: 15px;
    bottom: 30px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: #ff33eead;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 28px;
    box-shadow: 0 2px 10px rgba(214, 0, 214, 0.4);
    cursor: pointer;
    z-index: 9999999;
}

/* 手机端，直接上移 */
@media (max-width: 500px) {
    .float-publish-btn {
        bottom: 100px;
    }
}

.float-publish-btn:active {
    opacity: 0.8;
}

/* 滾動外層容器已在行內樣式定義，這裡只寫內部滾動態編號*/
.scroll-wrap {
    transition: none;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
}

.scroll-item {
    height: 20px;
    line-height: 20px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 80%;
}

/* 隐藏滚动态数据*/
::-webkit-scrollbar {
    display: none;
}

:global(html),
:global(body) {
    background: #fff;
    margin: 0;
    padding: 0;
}
</style>