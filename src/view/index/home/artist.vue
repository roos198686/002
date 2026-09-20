<template>
    <div class="main">
        <div class="register-container">
            <div class="register-all">
                <!-- 统一顶部：只保留返回按钮 -->
                <div class="allar-top allar-top-transparent">
                    <div class="allar-top-a" @click="goBack">
                        <Icon icon="tabler:chevron-left" height="30" />
                    </div>
                </div>

                <!-- 统一滚动容器 -->
                <div class="content-wrapper" ref="scrollWrap" @scroll="saveScrollPos">
                    <div class="cuekdil">
                        <div class="userteat-all">
                            <div class="userteat">
                                <div class="topimage" :style="nameareva"></div>
                                <div class="topimage-jrk">
                                    <div class="userteata">
                                        <img :src="baseURL + user.avatar" class="avatar-img" />
                                    </div>
                                    <div class="boot">
                                        <div class="bootritt" @click="myshop" v-if="currentUser.id != userId">
                                            <Icon icon="simple-icons:shopee" height="20" />
                                        </div>
                                        <div class="bootrittaq" @click="message" v-if="currentUser.id != userId">
                                            <Icon icon="ant-design:message-filled" height="20" />
                                        </div>
                                        <div class="bootritt" @click="userinfo" v-if="currentUser.id == userId">
                                            <Icon icon="majesticons:edit-pen-2" height="20" />
                                        </div>
                                    </div>
                                </div>
                                <div class="userteatb">
                                    <div class="userteatb-one">
                                        <div class="userteatb-onea">{{ user.nickname }}</div>
                                        <div class="userteatb-oneb" v-if="user.vip_level != '0'">
                                            <Icon icon="mingcute:flower-2-fill" height="20" />
                                        </div>
                                    </div>
                                    <div class="user-name-text">@{{ user.username }}</div>
                                    <div class="userteatb-two">
                                        <span>身高：{{ user.height }}</span>
                                        <span class="separator">age</span>
                                        <span>身材：{{ user.figure }}</span>
                                    </div>
                                    <div class="userteatb-two">{{ user.intro }}</div>
                                </div>
                            </div>
                            <!-- 動態列表 -->
                            <div class="dynamic-list-wrap">
                                <div class="inage" v-for="item in dynamicList" :key="item.dynamic_id">
                                    <div class="dynamic-row">
                                        <div class="userteataaq">
                                            <img :src="baseURL + item.avatar" class="avatar-img" />
                                        </div>
                                        <div class="dynamic-content">
                                            <div class="dynamic-header" @click="goDetail(item.id)">
                                                <span class="userteatb-oneaa">{{ item.nickname }}</span>
                                                <span class="vip-icon" v-if="user.vip_level != '0'">
                                                    <Icon icon="mingcute:flower-2-fill" height="15" />
                                                </span>
                                                <span class="time-text">
                                                    {{ moment(item.created_at).format('YYYY.MM.DD HH:mm') }}
                                                </span>
                                                <span class="bootrittaa" @click="deleteImage(item.dynamic_id)"
                                                    v-if="currentUser.id == userId">
                                                    刪除
                                                </span>
                                            </div>
                                            <div class="username-small" @click="goDetail(item.id)">@{{ item.username }}
                                            </div>
                                            <div class="contenttext" @click="goDetail(item.id)">{{ item.content }}</div>

                                            <div @click="goDetail(item.id)"
                                                v-if="item.file_type === 'image' && item.images.length"
                                                class="imagesdiv" :class="getImgClass(item)">
                                                <img v-for="(imgUrl, idx) in item.images" :key="idx"
                                                    :src="baseURL + imgUrl" @click.stop="openPreview(baseURL + imgUrl)">
                                            </div>

                                            <!-- 影片 -->
                                            <div class="video-wrap" @click="goDetail(item.id)"
                                                v-if="item.file_type === 'video' && item.video_url">
                                                <video :ref="(el: HTMLVideoElement | null) => {
                                                    if (el) {
                                                        videoDomList.push(el)
                                                        videoObserver?.observe(el)
                                                    }
                                                }" :src="baseURL + item.video_url" controls muted playsinline
                                                    webkit-playsinline x5-playsinline x5-video-player-type="h5"
                                                    x5-video-player-fullscreen="false" class="video-player"
                                                    @click.stop></video>
                                            </div>
                                            <div class="action-all">
                                                <div class="action-blt">
                                                    <div class="userteataaqas">
                                                        <img :src="baseURL + useravatar" class="userteataaq-img" />
                                                    </div>
                                                    <div class="userteataaq-textarea"
                                                        @click.stop="openSimpleCommentModal(item)">
                                                        <div class="userteataaq-cl">請輸入評論..</div>
                                                    </div>
                                                </div>
                                                <div class="action-bar">
                                                    <div class="action-item" @click="openCommentModal(item)">
                                                        <span>
                                                            <Icon icon="majesticons:chat-line" height="18" />
                                                        </span><span class="action-num">{{ item.comment_num ?
                                                            item.comment_num : 0 }}</span>
                                                    </div>
                                                    <div class="action-item" @click="toggleLike(item)">
                                                        <span>
                                                            <Icon v-if="item.isLike" icon="iconoir:heart-solid"
                                                                height="18" class="heart-active" />
                                                            <Icon v-else icon="iconoir:heart" height="18" />
                                                        </span><span class="action-num">{{ item.like_num ?
                                                            item.like_num : 0 }}</span>
                                                    </div>
                                                    <div class="action-item">
                                                        <span>
                                                            <Icon icon="material-symbols:equalizer-rounded"
                                                                height="18" />
                                                        </span><span class="action-num">{{ item.view_num ?
                                                            item.view_num :
                                                            0 }}</span>
                                                    </div>
                                                    <div class="action-item action-collect"
                                                        @click="toggleCollect(item)">
                                                        <span>
                                                            <Icon v-if="item.isCollect"
                                                                icon="material-symbols:bookmarks-rounded" height="18"
                                                                class="collect-active" />
                                                            <Icon v-else icon="material-symbols:bookmarks-outline"
                                                                height="18" />
                                                        </span><span class="action-num">{{ item.collect_num ?
                                                            item.collect_num : 0 }}</span>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>

                                </div>
                            </div>
                            <div class="empty-bottom"></div>
                        </div>
                    </div>
                </div>
                <!-- 右下角悬浮发布按讚失敗-->
                <div class="float-publish-btn" @click="goToPublish" v-if="userlevel > '1'">
                    <Icon icon="material-symbols:add" />
                </div>
            </div>
        </div>

        <!-- 評論彈窗 -->
        <div v-if="showCommentModal" class="comment-modal-wrap" @touchmove.prevent>
            <div class="comment-modal-box">
                <!-- 頂部資料-->
                <div class="comment-header">
                    <div class="cancel-btn" @click="closeCommentModal">取消</div>
                    <div>
                        <div class="buttdgrc"
                            :class="{ disabledBtn: !(imgList.length > 0 || videoItem || commentInput) }"
                            @click="sendComment">發送失敗</div>
                    </div>
                </div>
                <div class="upload-btn-group">
                    <!-- 圖片上傳 -->
                    <label class="upload-label">
                        <input type="file" accept="image/*" multiple class="hidden-input" @change="handleImageUpload" />
                        <div class="upload-btn">
                            <Icon icon="majesticons:image" height="30px" />
                        </div>
                    </label>
                    <!-- 影片上傳 -->
                    <label class="upload-label">
                        <input type="file" accept="video/*" class="hidden-input" @change="handleVideoUpload" />
                        <div class="upload-btn">
                            <Icon icon="fluent:video-28-filled" height="30px" />
                        </div>
                    </label>
                </div>
                <!-- 輸入區：-->
                <div class="textarea-wrap">
                    <textarea ref="textDom" v-model="commentInput" placeholder="請輸入評論..." inputmode="text"
                        class="comment-textarea" @input="changeHeight"></textarea>
                </div>

                <!-- 預覽區：-->
                <div class="preview-container">
                    <div v-for="(item, idx) in imgList" :key="idx" class="img-preview-item">
                        <img :src="item.preview" class="preview-image" />
                        <span @click="delImg(idx)" class="close-mark">×</span>
                    </div>
                    <div v-if="videoItem" class="video-preview-item">
                        <video :src="videoItem.preview" class="preview-image"></video>
                        <span @click="delVideo" class="close-mark">×</span>
                    </div>
                </div>
            </div>
        </div>
        <!-- 【简易文字评论弹�?- 底部输入框点击唤起，只允许文字等內容-->
        <div v-if="showSimpleCommentModal" class="simple-comment-modal-wrap" @touchmove.prevent>
            <div class="simple-comment-modal-box">
                <!-- 頂部資料-->
                <div class="comment-header">
                    <div class="cancel-btn" @click="closeSimpleCommentModal">取消</div>
                    <div>
                        <div class="buttdgrc" :class="{ disabledBtn: !simpleCommentInput.trim() }"
                            @click="sendSimpleComment">發送</div>
                    </div>
                </div>
                <!-- 僅文字輸入區：-->
                <div class="textarea-wrap">
                    <textarea ref="simpleTextDom" v-model="simpleCommentInput" placeholder="請輸入評論..." inputmode="text"
                        class="comment-textarea" @input="changeSimpleHeight"></textarea>
                </div>
            </div>
        </div>
        <div class="copy-toast" v-if="showToast">
            <div class="toast-icon">
                <Icon icon="iconoir:check" width="58" />
            </div>
            <div class="toast-text">{{ showtext }}</div>
        </div>

        <div class="img-preview" v-if="previewVisible" @click="closePreview">
            <img :src="previewUrl" class="preview-img" />
        </div>
        <div v-if="alertVisible" class="custom-modal" @click="alertVisible = false">
            <div class="modal-box" @click.stop>
                <Icon icon="iconoir:xmark" width="58" />
                <div class="modal-text">{{ alertMsg }}</div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref, computed, nextTick, onActivated, onBeforeUnmount, onUnmounted } from 'vue';
import { Icon } from '@iconify/vue';
import router from '../../../router'
import { useRoute } from 'vue-router';
import request from '@/utils/request';
import moment from 'moment';

const showToast = ref<boolean>(false);
const alertVisible = ref(false);
const alertMsg = ref('');
const showtext = ref('');

const baseURL = request.defaults.baseURL || '';
const route = useRoute();
const userId = ref(route.query.id || 1);

const dynamicList = ref<any[]>([])
const userlevel = ref('')
const useravatar = ref('')
// 评论弹窗、文件上传相關條款'
const showCommentModal = ref(false);
const commentInput = ref('')
const textDom = ref<HTMLTextAreaElement | null>(null)
const curDynamicId = ref('')
const imgList = ref<{ file: File; preview: string }[]>([])
const videoItem = ref<{ file: File; preview: string } | null>(null)

// 页面跳转'
const goDetail = (dynamicId: any) => {
    router.push({ path: '/dynamicIndex', query: { id: dynamicId } })
}
const goToPublish = () => router.push('/dynamicPublish')
const goBack = () => router.back();
const message = () => router.push(`/message/${userId.value}`);
const myshop = () => router.push(`/myshop?id=${userId.value}`);
const userinfo = () => router.push(`/userinfo`);
// 图片样式不正确'
const getImgClass = (item: any) => {
    const len = Array.isArray(item.images) ? item.images.length : 0
    if (len === 1) return 'imagesdiva'
    if (len === 2) return 'imagesdivb'
    if (len === 3) return 'imagesdivc'
    return 'imagesdivd'
}

// 头部背景�?
const nameareva = computed(() => {
    const bgFullUrl = user.avatar_bg ? baseURL + user.avatar_bg : '/images/userbg.png';
    return {
        height: '230px',
        display: 'flex',
        alignItems: 'center',
        backgroundImage: `url(${bgFullUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
    }
})

// 用户信息'
interface UserInfo {
    height: string;
    figure: string;
    avatar: string;
    like_count: number;
    intro: string;
    nickname: string;
    vip_level: string;
    username: string;
    view_count: string;
    role_level: string;
    avatar_bg: string;
}
const user = reactive<UserInfo>({
    height: '', figure: '', avatar: '', like_count: 0,
    intro: '', nickname: '', vip_level: '', username: '', view_count: '',
    role_level: '', avatar_bg: ''
});

// 删除动态数据'
const deleteImage = async (dynamic_id: any) => {
    try {
        await request.post('/api/artist/image/delete', { dynamic_id });
        showToast.value = true;
        showtext.value = '刪除成功';
    } catch (err) {
        showToast.value = true;
        showtext.value = '刪除失敗';
    } finally {
        setTimeout(() => showToast.value = false, 1000);
    }
};

// 主页整体点赞'
const isLiked = ref(false);
const userData = JSON.parse(localStorage.getItem('user') || '{}');
const currentUser = reactive({
    id: userData.id || '',
    role_level: userData.role_level || '0'
});
// const heartremix = async () => {
//     try {
//         const { data: res } = await request.post('/api/artist/like', {
//             user_id: userId.value,
//             liked_by: currentUser.id
//         });
//         if (res.code === 1) {
//             isLiked.value = res.action === 'like';
//             user.like_count = isLiked.value ? user.like_count + 1 : user.like_count - 1;
//         }
//     } catch (err) {
//         console.log(err);
//     }
// };

// 滚动位置保存/恢复'
const scrollWrap = ref<HTMLElement | null>(null);
const saveScrollPos = () => {
    if (scrollWrap.value) {
        localStorage.setItem('profile_scroll_top', String(scrollWrap.value.scrollTop));
    }
};
const restoreScroll = () => {
    nextTick(() => {
        setTimeout(() => {
            const top = localStorage.getItem('profile_scroll_top') || '0'
            if (scrollWrap.value) scrollWrap.value.scrollTop = Number(top)
        }, 50)
    })
}

// 大图预览'
const previewVisible = ref(false);
const previewUrl = ref('');
const openPreview = (url: string) => {
    previewUrl.value = url;
    previewVisible.value = true;
    document.body.style.overflow = 'hidden';
};
const closePreview = () => {
    previewVisible.value = false;
    document.body.style.overflow = 'auto';
};

/**
 * 统一从全局缓存同步动态状态'
 */
const syncGlobalCache = () => {
    const cacheStr = localStorage.getItem('tab_all_cache');
    if (!cacheStr || dynamicList.value.length === 0) return;

    const allCacheList: any[] = [];
    try {
        const cacheArr = JSON.parse(cacheStr);
        cacheArr.forEach((tab: any) => {
            if (Array.isArray(tab.list)) {
                allCacheList.push(...tab.list);
            }
        });
    } catch (e) {
        return;
    }

    dynamicList.value.forEach(item => {
        const cacheItem = allCacheList.find(c => c.dynamic_id === item.dynamic_id);
        if (cacheItem) {
            item.isLike = !!cacheItem.isLike;
            item.like_num = Number(cacheItem.like_num || 0);
            item.isCollect = !!cacheItem.isCollect;
            item.collect_num = Number(cacheItem.collect_num || 0);
            item.comment_num = Number(cacheItem.comment_num || 0);
        }
    })
}

// 初始化数据设置'
const getUserDetail = async () => {
    try {
        const { data: res } = await request.post('/api/artist/detail', {
            id: userId.value,
            current_user_id: currentUser.id
        });
        if (res.code === 1) {
            Object.assign(user, res.user);
            isLiked.value = !!res.isLiked;
        }

        const { data: imgRes } = await request.post('/api/artist/userimages', {
            userId: userId.value,
            page: 1,
            limit: 10,
            isRefresh: true,
            excludeIds: []
        });

        if (imgRes.code === 1) {
            dynamicList.value = imgRes.data.map((row: any) => {
                const imgArr = (row.image_url || '').split(',').filter(s => s.trim());
                return {
                    ...row,
                    images: imgArr,
                    dynamic_id: row.dynamic_id,
                    isLike: !!row.isLike,
                    isCollect: !!row.isCollect,
                    like_num: Number(row.like_num || 0),
                    collect_num: Number(row.collect_num || 0),
                    comment_num: Number(row.comment_num || 0)
                };
            });
            syncGlobalCache();
        }
    } catch (err) {
        console.log(err);
    } finally {
        restoreScroll()
    }
};

// 页面切回'
onActivated(() => {
    syncGlobalCache();
})

onBeforeUnmount(() => {
    if (scrollWrap.value) {
        localStorage.setItem('profile_scroll_top', String(scrollWrap.value.scrollTop));
    }
});

// ========= 动态点击左侧=========
let likeLock = false;
const toggleLike = async (item: any) => {
    if (likeLock || !currentUser.id) {
        if (!currentUser.id) {
            alertMsg.value = '請先登入會員';
            alertVisible.value = true;
            setTimeout(() => alertVisible.value = false, 2000);
        }
        return;
    }

    const oldIsLike = item.isLike;
    const oldNum = item.like_num;
    likeLock = true;

    try {
        const { data: res } = await request.post('/api/dynamiclndex/like', {
            dynamic_id: item.dynamic_id,
            user_id: currentUser.id
        });

        if (res.code === 1) {
            const newIsLike = res.action === 'like';
            const newNum = newIsLike ? oldNum + 1 : Math.max(oldNum - 1, 0);

            item.isLike = newIsLike;
            item.like_num = newNum;

            const cacheStr = localStorage.getItem('tab_all_cache');
            if (cacheStr) {
                const cacheArr = JSON.parse(cacheStr);
                cacheArr.forEach((tab: any) => {
                    const target = tab.list.find(d => d.dynamic_id === item.dynamic_id);
                    if (target) {
                        target.isLike = newIsLike;
                        target.like_num = newNum;
                    }
                })
                localStorage.setItem('tab_all_cache', JSON.stringify(cacheArr));
            }
        } else {
            item.isLike = oldIsLike;
            item.like_num = oldNum;
            alertMsg.value = res.msg || '操作失敗';
            alertVisible.value = true;
        }
    } catch (err) {
        item.isLike = oldIsLike;
        item.like_num = oldNum;
        alertMsg.value = '網路異常，請稍後再試';
        alertVisible.value = true;
    } finally {
        likeLock = false;
        setTimeout(() => alertVisible.value = false, 2000);
    }
};

// ========= 动态收貨地址=========
let collectLock = false;
const toggleCollect = async (item: any) => {
    if (collectLock || !currentUser.id) {
        if (!currentUser.id) {
            alertMsg.value = '請先登入會員';
            alertVisible.value = true;
            setTimeout(() => alertVisible.value = false, 2000);
        }
        return;
    }

    const oldIsCollect = item.isCollect;
    const oldCollectNum = item.collect_num;
    collectLock = true;

    try {
        const { data: res } = await request.post('/api/dynamiclndex/collect', {
            dynamic_id: item.dynamic_id,
            user_id: currentUser.id
        });

        if (res.code === 1) {
            const newCollect = res.action === 'collect';
            const newNum = newCollect ? oldCollectNum + 1 : Math.max(oldCollectNum - 1, 0);

            item.isCollect = newCollect;
            item.collect_num = newNum;

            const cacheStr = localStorage.getItem('tab_all_cache');
            if (cacheStr) {
                const cacheArr = JSON.parse(cacheStr);
                cacheArr.forEach((tab: any) => {
                    const target = tab.list.find(d => d.dynamic_id === item.dynamic_id);
                    if (target) {
                        target.isCollect = newCollect;
                        target.collect_num = newNum;
                    }
                })
                localStorage.setItem('tab_all_cache', JSON.stringify(cacheArr));
            }
        } else {
            item.isCollect = oldIsCollect;
            item.collect_num = oldCollectNum;
            alertMsg.value = res.msg || '操作失敗';
            alertVisible.value = true;
        }
    } catch (err) {
        item.isCollect = oldIsCollect;
        item.collect_num = oldCollectNum;
        alertMsg.value = '網路異常，請稍後再試';
        alertVisible.value = true;
    } finally {
        collectLock = false;
        setTimeout(() => alertVisible.value = false, 2000);
    }
};

// ========= 评论相关 =========
const openCommentModal = (item: any) => {
    curDynamicId.value = item.dynamic_id;
    showCommentModal.value = true;
    nextTick(() => {
        textDom.value?.focus()
    })
}
const closeCommentModal = () => {
    showCommentModal.value = false;
    commentInput.value = '';
    textDom.value?.blur();
    imgList.value.forEach(i => URL.revokeObjectURL(i.preview));
    imgList.value = [];
    if (videoItem.value) {
        URL.revokeObjectURL(videoItem.value.preview);
        videoItem.value = null;
    }
}
const changeHeight = () => {
    if (!textDom.value) return;
    textDom.value.style.height = 'auto';
    textDom.value.style.height = textDom.value.scrollHeight + 'px';
}

// 图片/视频上传'
const handleImageUpload = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const files = target.files;
    if (!files) return;
    if (videoItem.value) {
        URL.revokeObjectURL(videoItem.value.preview);
        videoItem.value = null;
    }
    const remain = 4 - imgList.value.length;
    if (remain <= 0) {
        alertMsg.value = '最多只能上傳張圖片';
        alertVisible.value = true;
        setTimeout(() => alertVisible.value = false, 2000);
        target.value = '';
        return;
    }
    const addNum = Math.min(files.length, remain);
    for (let i = 0; i < addNum; i++) {
        const preview = URL.createObjectURL(files[i]);
        imgList.value.push({ file: files[i], preview });
    }
    target.value = '';
}
const handleVideoUpload = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;
    imgList.value.forEach(i => URL.revokeObjectURL(i.preview));
    imgList.value = [];
    if (videoItem.value) URL.revokeObjectURL(videoItem.value.preview);
    videoItem.value = { file, preview: URL.createObjectURL(file) };
    target.value = '';
}
const delImg = (index: number) => {
    URL.revokeObjectURL(imgList.value[index].preview);
    imgList.value.splice(index, 1);
}
const delVideo = () => {
    if (videoItem.value) {
        URL.revokeObjectURL(videoItem.value.preview);
        videoItem.value = null;
    }
}

// 发送评论'
const sendComment = async () => {
    if (!curDynamicId.value) {
        alertMsg.value = '無法取得動態編號';
        alertVisible.value = true;
        setTimeout(() => alertVisible.value = false, 2000);
        return;
    }
    if (!currentUser.id) {
        alertMsg.value = '請先登入會員';
        alertVisible.value = true;
        setTimeout(() => alertVisible.value = false, 2000);
        return;
    }
    if (!commentInput.value.trim() && imgList.value.length === 0 && !videoItem.value) {
        alertMsg.value = '評論內容不可為空';
        alertVisible.value = true;
        setTimeout(() => alertVisible.value = false, 2000);
        return;
    }

    const formData = new FormData();
    formData.append('dynamic_id', curDynamicId.value);
    formData.append('user_id', currentUser.id);
    formData.append('reply_id', '');
    formData.append('content', commentInput.value.trim());
    imgList.value.forEach(item => formData.append('images', item.file));
    if (videoItem.value) formData.append('video', videoItem.value.file);

    try {
        const { data } = await request.post('/api/dynamiclndex/add', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (data.code === 1) {
            closeCommentModal();
            const targetItem = dynamicList.value.find(d => d.dynamic_id === curDynamicId.value);
            if (targetItem) {
                targetItem.comment_num += 1;
                const cacheStr = localStorage.getItem('tab_all_cache');
                if (cacheStr) {
                    const cacheArr = JSON.parse(cacheStr);
                    cacheArr.forEach((tab: any) => {
                        const cItem = tab.list.find(d => d.dynamic_id === curDynamicId.value);
                        if (cItem) cItem.comment_num = targetItem.comment_num;
                    })
                    localStorage.setItem('tab_all_cache', JSON.stringify(cacheArr));
                }
            }
        } else {
            alertMsg.value = data.msg || '發送失敗';
            alertVisible.value = true;
        }
    } catch (err) {
        alertMsg.value = '網路異常';
        alertVisible.value = true;
    } finally {
        setTimeout(() => alertVisible.value = false, 2000);
    }
}

// 释放文件资源'
const revokeAllObjectUrl = () => {
    imgList.value.forEach(i => URL.revokeObjectURL(i.preview));
    if (videoItem.value) URL.revokeObjectURL(videoItem.value.preview);
}

let videoObserver: IntersectionObserver | null = null
const videoDomList = ref<HTMLVideoElement[]>([])
//快速评论'
// ====================== 簡易文字評論彈窗（底部輸入框點擊新增=====================
const showSimpleCommentModal = ref(false);
const simpleCommentInput = ref('')
const simpleTextDom = ref<HTMLTextAreaElement | null>(null)
const simpleCurDynamicId = ref('')

// 打開簡易文字評論彈窗'
const openSimpleCommentModal = (item: any) => {
    console.log(item, '11111111111111111111111111111111111111111')
    if (!item?.dynamic_id) return;
    simpleCurDynamicId.value = item.dynamic_id;
    showSimpleCommentModal.value = true;
    // 双层nextTick + 更长延时，解决移动端弹窗渲染后才能聚�?
    nextTick(async () => {
        await nextTick();
        setTimeout(() => {
            simpleTextDom.value?.focus();
        }, 150);
    });
}

// 關閉簡易彈窗'
const closeSimpleCommentModal = () => {
    showSimpleCommentModal.value = false;
    simpleCommentInput.value = '';
    simpleTextDom.value?.blur();
}

// 自適應高：'
const changeSimpleHeight = () => {
    if (!simpleTextDom.value) return;
    simpleTextDom.value.style.height = 'auto';
    simpleTextDom.value.style.height = simpleTextDom.value.scrollHeight + 'px';
}

// 發送僅文字評論（複用接口，不攜帶圖片影片）'
const sendSimpleComment = async () => {
    if (!simpleCurDynamicId.value) {
        alertMsg.value = '無法取得動態編號';
        alertVisible.value = true;
        setTimeout(() => alertVisible.value = false, 2000);
        return;
    }
    if (!currentUser.id) {
        alertMsg.value = '請先登入會員';
        alertVisible.value = true;
        setTimeout(() => alertVisible.value = false, 2000);
        return;
    }
    const content = simpleCommentInput.value.trim()
    if (!content) {
        alertMsg.value = '評論內容不可為空';
        alertVisible.value = true;
        setTimeout(() => alertVisible.value = false, 2000);
        return;
    }

    const formData = new FormData();
    formData.append('dynamic_id', simpleCurDynamicId.value);
    formData.append('user_id', currentUser.id);
    formData.append('reply_id', '');
    formData.append('content', content);
    // 不附加圖片、影片、文'

    try {
        const { data } = await request.post('/api/dynamiclndex/add', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (data.code === 1) {
            closeSimpleCommentModal();
            const targetItem = dynamicList.value.find(d => d.dynamic_id === simpleCurDynamicId.value);
            if (targetItem) {
                targetItem.comment_num += 1;
                const cacheStr = localStorage.getItem('tab_all_cache');
                if (cacheStr) {
                    const cacheArr = JSON.parse(cacheStr);
                    cacheArr.forEach((tab: any) => {
                        const cItem = tab.list.find(d => d.dynamic_id === simpleCurDynamicId.value);
                        if (cItem) cItem.comment_num = targetItem.comment_num;
                    })
                    localStorage.setItem('tab_all_cache', JSON.stringify(cacheArr));
                }
            }
        } else {
            alertMsg.value = data.msg || '發送失敗';
            alertVisible.value = true;
        }
    } catch (err) {
        alertMsg.value = '網路異常';
        alertVisible.value = true;
    } finally {
        setTimeout(() => alertVisible.value = false, 2000);
    }
}
onUnmounted(() => {
    revokeAllObjectUrl()
    videoDomList.value.forEach(dom => {
        videoObserver?.unobserve(dom)
    })
    videoObserver?.disconnect()
    videoObserver = null
})

onMounted(() => {
    videoObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                const vid = entry.target as HTMLVideoElement
                if (entry.isIntersecting) {
                    vid.play().catch(() => { })
                } else {
                    vid.pause()
                }
            })
        },
        { threshold: 0.1 }
    )
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    userlevel.value = user.role_level
    useravatar.value = user.avatar
    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';
    getUserDetail();
});
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
    height: 100vh;
    position: relative;
    /* background-color: #fff; */
}

.content-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow-y: auto;
    overflow-x: hidden;
    box-sizing: border-box;
    overscroll-behavior-y: none;
    height: 100%;
    -webkit-overflow-scrolling: touch;
}

/* 透明頂欄：讓背景圖延伸到劉海區域 */
.allar-top-transparent {
    background: transparent !important;
    border-bottom: none !important;
}
.allar-top-transparent .allar-top-a {
    color: #fff;
    background-color: #2222229c;
    border-radius: 5px;
    height: 30px;
}

.cuekdil {
    width: 100%;
    min-height: 100%;
}

::-webkit-scrollbar {
    display: none;
}

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
}

.preview-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    pointer-events: none;
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

.toast-icon {
    font-size: 30px;
}

.toast-text {
    font-size: 16px;
}

.contenttext {
    font-size: 15px;
    padding-bottom: 10px;
    text-align: left;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: pre-wrap;
    word-break: break-word;
}

.topimage {
    height: 230px;
    width: 100%;
}

.topimage-jrk {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
}

.userteat-all {
    overflow-y: auto;
    overflow-x: hidden;
    height: 100%;
    background-color: #fff;
}

.userteat {
    display: flex;
    flex-direction: column;
}

.userteata {
    margin: -20px 0 0 20px;
    height: 60px;
    width: 60px;
    border-radius: 90px;
    overflow: hidden;
    position: relative;
    border: 2px solid #ffffff;
}

.userteataaq {
    margin: 15px 10px 0 20px;
    height: 30px;
    width: 30px;
    border-radius: 90px;
    overflow: hidden;
    position: relative;
    border: 1px solid #777;
}

.userteataaqas {
    margin-right: 5px;
    height: 30px;
    width: 30px;
    border-radius: 90px;
    overflow: hidden;
    position: relative;
    border: 1px solid #777;
}

.avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.userteataaq-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.userteatb {
    flex: 1;
    padding: 0 20px 20px 20px;
    color: #222;
    text-align: left;
}

.userteatb-one {
    text-align: left;
    margin: 10px 0 0 0;
    display: flex;
    flex-direction: row;
    align-items: flex-end;
}

.userteatb-oneaa {
    font-weight: bold;
    font-size: 15px;
}

.userteatb-onea {
    font-weight: bold;
    font-size: 25px;
}

.userteatb-oneb {
    display: flex;
    text-align: center;
    margin-left: 10px;
    color: #ff33ee;
    margin-bottom: 5px;
}

.user-name-text {
    font-size: 13px;
    color: #333;
    margin-bottom: 10px;
}

.userteatb-two {
    color: #333;
    font-size: 12px;
    word-break: break-all;
    white-space: normal;
}


.separator {
    margin: 0 5px;
    color: #ff33ee;
}

.userteat-all::-webkit-scrollbar {
    display: none;
}

.inage {
    border-width: 5px 0 0 0;
    border-style: solid;
    border-color: #f7f7f7;
    padding-bottom: 20px;
    display: flex;
    flex-direction: column;
}

.dynamic-list-wrap {
    display: flex;
    flex-direction: column;
}

.dynamic-row {
    display: flex;
    flex-direction: row;
}

.dynamic-content {
    display: flex;
    flex-direction: column;
    flex: 1;
    margin-right: 20px;
}

.dynamic-header {
    display: flex;
    flex-direction: row;
    margin-top: 10px;
    /* align-items: center; */
}

/* .icon-group {
    align-items: end;
    margin-left: 5px;
} */

.cert-icon {
    color: #f3bb02;
}

.vip-icon {
    color: #ff33ee;
    padding: 2px 5px;
}

.time-text {
    font-size: 11px;
    padding: 5px 0;
    text-align: left;
}

.username-small {
    font-size: 11px;
    text-align: left;
}

.video-wrap {
    text-align: left;
}

.video-player {
    width: auto;
    max-height: 380px;
    border-radius: 8px;
    object-fit: contain;
    display: block;
    transform: translateZ(0);
    -webkit-transform: translateZ(0);
}

.action-all {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-top: 10px;
    gap: 10px;
}

.action-blt {

    font-size: 14px;
    align-items: center;
    width: 40%;
    /* margin: 0 20px; */
    display: flex;
    flex-direction: row;
}

.action-bar {
    display: flex;
    flex-direction: row;
    font-size: 13px;
    align-items: center;
    width: 60%;
}

.userteataaq-textarea {
    border: 1px solid #bdbdbd;
    border-radius: 50px;
    height: 28px;
    flex: 1;
    background-color: #f5f4f4;
}

.userteataaq-cl {
    font-size: 13px;
    text-align: left;
    padding: 3px 0 3px 10px;
}

.action-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    flex: 1;
}

.action-collect {
    margin-left: 10px;
}

.action-num {
    font-size: 12px;
    margin-left: 4px;
}

.heart-active {
    color: #ff33ee;
}

.collect-active {
    color: #ff33ee;
}

.boot {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 10px 10px 0 0;
}

.bootritt {
    background-color: #edeffc;
    border: 1px solid #d4dcff;
    text-align: right;
    margin-left: auto;
    font-size: 12px;
    padding: 5px 5px 3px 5px;
    border-radius: 5px;
    color: #222;
    cursor: pointer;
    /* box-shadow: 0 0 5px 2px rgba(255, 235, 251, 0.349); */
}

.bootrittaq {
    background-color: #edeffc;
    border: 1px solid #d4dcff;
    margin-left: 5px;
    font-size: 12px;
    padding: 5px 5px 3px 5px;
    border-radius: 5px;
    color: #222;
    cursor: pointer;
    /* box-shadow: 0 0 5px 2px rgba(255, 235, 251, 0.349); */
}

.bootrittaa {
    background-color: #f0f0f0;
    text-align: right;
    margin-left: auto;
    font-size: 13px;
    padding: 2px 10px;
    border-radius: 50px;
    color: #333;
    cursor: pointer;
    box-shadow: 0 0 1px 1px rgba(255, 235, 251, 0.349);
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
    max-height: 330px;
    object-fit: contain;
    background: none;
    border-radius: 5px;
    display: block;
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
    background: #fff;
    border-radius: 5px;
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
    background: #fff;
    border-radius: 5px;
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
    background: #fff;
    border-radius: 5px;
}

.float-publish-btn {
    position: absolute;
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
    z-index: 999;
}

.float-publish-btn:active {
    opacity: 0.8;
}

/*评论弹窗*/
.comment-modal-wrap {
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

.comment-modal-box {
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
    font-size: 15px;
    border-radius: 15px 15px 0 0;
}

.cancel-btn {
    color: #000;
    cursor: pointer;
}

.upload-btn-group {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 5px 15px 0 15px;
}

.upload-label {
    cursor: pointer;
}

.hidden-input {
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

.comment-textarea {
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

.video-preview-item {
    width: 75%;
    height: auto;
    position: relative;
}

.preview-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 4px;
}

.close-mark {
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

.buttdgrc {
    background-color: rgb(105, 0, 131);
    padding: 7px 15px;
    font-size: 13px;
    border-radius: 4px;
    color: #ffffff;
    cursor: pointer;
    text-align: center;
}

.buttdgrc.disabledBtn {
    pointer-events: none;
    cursor: not-allowed;
    opacity: 0.6;
    color: #ffffff;
}

.empty-bottom {
    height: 50px;
    width: 100%;
    flex: 1;
    display: flex;
}

/*簡易文字評論彈窗*/
.simple-comment-modal-wrap {
    position: fixed;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    display: flex;
    justify-content: center;
    overflow: hidden;
    touch-action: none;
    /* border-radius: 30px 30px 0 0; */

}

.simple-comment-modal-box {
    width: 100%;
    max-width: 500px;
    background: #fff;
    display: flex;
    flex-direction: column;
    /* 貼近底部，和輸入框體驗一级列表*/
    margin-top: auto;
    min-height: 160px;
    border-radius: 15px 15px 0 0;
    transition: transform 0.24s ease;
}

.simple-comment-modal-wrap {
    background: rgba(0, 0, 0, 0.4);
}


</style>