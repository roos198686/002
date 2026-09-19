<template>
    <div class="maina">
        <div class="all">
            <div class="form-wrap" style="padding-bottom: 100px;">
                <div class="form-item">
                    <label>商品名称</label>
                    <el-input v-model="form.name" placeholder="请输入商品名称" clearable />
                </div>
                <div style="display: flex;flex-direction: row;gap: 10px;">
                    <div class="form-item" style="flex: 1;">
                        <label>商品售价</label>
                        <el-input v-model.number="form.price" placeholder="请输入售价" type="number" />
                    </div>
                    <div class="form-item" style="flex: 1;">
                        <label>商品分类</label>
                        <el-select v-model="form.category" placeholder="请选择商品规格" clearable>
                            <el-option label="美妝保養" value="1"></el-option>
                            <el-option label="輕奢鞋包" value="2"></el-option>
                            <el-option label="飾品配件" value="3"></el-option>
                            <el-option label="情趣用品" value="4"></el-option>
                            <el-option label="電子數位" value="5"></el-option>
                        </el-select>
                    </div>
                    <div class="form-item" style="flex: 1;">
                        <label>库存数量</label>
                        <el-input v-model.number="form.stock" placeholder="请输入库存" type="number" />
                    </div>
                    <!-- 新增：销量：-->
                    <div class="form-item" style="flex: 1;">
                        <label>商品销量：</label>
                        <el-input v-model.number="form.sales" placeholder="请输入销量" type="number" />
                    </div>
                    <!-- 新增：收藏数 -->
                    <div class="form-item" style="flex: 1;">
                        <label>收藏数量</label>
                        <el-input v-model.number="form.like" placeholder="请输入收藏数" type="number" />
                    </div>
                    <div class="form-item" style="flex: 1;">
                        <label>商品材质</label>
                        <el-input v-model="form.material" placeholder="商品材质" />
                    </div>

                    <div class="form-item" style="flex: 1;">
                        <label>商品颜色</label>
                        <el-input v-model="form.color" placeholder="例：黑色/白色/蓝色" />
                    </div>
                    <div class="form-item" style="flex: 1;">
                        <label>商品规格</label>
                        <el-input v-model="form.spec" placeholder="例：L/XL/256G" />
                    </div>
                </div>
                <!-- 主图：上传前本地预览 -->
                <div style="display: flex;flex-direction: row;gap: 20px;">
                    <div class="form-item" style="display: flex;flex-direction: column;gap: 10px;">
                        <label>商品主图</label>
                        <div class="upload-wrap">
                            <el-upload :auto-upload="false" list-type="picture-card" :file-list="coverList" :limit="1"
                                accept="image/*" @change="onCoverChange" @remove="onCoverRemove" @preview="openPreview">
                                <template #default>
                                    <div>点击选图</div>
                                </template>
                            </el-upload>
                        </div>
                    </div>

                    <!-- 详情多图：上传前预览 -->
                    <div class="form-item" style="display: flex;flex-direction: column;gap: 10px;">
                        <label>商品详情趣用品</label>
                        <div class="upload-wrap">
                            <el-upload :auto-upload="false" list-type="picture-card" :file-list="detailImgList" multiple
                                accept="image/*" @change="onDetailChange" @remove="onDetailRemove"
                                @preview="openPreview">
                                <template #default>
                                    <div>多选图片</div>
                                </template>
                            </el-upload>
                        </div>
                    </div>
                </div>
                <div class="form-item" style="display: flex;flex-direction: column;gap: 10px;">
                    <label>商品简介</label>
                    <el-input v-model="form.intro" type="textarea" :rows="3" placeholder="填写商品简介" />
                </div>

                <div class="form-item" style="display: flex;align-items: center;">
                    <label>商品状态</label>
                    <el-radio-group v-model.number="form.status">
                        <el-radio :label="1">上架</el-radio>
                        <el-radio :label="0">下架</el-radio>
                    </el-radio-group>
                </div>

                <div class="btn-box">
                    <div class="submit-btn" @click="submitGoods" :class="{ loading: submitLoading }"  :style="userInfo.status != 3 ? '' : 'pointer-events: none;background-color: #ddd;'">
                        <span v-if="!submitLoading">提交保存</span>
                        <span v-else class="loading-dot"></span>
                    </div>
                </div>
            </div>
        </div>

        <!-- 图片预览弹窗 -->
        <el-dialog v-model="previewDialog" width="60%" append-to-body>
            <img :src="previewImgSrc" style="width:100%" />
        </el-dialog>
    </div>
</template>

<script lang="ts" setup>
import { ref, onUnmounted, reactive } from 'vue'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'
import type { UploadFile } from 'element-plus'
const userInfo = reactive(JSON.parse(localStorage.getItem("adminuser") || "{}"));
const uploadApi = '/api/upload'
// 定义请求超时时间 30s
const REQ_TIMEOUT = 30000

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
  category: '',
  material: '',
  coverFile: null as File | null,
  detailFileArr: [] as File[],
  cover: '',
  detail_images: [] as string[],
})

const coverList = ref<UploadFile[]>([])
const detailImgList = ref<UploadFile[]>()
const submitLoading = ref(false)

const previewDialog = ref(false)
const previewImgSrc = ref('')
const blobUrlList: string[] = []

// 打开大图预览
const openPreview = (file: UploadFile) => {
  previewImgSrc.value = file.url!
  previewDialog.value = true
}

// 主图选择
const onCoverChange = (file: UploadFile) => {
  const localUrl = URL.createObjectURL(file.raw!)
  blobUrlList.push(localUrl)
  file.url = localUrl
  coverList.value = [file]
  form.value.coverFile = file.raw!
}

// 删除主图
const onCoverRemove = () => {
  form.value.coverFile = null
  coverList.value = []
}

// 详情图选择'
const onDetailChange = (file: UploadFile) => {
  const localUrl = URL.createObjectURL(file.raw!)
  blobUrlList.push(localUrl)
  file.url = localUrl
  detailImgList.value.push(file)
  form.value.detailFileArr.push(file.raw!)
}

// 删除详情趣用品'
const onDetailRemove = (file: UploadFile) => {
  const i = detailImgList.value.findIndex(x => x.uid === file.uid)
  if (i > -1) {
    detailImgList.value.splice(i, 1)
    form.value.detailFileArr.splice(i, 1)
  }
}

// 封装单文件上传函数（抽离复用，增加超时、捕获单张图片错误）'
const uploadSingleFile = async (file: File) => {
  const fd = new FormData()
  fd.append('file', file)
  // 给上传接口单独传超时配置，如果request支持自定义config
  const res = await request.post(uploadApi, fd, { timeout: REQ_TIMEOUT })
  return res.data
}

// 批量并行上传详情图（解决串行超时核心优化�?
const batchUploadDetailImages = async (files: File[]) => {
  if (!files.length) return []
  // 所有图片同时发起请求，大幅缩短耗时'
  const uploadTasks = files.map(file => uploadSingleFile(file))
  const results = await Promise.allSettled(uploadTasks)
  const paths: string[] = []
  // 过滤上传成功的图片，失败的提示不阻断整体提交'
  results.forEach((item, idx) => {
    if (item.status === 'fulfilled' && item.value.code === 1) {
      paths.push(item.value.data)
    } else {
      ElMessage.warning(`-fi{idx + 1}张详情图上传失败，已自动跳过`)
    }
  })
  return paths
}

// 提交商品'
const submitGoods = async () => {
  const data = form.value
  // ========== 强化表单校验 ==========
  if (!data.name.trim()) return ElMessage.warning('请填写商品名稱搜尋')
  if (!data.price || data.price <= 0) return ElMessage.warning('商品售价必须大于0')
  if (!data.category) return ElMessage.warning('请选择商品分类')
  if (!data.material.trim()) return ElMessage.warning('请填写商品材質')
  if (!data.coverFile) return ElMessage.warning('请上传商品主圖')
  if (data.stock < 0) return ElMessage.warning('库存不能为负数')
  if (data.sales < 0) return ElMessage.warning('销量不能为负数')
  if (data.like < 0) return ElMessage.warning('收藏数不能为负数')

  submitLoading.value = true
  try {
    // 1.上传主图'
    const coverRes = await uploadSingleFile(data.coverFile)
    if (coverRes.code !== 1) throw new Error('商品主图上传失败，请重新选择图片')
    data.cover = coverRes.data

    // 2.并行批量上传详情图（关键优化，解决串行超时）'
    data.detail_images = await batchUploadDetailImages(data.detailFileArr)

    // 3.提交商品基础数据'
    const submitParams = {
      name: data.name.trim(),
      price: data.price,
      stock: data.stock,
      sales: data.sales,
      like: data.like,
      intro: data.intro.trim(),
      status: data.status,
      color: data.color.trim(),
      spec: data.spec.trim(),
      category: data.category,
      material: data.material.trim(),
      cover: data.cover,
      // 重点：不要JSON.stringify！后端接收数组直接传数组，避免解析报失败：'
      detail_images: data.detail_images
    }
    const { data: submitRes } = await request.post('/api/mall/create', submitParams, {
      timeout: REQ_TIMEOUT
    })

    if (submitRes.code === 1) {
      ElMessage.success('新增商品成功')
      // 重置表单'
      form.value = {
        name: '', color: '', spec: '', category: '', material: '', price: 0, stock: 0, sales: 0, like: 0, intro: '', status: 1,
        coverFile: null, detailFileArr: [], cover: '', detail_images: []
      }
      coverList.value = []
      detailImgList.value = []
    } else {
      ElMessage.error(submitRes.msg || '商品保存失败')
    }
  } catch (err: any) {
    console.error('提交失败：', err)
    // 区分超时错误提示'
    if (err.message?.includes('timeout') || err.code === 'ECONNABORTED') {
      ElMessage.error('请求超时，请检查图片大小或网络后重试，建议单张图片不超過2MM')
    } else {
      ElMessage.error(err.message || '操作失败，请稍后重试')
    }
  } finally {
    submitLoading.value = false
  }
}

// 销毁页面释放本地预览图内存'
onUnmounted(() => {
  blobUrlList.forEach(url => URL.revokeObjectURL(url))
  blobUrlList.length = 0
})
</script>

<style scoped>
.maina {
    padding: 20px 50px 20px 20px;
}

.search-box {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    gap: 10px;
}

.search-label {
    white-space: nowrap;
    font-size: 14px;
}

.form-wrap {
    border-radius: 6px;
    background: #fff;
}

.form-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 18px;
    
}

.form-item label {
    /* width: 100px; */
    margin-right: 5px;
    padding-top: 8px;
    text-align: left;
    font-size: 13px;
    white-space: nowrap;
}

.form-item :deep(.el-input) {
    flex: 1;
}

.upload-wrap {
    flex: 1;
    text-align: left;
}

.btn-box {
    margin-top: 10px;
}

.upload-wrap :deep(.el-upload) {
    width: 100px;
    /* 更小的预览区�?*/
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
    /* 铺满 + 不变�?*/
}

.upload-wrap :deep(.el-upload-dragger) {
    width: 100% !important;
    height: 100% !important;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* 按钮容器 */
.btn-box {
    margin-top: 10px;
    display: flex;
    justify-content: flex-start;
}

/* 主按钮样式（会影响el-button primaryno*/
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

/* 加载状态*/
.submit-btn.loading {
    pointer-events: none;
    opacity: 0.8;
}

/* 加载点点动画 */
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
</style>