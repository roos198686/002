<template>
    <div class="main">
        <div class="register-container">
            <div class="register-all">
                <!-- 頂部標題 -->
                <div class="allar-top">
                    <div @click="goBack" style="margin-left: 10px;cursor: pointer;color: #a88035;width: 30px;">
                        <Icon icon="material-symbols:arrow-back-ios-rounded" width="18" />
                    </div>
                    <div class="allar-top-a" style="margin-right: 25px;">儲值</div>
                   

                </div>

                <!-- 滾動內容區 -->
                <div class="content-wrapper">
                    <div class="cuekdil">
                        <div style="height: 100%;">
                            <div class="butttop">
                                <div class="butttopone">餘額：</div>
                                <div class="butttoptwo">${{ userInfo.balance }}</div>
                            </div>
                            <div class="buttall">
                                <div class="buttallone"
                                    style="display: flex;flex-direction: row;justify-content: center;">
                                    <div>儲值金額：$</div>
                                    <div><input class="form-inputtext" v-model="amount" type="text" /></div>
                                </div>
                                <div class="buttalltwo">
                                    <div class="buttalltwo-a">快速選擇金額</div>
                                    <div class="buttalltwo-b">
                                        <div class="buttalltwo-ba" :class="{ active: amount == 50 }"
                                            @click="setAmount(50)">50
                                        </div>
                                        <div class="buttalltwo-ba" :class="{ active: amount == 100 }"
                                            @click="setAmount(100)">
                                            100</div>
                                        <div class="buttalltwo-ba" :class="{ active: amount == 200 }"
                                            @click="setAmount(200)">
                                            200</div>
                                    </div>
                                    <div class="buttalltwo-b">
                                        <div class="buttalltwo-ba" :class="{ active: amount == 500 }"
                                            @click="setAmount(500)">
                                            500</div>
                                        <div class="buttalltwo-ba" :class="{ active: amount == 1000 }"
                                            @click="setAmount(1000)">1000</div>
                                        <div class="buttalltwo-ba" :class="{ active: amount == 3000 }"
                                            @click="setAmount(3000)">3000</div>
                                    </div>
                                    <div class="buttalltwo-b">
                                        <div class="buttalltwo-ba" :class="{ active: amount == 5000 }"
                                            @click="setAmount(5000)">5000</div>
                                        <div class="buttalltwo-ba" :class="{ active: amount == 10000 }"
                                            @click="setAmount(10000)">10000</div>
                                        <div class="buttalltwo-ba" :class="{ active: amount == 30000 }"
                                            @click="setAmount(30000)">30000</div>
                                    </div>
                                </div>

                                <div class="buttokds-wrapper" v-if="walletList.length > 0">
                                    <div class="buttokds" v-for="item in walletList" :key="item.id"
                                        @click="selectWallet(item)">
                                        {{ item.coin_type }}
                                        <div style="text-align: right;margin-left: auto;">
                                            <input type="radio" name="coin" :checked="selectedWalletId === item.id" />
                                        </div>
                                    </div>
                                </div>

                                <div class="confirm" @click="confirm">確認</div>
                                <div class="confirm-a">儲值須知幫助</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="copy-toast" v-if="showToast">
            <div style="font-size: 30PX;">
                <Icon icon="iconoir:xmark" width="58" />
            </div>
            <div class="toast-text" style="font-size: 16px;">請選擇幣種</div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import router from '../../../router';
import { Icon } from '@iconify/vue';
import request from '@/utils/request';

const showToast = ref<boolean>(false);
const route = useRoute();
const goBack = () => router.go(-1);

const amount = ref(1000);
const walletList = ref<any[]>([]);
const selectedWalletId = ref<number | null>(null);

const userInfo = reactive({
    balance: '',
});
const loadUserInfo = async () => {
    try {
        const u = localStorage.getItem('user') || '';
        if (!u) return;
        const user = JSON.parse(u);
        const userId = user.id || user.userId;
        const { data: res } = await request.post('/api/recharge/info', { user_id: userId });
        if (res.code === 1 && res.data) {
            userInfo.balance = res.data.balance || '0';
            
        }
    } catch (err) { }
};
const getWalletList = async () => {
    try {
        const { data } = await request.get('/api/recharge/wallet/list');
        if (data.code === 1) {
            walletList.value = data.data;
            if (data.data.length > 0) {
                selectedWalletId.value = data.data[0].id;
            }
        }
    } catch (err) {
        console.log('取得錢包資料失敗', err);
    }
};

const selectWallet = (item: any) => {
    selectedWalletId.value = item.id;
};

const setAmount = (num: number) => {
    amount.value = num;
};

const confirm = () => {
    if (!selectedWalletId.value) {
        showToast.value = true
        setTimeout(() => showToast.value = false, 1500);
        return;
    }

    sessionStorage.setItem('recharge_amount', amount.value + '');
    sessionStorage.setItem('wallet_id', selectedWalletId.value + '');
    router.push('/rpaymentconfirm');
};

watch(() => route.path, () => {
    localStorage.setItem('last_path', route.path);
}, { immediate: true });

onMounted(() => {
    getWalletList();
    loadUserInfo()

    const cacheAmt = sessionStorage.getItem('recharge_amount');
    if (cacheAmt && !isNaN(Number(cacheAmt))) {
        amount.value = Number(cacheAmt);
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
}

.allar-top-a {
    font-size: 15px;
    font-weight: bold;
    color: #8a6520;
    text-align: center;
    width: 100%;
}

/* 滾動容器 */
.content-wrapper {
    position: absolute;
    top: 45px;
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
    background-color: #fff;
}

/* 頁面樣式 */
.copy-toast {
        position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(46, 46, 46, 0.8);
    color: #333;
    padding: 20px;
    border-radius: 8px;
    z-index: 9999;
    min-width: 250px;
}

.butttop {
    background-color: #fcd9abe3;
    height: 120px;
    display: flex;
    flex-direction: row;
    z-index: 9999;
    position: relative;
    border-bottom-left-radius: 60% 40px;
    border-bottom-right-radius: 60% 40px;
    justify-content: center;
    align-items: center;
    font-weight: bolder;
    font-size: 20px;
}

.buttall {
    margin: -70px 10px 50px 10px;
    background-color: #f5f5f5;
    padding-bottom: 30px;
    z-index: 33;
    border-radius: 12px;
    height: 100%;
    position: relative;
}

.butttoptwo {
    color: #ec00d9;
}

.buttallone {
    padding: 80px 0 10px 0;
    color: #cc9b5a;
    border-width: 0 0 1px 0;
    border-style: solid;
    border-color: #ddd;
    font-size: 18px;
    font-weight: 900;
}

.buttalltwo {
    border-width: 0 0 1px 0;
    border-style: solid;
    border-color: #ddd;
    padding-bottom: 20px;
    font-size: 15px;
    font-weight: 900;
    color: #cc9b5a;
}

.buttalltwo-a {
    text-align: left;
    padding: 10px 20px;
}

.buttalltwo-b {
    display: flex;
    flex-direction: row;
    gap: 5px;
    margin: 5px 20px 0 20px;
}

.buttalltwo-ba {
    border-radius: 4px;
    flex: 1;
    border-width: 1px;
    border-style: solid;
    border-color: #c7c6c646;
    color: #333;
    font-size: 12px;
    padding: 8px 0;
    cursor: pointer;
    font-weight: bold;
}

.buttokds {
    height: 35px;
    border-width: 0 0 1px 0;
    border-style: solid;
    border-color: #ddd;
    color: #cc9b5a;
    font-size: 12px;
    line-height: 35px;
    text-align: left;
    padding: 0 20px;
    font-weight: 800;
    display: flex;
    flex-direction: row;
    cursor: pointer;
}

.buttokds-wrapper {
    display: flex;
    flex-direction: column;
}

.buttokds input[type="radio"] {
    accent-color: #cc9b5a;
}

.buttalltwo-ba.active {
    background-color: #cc9b5a;
    color: #333;
}

.confirm {
    background: linear-gradient(360deg, #fac383 60%, #fff);
    padding: 8px;
    margin: 20px;
    font-weight: bold;
    border-radius: 6px;
    cursor: pointer;
}

.confirm:hover {
    background: linear-gradient(360deg, #fca13a 60%, #fff);
}

.confirm-a {
    color: #cc9b5a;
    font-size: 12px;
}

.form-inputtext {
    padding: 0 5px;
    font-size: 18px;
    font-weight: 800;
    color: #cc9b5a;
    outline: none;
    transition: border-color 0.3s;
    background-color: #47444700;
    border: none;
}

.form-inputtext.invalid {
    border: none;
}

.form-inputtext:focus {
    border: none;
    outline: none;
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