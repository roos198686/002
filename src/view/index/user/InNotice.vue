<template>
    <div class="main">
        <div class="register-container">
            <div class="mainheader">
                <!-- 頂部標題�?-->
                <div class="header">
                    <div class="back-icon" @click="$router.back()">
                        <Icon icon="material-symbols:arrow-back-ios-rounded" color="#a88035" height="22" />
                    </div>
                    <div class="title">入駐須知</div>
                </div>

                <div class="content">
                    <div class="notice-title">入駐規範與須知</div>
                    <div class="notice-text">
                        <p>1. 本平台入駐無需實名驗證、無需手機號綁定，充分保護會員隱私。</p>
                        <p>2. 入駐帳號僅限本人使用，請勿轉借、轉售帳號。</p>
                        <p>3. 發布內容需遵守平台規範，禁止違法、違規、不良資訊。</p>
                        <p>4. 入駐後請自覺維護平台秩序，違反規則將凍結相關權限。</p>
                        <p>5. 平台保留最終解釋權，規則變動將另行公告。</p>
                        <p>6. 嚴禁發布色情、暴力、賭博、侵權、謠言及違反公序良俗之內容。</p>
                        <p>7. 禁止利用本平台從事詐騙、導流、非法交易、惡意推廣等行為。</p>
                        <p>8. 請尊重其他用戶，不得惡意謾罵、騷擾、引發爭執、惡意舉報他人。</p>
                        <p>9. 發布圖片、影片、文字等內容時，請確保內容合法合規，自承相關法律責任。</p>
                        <p>10. 帳號若遭盜用、異常登錄，請及時聯繫平台客服處理。</p>
                        <p>11. 違反以上任一條款，平台有權視情節輕重給予警告、內容下架、暫時凍結或永久封禁帳號。</p>
                        <br />
                        <p style="color:#d6b288">溫馨提醒：</p>
                        <p>請仔細閱讀以上條款，申請入駐即代表您已同意本須知全部內容。</p>
                    </div>
                    <div style="padding: 10px 0;color: #fc01fc;">如有疑問，您可隨時聯繫我們*24小時線上客服！</div>
                    <div style="display: flex;flex-direction: row;font-size: 13px;gap: 15px;justify-content: center;">
                            <div @click="user_service"
                                style="cursor: pointer;color: #000;border-radius: 5px;display: flex;background-color: #eafaeb;padding: 3px 20px;">
                                聯繫客服
                            </div>
                            <div @click="goNotice"
                                style="cursor: pointer;color: #000;border-radius: 5px;display: flex;background-color: #fdd3ac;padding: 3px 20px;">
                                申請入駐
                            </div>
                        </div>
                    <div class="btn-back" @click="$router.back()">
                        返回會員中心
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import router from '@/router';
import { Icon } from '@iconify/vue';
// 聯繫客服'
const user_service = () => router.push('/message/235787')

// 跳轉入駐須知'
const goNotice = () => {
    router.push('/applyin')
}
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

.mainheader {
    max-width: 500px;
    width: 100%;
    background-color: #fff;
    height: 100%;
    
}

.header {
    display: flex;
    align-items: center;
    height: 44px;
    background: #f7f7f7;
    padding: 0 15px;
    position: relative;
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
    padding: 15px 30px 150px 30px;
    box-sizing: border-box;
    /* 新增：开启滚�?*/
    overflow-y: auto;
    overflow-x: hidden;
    /* 移动端顺滑滚�?*/
    -webkit-overflow-scrolling: touch;
    height: 100%;
}

.notice-title {
    font-size: 16px;
    font-weight: bold;
    color: #ff33ee;
    margin-bottom: 15px;
    text-align: center;
}

.notice-text {
    font-size: 13px;
    color: #666;
    line-height: 1.8;
    text-align: left;
}

.notice-text p {
    margin: 6px 0;
}

.btn-back {
    margin-top: 40px;
    text-align: center;
    padding: 10px 0;
    border: 1px solid #ff33ee;
    border-radius: 4px;
    color: #ff33ee;
    cursor: pointer;
    font-size: 14px;
}
</style>