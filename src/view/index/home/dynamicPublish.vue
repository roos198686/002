<template>
    <div class="main">
        <div class="publish-container">
            <!-- 顶部导航 -->
            <div class="allar-top">
                <div class="allar-top-a" @click="goBack">
                    取消
                </div>
                <div class="allar-top-r">發布動態</div>
                <div class="publish-btn" :class="{ disabledBtn: !(imgList.length > 0 || videoItem || content) }"
                    @click="submitPublish">發布</div>
            </div>
            <!-- 上传按钮�?-->
            <div class="upload-bar">
                <label class="upload-label">
                    <input type="file" accept="image/*" multiple @change="handleImageUpload" hidden />
                    <div
                        style="border: 1px solid #ccc;padding: 3px 7px;border-radius: 6px;background-color: #eee;display: flex;align-items: center;">
                        <Icon icon="majesticons:image" height="30px" />
                    </div>
                </label>
                <label class="upload-label">
                    <input type="file" accept="video/*" @change="handleVideoUpload" hidden />
                    <div
                        style="border: 1px solid #ccc;padding: 3px 7px;border-radius: 6px;background-color: #eee;display: flex;align-items: center;">
                        <Icon icon="fluent:video-28-filled" height="30px" />
                    </div>
                </label>
            </div>
            <!-- 内容输入會員-->
            <div class="content-wrapper">
                <div style="display: flex;padding: 0 15px;">
                    <textarea ref="textDom" v-model="content" placeholder="分享你的動態..." class="publish-textarea"
                        @input="changeHeight" maxlength="700" inputmode="text"
                        style="touch-action: manipulation;"></textarea>
                </div>
                <!-- 新增字数提示 -->
                <div style="padding: 0 15px 10px; text-align: right; color:#666; font-size: 12px;">
                    {{ content.length }} / 700
                </div>
                <!-- 预览区域 -->
                <div class="bootkldl">
                    <div class="preview-list">
                        <!-- 图片预览 -->
                        <div v-for="(item, idx) in imgList" :key="idx" class="preview-item">
                            <img :src="item.preview" alt="" />
                            <span class="del-btn" @click="delImg(idx)">×</span>
                        </div>
                        <!-- 视频预览 -->
                        <div v-if="videoItem" class="preview-itemaa">
                            <video :src="videoItem.preview"></video>
                            <span class="del-btn" @click="delVideo">×</span>
                        </div>
                    </div>

                </div>

            </div>
        </div>

        <!-- 提示弹窗 -->
        <div class="copy-toast" v-if="showToast">
            <div style="font-size: 30px;">
                <Icon icon="iconoir:check" width="58" />
            </div>
            <div class="toast-text">{{ toastText }}</div>
        </div>
        <div v-if="alertVisible" class="custom-modal">
            <div class="modal-box" @click.stop>
                <Icon icon="iconoir:xmark" width="58" />
                <div class="modal-text">{{ alertMsg }}</div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onUnmounted, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import router from '@/router'
import request from '@/utils/request'




// 用户信息'
const userData = JSON.parse(localStorage.getItem('user') || '{}')
const currentUser = reactive({
    id: userData.id || ''
})

// 表单'
const content = ref('')
const textDom = ref<HTMLTextAreaElement | null>(null)

// 上传文件'
const imgList = ref<{ file: File; preview: string }[]>([])
const videoItem = ref<{ file: File; preview: string } | null>(null)

// 弹窗'
const showToast = ref(false)
const toastText = ref('')
const alertVisible = ref(false)
const alertMsg = ref('')

// 返回上一级列表'
const goBack = () => {
    router.back()
}

// 文本域自动高：'
const changeHeight = () => {
    if (!textDom.value) return
    textDom.value.style.height = 'auto'
    textDom.value.style.height = textDom.value.scrollHeight + 'px'
}

// 选择图片'
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
        alertVisible.value = true
        alertMsg.value = '最多只能上傳張圖片'
        setTimeout(() => alertVisible.value = false, 2000)
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

// 选择视频'
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

// 删除图片
const delImg = (index: number) => {
    URL.revokeObjectURL(imgList.value[index].preview)
    imgList.value.splice(index, 1)
}

// 删除视频'
const delVideo = () => {
    if (videoItem.value) {
        URL.revokeObjectURL(videoItem.value.preview)
        videoItem.value = null
    }
}

// 提交发布动态数据'
const submitPublish = async () => {
    if (!currentUser.id) {
        alertVisible.value = true
        alertMsg.value = '請先登入會員'
        setTimeout(() => alertVisible.value = false, 2000)
        return
    }
    if (!content.value.trim() && imgList.value.length === 0 && !videoItem.value) {
        alertVisible.value = true
        alertMsg.value = '動態內容不可為空'
        setTimeout(() => alertVisible.value = false, 2000)
        return
    }

    const userStr = localStorage.getItem('user');
    const userInfo = userStr ? JSON.parse(userStr) : {};
    const group_user = userInfo.group_user || 0;
    // 前端生成 dynamic_id（和你标准代码完全一致）'
    const dynamicId = Date.now() + '' + Math.random().toString(36).slice(2, 10)

    const formData = new FormData()
    // 依次挂载所有字段，和你标准代码对齐'
    formData.append('user_id', currentUser.id)
    formData.append('content', content.value.trim())
    formData.append('dynamic_id', dynamicId)
    formData.append('group_user', group_user)
    formData.append('username', userInfo.username || '')
    formData.append('avatar', userInfo.avatar || '')
    formData.append('nickname', userInfo.nickname || '')

    // 图片/视频 统一使用 image_files，和后端 multer 匹配'
    if (imgList.value.length > 0) {
        imgList.value.forEach(item => {
            formData.append('image_files', item.file)
        })
    } else if (videoItem.value) {
        formData.append('image_files', videoItem.value.file)
    }

    try {
        const { data } = await request.post('/api/dynamicPublish/batchImage', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })

        if (data.code === 1) {
            showToast.value = true
            toastText.value = '發布成功'
            setTimeout(() => {
                showToast.value = false
                router.back()
            }, 1500)
        } else {
            alertVisible.value = true
            alertMsg.value = data.msg || '發布失敗'
            setTimeout(() => alertVisible.value = false, 2000)
        }
    } catch (err) {
        console.error(err)
        alertVisible.value = true
        alertMsg.value = '網路異常，請稍後再試'
        setTimeout(() => alertVisible.value = false, 2000)
    }
}

// 释放资源
const revokeAllObjectUrl = () => {
    imgList.value.forEach(item => URL.revokeObjectURL(item.preview))
    if (videoItem.value) URL.revokeObjectURL(videoItem.value.preview)
}
const preventPageScroll = (e: TouchEvent) => {
    // 阻止页面整体滑动'
    e.preventDefault()
}

onMounted(() => {
    // 给根元素绑定事件'
    document.body.addEventListener('touchmove', preventPageScroll, { passive: false })
})

onUnmounted(() => {
    revokeAllObjectUrl()
    document.body.removeEventListener('touchmove', preventPageScroll)
})
</script>

<style scoped>
html,
body {
    width: 100%;
    height: 100%;
    /* 禁止滚动态数据+ 禁止滑动 */
    overflow: hidden;
    /* 禁用页面拖拽、滚动穿�?*/
    touch-action: none;
    margin: 0;
    padding: 0;
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
    /* 全局禁止滚动 */
}

.publish-container {
    width: 100%;
    max-width: 500px;
    height: 100vh;
    margin: 0 auto;
    background-color: #fff;
    display: flex;
    flex-direction: column;

}

.allar-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 9px 0;
    padding-top: calc(9px + env(safe-area-inset-top));
    background: #f7f7f7;
    flex-shrink: 0;
    z-index: 999;
    height: 25px;
}

.allar-top-a {
    color: #000;
    width: 50px;
    display: flex;
    cursor: pointer;
    margin-left: 15px;
}

.allar-top-r {
    font-size: 15px;
    font-weight: bold;
    color: #000;
}

.publish-btn {
    background-color: #ff33ee;
    padding: 5px 15px;
    font-size: 14px;
    border-radius: 4px;
    color: #fff;
    cursor: pointer;
    margin-right: 15px;
}
.publish-btn.disabledBtn {
    pointer-events: none;
    cursor: not-allowed;
    opacity: 0.6;
    color: #fff;
}
.content-wrapper {
    flex: 1;
    /* padding-top: 10px; */
    overflow-y: auto;
    font-size: 14px;
    display: flex;
    flex-direction: column;
    background: #fff;
}

.publish-textarea {
    width: 100%;
    border: none;
    resize: none;
    outline: none;
    font-size: 14px;
    line-height: 1.5;
}

.preview-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: auto;
    padding: 0 15px;
    width: 100%;
    height: 70px;
}

.upload-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 12px 15px;
    background-color: #fff;
}

.bootkldl {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    flex-direction: column;
    padding: 0 15px;
}

.upload-label {
    cursor: pointer;
}

.preview-item {
    width: 48%;
    height: 120px;
    position: relative;
}

.preview-item img,
.preview-item video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 4px;
}

.preview-itemaa {
    width: 75%;
    height: auto;
    position: relative;
}

.preview-itemaa video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 4px;
}

.del-btn {
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

.custom-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    color: #fff;
}

.modal-box {
    background: rgba(0, 0, 0, 0.82);
    border-radius: 14px;
    padding: 24px 28px;
    display: flex;
    flex-direction: column;
    min-width: 200px;
    max-width: 72%;
    text-align: center;
    align-items: center;
    justify-content: center;
    gap: 10px;
    box-sizing: border-box;
}

::-webkit-scrollbar {
    display: none;
}
</style>