<template>
    <div class="maina">
        <div class="all">
            <div class="all-l" style="padding: 20px;">
                <!-- 标题 -->
                <div style="display: flex;">
                    <div @click="logout"
                        style="display: flex;padding: 5px 20px; background: #a3329e; color:#333;border-radius: 6px; cursor: pointer;font-size: 13px;">
                        <span>安全退出</span>
                    </div>
                </div>

                <!-- 修改密码 -->
                <div
                    style="max-width: 300px; display: flex; flex-direction: column; gap: 15px;margin: 0 auto;">
                    <div style="font-weight: 500;">修改登录密码</div>

                    <input v-model="oldPwd" type="password" placeholder="请输入当前密码"
                        style="padding: 7px; border: 1px solid #ddd; border-radius: 6px;" />

                    <input v-model="newPwd" type="password" placeholder="请输入新密码"
                        style="padding: 7px; border: 1px solid #ddd; border-radius: 6px;" />

                    <input v-model="confirmPwd" type="password" placeholder="请确认新密码"
                        style="padding: 7px; border: 1px solid #ddd; border-radius: 6px;" />

                    <button @click="updatePwd"
                        style="font-size: 13px; padding:8px 10px; background: #a3329e; color:#333; border: none; border-radius: 6px; cursor: pointer;">
                        {{ loading ? '提交中.....' : '确认修改密码' }}
                    </button>
                </div>


            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { Icon } from '@iconify/vue';
import router from '../../router';

// 密码'
const oldPwd = ref('')
const newPwd = ref('')
const confirmPwd = ref('')
const loading = ref(false)

// 修改密码'
const updatePwd = async () => {
    if (!oldPwd.value || !newPwd.value || !confirmPwd.value) {
        alert('请填写完整信息')
        return
    }
    if (newPwd.value !== confirmPwd.value) {
        alert('两次输入的新密码不一致')
        return
    }

    loading.value = true
    try {
        // 从本地获取当前登录用户'
        const user = JSON.parse(localStorage.getItem('adminuser') || '{}')
        const userId = user.id

        const res = await fetch('/api/admin/login/updatePwd', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: userId,
                oldPwd: oldPwd.value,
                newPwd: newPwd.value
            })
        })

        const data = await res.json()
        if (data.code === 1) {
            alert('修改成功，请重新登录')
            logout()
        } else {
            alert(data.msg || '修改失败')
        }
    } catch (err) {
        console.log(err)
        alert('请求失败')
    } finally {
        loading.value = false
    }
}

// 退出登录吗？'
const logout = () => {
    if (!confirm('确定要退出登录吗？')) return
    // 清除本地缓存'
    localStorage.removeItem('adminuser')
    // 跳转到登录页'
    router.replace('/admin_login')
}
onMounted(() => {

    const adminStr = localStorage.getItem('adminuser');

    if (!adminStr) {
        router.replace('/admin_login');
    }
});
onMounted(async () => { });

</script>

<style scoped>
.jfkdlsa {
    color: #b655e2;
}

.jfkdlsa:hover {
    color: #701e96;
}

@media (max-width: 768px) {}
</style>