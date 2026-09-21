<template>
    <div class="admin-page">
        <div class="page-title">入驻审核</div>

        <!-- 顶部搜索栏（接口无搜索参数，仅在全量数据上本地过滤） -->
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

        <!-- 申请表格 -->
        <el-table :data="pagedList" v-loading="loading" border stripe row-key="id">
            <el-table-column prop="id" label="申請ID" width="90" />
            <el-table-column prop="user_id" label="用戶ID" width="100" />
            <el-table-column prop="contact" label="联系方式" min-width="140" show-overflow-tooltip />
            <el-table-column prop="remark" label="申請说明" min-width="200" show-overflow-tooltip />
            <el-table-column label="申請狀態" width="110">
                <template #default="{ row }">
                    <el-tag :type="statusTagMap[row.status]">{{ statusMap[row.status] }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column label="申請時間" min-width="150">
                <template #default="{ row }">{{ formatTime(row.create_time) }}</template>
            </el-table-column>
            <el-table-column label="操作" width="90" fixed="right">
                <template #default="{ row }">
                    <el-button link type="primary" :disabled="userInfo.status === 3" @click="openAudit(row)">
                        審核
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 底部分页（接口一次返回全量，本地分页） -->
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

        <!-- 审核弹窗 -->
        <el-dialog v-model="auditVisible" title="入駐申請審核" width="460px">
            <el-form label-width="90px">
                <el-form-item label="申請用戶">
                    <span>@{{ auditForm.user_id }}</span>
                </el-form-item>
                <el-form-item label="審核狀態">
                    <el-select v-model="auditStatus" placeholder="請選擇審核結果" style="width: 100%;">
                        <el-option label="通過" value="1" />
                        <el-option label="拒絕" value="2" />
                    </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="auditVisible = false">取消</el-button>
                <el-button type="primary" @click="saveAudit">提交</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import request from '@/utils/request';
import router from '@/router';
import moment from 'moment';
import './admin-common.css';

// 当前登录的后台用户
interface AdminUser {
    id?: number;
    status?: number;
    group_level?: string;
}

// 入驻申请列表项（settle_apply 表）
interface ApplyRow {
    id: number;
    user_id: number;
    username?: string;
    contact: string;
    remark: string;
    status: number;
    create_time: string;
}

const userInfo = reactive<AdminUser>(
    JSON.parse(localStorage.getItem('adminuser') || '{}') as AdminUser
);

// 搜索
const searchName = ref('');
const loading = ref(false);
// 申请列表（全量）
const applyList = ref<ApplyRow[]>([]);

// 本地分页
const currentPage = ref(1);
const pageSize = ref(10);

// 本地按关键字过滤（接口不支持搜索参数，保持请求不变）
const filteredList = computed(() => {
    const keyword = searchName.value.trim();
    if (!keyword) return applyList.value;
    return applyList.value.filter(
        item =>
            String(item.user_id).includes(keyword) ||
            (item.contact || '').includes(keyword) ||
            (item.remark || '').includes(keyword)
    );
});

const pagedList = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    return filteredList.value.slice(start, start + pageSize.value);
});

// 审核弹窗
const auditVisible = ref(false);
const auditForm = ref<ApplyRow>({
    id: 0,
    user_id: 0,
    username: '',
    contact: '',
    remark: '',
    status: 0,
    create_time: '',
});
const auditStatus = ref('');

// 狀態映射
const statusMap: Record<number, string> = {
    0: '待審核',
    1: '已通過',
    2: '已拒絕',
};

const statusTagMap: Record<number, 'warning' | 'success' | 'danger'> = {
    0: 'warning',
    1: 'success',
    2: 'danger',
};

const formatTime = (time: string) => moment(time).format('YY/MM/DD HH:mm:ss');

// 獲取入駐申請列表
const getApplyList = async () => {
    loading.value = true;
    try {
        const { data } = await request.get('/api/admin/admin_user/admin_apply');
        if (data.code === 1) {
            applyList.value = data.data || [];
        }
    } catch (err) {
        ElMessage.error('數據加載失敗');
        console.error(err);
    } finally {
        loading.value = false;
    }
};

const handleSearch = () => {
    currentPage.value = 1;
    getApplyList();
};

const handleReset = () => {
    searchName.value = '';
    currentPage.value = 1;
    getApplyList();
};

const handleSizeChange = () => {
    currentPage.value = 1;
};

// 打開審核彈窗
const openAudit = (row: ApplyRow) => {
    auditVisible.value = true;
    auditForm.value = { ...row };
    auditStatus.value = String(row.status);
};

// 提交審核（参数与原文件完全一致）
const saveAudit = async () => {
    if (!auditStatus.value) {
        ElMessage.error('請選擇審核狀態');
        return;
    }
    try {
        // 狀態=通過(角色改為2入駐用戶)，狀態=拒絕(角色維持1普通用戶)
        const roleLevel = auditStatus.value === '1' ? 2 : 1;
        const { data } = await request.get('/api/admin/admin_user/settle_apply', {
            params: {
                id: auditForm.value.user_id,
                role_level: roleLevel,
                apply_id: auditForm.value.id,
                status: auditStatus.value,
            },
        });

        if (data.code === 1) {
            auditVisible.value = false;
            ElMessage.success('審核提交成功');
            getApplyList();
        } else {
            ElMessage.error('審核提交失敗');
        }
    } catch (err) {
        ElMessage.error('請求異常');
        console.error(err);
    }
};

onMounted(() => {
    // 後台登錄校驗
    const adminStr = localStorage.getItem('adminuser');
    if (!adminStr) {
        router.replace('/admin_login');
        return;
    }
    getApplyList();
});
</script>

<style scoped>
</style>
