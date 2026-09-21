<template>
    <div class="login-page">
        <div class="login-box">
            <div class="login-title">管理后台登录</div>
            <el-form label-position="top" @submit.prevent>
                <el-form-item label="用户名">
                    <el-input v-model="form.username" placeholder="请输入用户名" clearable size="large"
                        @keyup.enter="loginbutt" />
                </el-form-item>
                <el-form-item label="密码">
                    <el-input v-model="form.password" type="password" show-password placeholder="请输入密码"
                        size="large" @keyup.enter="loginbutt" />
                </el-form-item>
                <el-button type="primary" size="large" class="login-btn" :loading="isLoading"
                    @click="loginbutt">
                    登录
                </el-button>
            </el-form>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import router from "../../router";
import request from '@/utils/request'

const isLoading = ref(false);

const form = reactive({
    username: '',
    password: ''
});

const loginbutt = async () => {
    if (!form.username.trim()) {
        return ElMessage.warning('请输入用户名');
    }
    if (!form.password.trim()) {
        return ElMessage.warning('请输入密码');
    }
    isLoading.value = true;
    try {
        const { data: res } = await request.post('/api/login/login', {
            username: form.username,
            password: form.password
        });
        if (res.code === 1) {
            localStorage.setItem('adminuser', JSON.stringify(res.user))
            ElMessage.success('登录成功');
            setTimeout(() => {
                router.push('/admin_index');
            }, 600);
        } else {
            ElMessage.warning(res.message || res.msg || '登录失败');
        }
    } catch (err) {
        ElMessage.error('服务器异常');
    } finally {
        isLoading.value = false;
    }
};
</script>

<style scoped>
.login-page {
    position: fixed;
    inset: 0;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
}

.login-box {
    width: 360px;
    max-width: 90%;
    padding: 36px 32px;
    border: 1px solid #f0d6ef;
    border-radius: 14px;
    box-shadow: 0 8px 30px rgba(255, 51, 238, 0.08);
    background: #fff;
}

.login-title {
    font-size: 22px;
    font-weight: bold;
    color: #333;
    text-align: center;
    margin-bottom: 26px;
}

.login-btn {
    width: 100%;
    margin-top: 6px;
}
</style>
