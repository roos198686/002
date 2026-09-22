<template>
    <div class="main">
        <div class="register-container">
            <div class="register-all">
                <!-- 頂部標題 -->
                <div class="allar-top">
                    <div @click="goBack" style="margin-left: 10px;cursor: pointer;color: #000;width: 30px;">
                        <Icon icon="material-symbols:arrow-back-ios-rounded" width="18" />
                    </div>
                    <div class="allar-top-a">VIP 管理</div>
                </div>

                <!-- 滾動內容區 -->
                <div class="content-wrapper">
                    <div class="cuekdil">
                        <div style="display: flex;flex-direction: row;padding-top: 20px;align-items: center;">
                            <div style="color: #000;font-weight: bold;font-size: 14px;padding-left: 20px;">
                                目前等級：
                                <span style="color: #e64dde;">{{ userInfo.vip ? 'VIP' + userInfo.vip : '一般會員' }}</span>
                            </div>
                        </div>

                        <div class="vipall">
                            <div class="viptext" v-for="item in vipList" :key="item.vip_level">
                                <div style="height: 60px;width:15%;">
                                    <img :src="item.icon_url == 1 ? imagea : item.icon_url == 2 ? imageb : imagec"
                                        style="width:100%;height:100%;object-fit:cover;">
                                </div>
                                <div
                                    style="display: flex;flex-direction: column;text-align: left;width:25%;justify-content: center;margin-left: 10px;">
                                    <div style="color: #d400ca;font-weight: bold;font-size: 15px;">VIP{{ item.vip_level
                                        }}</div>
                                    <div style="color:#666;font-size: 12px;">儲值金額{{ item.recharge_amount }}</div>
                                </div>
                                <div
                                    style="display: flex;flex-direction: column;text-align: center;flex: 1; justify-content: center;">
                                    <div style="font-size: 14px;color:#333;">權益</div>
                                    <div style="font-size: 12px;color:#666;">
                                        {{ item.privilege_desc }}
                                    </div>
                                </div>
                                <div class="upgrade"
                                    :class="Number(userInfo?.vip) + 1 == item.vip_level ? 'upgrade--active' : 'upgrade--disabled'"
                                    @click="recharge(item)">升級</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="copy-toastas" v-if="zuzjkdsoa">
            <div style="font-size: 30px;width: 100%;height: 150px;color:#fff; display: flex;background-color: #f708af;align-items: center;border-bottom-left-radius: 60% 40px;
    border-bottom-right-radius: 60% 40px;">
                <div style="height: 60px;width:15%;margin-left: 20px;">
                    <img :src="vakdilsog == 100 ? imagea : vakdilsog == 300 ? imageb : imagec"
                        style="width:100%;height:100%;object-fit:cover;">
                </div>
                <div style="font-size: 16px;">升級為：VIP{{ vakdilsog == 100 ? '1' : vakdilsog == 300 ? '2' : '3' }}</div>
            </div>
            <div
                style="border-radius: 30px 30px 0 0;background-color: #fff;width: 100%;color: #000;text-align: left;position: relative;margin-top: auto;flex: 1;">
                <div style="font-size: 16px;margin-top: 30px;margin-left: 30px;">可用餘額：{{ userInfo.balance }}</div>
                <div style="font-size: 36px;margin-top: 10px;margin-left: 30px;font-weight: bold;">
                    <div class="form-input">${{ vakdilsog }}</div>
                </div>
                <div style="display: flex;flex-direction: row;margin: 50px 20px 20px 20px;gap: 15px;">
                    <div class="buttdgr" @click="zuzjkdsoa = false">取消</div>
                    <div class="buttdgraa" @click="router.push(`/user_recharge`)" v-if="userInfo.balance < vakdilsog">
                        前往儲值</div>
                    <div class="buttdgraa" @click="datingcard" v-else>升級</div>
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
import { onMounted, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import router from '../../../router';
import { Icon } from '@iconify/vue';
import request from '@/utils/request';

// const amountyqm = ref('');
const route = useRoute();
const zuzjkdsoa = ref(false)
const vakdilsog = ref()

const showToast = ref(false);
const showtext = ref('');
const yesno = ref(false);
const goBack = () => router.go(-1);

const recharge = (item: any) => {
    zuzjkdsoa.value = true
    vakdilsog.value = item.recharge_amount
};

// VIP列表資料'
const vipList = ref([])

// 拉取VIP配置列表'
const getVipList = async () => {
    try {
        const { data: res } = await request.get('/api/user_vip/viplist')
        if (res.code === 200) {
            vipList.value = res.data || []
        }
    } catch (err) {
        console.error('取得VIP列表失敗', err)
    }
}
//购买VIP
const datingcard = async () => {
    const balance = Number(userInfo.balance);

    if (balance < vakdilsog.value) {
        showToast.value = true;
        yesno.value = false;
        showtext.value = '餘額不足';
        setTimeout(() => showToast.value = false, 1000);
        return;
    }
    try {
        const { data } = await request.post('/api/user_vip/buy-vip', {
            user_id: userInfo.id,
            amount: vakdilsog.value,
        });
        if (data.code === 1) {
            showToast.value = true;
            yesno.value = true;
            showtext.value = '購買成功';
            setTimeout(() => showToast.value = false, 1000);
            zuzjkdsoa.value = false;
            loadUserInfo();
        } else if (data.code === 200) {
            showToast.value = true;
            yesno.value = false;
            showtext.value = '餘額不足';
            setTimeout(() => showToast.value = false, 1000);
        } else {
            showToast.value = true;
            yesno.value = false;
            showtext.value = '請求失敗';
            setTimeout(() => showToast.value = false, 1000);
        }
    } catch (err) {
        showToast.value = true;
        yesno.value = false;
        showtext.value = '請求失敗';
        setTimeout(() => showToast.value = false, 1000);
    }
};

const imagea = ref('/images/vip1.png')
const imageb = ref('/images/vip2.png')
const imagec = ref('/images/vip3.png')

const userInfo = reactive({
    vip: '',
    date_card_num: '',
    balance: '',
    id: '',
});

const loadUserInfo = async () => {
    try {
        const u = localStorage.getItem('user') || '';
        if (!u) return;
        const user = JSON.parse(u);
        const userId = user.id || user.userId;

        const { data: res } = await request.post('/api/user/user/info', { user_id: userId });
        if (res.code === 1 && res.data) {
            const data = res.data;
            userInfo.balance = data.balance || '0'
            userInfo.date_card_num = data.date_card_num || '0'
            userInfo.vip = data.vip_level || ''
            userInfo.id = data.id || '';
        }
    } catch (err) { }
};

watch(() => route.path, () => {
    localStorage.setItem('last_path', route.path);
}, { immediate: true });

onMounted(() => {
    loadUserInfo()
    getVipList()
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
    padding: calc(9px + env(safe-area-inset-top)) 0 9px 0;
    background: #f7f7f7;
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
    background: #fff !important;
}

.cuekdil {
    width: 100%;
    min-height: 100%;
    padding-bottom: 10px;
}

.vipall {
    padding: 15px 20px;
    height: 100%;
}

.viptext {
    display: flex;
    flex-direction: row;
    padding: 15px 20px;
    border-radius: 5px;
    box-shadow: 0 0 1px 1px rgb(226, 226, 226);
    margin-bottom: 15px;
    background-color: #f5f5f5;
}

.upgrade {
    background-color: #a1a1a1;
    font-size: 12px;
    height: 25px;
    margin-top: 17.5px;
    border-radius: 50px;
    line-height: 25px;
    padding: 0 10px;
    color: #000;
    cursor: pointer;
    text-align: center;
}

.upgrade--active {
    background-color: #f5d1fc;
    box-shadow: 0 0 1px 1px rgb(226, 149, 245);
}

.upgrade--disabled {
    background-color: #888888;
    box-shadow: 0 0 1px 1px rgb(114, 114, 114);
    pointer-events: none;
    color: #fff;
}

.copy-toastas {
    position: fixed;
    width: 100%;
    max-width: 500px;
    height: 100%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #fff;
    display: flex;
    flex-direction: column;
    z-index: 9999;
}

.buttdgr {
    background-color: #71a761;
    padding: 8px;
    border-radius: 7px;
    text-align: center;
    color: #fff;
    flex: 1;
}

.buttdgraa {
    background-color: #cc7c21;
    padding: 8px;
    border-radius: 7px;
    text-align: center;
    color: #fff;
    flex: 1;
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

.form-inputtext {
    padding: 5px 15px;
    font-size: 16px;
    font-weight: 800;
    color: #000;
    text-align: center;
    outline: none;
    transition: border-color 0.3s;
    background-color: #f1f1f1;
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