<template>
    <div class="main">
        <div class="register-container">
            <div class="mainheader">
                <!-- 頂部標題�?-->
                <div class="header">
                    <div class="back-icon" @click="$router.back()">
                        <Icon icon="material-symbols:arrow-back-ios-rounded" color="#a88035" height="22" />
                    </div>
                    <div class="title">申請入駐</div>
                </div>
                <div class="content">
                    <div class="desc">
                        成為入駐會員，我們充分尊重您的隱私，無需實名驗證、無需手機號驗證，簡單步驟即可完成申請。
                    </div>
                    <div style="text-align: left;color:#666;font-size: 13px;padding:0 30px;">
                        <div>入駐條件：</div>
                        <div>1、年滿18周8周歲滿18周</div>
                        <div>2、通過視頻認證。</div>
                        <div>3、開通平台VIP會員。</div>
                        <div>註：申請提交後，平台工作人員會透過您留下的聯繫方式進行認證！</div>
                    </div>
                    <!-- 表單區：-->
                    <div class="form-box">
                        <div style="display: flex;flex-direction: row;font-size: 14px;gap: 5px;justify-content: right;">
                            <div @click="user_service"
                                style="cursor: pointer;color: #000;border-radius: 5px;display: flex;background-color: #eafaeb;padding: 3px 10px;">
                                聯繫客服
                            </div>
                            <div @click="goNotice"
                                style="cursor: pointer;color: #000;border-radius: 5px;display: flex;background-color: #fdd3ac;padding: 3px 10px;">
                                入駐須知
                            </div>
                        </div>
                        <div v-if="userInfo.status == '0'" class="xudkoklgdfs">
                            <div>
                                您的申請已提交成功，請耐心等待我们的審核，我们会在五个工作日内通过您留下的联系方式联系您！
                            </div>
                            <div style="display: flex;justify-content: center;margin: 20px 0;">
                                <div
                                    style="display: flex;background-color: #fff;color: #000;padding: 5px 20px;border-radius: 5px;">
                                    審核中</div>
                            </div>
                            <div style="text-align: right;font-size: 11px;padding: 5px 0;">申请时间：{{
                                moment(userInfo.create_time).format('YYYY.MM.DD HH:mm') }}</div>
                        </div>


                        <div v-if="userInfo.status < '0'" style="display: flex;flex-direction: column; gap: 10px;">
                            <div class=" form-item">
                                <label>聯繫方式<span
                                        style="font-size: 11px;color:#666;margin-left: 5px;">(必填)</span></label>
                                <input v-model="form.contact" type="text" placeholder="請輸入您的聯繫方式"
                                    :class="{ 'input-error': errorMsg.contact }" />
                            </div>
                            <div v-if="errorMsg.contact" class="error-tip">{{ errorMsg.contact }}</div>
                            <div class="form-item">
                                <label>申請說明<span
                                        style="font-size: 11px;color:#666;margin-left: 5px;">(必填)</span></label>
                                <textarea v-model="form.remark" placeholder="簡單介紹您的服務或商品"
                                    :class="{ 'input-error': errorMsg.remark }"></textarea>
                                <div v-if="errorMsg.remark" class="error-tip">{{ errorMsg.remark }}</div>
                            </div>
                            <div class="btn-group">
                                <div class="btn cancel" @click="$router.back()">返回</div>
                                <div class="btn submit" :class="{ 'btn-disabled': submitLoading }"
                                    :pointer-events="submitLoading ? 'none' : 'auto'" @click="handleSubmit">
                                    {{ submitLoading ? '提交成功，請..' : '提交申請' }}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-if="userInfo.status == '1'" class="xudkoklgdfsaq">
                        <div style="text-align: left;">
                            感謝您的支持，您的申請已通過我們的審核!
                        </div>
                        <div style="padding: 5px 0;text-align: left;">
                            現在您可以發布你的動態，開設您的小店新增商品！
                        </div>
                        <div style="text-align: left;">
                            如需其他協助或支援，您可以隨時聯繫我們*24小時線上客服！
                        </div>
                        <div style="display: flex;justify-content: center;margin: 20px 0;">
                            <div
                                style="display: flex;background-color: #fff;color: #000;padding: 5px 20px;border-radius: 5px;">
                                審核通過</div>
                        </div>
                        <div style="text-align: right;font-size: 11px;padding: 5px 0;">申請時間：{{
                            moment(userInfo.create_time).format('YYYY.MM.DD HH:mm') }}</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="copy-toast" v-if="showToast">
            <div style="font-size: 30PX;">
                <Icon icon="iconoir:xmark" width="58" v-if="!yesno" />
                <Icon icon="iconoir:check" width="58" v-if="yesno" />
            </div>
            <div style="font-size: 16px;">{{ showtext }}</div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import router from '@/router'
import { Icon } from '@iconify/vue'
import request from '@/utils/request' // 你的axios/請求封裝'
import moment from 'moment';
const showToast = ref(false);
const showtext = ref('');
const yesno = ref(false);

// 表單數據'
const form = reactive({
    contact: '',   // 聯繫方式/稱謂'
    remark: ''     // 申請說明'
})

// 校驗錯誤提示'
const errorMsg = reactive({
    contact: '',
    remark: ''
})

// 提交加載狀態'
const submitLoading = ref(false)

// 聯繫客服'
const user_service = () => router.push('/message/235787')

// 跳轉入駐須知'
const goNotice = () => {
    router.push('/innotice')
}

// 表單校驗'
const validateForm = () => {
    let valid = true
    // 清空舊錯誤'
    Object.keys(errorMsg).forEach(key => {
        (errorMsg as any)[key] = ''
    })

    if (!form.contact.trim()) {
        errorMsg.contact = '請填寫聯繫方式'
        valid = false
    }
    if (!form.remark.trim()) {
        errorMsg.remark = '請填寫申請說明'
        valid = false
    }
    return valid
}

// 提交申請'
const handleSubmit = async () => {
    if (!validateForm()) return
    if (submitLoading.value) return
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : {};
    const userId = user.id;
    submitLoading.value = true
    try {
        const { data: res } = await request.post('/api/applyin/apply', {
            user_id: userId,
            contact: form.contact.trim(),
            remark: form.remark.trim()
        })

        if (res.code === 1) {
            showToast.value = true;
            yesno.value = true;
            showtext.value = '申請提交成功，請耐心等待審核！';
            getapplyinlist()
            setTimeout(() => showToast.value = false, 2000);
            form.contact = ''
            form.remark = ''
        } else {
            showToast.value = true;
            yesno.value = false;
            showtext.value = '提交失敗，請稍後重試！';
            setTimeout(() => showToast.value = false, 2000);
        }
    } catch (err) {
        showToast.value = true;
        yesno.value = false;
        showtext.value = '提交入駐申請異常！';
        setTimeout(() => showToast.value = false, 2000);
    } finally {
        submitLoading.value = false
    }
}
//查询申请状态'

const userInfo = reactive({
    status: '',
    create_time: ''
})
const getapplyinlist = async () => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : {};
    const userId = user.id;
    if (!userId) return;

    try {
        const { data: res } = await request.post('/api/applyin/applyinlist', {
            user_id: userId,
        })
        if (res.code === 1) {
            // res.data 為單條記錄異常</ null
            if (res.data) {
                userInfo.status = res.data.status;
                userInfo.create_time = res.data.create_time;
            }
        }
    } catch (err) {
        console.error('查詢入駐記錄異常', err)
    }
}

onMounted(() => {
    getapplyinlist()
});
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

.header {
    display: flex;
    align-items: center;
    background: #f7f7f7;
    padding: 0 15px;
    position: relative;
    align-items: center;
    height: 45px;
    border-bottom: 1px solid #ddd;
    padding-top: env(safe-area-inset-top);
    box-sizing: content-box;
}

.back-icon {
    position: absolute;
    left: 15px;
    cursor: pointer;
}

.title {
    width: 100%;
    text-align: center;
    font-size: 15px;
    font-weight: bold;
    color: #8a6520;
}

.content {
    box-sizing: border-box;
}

.desc {
    font-size: 13px;
    color: #fff;
    font-weight: 800;
    line-height: 1.6;
    margin-bottom: 20px;
    text-align: left;
    padding: 25px 55px 45px 55px;
    border-bottom: 5px solid #ddd;
    border-bottom-left-radius: 60% 40px;
    border-bottom-right-radius: 60% 40px;
    background-color: #ff33ee;
}

.form-box {
    display: flex;
    flex-direction: column;
    gap: 15px;
    padding: 25px;
}

.form-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
    text-align: left;
}

.form-item label {
    font-size: 13px;
    color: #8a6a30;
}

.form-item input,
.form-item textarea {
    width: 100%;
    padding: 10px;
    background: #fff;
    border: 1px solid #444;
    border-radius: 4px;
    color: #333;
    font-size: 13px;
    box-sizing: border-box;
}


.input-error {
    border-color: #f56c6c !important;
}

.error-tip {
    font-size: 11px;
    color: #f56c6c;
    text-align: left;
}

.form-item textarea {
    min-height: 80px;
    resize: none;
}

.btn-group {
    display: flex;
    gap: 10px;
    padding: 25px 0;
}

.btn {
    flex: 1;
    text-align: center;
    padding: 7px 0;
    border-radius: 4px;
    font-size: 13px;
    cursor: pointer;
}

.cancel {
    border: 1px solid #ff33ee;
    color: #ff33ee;
}

.submit {
    background: #ff33ee;
    color: #fff;
}

.btn-disabled {
    opacity: 0.6;
    cursor: not-allowed !important;
}

.mainheader {
    max-width: 500px;
    width: 100%;
    background-color: #fff;
    height: 100%;
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

.xudkoklgdfs {
    background-color: #c05600;
    color: #333;
    font-size: 13px;
    padding: 25px;
    border-radius: 5px;
    margin: 15px 5px;

}

.xudkoklgdfsaq {
    background: linear-gradient(325deg, #ff33ee 0%, #ecc97f 50%, #fff 100%);
    color: #000;
    font-size: 13px;
    padding: 25px;
    border-radius: 5px;
    margin: 15px 25px;
}
</style>