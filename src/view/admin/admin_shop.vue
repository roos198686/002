<template>
    <div class="admin-page">
        <div class="page-title">商品上传</div>

        <el-card>
            <el-form label-width="90px" class="goods-form">
                <!-- 商品名称 -->
                <el-form-item label="商品名称">
                    <el-input v-model="form.name" placeholder="请输入商品名称" clearable />
                </el-form-item>

                <!-- 规格参数 -->
                <div class="form-grid">
                    <el-form-item label="商品售价">
                        <el-input v-model.number="form.price" placeholder="请输入售价" type="number" />
                    </el-form-item>
                    <el-form-item label="商品分类">
                        <el-select v-model="form.category" placeholder="请选择商品规格" clearable style="width: 100%;">
                            <el-option label="美妝保養" value="1" />
                            <el-option label="輕奢鞋包" value="2" />
                            <el-option label="飾品配件" value="3" />
                            <el-option label="情趣用品" value="4" />
                            <el-option label="電子數位" value="5" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="库存数量">
                        <el-input v-model.number="form.stock" placeholder="请输入库存" type="number" />
                    </el-form-item>
                    <!-- 销量 -->
                    <el-form-item label="商品销量">
                        <el-input v-model.number="form.sales" placeholder="请输入销量" type="number" />
                    </el-form-item>
                    <!-- 收藏数 -->
                    <el-form-item label="收藏数量">
                        <el-input v-model.number="form.like" placeholder="请输入收藏数" type="number" />
                    </el-form-item>
                    <el-form-item label="商品材质">
                        <el-input v-model="form.material" placeholder="商品材质" />
                    </el-form-item>
                    <el-form-item label="商品颜色">
                        <el-input v-model="form.color" placeholder="例：黑色/白色/蓝色" />
                    </el-form-item>
                    <el-form-item label="商品规格">
                        <el-input v-model="form.spec" placeholder="例：L/XL/256G" />
                    </el-form-item>
                </div>

                <!-- 图片上传 -->
                <div class="upload-row">
                    <el-form-item label="商品主图">
                        <el-upload
                            :auto-upload="false"
                            list-type="picture-card"
                            :file-list="coverList"
                            :limit="1"
                            accept="image/*"
                            @change="onCoverChange"
                            @remove="onCoverRemove"
                            @preview="openPreview"
                        >
                            <div>点击选图</div>
                        </el-upload>
                    </el-form-item>

                    <el-form-item label="商品详情图片">
                        <el-upload
                            :auto-upload="false"
                            list-type="picture-card"
                            :file-list="detailImgList"
                            multiple
                            accept="image/*"
                            @change="onDetailChange"
                            @remove="onDetailRemove"
                            @preview="openPreview"
                        >
                            <div>多选图片</div>
                        </el-upload>
                    </el-form-item>
                </div>

                <!-- 商品简介 -->
                <el-form-item label="商品简介">
                    <el-input v-model="form.intro" type="textarea" :rows="3" placeholder="填写商品简介" />
                </el-form-item>

                <!-- 商品状态 -->
                <el-form-item label="商品状态">
                    <el-radio-group v-model.number="form.status">
                        <el-radio :label="1">上架</el-radio>
                        <el-radio :label="0">下架</el-radio>
                    </el-radio-group>
                </el-form-item>

                <el-form-item>
                    <el-button
                        type="primary"
                        :loading="submitLoading"
                        :disabled="userInfo.status === 3"
                        @click="submitGoods"
                    >
                        提交保存
                    </el-button>
                </el-form-item>
            </el-form>
        </el-card>

        <!-- 图片预览弹窗 -->
        <el-dialog v-model="previewDialog" width="60%" append-to-body>
            <el-image :src="previewImgSrc" fit="contain" style="width: 100%;" />
        </el-dialog>
    </div>
</template>

<script lang="ts" setup>
import { ref, onUnmounted, reactive } from 'vue';
import request from '@/utils/request';
import { ElMessage } from 'element-plus';
import type { UploadFile } from 'element-plus';
import './admin-common.css';

// 当前登录的后台用户
interface AdminUser {
    id?: number;
    status?: number;
    group_level?: string;
}

interface GoodsForm {
    name: string;
    price: number;
    stock: number;
    sales: number;
    like: number;
    intro: string;
    status: number;
    color: string;
    spec: string;
    category: string;
    material: string;
    coverFile: File | null;
    detailFileArr: File[];
    cover: string;
    detail_images: string[];
}

const userInfo = reactive<AdminUser>(
    JSON.parse(localStorage.getItem('adminuser') || '{}') as AdminUser
);

const uploadApi = '/api/upload';
// 定义请求超时时间 30s
const REQ_TIMEOUT = 30000;

const createDefaultForm = (): GoodsForm => ({
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
    coverFile: null,
    detailFileArr: [],
    cover: '',
    detail_images: [],
});

const form = ref<GoodsForm>(createDefaultForm());

const coverList = ref<UploadFile[]>([]);
const detailImgList = ref<UploadFile[]>([]);
const submitLoading = ref(false);

const previewDialog = ref(false);
const previewImgSrc = ref('');
const blobUrlList: string[] = [];

// 打开大图预览
const openPreview = (file: UploadFile) => {
    previewImgSrc.value = file.url!;
    previewDialog.value = true;
};

// 主图选择
const onCoverChange = (file: UploadFile) => {
    const localUrl = URL.createObjectURL(file.raw!);
    blobUrlList.push(localUrl);
    file.url = localUrl;
    coverList.value = [file];
    form.value.coverFile = file.raw!;
};

// 删除主图
const onCoverRemove = () => {
    form.value.coverFile = null;
    coverList.value = [];
};

// 详情图选择
const onDetailChange = (file: UploadFile) => {
    const localUrl = URL.createObjectURL(file.raw!);
    blobUrlList.push(localUrl);
    file.url = localUrl;
    detailImgList.value.push(file);
    form.value.detailFileArr.push(file.raw!);
};

// 删除详情图
const onDetailRemove = (file: UploadFile) => {
    const i = detailImgList.value.findIndex(x => x.uid === file.uid);
    if (i > -1) {
        detailImgList.value.splice(i, 1);
        form.value.detailFileArr.splice(i, 1);
    }
};

// 封装单文件上传函数（抽离复用，增加超时、捕获单张图片错误）
const uploadSingleFile = async (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    // 给上传接口单独传超时配置
    const res = await request.post(uploadApi, fd, { timeout: REQ_TIMEOUT });
    return res.data;
};

// 批量并行上传详情图（解决串行超时核心优化）
const batchUploadDetailImages = async (files: File[]) => {
    if (!files.length) return [];
    // 所有图片同时发起请求，大幅缩短耗时
    const uploadTasks = files.map(file => uploadSingleFile(file));
    const results = await Promise.allSettled(uploadTasks);
    const paths: string[] = [];
    // 过滤上传成功的图片，失败的提示不阻断整体提交
    results.forEach((item, idx) => {
        if (item.status === 'fulfilled' && item.value.code === 1) {
            paths.push(item.value.data);
        } else {
            ElMessage.warning(`第${idx + 1}张详情图上传失败，已自动跳过`);
        }
    });
    return paths;
};

// 提交商品
const submitGoods = async () => {
    const data = form.value;
    // ========== 强化表单校验 ==========
    if (!data.name.trim()) return ElMessage.warning('请填写商品名称');
    if (!data.price || data.price <= 0) return ElMessage.warning('商品售价必须大于0');
    if (!data.category) return ElMessage.warning('请选择商品分类');
    if (!data.material.trim()) return ElMessage.warning('请填写商品材质');
    if (!data.coverFile) return ElMessage.warning('请上传商品主图');
    if (data.stock < 0) return ElMessage.warning('库存不能为负数');
    if (data.sales < 0) return ElMessage.warning('销量不能为负数');
    if (data.like < 0) return ElMessage.warning('收藏数不能为负数');

    submitLoading.value = true;
    try {
        // 1.上传主图
        const coverRes = await uploadSingleFile(data.coverFile);
        if (coverRes.code !== 1) throw new Error('商品主图上传失败，请重新选择图片');
        data.cover = coverRes.data;

        // 2.并行批量上传详情图（关键优化，解决串行超时）
        data.detail_images = await batchUploadDetailImages(data.detailFileArr);

        // 3.提交商品基础数据
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
            // 重点：不要JSON.stringify！后端接收数组直接传数组，避免解析失败
            detail_images: data.detail_images,
        };
        const { data: submitRes } = await request.post('/api/mall/create', submitParams, {
            timeout: REQ_TIMEOUT,
        });

        if (submitRes.code === 1) {
            ElMessage.success('新增商品成功');
            // 重置表单
            form.value = createDefaultForm();
            coverList.value = [];
            detailImgList.value = [];
        } else {
            ElMessage.error(submitRes.msg || '商品保存失败');
        }
    } catch (err: unknown) {
        console.error('提交失败：', err);
        // 区分超时错误提示
        const e = err as { message?: string; code?: string };
        if (e.message?.includes('timeout') || e.code === 'ECONNABORTED') {
            ElMessage.error('请求超时，请检查图片大小或网络后重试，建议单张图片不超过2M');
        } else {
            ElMessage.error(e.message || '操作失败，请稍后重试');
        }
    } finally {
        submitLoading.value = false;
    }
};

// 销毁页面释放本地预览图内存
onUnmounted(() => {
    blobUrlList.forEach(url => URL.revokeObjectURL(url));
    blobUrlList.length = 0;
});
</script>

<style scoped>
.goods-form {
    max-width: 1200px;
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    column-gap: 18px;
}

.form-grid :deep(.el-form-item) {
    margin-bottom: 18px;
}

.upload-row {
    display: flex;
    gap: 40px;
    flex-wrap: wrap;
}

@media (max-width: 1200px) {
    .form-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}
</style>
