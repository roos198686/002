<template>
    <div class="main">
        <div class="register-container">
            <div class="register-all">
                <!-- 頂部標題 -->
                <div class="allar-top">
                    <div @click="goBack" style="margin-left: 10px;cursor: pointer;color: #000;width: 30px;">
                        <Icon icon="material-symbols:arrow-back-ios-rounded" width="18" />
                    </div>
                    <div class="allar-top-a">變更資金密碼</div>
                </div>

                <!-- 滾動內容區 -->
                <div class="content-wrapper">
                    <div class="cuekdil">
                        <div class="vielsljkfgds">
                            <div class="pin-row">
                                <div class="texta">舊密碼（6位數字）</div>
                                <PinInput v-model="oldpassword" />
                            </div>
                            <div class="pin-row">
                                <div class="texta">新密碼（6位數字）</div>
                                <PinInput v-model="newpassword" />
                            </div>
                            <div class="pin-row">
                                <div class="texta">確認新密碼</div>
                                <PinInput v-model="confirmpassword" />
                            </div>
                            <div class="textbutt" @click="submit">確認</div>
                            <div style="color:#666;font-size: 12px;margin: 30px;">
                                資金密碼用於提領、轉帳等資金操作，請妥善保管
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="copy-toast" v-if="showToast">
            <div style="font-size: 30PX;">
                <Icon icon="iconoir:xmark" width="58" v-if="!yesno" />
                <Icon icon="iconoir:check" width="58" v-if="yesno" />
            </div>
            <div class="toast-text" style="font-size: 16px;">{{ showtext }}</div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import router from '../../../router';
import { Icon } from '@iconify/vue';
import request from '@/utils/request';
import PinInput from '@/components/PinInput.vue';

const route = useRoute();
const goBack = () => router.go(-1);

const showToast = ref(false);
const showtext = ref('');
const yesno = ref(false);

const oldpassword = ref('');
const newpassword = ref('');
const confirmpassword = ref('');

const submit = async () => {
  if (!/^\d{6}$/.test(oldpassword.value)) {
    showToast.value = true;
    yesno.value = false;
    showtext.value = '請輸入6位數字舊密碼';
    setTimeout(() => showToast.value = false, 2000);
    return;
  }
  if (!/^\d{6}$/.test(newpassword.value)) {
    showToast.value = true;
    yesno.value = false;
    showtext.value = '請輸入6位數字新密碼';
    setTimeout(() => showToast.value = false, 2000);
    return;
  }
  if (newpassword.value === oldpassword.value) {
    showToast.value = true;
    yesno.value = false;
    showtext.value = '新密碼不可與舊密碼相同';
    setTimeout(() => showToast.value = false, 2000);
    return;
  }
  if (!/^\d{6}$/.test(confirmpassword.value)) {
    showToast.value = true;
    yesno.value = false;
    showtext.value = '請確認新密碼';
    setTimeout(() => showToast.value = false, 2000);
    return;
  }
  if (newpassword.value !== confirmpassword.value) {
    showToast.value = true;
    yesno.value = false;
    showtext.value = '兩次輸入的密碼不一致';
    setTimeout(() => showToast.value = false, 2000);
    return;
  }

  try {
    const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
    const user_id = userInfo.id;

    const { data: res } = await request.post('/api/password/updateFundPassword', {
      user_id,
      oldpassword: oldpassword.value,
      newpassword: newpassword.value,
      confirmpassword: confirmpassword.value
    });

    if (res.code === 1) {
      showToast.value = true;
      yesno.value = true;
      showtext.value = '密碼修改成功';

      setTimeout(() => {
        showToast.value = false;
        router.push('/user');
      }, 1200);
    } else {
      showToast.value = true;
      yesno.value = false;
      showtext.value = res.msg || '操作失敗';
      setTimeout(() => showToast.value = false, 2000);
    }
  } catch (err) {
    showToast.value = true;
    yesno.value = false;
    showtext.value = '請求失敗，請稍後再試';
    setTimeout(() => showToast.value = false, 2000);
  }
};

watch(() => route.path, () => {
    localStorage.setItem('last_path', route.path);
}, { immediate: true });

onMounted(() => {
    const lastPath = localStorage.getItem('last_path');
    if (lastPath && route.path === '/') {
        router.replace(lastPath);
    }
});
</script>

<style scoped>
/* ========== 全域佈局 ========== */
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
    height: 100vh !important;
    position: relative;
}

/* 頂部標題 */
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
    padding-top: env(safe-area-inset-top);
    box-sizing: content-box;
}

.allar-top-a {
    font-size: 15px;
    font-weight: bold;
    color: #000;
    text-align: center;
    width: 100%;
    margin-right: 40px;
}

/* 滾動容器 */
.content-wrapper {
    position: absolute;
    top: calc(40px + env(safe-area-inset-top));
    left: 0;
    right: 0;
    bottom: 0;
    overflow-y: auto;
    overflow-x: hidden;
    box-sizing: border-box;
}

.cuekdil {
    width: 100%;
    min-height: 100%;
    background: #fff;
}

.vielsljkfgds {
    height: 100%;
    padding: 20px;
}

.pin-row {
    margin-top: 30px;
}

.pin-row .texta {
    margin-bottom: 12px;
}

.form-inputa {
    width: 100%;
    height: 38px;
    padding: 0 15px;
    border: 1px solid #8d8d8d;
    border-radius: 5px;
    font-size: 14px;
    color: #333;
    box-sizing: border-box;
    outline: none;
    transition: border-color 0.3s;
    background-color: #e8e8e8;
    margin-top: 5px;
}

.form-inputa.invalid {
    border-color: #f53f3f;
}

.form-inputa:focus {
    border-color: #ffffff;
}

.form-inputa::placeholder {
    color: #666;
}

.texta {
    color: #4e4e4e;
    text-align: left;
    font-size: 14px;
}

.textbutt {
    margin-top: 50px;
    background-color: #2c51a1;
    text-align: center;
    border-radius: 50px;
    padding: 8px 15px;
    font-weight: 900;
    cursor: pointer;
    color: #fff;
}

.textbutt:hover {
    background-color: #5c8aee;
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

/* 隱藏捲軸 + 禁止彈回 */
::-webkit-scrollbar {
    display: none;
}

:global(html),
:global(body) {
    background: #fff !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
    overscroll-behavior: none !important;
}
</style>