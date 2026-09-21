<template>
    <div class="admin-page">
        <div class="page-title">贴子/动态管理</div>

        <!-- 顶部搜索栏 -->
        <div class="filter-bar">
            <el-input
                v-model="searchUsername"
                placeholder="请输入用户名搜索"
                clearable
                @keyup.enter="handleSearch"
                @clear="handleSearch"
            />
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
        </div>

        <!-- 动态表格 -->
        <el-table :data="list" v-loading="loading" border stripe row-key="dynamic_id">
            <el-table-column label="头像" width="80">
                <template #default="{ row }">
                    <el-image
                        class="thumb small"
                        :src="baseURL + row.avatar"
                        :preview-src-list="[baseURL + row.avatar]"
                        fit="cover"
                    />
                </template>
            </el-table-column>
            <el-table-column prop="nickname" label="昵称" min-width="110" show-overflow-tooltip />
            <el-table-column label="账号" min-width="110" show-overflow-tooltip>
                <template #default="{ row }">@{{ row.username }}</template>
            </el-table-column>
            <el-table-column label="图片" width="90">
                <template #default="{ row }">
                    <el-image
                        v-if="row.image_url"
                        class="thumb"
                        :src="baseURL + row.image_url.split(',')[0]"
                        :preview-src-list="[baseURL + row.image_url.split(',')[0]]"
                        fit="cover"
                    />
                    <span v-else>-</span>
                </template>
            </el-table-column>
            <el-table-column prop="view_num" label="阅读" width="80" />
            <el-table-column prop="like_num" label="点赞" width="80" />
            <el-table-column prop="collect_num" label="收藏" width="80" />
            <el-table-column label="发布时间" min-width="170">
                <template #default="{ row }">{{ formatTime(row.created_at) }}</template>
            </el-table-column>
            <el-table-column label="操作" width="100" fixed="right">
                <template #default="{ row }">
                    <el-button link type="primary" :disabled="userInfo.status === 3" @click="openEditDate(row)">
                        修改数据
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 底部分页（服务端分页，沿用 page/limit 参数名） -->
        <div class="pager-bar">
            <el-pagination
                v-model:current-page="page"
                v-model:page-size="pageSize"
                :page-sizes="[10, 20, 50]"
                :total="total"
                background
                layout="total, sizes, prev, pager, next, jumper"
                @current-change="getList"
                @size-change="handleSizeChange"
            />
        </div>

        <!-- 修改数据弹窗 -->
        <el-dialog v-model="showDateDialog" title="修改数据" width="500px">
            <el-form label-width="80px">
                <el-form-item label="发布时间">
                    <el-date-picker
                        v-model="editTime"
                        type="datetime"
                        placeholder="选择日期时间"
                        format="YYYY-MM-DD HH:mm:ss"
                        value-format="YYYY-MM-DD HH:mm:ss"
                        :editable="false"
                        style="width: 100%;"
                    />
                </el-form-item>
                <el-form-item label="阅读量">
                    <el-input-number
                        v-model="editViewNum"
                        :min="0"
                        placeholder="请输入阅读量"
                        controls-position="right"
                        style="width: 100%;"
                    />
                </el-form-item>
                <el-form-item label="点赞数">
                    <el-input-number
                        v-model="editLikeNum"
                        :min="0"
                        placeholder="请输入点赞数"
                        controls-position="right"
                        style="width: 100%;"
                    />
                </el-form-item>
                <el-form-item label="收藏数">
                    <el-input-number
                        v-model="editCollectNum"
                        :min="0"
                        placeholder="请输入收藏数"
                        controls-position="right"
                        style="width: 100%;"
                    />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="showDateDialog = false">取消</el-button>
                <el-button type="primary" @click="saveEditTime">确认保存</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import request from '@/utils/request';
import moment from 'moment';
import router from '@/router';
import './admin-common.css';

// 当前登录的后台用户
interface AdminUser {
    id?: number;
    status?: number;
    group_level?: string;
}

// 动态列表项（user_images 联表 user 字段）
interface DynamicRow {
    dynamic_id: number | string;
    user_id?: number;
    username: string;
    nickname: string;
    avatar: string;
    image_url: string;
    images?: string[];
    view_num: number | string;
    like_num: number | string;
    collect_num: number | string;
    created_at: string;
}

const baseURL = request.defaults.baseURL || '';
const userInfo = reactive<AdminUser>(
    JSON.parse(localStorage.getItem('adminuser') || '{}') as AdminUser
);

const searchUsername = ref('');
const list = ref<DynamicRow[]>([]);
const loading = ref(false);

// 服务端分页（参数名沿用后端的 page / limit）
const page = ref(1);
const pageSize = ref(10);
// 后端不返回总数，仅返回 more，按已加载条数与 more 推导分页总数
const total = ref(0);

// 修改数据相关
const showDateDialog = ref(false);
const currentDynamicId = ref<number | string | null>(null);
const editTime = ref('');
const editViewNum = ref(0);
const editLikeNum = ref(0);
const editCollectNum = ref(0);

const formatTime = (time: string) => moment(time).format('YYYY/MM/DD HH:mm:ss');

// 打开弹窗，回显原有数据
const openEditDate = (row: DynamicRow) => {
    currentDynamicId.value = row.dynamic_id;
    editTime.value = moment(row.created_at).format('YYYY-MM-DD HH:mm:ss');
    editViewNum.value = Number(row.view_num) || 0;
    editLikeNum.value = Number(row.like_num) || 0;
    editCollectNum.value = Number(row.collect_num) || 0;
    showDateDialog.value = true;
};

// 保存修改
const saveEditTime = async () => {
    if (!currentDynamicId.value) {
        ElMessage.warning('数据ID异常');
        return;
    }
    if (!moment(editTime.value).isValid()) {
        ElMessage.error('时间格式不正确');
        return;
    }
    // 校验数字非负
    if (editViewNum.value < 0 || editLikeNum.value < 0 || editCollectNum.value < 0) {
        ElMessage.error('数字不能为负数');
        return;
    }

    try {
        const submitTime = moment(editTime.value).format('YYYY-MM-DD HH:mm:ss');

        await request.post('/api/admin/ruklose/updateImageTime', {
            dynamic_id: currentDynamicId.value,
            created_at: submitTime,
            view_num: editViewNum.value,
            like_num: editLikeNum.value,
            collect_num: editCollectNum.value,
        });

        ElMessage.success('修改成功');
        showDateDialog.value = false;
        page.value = 1;
        getList();
    } catch (err) {
        ElMessage.error('修改失败');
        console.error(err);
    }
};

// 获取列表（参数与原文件完全一致：username/page/limit/remark）
const getList = async () => {
    loading.value = true;
    const remark = userInfo.group_level;

    try {
        const res = await request.post('/api/admin/ruklose/userimages', {
            username: searchUsername.value,
            page: page.value,
            limit: pageSize.value,
            remark: remark,
        });

        const data: DynamicRow[] = res.data.data || [];
        list.value = data;
        // 后端仅返回 more 标记，据此推导用于分页器展示的总数
        const more = res.data.more === true;
        total.value = (page.value - 1) * pageSize.value + data.length + (more ? 1 : 0);
    } finally {
        loading.value = false;
    }
};

const handleSizeChange = () => {
    page.value = 1;
    getList();
};

// 搜索
const handleSearch = () => {
    page.value = 1;
    getList();
};

// 重置
const handleReset = () => {
    searchUsername.value = '';
    page.value = 1;
    getList();
};

onMounted(() => {
    const adminStr = localStorage.getItem('adminuser');
    if (!adminStr) {
        router.replace('/admin_login');
        return;
    }
    getList();
});
</script>

<style scoped>
</style>
