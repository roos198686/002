<template>
    <div class="main">
        <div class="register-container">
            <div class="register-all">
                <!-- 頂部導航 -->
                <div class="allar-top">
                    <div class="allar-top-a" @click="goBack">
                        <Icon icon="tabler:chevron-left" height="30" />
                    </div>
                    <div class="allar-top-r">動態詳情</div>
                </div>
                
                <!-- 滾動容器 -->
                <div class="content-wrapper">
                    <div class="cuekdil">
                        <!-- 動態列表 -->
                        <div class="dynamic-list">
                            <div class="inage" v-for="(item, i) in dynamicList" :key="item.dynamic_id"
                                style="padding-top: 10px;">
                                <div style="display: flex;flex-direction: row;padding-bottom: 5px;">
                                    <div class="userteataaq" @click="goUserPage(item.user_id)">
                                        <img :src="baseURL + item.avatar" :onerror="`this.src='${defaultImg}'`"
                                            loading="lazy" style="width:100%;height:100%;object-fit:cover;">
                                    </div>
                                    <div style="display: flex;flex-direction: column;flex: 1;">
                                        <div
                                            style="display: flex;flex-direction: row;margin-top: 10px;align-items: end;">
                                            <div class="userteatb-oneaa">{{ item.nickname }}</div>
                                            <div class="userteatb-oneb" v-if="item.vip_level && item.vip_level !== '0'">
                                                <Icon icon="mingcute:flower-2-fill" height="15" />
                                            </div>
                                            <div
                                                style="font-size: 11px;padding: 5px 10px;text-align: right;margin-left: auto; color:#666;">
                                                {{ moment(item.created_at).format('YYYY.MM.DD HH:mm') }}
                                            </div>
                                        </div>
                                        <div style="font-size: 13px;text-align: left;color:#666;">@{{ item.username }}
                                        </div>

                                    </div>
                                </div>
                                <div style="padding: 0 20px;">
                                    <div class="contenttext"
                                        :style="item.content ? 'display: block;' : ' display: none;'">{{ item.content }}
                                    </div>
                                    <!-- 圖片區：-->
                                    <div class="imagesdiv" :class="getImgClass(item)"
                                        v-if="item.file_type === 'image' && item.images.length">
                                        <img v-for="(img, idx) in item.images" :key="idx" :src="baseURL + img"
                                            :onerror="`this.src='${defaultImg}'`" loading="lazy"
                                            @click="openPreview(baseURL + img)">
                                    </div>

                                    <!-- 影片區域：高度限制240px，寬度自適應原比例，不拉取云端-->
                                    <div v-if="item.file_type === 'video' && item.video_url"
                                        style="margin-top:5px; text-align:left;">
                                        <video :src="baseURL + item.video_url" controls preload="metadata" muted
                                            playsinline
                                            style="max-height: 300px;width: auto;max-width: 100%; border-radius: 8px; display: block;background:#fff;"
                                            @loadedmetadata="(e) => { (e.target as HTMLVideoElement).currentTime = 0; }"
                                            @click="openFullscreen($event.target)"></video>
                                    </div>
                                    <!-- 操作失敗按讚/瀏覽/收藏 -->
                                    <div class="boot" style="margin-top:12px;">
                                        <div class="bootriaa">
                                            <div @click="openCommentModal(item)"
                                                style="display: flex;flex-direction: row;align-items: center;flex: 1;">
                                                <span>
                                                    <Icon icon="majesticons:chat-line" height="18" />
                                                </span><span style="font-size: 12px;">{{ item.comment_num ?
                                                    item.comment_num : 0 }}</span>
                                            </div>
                                            <div style="flex: 1;" @click="toggleLike(item)">
                                                <Icon icon="iconoir:heart-solid" height="18" style="color:#d600d6;"
                                                    v-if="item.isLike" />
                                                <Icon icon="iconoir:heart" height="18" v-else />
                                                <span style="margin: 0 5px 0 2px">{{ item.like_num }}</span>
                                            </div>
                                            <div style="flex: 1;">
                                                <Icon icon="material-symbols:equalizer-rounded" height="18" />
                                                <span style="margin: 0 5px 0 2px">{{ item.view_num }}</span>
                                            </div>
                                            <div style="flex: 1;" @click="toggleCollect(item)">
                                                <span>
                                                    <Icon v-if="item.isCollect"
                                                        icon="material-symbols:bookmarks-rounded" height="18"
                                                        style="color:#ff33ee" />
                                                    <Icon v-else icon="material-symbols:bookmarks-outline"
                                                        height="18" />
                                                </span><span style="font-size: 12px;">{{ item.collect_num ?
                                                    item.collect_num : 0 }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="empty-tip" v-if="!loading && dynamicList.length === 0">
                            暫無動態資料
                        </div>
                        <div class="load-tip" v-if="loading">載入中.....</div>
                        <div class="load-tip" v-if="noMore && dynamicList.length">已載入全部資料</div>
                        <div
                            style="background:#f7f7f7;font-weight: 700;font-size: 13px;text-align: left;padding: 10px 0 10px 20px;">
                            全部評論</div>
                        <div class="page-comment-wrap">
                            <div class="page-comment-item" v-for="c in commentList" :key="c.id">
                                <div class="c-avatar">
                                    <img :src="baseURL + c.avatar" :onerror="`this.src='${defaultImg}'`" loading="lazy">
                                </div>
                                <div class="c-body">
                                    <div class="c-name">{{ c.nickname }}</div>
                                    <div class="c-text">{{ c.content }}</div>
                                    <!-- 展示評論圖片 -->
                                    <div v-if="c.images" class="imagesdiv" :class="getCommentImgClass(c)">
                                        <img v-for="(img, idx) in c.images.split(',').filter(url => url.trim())"
                                            :key="idx" :src="baseURL + img" :onerror="`this.src='${defaultImg}'`"
                                            loading="lazy" @click="openPreview(baseURL + img)" />
                                    </div>

                                    <!-- 展示評論影片 -->
                                    <div v-if="c.video" style="margin:6px 0;">
                                        <video :src="baseURL + c.video" style="width:60%; border-radius:4px;" controls
                                            @click="openFullscreen($event.target)"></video>
                                    </div>
                                    <div class="c-time">{{ moment(c.created_at).format('YYYY.MM.DD HH:mm') }}</div>
                                </div>
                            </div>
                            <div class="empty-comment" v-if="commentList.length === 0">暫無評論</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 評論彈窗 【新增成功-->
        <div v-if="showCommentModal"
    @touchmove.prevent
    style="position:fixed;top:0;width:100%; height:100%;z-index:999;display: flex;justify-content: center;overflow:hidden;touch-action:none;">
            <div style="width:100%;max-width: 500px;background:#fff;display:flex;flex-direction:column;">
                <!-- 頂部資料-->
                <div
                    style="background-color: #f7f7f7; display:flex;justify-content:space-between;align-items:center;padding:5px 15px;font-size: 15px;">
                    <div style="color: #000;" @click="closeCommentModal">取消</div>
                    <div>
                        <div class="buttdgrc"
                            :class="{ disabledBtn: !(imgList.length > 0 || videoItem || commentInput) }"
                            @click="sendComment">發送評論</div>
                    </div>
                </div>
                <div style="display:flex;align-items:center;gap:10px;margin: 5px 15px 0 15px;">
                    <!-- 圖片上傳 -->
                    <label style="cursor:pointer;">
                        <input type="file" accept="image/*" multiple style="display:none;"
                            @change="handleImageUpload" />

                        <div
                            style="border: 1px solid #ccc;padding: 3px 7px;border-radius: 6px;background-color: #eee;display: flex;align-items: center;">
                            <Icon icon="majesticons:image" height="30px" />
                        </div>
                    </label>
                    <!-- 影片上傳 -->
                    <label style="cursor:pointer;">
                        <input type="file" accept="video/*" style="display:none;" @change="handleVideoUpload" />
                        <div
                            style="border: 1px solid #ccc;padding: 3px 7px;border-radius: 6px;background-color: #eee;display: flex;align-items: center;">
                            <Icon icon="fluent:video-28-filled" height="30px" />
                        </div>
                    </label>
                </div>
                <!-- 輸入區：-->
                <div style="overflow-y:auto;margin:15px 15px 0 15px;">
                    <textarea ref="textDom" v-model="commentInput" placeholder="請輸入評論..." inputmode="text"
                        style="font-size: 15px; width:97%;border:none;resize:none;overflow:hidden;outline:none;background:transparent;color:#000;"
                        @input="changeHeight"></textarea>
                </div>

                <!-- 底部上傳區：-->
                <div style="padding:0 15px;color: #000;">

                    <!-- 預覽區：-->
                    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;">
                        <!-- 圖片預覽 -->
                        <div v-for="(item, idx) in imgList" :key="idx"
                            style="width:47%;height:150px;position:relative;">
                            <img :src="item.preview"
                                style="width:100%;height:100%;object-fit:cover;border-radius:4px;" />
                            <span @click="delImg(idx)"
                                style="position:absolute;top:-6px;right:-6px;background:#fff;color:#333;border-radius:50%;width:18px;height:18px;text-align:center;line-height:18px;font-size:12px;cursor:pointer;">×</span>
                        </div>
                        <!-- 影片預覽 -->
                        <div v-if="videoItem" style="width:75%;height:auto;position:relative;">
                            <video :src="videoItem.preview"
                                style="width:100%;height:100%;object-fit:cover;border-radius:4px;"></video>
                            <span @click="delVideo"
                                style="position:absolute;top:-6px;right:-6px;background:#fff;color:#333;border-radius:50%;width:18px;height:18px;text-align:center;line-height:18px;font-size:12px;cursor:pointer;">×</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 大圖預覽 -->
        <div class="img-preview" v-if="previewVisible" @click="closePreview">
            <img :src="previewUrl" class="preview-img" />
        </div>

        <!-- 提示彈窗 -->
        <div class="copy-toast" v-if="showToast">
            <div style="font-size: 30PX;">
                <Icon icon="iconoir:check" width="58" />
            </div>
            <div class="toast-text" style="font-size: 16px;">{{ toastText }}</div>
        </div>

        <!-- 警告彈窗 -->
        <div v-if="alertVisible" class="custom-modal">
            <div class="modal-box" @click.stop>
                <Icon icon="iconoir:xmark" width="58" />
                <div class="modal-text">{{ alertMsg }}</div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, reactive, nextTick, onUnmounted, onActivated } from 'vue';
import { Icon } from '@iconify/vue';
import router from '../../../router'
import { useRoute } from 'vue-router';
import request from '@/utils/request';
import moment from 'moment';

const route = useRoute();
const baseURL = request.defaults.baseURL || '';

// ===================== 圖片優化配置 =====================
const defaultImg = `${baseURL}/static/default.png`;

// 彈窗狀態'
const showToast = ref(false);
const toastText = ref('');
const alertVisible = ref(false);
const alertMsg = ref('');
const showCommentModal = ref(false);

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
// 目前登入使用者名稱'
const userData = JSON.parse(localStorage.getItem('user') || '{}');
const currentUser = reactive({
    id: userData.id || '',
    role_level: userData.role_level || '0'
});

// 分頁與載入狀態'
const loading = ref(false);
const noMore = ref(false);
const dynamicList = ref<any[]>([]);

// 評論相關'
const curDynamicId = ref('');
const commentList = ref<any[]>([]);

// 圖片預覽'
const previewVisible = ref(false);
const previewUrl = ref('');

// 返回上一级列表'
const goBack = () => router.back();

// 跳轉使用者主頁'
const goUserPage = (uid: number) => {
    router.push({ path: '/artist', query: { id: uid } });
};

// 動態多圖樣式判斷'
const getImgClass = (item: any) => {
    const len = Array.isArray(item.images) ? item.images.length : 0
    if (len === 1) return 'imagesdiva'
    if (len === 2) return 'imagesdivb'
    if (len === 3) return 'imagesdivc'
    return 'imagesdivd'
};

// 評論多圖樣式判斷'
const getCommentImgClass = (item: any) => {
    const imgArr = (item.images || '').split(',').filter(url => url.trim())
    const len = imgArr.length
    if (len === 1) return 'imagesdiva'
    if (len === 2) return 'imagesdivb'
    if (len === 3) return 'imagesdivc'
    return 'imagesdivd'
};

// 大圖預覽'
const openPreview = (url: string) => {
    previewUrl.value = url;
    previewVisible.value = true;
    document.body.style.overflow = 'hidden';
};

// 影片全螢�?
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

// 關閉大圖預覽'
const closePreview = () => {
    previewVisible.value = false;
    document.body.style.overflow = 'auto';
};

const commentInput = ref('')
const textDom = ref<HTMLTextAreaElement | null>(null)

// 上傳檔案暫存'
const imgList = ref<{ file: File; preview: string }[]>([])
const videoItem = ref<{ file: File; preview: string } | null>(null)

// 文字域自動增成功'
const changeHeight = () => {
    if (!textDom.value) return
    textDom.value.style.height = 'auto'
    textDom.value.style.height = textDom.value.scrollHeight + 'px'
}

// 選擇圖片'
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
}

// 選擇影片'
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
}

// 刪除單張圖片
const delImg = (index: number) => {
    URL.revokeObjectURL(imgList.value[index].preview)
    imgList.value.splice(index, 1)
}

// 刪除影片'
const delVideo = () => {
    if (videoItem.value) {
        URL.revokeObjectURL(videoItem.value.preview)
        videoItem.value = null
    }
}

// 發送評論失敗'
const sendComment = async () => {
    if (!curDynamicId.value) {
        alertVisible.value = true;
        alertMsg.value = '無法取得動態編號';
        setTimeout(() => alertVisible.value = false, 2000);
        return;
    }
    if (!currentUser.id) {
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
    formData.append('user_id', currentUser.id);
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
            await loadComment();

            // 更新本地评论内容'
            const target = dynamicList.value.find(d => d.dynamic_id === curDynamicId.value);
            if (target) {
                target.comment_num += 1;
                // 同步到全局缓存 tab_all_cache
                const cacheKey = 'tab_all_cache';
                const cacheStr = localStorage.getItem(cacheKey);
                if (cacheStr) {
                    const cacheArr = JSON.parse(cacheStr);
                    cacheArr.forEach((tab: any) => {
                        const cacheItem = tab.list.find((d: any) => d.dynamic_id === curDynamicId.value);
                        if (cacheItem) {
                            cacheItem.comment_num = target.comment_num;
                        }
                    })
                    localStorage.setItem(cacheKey, JSON.stringify(cacheArr));
                }
            }
        } else {
            console.error('發送評論失敗', data);
        }
    } catch (err) {
        console.error(err);
    }
};

// 載入單筆動態詳情 + 過濾空圖片位址'
const loadDynamicList = async () => {
    if (loading.value) return;
    loading.value = true;
    try {
        const id = route.query.id
        if (!id) {
            dynamicList.value = [];
            loading.value = false;
            return
        }
        const { data: res } = await request.post('/api/dynamiclndex/detail', {
            id,
            user_id: currentUser.id
        });
        if (res.code === 1) {
            const data = res.data
            const imgArr = (data.image_url || '')
                .toString()
                .split(',')
                .filter((s: string) => s.trim());

            const formatItem = {
                ...data,
                images: imgArr,
                video_url: data.video_url || '',
                isLike: Boolean(data.isLike ?? 0),
                isCollect: Boolean(data.isCollect ?? 0)
            }
            dynamicList.value = [formatItem]
            curDynamicId.value = data.dynamic_id
            await loadComment()
        }
    } catch (err) {
        console.error(err);
    } finally {
        loading.value = false;
    }
}

// 按讚 / 取消按讚'
let likeLock = false;
const toggleLike = async (item: any) => {
    if (likeLock) return;
    if (!currentUser.id) {
        alertVisible.value = true;
        alertMsg.value = '請先登入會員';
        setTimeout(() => alertVisible.value = false, 2000);
        return;
    }
    const oldIsLike = !!item.isLike;
    const oldNum = Number(item.like_num || 0);
    likeLock = true;
    try {
        const { data: res } = await request.post('/api/dynamiclndex/like', {
            dynamic_id: item.dynamic_id,
            user_id: currentUser.id
        });
        if (res.code === 1) {
            const newLike = res.action === 'like'
            const newNum = newLike ? oldNum + 1 : Math.max(oldNum - 1, 0)

            // 更新本地视图'
            item.isLike = newLike
            item.like_num = newNum

            // 同步全局共用缓存 tab_all_cache
            const cacheKey = 'tab_all_cache';
            const cacheStr = localStorage.getItem(cacheKey);
            if (cacheStr) {
                const cacheArr = JSON.parse(cacheStr);
                cacheArr.forEach((tab: any) => {
                    const target = tab.list.find((d: any) => d.dynamic_id === item.dynamic_id);
                    if (target) {
                        target.isLike = newLike;
                        target.like_num = newNum;
                    }
                })
                localStorage.setItem(cacheKey, JSON.stringify(cacheArr));
            }
        } else {
            item.isLike = oldIsLike;
            item.like_num = oldNum;
        }
    } catch (err) {
        item.isLike = oldIsLike;
        item.like_num = oldNum;
        console.log('按讚失敗', err);
    } finally {
        likeLock = false;
    }
};

// 收藏 / 取消收藏'
let collectLock = false;
const toggleCollect = async (item: any) => {
    if (collectLock) return;
    if (!currentUser.id) {
        alertVisible.value = true;
        alertMsg.value = '請先登入會員';
        setTimeout(() => alertVisible.value = false, 2000);
        return;
    }
    const oldCollect = !!item.isCollect;
    const oldNum = Number(item.collect_num || 0);
    collectLock = true;
    try {
        const { data: res } = await request.post('/api/dynamiclndex/collect', {
            dynamic_id: item.dynamic_id,
            user_id: currentUser.id
        });
        if (res.code === 1) {
            const newCollect = res.action === 'collect'
            const newNum = newCollect ? oldNum + 1 : Math.max(oldNum - 1, 0)

            // 更新本地视图'
            item.isCollect = newCollect
            item.collect_num = newNum

            // 同步全局共用缓存 tab_all_cache
            const cacheKey = 'tab_all_cache';
            const cacheStr = localStorage.getItem(cacheKey);
            if (cacheStr) {
                const cacheArr = JSON.parse(cacheStr);
                cacheArr.forEach((tab: any) => {
                    const target = tab.list.find((d: any) => d.dynamic_id === item.dynamic_id);
                    if (target) {
                        target.isCollect = newCollect;
                        target.collect_num = newNum;
                    }
                })
                localStorage.setItem(cacheKey, JSON.stringify(cacheArr));
            }
        }
    } catch (err) {
        item.isCollect = oldCollect;
        item.collect_num = oldNum;
        console.log('收藏失敗', err);
    } finally {
        collectLock = false;
    }
};

// 載入評論列表'
const loadComment = async () => {
    try {
        const { data: res } = await request.post('/api/dynamiclndex/list', {
            dynamic_id: curDynamicId.value
        });
        if (res.code === 1) commentList.value = res.data.list;
    } catch (err) {
        commentList.value = [];
    }
};

// 釋放本地預覽資源，防止記憶體外洩'
const revokeAllObjectUrl = () => {
    imgList.value.forEach(item => {
        URL.revokeObjectURL(item.preview)
    })
    if (videoItem.value) {
        URL.revokeObjectURL(videoItem.value.preview)
    }
}

// 路由切回：讀取全局緩存，刷新狀態'
onActivated(() => {
    const cacheKey = 'tab_all_cache';
    const cacheStr = localStorage.getItem(cacheKey);
    if (cacheStr) {
        const cacheArr = JSON.parse(cacheStr);
        dynamicList.value.forEach(item => {
            cacheArr.forEach((tab: any) => {
                const cacheItem = tab.list.find((d: any) => d.dynamic_id === item.dynamic_id);
                if (cacheItem) {
                    item.isLike = cacheItem.isLike;
                    item.like_num = cacheItem.like_num;
                    item.isCollect = cacheItem.isCollect;
                    item.collect_num = cacheItem.collect_num;
                    item.comment_num = cacheItem.comment_num;
                }
            })
        })
    }
    // 刷新评论'
    if (curDynamicId.value) loadComment()
})

onMounted(async () => {
    await nextTick();
    window.scrollTo(0, 0);
    loadDynamicList();
    if (dynamicList.value.length > 0) {
        curDynamicId.value = dynamicList.value[0].dynamic_id
        loadComment()
    }
});

// 頁面卸載：釋放資源、關閉預設成功'
onUnmounted(() => {
    revokeAllObjectUrl()
    previewVisible.value = false
    document.body.style.overflow = 'auto'
})
</script>

<style scoped>
@import '../../../assets/css/all.css';
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
    /* background-color: #fff; */
}



.content-wrapper {
    position: absolute;
    top: calc(40px + env(safe-area-inset-top));
    left: 0;
    right: 0;
    bottom: 0;
    overflow-y: auto;
    overflow-x: hidden;
    box-sizing: border-box;
}

.cuekdil {
    width: 100%;
    min-height: 100%;
}

::-webkit-scrollbar {
    display: none;
}

:global(html),
:global(body) {
    /* background: #fff !important; */
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
    overscroll-behavior: none !important;
}

/* 大图预览优化 */
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
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
}

.copy-toastas {
    position: fixed;
    width: 100%;
    max-width: 500px;
    min-width: 200px;
    height: 100%;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    background: #fff;
    color: #333;
    display: flex;
    flex-direction: column;
    z-index: 9999;
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

.auto-textarea {
    flex: 1;
    width: 100%;
    --el-input-textarea-line-height: normal !important;
}

.auto-textarea :deep(.el-textarea__inner) {
    padding: 8px 12px !important;
    flex: 1;
    width: 100%;
    height: 200px !important;
    font-size: 15px;
    line-height: normal !important;
    resize: none;
    overflow-y: auto;
    white-space: pre-wrap;
    word-break: break-all;
    display: flex;
    align-items: center;
    background: #ffffff !important;
    -ms-overflow-style: none;
    scrollbar-width: none;
}





.buttdgrc {
    background-color: rgb(105, 0, 131);
    padding: 5px 15px;
    font-size: 14px;
    flex: 1;
    border-radius: 4px;
    color: #333;
    cursor: pointer;
    text-align: center;
}

.contenttext {
    font-size: 15px;
    padding: 10px 0px;
    text-align: left;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: pre-wrap;
    word-break: break-word;
    color: #333;
}


/* 头像容器：加载占位背景，防止布局抖动 */
.userteataaq {
    margin: 15px 10px 0 20px;
    height: 35px;
    width: 35px;
    border-radius: 90px;
    overflow: hidden;
    position: relative;
    border: 1px solid #ffffff;
    background: #fff;
}

.userteatb-oneaa {
    font-weight: bold;
    font-size: 15px;
    color: #333;
}

.userteatb-oneb-no {
    margin-top: 3px;
    display: flex;
    text-align: center;
    margin-left: 5px;
    font-size: 9px;
    background-color: #ff33ee;
    border-radius: 20px;
    height: 15px;
    width: auto;
    padding: 0 8px;
    line-height: 15px;
    align-items: center;
    justify-content: center;
    border: 1px solid #333;
    box-shadow: 0 0 1px 1px rgba(255, 255, 255, 0.349);
    font-weight: 999;
    white-space: nowrap;
    color: #fff;
}

.userteatb-oneb {
    display: flex;
    text-align: center;
    margin-left: 2px;
    color: #ff33ee;
    margin-bottom: 5px;
}

.userteatb-oneba {
    margin-left: 10px;
}

.inage {
    color: #333;
    
    padding-bottom: 20px;
    display: flex;
    flex-direction: column;
}

.boot {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding-right: 35px;
}

.bootriaa {
    /* color: #333; */
    font-size: 13px;
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-top: 5px;
    gap: 10px;
    width: 100%;
    text-align: left;
}


/* 图片容器通用 + 淡入动画、占位背�?*/
.imagesdiv {
    display: flex;
    flex-direction: column;
    gap: 15px;
    width: 95%;
    height: 100%;
    cursor: pointer;
    margin-top: 5px;
}

.imagesdiv img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    background: #fff;
    border-radius: 5px;
    display: block;
    opacity: 0;
    transition: opacity 0.2s ease;
}

/* 图片加载完成淡入 */
.imagesdiv img:not([src=""]) {
    opacity: 1;
}

.imagesdiva {
    display: grid;
    grid-template-columns: 1fr;
    gap: 5px;
    width: 100%;
    cursor: pointer;
}

.imagesdiva:has(img:only-child) {
    max-width: 250px;
}

.imagesdiva img {
    width: auto;
    max-width: 100%;
    max-height: 380px;
}

.imagesdivb {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 5px;
    width: 100%;
    cursor: pointer;
}

.imagesdivb img {
    width: 100%;
    height: 200px;
    object-fit: cover;
}

.imagesdivc {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 5px;
    width: 100%;
    cursor: pointer;
}

.imagesdivc img {
    width: 100%;
    height: 155px;
    object-fit: cover;
}

.imagesdivc img:last-child {
    grid-column: 1 / 3;
    height: 155px;
}

.imagesdivd {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 5px;
    width: 100%;
    cursor: pointer;
}

.imagesdivd img {
    width: 100%;
    height: 155px;
    object-fit: cover;
}

.comment-item {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
}

.c-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    overflow: hidden;
    background: #fff;
}

.c-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.c-body {
    flex: 1;
    margin-left: 10px;
}

.c-name {
    color: #333;
    font-weight: bold;
    font-size: 14px;
}

.c-text {
    color: #666;
    font-size: 13px;
    margin: 4px 0;
}

.c-time {
    color: #777;
    font-size: 11px;
}

.empty-comment {
    color: #777;
    text-align: center;
    padding: 30px 0;
}

.empty-tip,
.load-tip {
    text-align: center;
    padding: 40px 0;
    color: #666;
    font-size: 14px;
}

.page-comment-wrap {
    text-align: left;
    margin-bottom: 100px;
}

.page-comment-item {
    display: flex;
    padding: 10px 20px;
    flex-direction: row;
    border-bottom: 5px solid #f7f7f7;
}
</style>