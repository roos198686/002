<template>
    <div class="admin-page">
        <div class="page-title">个人中心</div>

        <!-- 安全退出 -->
        <div class="logout-bar">
            <el-button type="danger" plain @click="logout">安全退出</el-button>
        </div>

        <!-- 修改登录密码 -->
        <el-card class="pwd-card">
            <template #header>
                <span class="card-title">修改登录密码</span>
            </template>
            <el-form label-position="top" class="pwd-form">
                <el-form-item label="当前密码">
                    <el-input v-model="oldPwd" type="password" show-password placeholder="请输入当前密码" />
                </el-form-item>
                <el-form-item label="新密码">
                    <el-input v-model="newPwd" type="password" show-password placeholder="请输入新密码" />
                </el-form-item>
                <el-form-item label="确认新密码">
                    <el-input
                        v-model="confirmPwd"
                        type="password"
                        show-password
                        placeholder="请确认新密码"
                        @keyup.enter="updatePwd"
                    />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" :loading="loading" @click="updatePwd">
                        {{ loading ? '提交中.....' : '确认修改密码' }}
                    </el-button>
                </el-form-item>
            </el-form>
        </el-card>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import router from '@/router';
import './admin-common.css';

// 当前登录的后台用户
interface AdminUser {
    id?: number;
    status?: number;
    group_level?: string;
}

const userInfo = reactive<AdminUser>(
    JSON.parse(localStorage.getItem('adminuser') || '{}') as AdminUser
);

// 密码
const oldPwd = ref('');
const newPwd = ref('');
const confirmPwd = ref('');
const loading = ref(false);

// 修改密码（保留原文件原生 fetch 请求：POST /api/admin/login/updatePwd）
const updatePwd = async () => {
    if (!oldPwd.value || !newPwd.value || !confirmPwd.value) {
        ElMessage.warning('请填写完整信息');
        return;
    }
    if (newPwd.value !== confirmPwd.value) {
        ElMessage.error('两次输入的新密码不一致');
        return;
    }

    loading.value = true;
    try {
        // 从本地获取当前登录用户
        const userId = userInfo.id;

        const res = await fetch('/api/admin/login/updatePwd', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: userId,
                oldPwd: oldPwd.value,
                newPwd: newPwd.value,
            }),
        });

        const data = await res.json();
        if (data.code === 1) {
            ElMessage.success('修改成功，请重新登录');
            logout();
        } else {
            ElMessage.error(data.msg || '修改失败');
        }
    } catch (err) {
        console.log(err);
        ElMessage.error('请求失败');
    } finally {
        loading.value = false;
    }
};

// 退出登录
const logout = () => {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    })
        .then(() => {
            // 清除本地缓存
            localStorage.removeItem('adminuser');
            // 跳转到登录页
            router.replace('/admin_login');
        })
        .catch(() => {});
};

onMounted(() => {
    const adminStr = localStorage.getItem('adminuser');
    if (!adminStr) {
        router.replace('/admin_login');
    }
});
</script>

<style scoped>
.logout-bar {
    margin-bottom: 16px;
}

.pwd-card {
    max-width: 420px;
    margin: 0 auto;
}

.pwd-card :deep(.el-card__header) {
    padding: 12px 18px;
}

.card-title {
    font-weight: 600;
    font-size: 15px;
}

.pwd-form {
    max-width: 320px;
    margin: 0 auto;
}

.pwd-form :deep(.el-form-item:last-child) {
    margin-bottom: 0;
}

.pwd-form .el-button--primary {
    width: 100%;
}
</style>
