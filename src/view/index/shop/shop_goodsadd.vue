<template>
    <div class="main">
        <div class="register-container">
            <div class="register-all">
                <!-- 頂部標題�?-->
                <div class="allar-top">
                    <div @click="goBack" class="back-icon">
                        <Icon icon="material-symbols:arrow-back-ios-rounded" width="18" />
                    </div>
                    <div class="allar-top-a">新增商品</div>
                </div>
                <div class="form-wrap">
                    <div class="form-item">
                        <label>商品名稱</label>
                        <el-input v-model="form.name" placeholder="請輸入商品名稱" clearable />
                    </div>
                    <div style="display: flex;flex-wrap: wrap;gap: 10px;">
                        <div class="form-item" style="flex: 1 1 calc(50% - 5px);min-width: 140px;">
                            <label>商品售價</label>
                            <el-input v-model.number="form.price" placeholder="請輸入售價" type="number" />
                        </div>
                        <div class="form-item" style="flex: 1 1 calc(50% - 5px);min-width: 140px;">
                            <label>庫存數量</label>
                            <el-input v-model.number="form.stock" placeholder="請輸入庫存" type="number" />
                        </div>
                        <div class="form-item" style="flex: 1 1 calc(50% - 5px);min-width: 140px;">
                            <label>商品銷量</label>
                            <el-input v-model.number="form.sales" placeholder="請輸入銷量" type="number" />
                        </div>
                        <div class="form-item" style="flex: 1 1 calc(50% - 5px);min-width: 140px;">
                            <label>收藏數量</label>
                            <el-input v-model.number="form.like" placeholder="請輸入收藏數" type="number" />
                        </div>
                        <div class="form-item" style="flex: 1 1 calc(50% - 5px);min-width: 140px;">
                            <label>商品材質</label>
                            <el-input v-model="form.material" placeholder="商品材質" />
                        </div>
                        <div class="form-item" style="flex: 1 1 calc(50% - 5px);min-width: 140px;">
                            <label>商品顏色</label>
                            <el-input v-model="form.color" placeholder="例：黑色/白色/藍色" />
                        </div>
                        <div class="form-item" style="flex: 1 1 calc(50% - 5px);min-width: 140px;">
                            <label>商品規格</label>
                            <el-input v-model="form.spec" placeholder="例：L/XL/256G" />
                        </div>
                    </div>
                    <div style="display: flex;flex-direction: row;flex-wrap: wrap;margin: 10px 0;">
                        <div class="form-item" style="display: flex;flex-direction: column;gap: 10px;">
                            <label>商品主圖</label>
                            <div class="upload-wrap">
                                <el-upload :auto-upload="false" list-type="picture-card" :file-list="coverList"
                                    :limit="1" accept="image/*" @change="onCoverChange" @remove="onCoverRemove"
                                    @preview="openPreview">
                                    <template #default>
                                        <div style="font-size: 13px;">點擊選圖</div>
                                    </template>
                                </el-upload>
                            </div>
                        </div>
                        <div class="form-item" style="display: flex;flex-direction: column;gap: 10px;">
                            <label>商品詳情圖</label>
                            <div class="upload-wrap">
                                <el-upload :auto-upload="false" list-type="picture-card" :file-list="detailImgList"
                                    multiple accept="image/*" @change="onDetailChange" @remove="onDetailRemove"
                                    @preview="openPreview">
                                    <template #default>
                                        <div style="font-size: 13px;">多選圖片</div>
                                    </template>
                                </el-upload>
                            </div>
                        </div>
                    </div>
                    <div class="form-item" style="display: flex;flex-direction: column;gap: 10px;">
                        <label>商品簡介</label>
                        <el-input v-model="form.intro" type="textarea" :rows="3" placeholder="填寫商品簡介" />
                    </div>
                    <div class="form-item" style="display: flex;align-items: center;">
                        <label>商品狀態</label>
                        <el-radio-group v-model.number="form.status">
                            <el-radio :label="1">上架</el-radio>
                            <el-radio :label="0">下架</el-radio>
                        </el-radio-group>
                    </div>
                    <div class="btn-box">
                        <div class="submit-btn" @click="submitGoods" :class="{ loading: submitLoading }">
                            <span v-if="!submitLoading">送出儲存</span>
                            <span v-else class="loading-dot"></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 圖片預覽彈窗 -->
        <el-dialog v-model="previewDialog" width="60%" append-to-body class="dark-dialog">
            <img :src="previewImgSrc" style="width:100%" />
        </el-dialog>
    </div>
</template>

<script lang="ts" setup>
import { ref, onUnmounted } from 'vue'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'
import type { UploadFile } from 'element-plus'
import router from '@/router'
import { Icon } from '@iconify/vue'
const uploadApi = '/api/upload'
const REQ_TIMEOUT = 30000
const goBack = () => router.go(-1)
const form = ref({
    name: '',
    price: 0,
    stock: 0,
    sales: 0,
    like: 0,
    intro: '',
    status: 1,
    color: '',
    spec: '',
    material: '',
    coverFile: null as File | null,
    detailFileArr: [] as File[],
    cover: '',
    detail_images: [] as string[],
})

const coverList = ref<UploadFile[]>([])
const detailImgList = ref<UploadFile[]>([])
const submitLoading = ref(false)

const previewDialog = ref(false)
const previewImgSrc = ref('')
const blobUrlList: string[] = []

const openPreview = (file: UploadFile) => {
    previewImgSrc.value = file.url!
    previewDialog.value = true
}

const onCoverChange = (file: UploadFile) => {
    const localUrl = URL.createObjectURL(file.raw!)
    blobUrlList.push(localUrl)
    file.url = localUrl
    coverList.value = [file]
    form.value.coverFile = file.raw!
}

const onCoverRemove = () => {
    form.value.coverFile = null
    coverList.value = []
}

const onDetailChange = (file: UploadFile) => {
    const localUrl = URL.createObjectURL(file.raw!)
    blobUrlList.push(localUrl)
    file.url = localUrl
    detailImgList.value.push(file)
    form.value.detailFileArr.push(file.raw!)
}

const onDetailRemove = (file: UploadFile) => {
    const i = detailImgList.value.findIndex(x => x.uid === file.uid)
    if (i > -1) {
        detailImgList.value.splice(i, 1)
        form.value.detailFileArr.splice(i, 1)
    }
}

const uploadSingleFile = async (file: File) => {
    const fd = new FormData()
    fd.append('file', file)
    const res = await request.post(uploadApi, fd, { timeout: REQ_TIMEOUT })
    return res.data
}

const batchUploadDetailImages = async (files: File[]) => {
    if (!files.length) return []
    const uploadTasks = files.map(file => uploadSingleFile(file))
    const results = await Promise.allSettled(uploadTasks)
    const paths: string[] = []
    results.forEach((item, idx) => {
        if (item.status === 'fulfilled' && item.value.code === 1) {
            paths.push(item.value.data)
        } else {
            ElMessage.warning(`第{idx + 1}張詳情圖上傳失敗，已自動略過`)
        }
    })
    return paths
}
const getUserInfo = () => {
    const u = localStorage.getItem('user');
    if (!u) return null;
    return JSON.parse(u);
};
const submitGoods = async () => {
    const user = getUserInfo();
    if (!user || !user.id) return;
    const data = form.value
    if (!data.name.trim()) return ElMessage.warning('請填寫商品名稱')
    if (!data.price || data.price <= 0) return ElMessage.warning('商品售價必須大於0')
    if (!data.material.trim()) return ElMessage.warning('請填寫商品材質')
    if (!data.coverFile) return ElMessage.warning('請上傳商品主圖')
    if (data.stock < 0) return ElMessage.warning('庫存不可為負數')
    if (data.sales < 0) return ElMessage.warning('銷量不可為負數')
    if (data.like < 0) return ElMessage.warning('收藏數不可為負數')

    submitLoading.value = true
    try {
        const coverRes = await uploadSingleFile(data.coverFile)
        if (coverRes.code !== 1) throw new Error('商品主圖上傳失敗，請重新選擇圖片')
        data.cover = coverRes.data

        data.detail_images = await batchUploadDetailImages(data.detailFileArr)

        const submitParams = {
            user_id: user.id,
            name: data.name.trim(),
            price: data.price,
            stock: data.stock,
            sales: data.sales,
            like: data.like,
            intro: data.intro.trim(),
            status: data.status,
            color: data.color.trim(),
            spec: data.spec.trim(),
            material: data.material.trim(),
            cover: data.cover,
            detail_images: data.detail_images
        }
        const { data: submitRes } = await request.post('/api/shop_goodsadd/create', submitParams, {
            timeout: REQ_TIMEOUT
        })

        if (submitRes.code === 1) {
            ElMessage.success('新增商品成功')
            form.value = {
                name: '', color: '', spec: '', material: '', price: 0, stock: 0, sales: 0, like: 0, intro: '', status: 1,
                coverFile: null, detailFileArr: [], cover: '', detail_images: []
            }
            coverList.value = []
            detailImgList.value = []
        } else {
            ElMessage.error(submitRes.msg || '商品儲存失敗')
        }
    } catch (err: any) {
        console.error('提交失敗：', err)
        if (err.message?.includes('timeout') || err.code === 'ECONNABORTED') {
            ElMessage.error('請求逾時，請檢查圖片大小或網路後重試，建議單張圖片不超過2M')
        } else {
            ElMessage.error(err.message || '操作失敗，請稍後再試')
        }
    } finally {
        submitLoading.value = false
    }
}

onUnmounted(() => {
    blobUrlList.forEach(url => URL.revokeObjectURL(url))
    blobUrlList.length = 0
})
</script>

<style scoped>
:global(html),
:global(body) {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden !important;
  position: fixed;
  width: 100%;
}
/* 全局外层容器 异常你现有页面完全统一 */
.main {
     position: fixed;
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
    position: relative;
    height: 100%;
    overflow: hidden;
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
}

.allar-top-a {
    font-size: 15px;
    font-weight: bold;
    color: #8a6520;
    text-align: center;
    width: 100%;
    margin-right: 25px;
}

/* 頂部標題 */
.back-icon {
    color: #a88350;
    cursor: pointer;
    margin-left: 15px;
}
/* 滚动条隐�?同现有风�?*/
.register-all::-webkit-scrollbar {
    display: none;
}

/* 表单外层 深灰底色 统一内容区风�?*/
.form-wrap {
    width: 100%;
    background: #fff;
    /* border-radius: 6px; */
    padding: 15px 15px 100px 15px;
    box-sizing: border-box;
    margin-top: 40px;
    max-height: calc(100vh - 60px);
    overflow-y: auto;
    overflow-x: hidden;
    ::-webkit-scrollbar {
        display: none;
    }
    -ms-overflow-style: none;
    scrollbar-width: none;
}

/* 表单项布局 */
.form-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 18px;
    width: 100%;
}

.form-item label {
    min-width: 70px;
    margin-right: 8px;
    padding-top: 8px;
    text-align: left;
    font-size: 13px;
    white-space: nowrap;
    color: #666;
    /* 文字浅灰 统一色调 */
}

/* ElementPlus 组件深度样式覆盖 暗黑适配 */
.form-item :deep(.el-input__wrapper) {
    background-color: #fff;
    box-shadow: none;
}

.form-item :deep(.el-input__inner) {
    color: #333;
    background: transparent;
}

.form-item :deep(.el-textarea__inner) {
    background-color: #fff;
    color: #333;
    border: none;
}

.form-item :deep(.el-select__wrapper) {
    background-color: #fff;
    box-shadow: none;
}

.form-item :deep(.el-select__placeholder) {
    color: #666;
}

.form-item :deep(.el-select__label) {
    color: #333;
}

.form-item :deep(.el-radio__label) {
    color: #666;
}

/* 上传区域样式 保持原有尺寸 */
.upload-wrap {
    flex: 1;
    text-align: left;
}

.upload-wrap :deep(.el-upload) {
    width: 100px;
    height: 100px;
}

.upload-wrap :deep(.el-upload-list__item) {
    width: 100px !important;
    height: 100px !important;
    margin: 0 !important;
}

.upload-wrap :deep(.el-upload-list__item-thumbnail) {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
}

.upload-wrap :deep(.el-upload-dragger) {
    width: 100% !important;
    height: 100% !important;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
    border-color: #555;
    color: #666;
}

/* 按钮区域 */
.btn-box {
    margin-top: 10px;
    display: flex;
    justify-content: flex-start;
}

/* 提交按钮 配色、hover 完全沿用你现有按钮风�?*/
.submit-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 160px;
    height: 30px;
    background-color: #ff33ee;
    color: #fff;
    border-radius: 4px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
    outline: none;
}

.submit-btn:hover {
    background-color: #f8d3ba;
    color: #000;
}

.submit-btn:active {
    background-color: #fa741a;
}

.submit-btn.loading {
    pointer-events: none;
    opacity: 0.8;
}

/* 加载动画 */
.loading-dot {
    width: 16px;
    height: 16px;
    border: 2px solid #fff;
    border-top-color: transparent;
    border-radius: 50%;
    animation: rotate 0.6s linear infinite;
}

@keyframes rotate {
    to {
        transform: rotate(360deg);
    }
}

/* 弹窗暗黑适配 */
:deep(.dark-dialog .el-dialog) {
    background: #fff;
}

:deep(.dark-dialog .el-dialog__header) {
    border-bottom: 1px solid #444;
}

:deep(.dark-dialog .el-dialog__title) {
    color: #333;
}

:deep(.dark-dialog .el-dialog__close) {
    color: #666;
}
</style>