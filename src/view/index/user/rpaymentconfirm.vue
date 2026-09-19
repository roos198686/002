<template>
    <div class="main">
        <div class="register-container">
            <div class="register-all">
                <!-- 顶部标题 完全和你原来一级列表-->
                <div class="allar-top">
                    <div @click="goBack" style="margin-left: 10px;cursor: pointer;">
                        <Icon icon="material-symbols:arrow-back-ios-rounded" width="18" />
                    </div>
                    <div class="allar-top-a" style="text-align: center;width: 80%;">
                        儲值訂單待處理
                    </div>
                </div>

                <!-- 以下内容 100% 完全保留你原来的布局 -->

                <div style="background-color: #111;height: 100%;">
                    <div style="font-size: 13px;padding: 10px 15px;color: #cc9b5a;text-align: left;">
                        轉帳至收款帳戶
                    </div>
                    <div class="listadd">
                        <div class="listaddaq brislid">
                            <div style="width: 60px;text-align: left;font-size: 11px;">訂單編號</div>
                            <div>{{ orderNo }}</div>
                            <div class="copy-btn" @click="copyText(orderNo)">複製</div>
                        </div>
                        <div class="listaddaq brislid">
                            <div style="width: 60px;text-align: left;font-size: 11px;">幣種</div>
                            <div>{{ coin_type }}</div>
                            <div class="copy-btn" @click="copyText(coin_type)">複製</div>
                        </div>
                        <div class="listaddaq brislid">
                            <div style="width: 60px;text-align: left;font-size: 11px;">錢包位址</div>
                            <div>{{ wallet_address }}</div>
                            <div class="copy-btn" @click="copyText(wallet_address)">複製</div>
                        </div>
                        <div class="listaddaq">
                            <div style="width: 60px;text-align: left;font-size: 11px;">儲值金額</div>
                            <div>{{ amount }}</div>
                            <div class="copy-btn" @click="copyText(amount)">複製</div>
                        </div>
                    </div>

                    <div style="margin:20px 35px;">
                        <div style="color:#cc9b5a;margin-bottom:8px;font-size: 12px;">上傳付款憑證
                        </div>
                        <div style="font-size:12px;color:#666;margin-bottom:10px;">
                            請上傳轉帳截圖做為憑證
                        </div>

                        <div class="upload-box" @click="triggerUpload">
                            <img v-if="previewImage" :src="previewImage" class="preview-img" />
                            <span style="font-size: 13px;" v-else>點擊上傳圖片</span>
                        </div>
                        <input type="file" id="fileInput" accept="image/*" style="display:none;"
                            @change="handleUpload" />
                    </div>

                    <div class="confirm" @click="submitPayment">已完成付款</div>
                    <div class="confirm" @click="goService">線上客服</div>
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
import { onMounted, ref } from 'vue';
import { Icon } from '@iconify/vue';
import { useRouter } from 'vue-router'
import request from '@/utils/request';

const router = useRouter();
const goBack = () => router.go(-1);
const yesno = ref(false);
const amount = ref('');
const coin_type = ref('');
const wallet_address = ref('');

const orderNo = ref('');
const generateOrderNo = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    orderNo.value = 'RY' + timestamp + random;
};

const previewImage = ref('');
const imageFile = ref<File | null>(null);
const triggerUpload = () => {
    const input = document.getElementById('fileInput') as HTMLInputElement;
    input?.click();
};
const handleUpload = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;
    imageFile.value = file;
    previewImage.value = URL.createObjectURL(file);
};

const showtext = ref('');
const showToast = ref(false);
const copyText = (text: any) => {
    try {
        const input = document.createElement('input');
        input.value = text;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);

        showToast.value = true;
        yesno.value = true;
        showtext.value = '複製成功';
        setTimeout(() => showToast.value = false, 3000);
    } catch (e) {
        showToast.value = true;
        yesno.value = false;
        showtext.value = '複製失敗';
        setTimeout(() => showToast.value = false, 2000);
    }
};

const submitPayment = async () => {
    if (!previewImage.value || !imageFile.value) {
        showToast.value = true;
        yesno.value = false;
        showtext.value = '請上傳付款憑證';
        setTimeout(() => showToast.value = false, 1500);
        return;
    }

    try {
const user = JSON.parse(localStorage.getItem('user') || '{}')
        if (!user) return;
        const user_id = user?.id || '';
        const remark = '用戶儲值';
        const formData = new FormData();
        formData.append('user_id', user_id);
        formData.append('order_no', orderNo.value);
        formData.append('amount', amount.value);
        formData.append('coin_type', coin_type.value);
        formData.append('wallet_address', wallet_address.value);
        formData.append('type', '2');
        formData.append('proof_file', imageFile.value!);
        formData.append('invite_code', '');
        formData.append('remark', remark);
        const { data: res } = await request.post('/api/recharge/submit', formData);

        if (res.code === 1) {
            showToast.value = true;
            yesno.value = true;
            showtext.value = '提交成功，請等候審核';
            setTimeout(() => router.push('/datingorders'), 1500);
        } else {
            showToast.value = true;
            yesno.value = false;
            showtext.value = res.msg || '提交失敗';
            setTimeout(() => showToast.value = false, 2000);
        }
    } catch (err) {
        showToast.value = true;
        yesno.value = false;
        showtext.value = '提交失敗';
        setTimeout(() => showToast.value = false, 2000);
    }
};

const goService = () => {
   router.push('/message/235787')
};

const getWalletInfo = async (wallet_id: string) => {
    try {
        const { data } = await request.get('/api/recharge/wallet/info', {
            params: { wallet_id }
        });
        if (data.code === 1) {
            coin_type.value = data.data.coin_type;
            wallet_address.value = data.data.address;
        }
    } catch (err) {
        console.log('取得錢包資訊失敗');
    }
};

onMounted(() => {
    generateOrderNo();
    const amt = sessionStorage.getItem('recharge_amount');
    const wallet_id = sessionStorage.getItem('wallet_id');
    if (amt) amount.value = amt;
    if (wallet_id) getWalletInfo(wallet_id);
});
</script>

<style scoped>
/* ========== 只保留你原来的所有样�?========== */
/* @import '../../assets/css/index.css'; */

.form-inputtext {
    padding: 0 15px;
    font-size: 16px;
    font-weight: 800;
    color: #000;
    text-align: center;
    outline: none;
    transition: border-color 0.3s;
    background-color: #d4cfd4;
    border: none;
    border-radius: 4px;
    height: 30px;
}

.form-inputtext.invalid {
    border: none;
}

.form-inputtext:focus {
    border: none;
    outline: none;
}

.allar-top {
    display: flex;
    align-items: center;
    color: #cc9b5a;
    background: #f7f7f7;
    height: 45px;
    border-bottom: 1px solid #ddd;
}

.allar-top-a {
    margin-left: 15px;
    font-size: 15px;
    font-weight: bold;
    color: #8a6520;
}

.copy-btn {
    cursor: pointer;
    text-align: right;
    margin-left: auto;
    background-color: #cc9b5a;
    border-radius: 6px;
    color: #000;
    font-size: 11px;
    padding: 3px 10px;
}

.confirm {
    background: linear-gradient(360deg, #fac383 60%, #fff);
    padding: 10px;
    border-radius: 6px;
    margin: 10px 20px;
    text-align: center;
    cursor: pointer;
    font-size: 12px;
    font-weight: 700;
}

.confirm:hover {
    background: linear-gradient(360deg, #fca13a 60%, #fff);
}

.upload-box {
    width: 100%;
    height: 120px;
    border: 1px dashed #cc9b5a;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #cc9b5a;
    cursor: pointer;
    overflow: hidden;
}

.preview-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

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

.listadd {
    background-color: #f5f5f5;
    color: #d3d3d3;
    font-size: 13px;
    padding: 10px 0;
}

.listaddaq {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    padding: 5px 15px;
    font-size: 11px;
}

.brislid {
    border-width: 0 0 1px 0;
    border-style: solid;
    border-color: #ddd;
}

/* 全局样式 100% 和你原来一级列表*/
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
    /* background: #fff; */
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

::-webkit-scrollbar {
    display: none;
}

:global(html),
:global(body) {
    background: #fff !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
    height: 100% !important;
}
</style>