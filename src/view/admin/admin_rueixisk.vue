<template>
    <div class="admin-page">
        <div class="page-title">用户管理</div>

        <!-- 顶部搜索栏 -->
        <div class="filter-bar">
            <el-input
                v-model="searchName"
                placeholder="请输入用户名模糊搜索"
                clearable
                @keyup.enter="handleSearch"
                @clear="handleSearch"
            />
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
        </div>

        <!-- 角色切换 -->
        <el-tabs v-model="currentRole" @tab-change="handleRoleChange">
            <el-tab-pane label="普通用户" :name="1" />
            <el-tab-pane label="入驻用户" :name="2" />
        </el-tabs>

        <!-- 用户表格 -->
        <el-table :data="pagedList" v-loading="loading" border stripe row-key="id">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="username" label="用户名" min-width="120" show-overflow-tooltip />
            <el-table-column prop="nickname" label="昵称" min-width="120" show-overflow-tooltip />
            <el-table-column label="角色" width="100">
                <template #default="{ row }">
                    {{ row.role_level == 1 ? '普通用户' : '入驻用户' }}
                </template>
            </el-table-column>
            <el-table-column prop="like_count" label="点赞数" width="90" />
            <el-table-column prop="view_count" label="查看数" width="90" />
            <el-table-column prop="vip_level" label="VIP" width="80" />
            <el-table-column prop="balance" label="余额" width="100" />
            <el-table-column label="编辑" width="90" fixed="right">
                <template #default="{ row }">
                    <el-button link type="primary" :disabled="userInfo.status === 3" @click="openEdit(row)">
                        编辑
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 底部分页 -->
        <div class="pager-bar">
            <el-pagination
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :page-sizes="[10, 20, 50]"
                :total="filteredList.length"
                background
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleSizeChange"
            />
        </div>

        <!-- 编辑用户弹窗 -->
        <el-dialog v-model="editVisible" title="编辑用户信息" width="480px">
            <el-form label-width="80px">
                <el-form-item label="用户名">
                    <el-input v-model="editForm.username" disabled />
                </el-form-item>
                <el-form-item label="角色等级">
                    <el-select v-model="roleText" placeholder="请选择角色" style="width: 100%;">
                        <el-option label="普通用户" value="普通用户" />
                        <el-option label="入驻用户" value="入驻用户" />
                    </el-select>
                </el-form-item>
                <el-form-item label="点赞数">
                    <el-input-number
                        v-model="editForm.like_count"
                        :disabled="roleText === '普通用户'"
                        controls-position="right"
                        style="width: 100%;"
                    />
                </el-form-item>
                <el-form-item label="查看数">
                    <el-input-number
                        v-model="editForm.view_count"
                        :disabled="roleText === '普通用户'"
                        controls-position="right"
                        style="width: 100%;"
                    />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="editVisible = false">取消</el-button>
                <el-button type="primary" @click="saveEdit">保存修改</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import request from '@/utils/request';
import router from '@/router';
import './admin-common.css';

// 当前登录的后台用户
interface AdminUser {
    id?: number;
    status?: number;
    group_level?: string;
}

// 用户列表项（只声明页面使用到的字段，后端为 SELECT * 返回）
interface UserRow {
    id: number;
    username: string;
    nickname: string;
    role_level: number;
    like_count: number;
    view_count: number;
    vip_level: number | string;
    balance: number;
    city?: string;
    group_user?: string;
}

// 管理员组别（admin_user 表）
interface AdminGroupRow {
    id?: number;
    group_level?: string;
    [key: string]: unknown;
}

const userInfo = reactive<AdminUser>(
    JSON.parse(localStorage.getItem('adminuser') || '{}') as AdminUser
);

// 列表接口固定取前 20 条（与原逻辑一致：page=1, pageSize=20，前端本地过滤/分页）
const API_PAGE_SIZE = 20;

const searchName = ref('');
const currentRole = ref(1);
const allUserList = ref<UserRow[]>([]);
const loading = ref(false);

// 本地分页
const currentPage = ref(1);
const pageSize = ref(10);

// 按角色过滤后的列表
const filteredList = computed(() =>
    allUserList.value.filter(item => item.role_level === currentRole.value)
);

// 当前页展示数据
const pagedList = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    return filteredList.value.slice(start, start + pageSize.value);
});

// 编辑弹窗
const editVisible = ref(false);
const zubeikd = ref<AdminGroupRow[]>([]);
const grouplevel = ref<string>('');

const editForm = ref<UserRow>({
    id: 0,
    username: '',
    nickname: '',
    role_level: 1,
    like_count: 0,
    view_count: 0,
    vip_level: 0,
    balance: 0,
    city: '',
    group_user: '',
});

const roleText = ref('');

const roleMap: Record<number, string> = {
    1: '普通用户',
    2: '入驻用户',
};

const roleToNum: Record<string, number> = {
    '普通用户': 1,
    '入驻用户': 2,
};

// 查询管理员组别（保持与原文件一致的请求）
const xujfkdwobei = async () => {
    const { data } = await request.get('/api/admin/admin_user/zubeikd');
    zubeikd.value = data.data || [];
};

// 用户列表（全部）
const getAllUser = async () => {
    loading.value = true;
    try {
        const status = userInfo.status;
        const { data } = await request.get('/api/admin/admin_user/listAll', {
            params: {
                status: status,
                page: 1,
                pageSize: API_PAGE_SIZE,
            },
        });
        allUserList.value = data.data || [];
        currentPage.value = 1;
    } finally {
        loading.value = false;
    }
};

// 查询用户（原版逻辑：关键字为空走列表，非空走搜索）
const getUserList = async () => {
    currentPage.value = 1;
    if (!searchName.value) {
        getAllUser();
        return;
    }
    loading.value = true;
    try {
        const { data } = await request.get('/api/admin/admin_user/search', {
            params: { username: searchName.value },
        });
        allUserList.value = data.data || [];
    } finally {
        loading.value = false;
    }
};

const handleSearch = () => {
    getUserList();
};

const handleReset = () => {
    searchName.value = '';
    getUserList();
};

// 切换角色：仅本地重新过滤，不重新请求（与原逻辑一致）
const handleRoleChange = () => {
    currentPage.value = 1;
};

const handleSizeChange = () => {
    currentPage.value = 1;
};

// 打开编辑弹窗
const openEdit = async (row: UserRow) => {
    editVisible.value = true;
    editForm.value = { ...row };
    roleText.value = roleMap[row.role_level] || '';
    await xujfkdwobei();
    grouplevel.value = row.group_user || '';
};

// 保存修改（参数与原文件完全一致）
const saveEdit = async () => {
    try {
        const role_level = roleToNum[roleText.value];
        const params = {
            id: editForm.value.id,
            role_level: role_level,
            like_count: editForm.value.like_count,
            view_count: editForm.value.view_count,
        };

        const { data } = await request.get('/api/admin/admin_user/update', { params });

        if (data.code === 1) {
            editVisible.value = false;
            ElMessage.success('保存成功');
            getUserList();
        } else {
            ElMessage.error('保存失败');
        }
    } catch (err) {
        ElMessage.error('保存失败');
        console.error(err);
    }
};

onMounted(() => {
    const adminStr = localStorage.getItem('adminuser');
    if (!adminStr) {
        router.replace('/admin_login');
        return;
    }
    getUserList();
});
</script>

<style scoped>
.admin-page :deep(.el-tabs) {
    margin-bottom: 6px;
}
</style>
