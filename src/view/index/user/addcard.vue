<template>
    <div class="main">
        <div class="register-container">
            <div class="register-all">
                <!-- 頂部標題 -->
                <div class="allar-top">
                    <div @click="goBack" style="margin-left: 10px;cursor: pointer;color: #a88035;width: 30px;">
                        <Icon icon="material-symbols:arrow-back-ios-rounded" width="18" />
                    </div>
                    <div class="allar-top-a">新增提款帳戶</div>
                </div>

                <!-- 滾動內容區 -->
                <div class="content-wrapper">
                    <div class="cuekdil">
                        <div class="vielsljkfgds">
                            <div>
                                <div class="texta">選擇幣種</div>
                                <select class="form-input" v-model="selectedCurrency">
                                    <option value="" disabled selected>請選擇幣種</option>
                                    <option v-for="item in source" :key="item.skjgk" :value="item.skjgk">
                                        {{ item.skjgk }}
                                    </option>
                                </select>
                            </div>
                            <div style="margin-top: 30px;">
                                <div class="texta">錢包地址</div>
                                <div color="input">
                                    <input class="form-inputa" v-model="searchKey" placeholder="請輸入" />
                                </div>
                            </div>
                            <div class="textbutt" @click="submit">提交</div>
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
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import request from '@/utils/request';

const router = useRouter();
const goBack = () => router.back();

const selectedCurrency = ref<string>('');
const searchKey = ref<string>('');
const showToast = ref<boolean>(false);
const showtext = ref<string>('');
const yesno = ref<boolean>(false);

const source = ref([
    { skjgk: 'USDC-ERC20' },
    { skjgk: 'USDC-BEP20' },
    { skjgk: 'USDT-ERC20' },
    { skjgk: 'USDT-TRC20' },
    { skjgk: 'USDT-BEP20' },
]);

const submit = async () => {
    if (!selectedCurrency.value) {
        showtext.value = '請選擇幣種';
        showToast.value = true;
        yesno.value = false;
        setTimeout(() => showToast.value = false, 2000);
        return;
    }

    if (!searchKey.value.trim()) {
        showtext.value = '請輸入錢包地址';
        showToast.value = true;
        yesno.value = false;
        setTimeout(() => showToast.value = false, 2000);
        return;
    }

    try {
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : {};
        const userId = user.id;

        if (!userId) {
            showtext.value = '請重新登入';
            showToast.value = true;
            yesno.value = false;
            setTimeout(() => showToast.value = false, 2000);
            return;
        }

        const { data } = await request.post('/api/withdraw/add', {
            user_id: userId,
            coin_type: selectedCurrency.value,
            wallet_address: searchKey.value
        });

        if (data.code === 1) {
            showtext.value = '新增成功';
            yesno.value = true;
            showToast.value = true;
            setTimeout(() => {
                router.push('/cardlist');
            }, 1500);
        } else {
            showtext.value = data.msg || '新增失敗';
            yesno.value = false;
            showToast.value = true;
        }
    } catch (err) {
        showtext.value = '提交失敗，請稍後再試';
        yesno.value = false;
        showToast.value = true;
    }

    setTimeout(() => showToast.value = false, 2000);
};
</script>

<style scoped>
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
    height: 45px;
    border-bottom: 1px solid #ddd;
    background: #f7f7f7;
}

.allar-top-a {
    font-size: 15px;
    font-weight: bold;
    color: #8a6520;
    text-align: center;
    width: 100%;
    margin-right: 40px;
}

.content-wrapper {
    position: absolute;
    top: 40px;
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

select.form-input {
    width: 100%;
    height: 38px;
    padding: 0 15px;
    border: 1px solid #8d8d8d;
    border-radius: 5px;
    font-size: 12px;
    color: #333;
    box-sizing: border-box;
    outline: none;
    background-color: #e8e8e8;
    margin-top: 15px;
    cursor: pointer;
}

.form-inputa {
    width: 100%;
    height: 38px;
    padding: 0 15px;
    border: 1px solid #8d8d8d;
    border-radius: 5px;
    font-size: 12px;
    color: #333;
    box-sizing: border-box;
    outline: none;
    transition: border-color 0.3s;
    background-color: #e8e8e8;
    margin-top: 15px;
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
    color: #e390fc;
    text-align: left;
    font-size: 12px;
}

.textbutt {
    margin-top: 50px;
    background: linear-gradient(360deg, #ff33ee, #eda5fc);
    text-align: center;
    border-radius: 50px;
    padding: 8px 15px;
    font-weight: 900;
    cursor: pointer;
}

.textbutt:hover {
    background: linear-gradient(360deg, #b147bb, #eda5fc);
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