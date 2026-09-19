<template>
    <div class="main">
        <div class="register-container">
            <div class="register-all">
                <!-- 顶部标题：只保留返回按钮 -->
                <div class="allar-top allar-top-transparent">
                    <div class="allar-top-a" @click="goBack">
                        <Icon icon="tabler:chevron-left" height="30" />
                    </div>
                </div>

                <!-- 中间滚动区域 -->
                <div class="content-wrapper">
                    <div class="cuekdil">
                        <div class="allcoueksi">
                            <div :style="nameareva"></div>
                            <div style="margin-top: -30px;border-bottom: 3px solid #eee;">
                                <div class="username-avatar"><img :src="userInfo.avatar" alt="avatar" /></div>
                                <div class="username-rakdi">
                                    <div class="username-text" style="font-weight: 900;">暱稱：{{ userInfo.nickname }}
                                    </div>
                                    <div class="username-text" style="color:#666;">@{{ userInfo.username }}</div>
                                    <div style="display: flex;flex-direction: row;padding: 1px 5px;">
                                        VIP等級：<span style="color: #e200e2;font-weight: bolder;">
                                            {{ !userInfo.vip || userInfo.vip == '0' ? '一般會員' : 'VIP' +
                                                userInfo.vip }}</span></div>
                                    <div style="text-align: right;margin-left: auto;cursor: pointer;color:#666;"
                                        @click="userinfo">
                                        <Icon icon="lucide:settings" height="20" />
                                    </div>
                                </div>

                            </div>

                            <div class="allcoueksi-a" style="align-items: center;">
                                <div class="allcoueksi-atext">
                                    <span style="font-size: 12px;color: #a88035;font-weight: 800;">帳戶餘額：
                                        <span style="font-size: 15px;font-weight: 800;color:#333;">$</span>
                                        <span style="font-size: 23px;font-weight: 800;color:#333;">{{ userInfo.balance
                                            || 0 }}
                                        </span>
                                    </span>
                                </div>
                                <div style="font-size: 12px;color: #e200e2;margin-right: 20px;cursor: pointer;"
                                    @click="yesnopo">{{ yesno == false ? '查看明细' : '收起明细' }}</div>
                            </div>
                            <div v-if="yesno" style="text-align: left;font-size:13px;padding:0 20px 20px 20px;">
                                <div
                                    style="padding: 20px;border: 1px solid #000;border-radius: 6px;background-color: #fff;">
                                    <div style="color:#fc01fc;font-weight:bold;">收入汇总</div>
                                    <div class="allcoueksi-a">
                                        <div style="text-align:center;color:#666;font-size:12px;margin-right: 5px;">
                                            <span>轉帳：</span>
                                            <span style="color:#01f837;">$</span>
                                            <span style="color:#01f837;font-size:12px;">{{
                                                incomeData.transfer_income }}</span>
                                        </div>
                                        <div style="text-align:center;color:#666;font-size:12px;margin-right: 5px;">
                                            <span>商品：</span>
                                            <span style="color:#01f837;">$</span>
                                            <span style="color:#01f837;font-size:12px;">{{
                                                incomeData.goods_income }}</span>
                                        </div>
                                        <div style="text-align:center;color:#666;font-size:12px;margin-right: 5px;">
                                            <span>儲值</span>
                                            <span style="color:#01f837;">$</span>
                                            <span style="color:#01f837;font-size:12px;">{{
                                                incomeData.user_yfrops }}</span>
                                        </div>
                                    </div>
                                    <div style="color:#fc01fc;font-weight:bold;margin-top: 8px;">支出汇总</div>
                                    <div class="allcoueksi-a">
                                        <div style="text-align:center;color:#666;font-size:12px;margin-right: 5px;">
                                            <span>轉帳：</span>
                                            <span style="color:#f80101;">$</span>
                                            <span style="color:#f80101;font-size:12px;">{{
                                                incomeData.transfer_zccome }}</span>
                                        </div>
                                        <div style="text-align:center;color:#666;font-size:12px;margin-right: 5px;">
                                            <span>商品：</span>
                                            <span style="color:#f80101;">$</span>
                                            <span style="color:#f80101;font-size:12px;">{{
                                                incomeData.goods_ingod }}</span>
                                        </div>
                                        <div style="text-align:center;color:#666;font-size:12px;margin-right: 5px;">
                                            <span>VIP:</span>
                                            <span style="color:#f80101;">$</span>
                                            <span style="color:#f80101;font-size:12px;">{{
                                                incomeData.user_vip }}</span>
                                        </div>
                                        <div style="text-align:center;color:#666;font-size:12px;margin-right: 5px;">
                                            <span>提現：</span>
                                            <span style="color:#f80101;">$</span>
                                            <span style="color:#f80101;font-size:12px;">{{
                                                incomeData.user_yfgotx }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="allcoueksi-a" style="gap: 5px;margin:0 20px;">
                                <div class="allcoueksi-btext" @click="user_datingorders">
                                    <Icon icon="material-symbols-light:assignment-rounded" height="40"
                                        style="color: #fc01fc;" />
                                    <div style="width: 50%;">
                                        <div>交易記錄</div>
                                        <div>訂單記錄</div>
                                    </div>
                                </div>
                                <div class="allcoueksi-btext" @click="user_vip">
                                    <Icon icon="streamline-ultimate:vip-crown-queen-1-bold" height="35"
                                        style="color: #fc01fc;" />
                                    <div style="width: 50%;">
                                        <div>VIP管理</div>
                                        <div>目前等級：{{ userInfo.vip || 0 }}</div>
                                    </div>
                                </div>
                                <div class="allcoueksi-btext" @click="user_service">
                                    <Icon icon="mdi:support" height="40" style="color: #fc01fc;" />
                                    <div style="width: 50%;">
                                        <div>線上客服</div>
                                        <div>全天候服務</div>
                                    </div>
                                </div>
                            </div>

                            <div class="kdilspsdas">
                                <div style="flex: 1;display: flex;flex-direction: column;justify-content: center;padding-top: 10px;"
                                    @click="cart">
                                    <div>
                                        <Icon icon="material-symbols:shopping-cart-checkout-rounded" height="28"
                                            style="color:#666;" />
                                    </div>
                                    <div style="color:#666;">購物車</div>
                                </div>
                                <div style="flex: 1;display: flex;flex-direction: column;justify-content: center;padding-top: 10px;"
                                    @click="orders">
                                    <div>
                                        <Icon icon="carbon:ibm-watson-orders" height="28" style="color:#666;" />
                                    </div>
                                    <div style="color:#666;">我的訂單</div>
                                </div>
                                <div style="flex: 1;display: flex;flex-direction: column;justify-content: center;padding-top: 10px;"
                                    @click="address">
                                    <div>
                                        <Icon icon="mdi:address-marker-outline" height="28" style="color:#666;" />
                                    </div>
                                    <div style="color:#666;">收貨位址</div>
                                </div>
                                <div style="flex: 1;display: flex;flex-direction: column;justify-content: center;padding-top: 10px;"
                                    @click="collect">
                                    <div>
                                        <Icon icon="fluent:collections-16-regular" height="28" style="color:#666;" />
                                    </div>
                                    <div style="color:#666;">我的收藏</div>
                                </div>
                            </div>
                            <div class="opsklfop" v-if="Number(userInfo.role_level) == 1">
                                <div style="font-weight: bold;">成為入駐會員</div>
                                <div>我們充分尊重您的隱私，無需實名驗證、無需手機號驗證</div>
                                <div style="display: flex;justify-content: center;gap: 10px;margin: 5px;">
                                    <div @click="goApply"
                                        style="cursor: pointer; border: 1px solid #fc01fc;border-radius: 5px;display: flex;background-color: #fff;padding: 3px 10px;">
                                        申請入駐</div>
                                    <div @click="goNotice"
                                        style="cursor: pointer;color:#333; border: 1px solid #fc01fc;border-radius: 5px;display: flex;background-color: #fc01fc;padding: 3px 10px;">
                                        入駐須知</div>
                                </div>
                            </div>
                            <div style="display: flex;flex-direction: row;padding: 0 20px;gap: 5px;">
                                <div class="myimage" v-if="Number(userInfo.role_level) > 1">
                                    <div class="myimagetext">
                                        <div>個人主頁</div>
                                        <div class="tudslig" @click="artist()">編輯</div>
                                    </div>
                                    <div class="myimagediv" :style="(myImages || []).length < 1 ? 'height:40px;' : ''">
                                        <div v-for="(img, i) in (myImages || []).slice(0, 2)" :key="i" style="flex: 1;">
                                            <img :src="baseURL + img" class="myimageurl">
                                        </div>
                                        <div v-if="(myImages || []).length < 1" class="terxtimage">暫無資料</div>
                                    </div>
                                </div>
                                <div class="myimage" v-if="Number(userInfo.role_level) > 1">
                                    <div class="myimagetext">
                                        <div>我的小店</div>
                                        <div class="tudslig" @click="myshop()">进入</div>
                                    </div>
                                    <div class="myimagediv"
                                        :style="(myshoplist || []).length < 1 ? 'height:40px;' : ''">
                                        <div v-for="(img, i) in myshoplist || []" :key="i" style="flex: 1;">
                                            <img :src="baseURL + img" class="myimageurl">
                                        </div>
                                        <div v-if="(myshoplist || []).length < 1" class="terxtimage">暫無資料</div>
                                    </div>
                                </div>
                            </div>
                            <div class="butopkdo" style="margin-bottom: 20px;">
                                <!-- <div class="butopkdo-text" @click="userrecommend">
                                    <Icon icon="material-symbols:recommend-outline-sharp" height="28" />
                                    <span style="margin-left: 10px;">我的推薦人</span>
                                    <Icon icon="mdi:chevron-right" height="28"
                                        style="text-align: right;margin-left: auto;" />
                                </div> -->
                                <div class="butopkdo-text" @click="user_withdraw">
                                    <Icon icon="basil:wallet-solid" height="28" />
                                    <span style="margin-left: 10px;">提現</span>
                                    <Icon icon="mdi:chevron-right" height="28"
                                        style="text-align: right;margin-left: auto;" />
                                </div>
                                <div class="butopkdo-text" @click="user_resetpass">
                                    <Icon icon="material-symbols:shield-locked" height="28" />
                                    <span style="margin-left: 10px;">重設密碼</span>
                                    <Icon icon="mdi:chevron-right" height="28"
                                        style="text-align: right;margin-left: auto;" />
                                </div>
                                <div class="butopkdo-text" @click="user_resrtpaypass">
                                    <Icon icon="material-symbols:lock-clock-rounded" height="28" />
                                    <span style="margin-left: 10px;">重設支付密碼</span>
                                    <Icon icon="mdi:chevron-right" height="28"
                                        style="text-align: right;margin-left: auto;" />
                                </div>
                                <div class="butopkdo-text" @click="user_recharge">
                                    <Icon icon="fluent:wallet-credit-card-32-filled" height="28" />
                                    <span style="margin-left: 10px;">儲值</span>
                                    <Icon icon="mdi:chevron-right" height="28"
                                        style="text-align: right;margin-left: auto;" />
                                </div>
                                <!-- <div class="butopkdo-texta" @click="copyText">
                                    <Icon icon="ic:baseline-person-add-alt-1" height="28" />
                                    <span style="margin-left: 10px;">邀請碼</span>
                                    <div style="text-align: right;margin-left: auto;">{{ userInfo.invite_code || '' }}
                                    </div>
                                </div> -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="copy-toast" v-if="showToast">
            <div style="font-size: 30PX;">
                <Icon icon="iconoir:check" width="58" />
            </div>
            <div class="toast-text" style="font-size: 16px;">{{ showtext }}</div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref, computed, watch, onUnmounted } from 'vue';
import { Icon } from '@iconify/vue';
import router from '../../../router';
import { useRoute } from 'vue-router';
import request from '@/utils/request';
import { BASE_URLQDAPI } from "@/config/base"
import { io } from 'socket.io-client';
let socket: any = null;
const route = useRoute();
const baseURL = request.defaults.baseURL || '';

const showToast = ref(false);

// 返回上一頁
const goBack = () => {
    router.back()
}
const showtext = ref('');

const yesno = ref(false);
const userInfo = reactive({
    id: '',
    username: '',
    nickname: '',
    avatar: '',
    vip: '',
    balance: '',
    invite_code: '',
    date_card_num: '',
    role_level: '',
    avatar_bg: ''
});

const yesnopo = async () => {
    yesno.value = yesno.value == true ? false : true
}

// 跳轉 申請入駐會員'
const goApply = () => {
    router.push('/applyin')
}

// 跳轉 入駐須知全部內'
const goNotice = () => {
    router.push('/innotice')
}
const loadUserInfo = async () => {
    try {
        const u = localStorage.getItem('user') || '';
        if (!u) return;
        const user = JSON.parse(u);
        const userId = user.id || user.userId;

        const { data: res } = await request.post('/api/user/user/info', { user_id: userId });
        if (res.code === 1 && res.data) {
            const data = res.data;
            userInfo.id = data.id || '';
            userInfo.username = data.username || '';
            userInfo.nickname = data.nickname || '';
            userInfo.avatar = baseURL + (data.avatar || '');
            userInfo.vip = data.vip_level || '';
            userInfo.balance = data.balance || '';
            userInfo.invite_code = data.invite_code || '';
            userInfo.role_level = data.role_level || '';
            userInfo.date_card_num = data.date_card_num || '0';
            userInfo.avatar_bg = data.avatar_bg || '';
        }
    } catch (err) { }
};

// const copyText = () => {
//     const text = userInfo.invite_code || '';
//     try {
//         const input = document.createElement('input');
//         // input.value = BASE_URLQDAPI + 'register?code=' + text;
//         document.body.appendChild(input);
//         input.select();
//         document.execCommand('copy');
//         document.body.removeChild(input);

//         showToast.value = true;
//         showtext.value = '複製成功';
//         setTimeout(() => showToast.value = false, 3000);
//     } catch (e) {
//         showToast.value = true;
//         showtext.value = '複製失敗';
//         setTimeout(() => showToast.value = false, 2000);
//     }
// };

const userinfo = () => router.push('/userinfo');
const user_datingorders = () => router.push('/datingorders');
const user_vip = () => router.push('/user_vip');
const user_withdraw = () => router.push('/user_withdraw');
const user_resetpass = () => router.push('/user_resetpass');
const user_resrtpaypass = () => router.push('/user_resrtpaypass');
const user_recharge = () => router.push('/user_recharge');
const address = () => router.push('/address');
const user_service = () => router.push('/message/235787');
const orders = () => router.push('/orders');
const cart = () => router.push('/cart');
const collect = () => router.push('/collect');


//我的主页'
const artist = () => {
    const u = localStorage.getItem('user') || '';
    if (!u) return;
    const user = JSON.parse(u);
    const userId = user.id || user.userId;
    router.push({ path: '/artist', query: { id: userId } });
};
//我的小店'
const myshop = () => {
    const u = localStorage.getItem('user') || '';
    if (!u) return;
    const user = JSON.parse(u);
    const userId = user.id || user.userId;
    router.push({ path: '/myshop', query: { id: userId } });
};


watch(() => route.path, () => {
    localStorage.setItem('last_path', route.path);
}, { immediate: true });
const myImages = ref<any[]>([]);
const u = localStorage.getItem('user') || '';
//主页'
const getMyImages = async () => {
    if (!u) return;
    const user = JSON.parse(u);
    const userId = user.id || user.userId;
    try {
        const { data: res } = await request.post('/api/user/user/myImages', {
            current_user_id: userId
        });
        if (res.code === 1) {
            // 兜底空数据加载'
            myImages.value = Array.isArray(res.images) ? res.images : [];
        } else {
            myImages.value = [];
        }
    } catch (err) {
        myImages.value = [];
    }
};
const myshoplist = ref<any[]>([]);
//小店'
const getmyshop = async () => {
    if (!u) return;
    const user = JSON.parse(u);
    const userId = user.id || user.userId;
    try {
        const { data: res } = await request.post('/api/user/user/myshop', {
            user_id: userId
        });
        if (res.code === 1) {
            // 后端接口返回 res.cover，统一转为数组兜底'
            const list = res.data ?? [];
            myshoplist.value = Array.isArray(list) ? list : [];
        } else {
            myshoplist.value = [];
        }
    } catch (err) {
        myshoplist.value = [];
    }
};


// 頭像背景'
const nameareva = computed(() => {
    let bgFullUrl: string;
    if (userInfo.avatar_bg) {
        bgFullUrl = baseURL + userInfo.avatar_bg;
    } else {
        bgFullUrl = '/images/userbg.png';
    }
    return {
        height: '220px',
        display: 'flex',
        alignItems: 'center',
        backgroundImage: `url(${bgFullUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
    }
})
// 收益统计数据
const incomeData = reactive({
    transfer_income: 0,
    transfer_zccome: 0,
    goods_income: 0,
    goods_ingod: 0,
    user_yfrops: 0,
    user_yfgotx: 0,
    user_vip: 0,
    total_income: 0,
    total_zccome: 0,
    total_ktkdlsls: 0,//可提现金额'
})

// 加载用户收益统计'
const loadUserIncome = async () => {
    const u = localStorage.getItem('user') || '';
    if (!u) return;
    const user = JSON.parse(u);
    const userId = user.id || user.userId;
    try {
        const { data: res } = await request.post('/api/user/user/incomeStat', {
            user_id: userId
        })
        if (res.code === 1 && res.data) {
            incomeData.transfer_income = Number(res.data.transfer_income) || 0
            incomeData.transfer_zccome = Number(res.data.transfer_zccome) || 0
            incomeData.goods_income = Number(res.data.goods_income) || 0
            incomeData.goods_ingod = Number(res.data.goods_ingod) || 0
            incomeData.user_yfrops = Number(res.data.user_yfrops) || 0
            incomeData.user_yfgotx = Number(res.data.user_yfgotx) || 0
            incomeData.user_vip = Number(res.data.user_vip) || 0
            incomeData.total_income = Number(res.data.total_income) || 0
            incomeData.total_zccome = Number(res.data.total_zccome) || 0
        }
    } catch (err) {
        console.log('收益数据加载失败', err)
    }
}
onMounted(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    loadUserInfo();
    getMyImages();
    getmyshop()
    loadUserIncome();

    if (user.id) {
        socket = io(baseURL, { transports: ['websocket'] });
        socket.emit('bindUserId', user.id);
        socket.on('new_msg', () => {
        });
    }

    const lastPath = localStorage.getItem('last_path');
    if (lastPath && route.path === '/') {
        router.replace(lastPath);
    }
});

onUnmounted(() => {
    if (socket) socket.disconnect();
});
</script>

<style scoped>
@import '../../../assets/css/all.css';

/* ========== 全局布局 ========== */
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


/* 内容滚动容器 */
.content-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow-y: auto;
    overflow-x: hidden;
    box-sizing: border-box;
    padding-bottom: 80px !important;
    background: #fff !important;
}

/* 透明頂欄：讓背景圖延伸到劉海區域 */
.allar-top-transparent {
    background: transparent !important;
    border-bottom: none !important;
}
.allar-top-transparent .allar-top-a {
    color: #fff;
    text-shadow: 0 1px 3px rgba(0,0,0,0.4);
    width: auto;
}

.cuekdil {
    width: 100%;
    min-height: 100%;
    background: #fff;
    padding-bottom: 10px;
}

.allcoueksi {
    color: #333;
}

.username-avatar {
    width: 65px;
    height: 65px;
    border-radius: 50%;
    overflow: hidden;
    margin: 0 15px 0 30px;
    border: 2px solid #c2c0c0;
}

.username-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
}

.username-rakdi {
    font-size: 12px;
    color: #333;
    text-align: left;
    display: flex;
    flex-direction: row;
    padding: 10px 25px;
}

.allcoueksi-a {
    display: flex;
}

.allcoueksi-atext {
    flex: 1;
    margin: 10px 20px;
    display: flex;
    flex-direction: row;
    align-items: flex-end;
}

.allcoueksi-btext {
    flex: 1;
    height: 70px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(325deg, #ff33ee 0%, #ecc97f 50%, #fff 100%);
    font-size: 11px;
    color: #000;
}

.myimage {
    background: #f0f0f0;
    margin: 10px 0;
    border-radius: 5px;
    flex: 1;
}

.myimagetext {
    padding: 7px 10px;
    font-size: 12px;
    background: #e8e8e8;
    color: #8a6a30;
    display: flex;
    border-radius: 5px 5px 0 0;
}

.myimagediv {
    display: flex;
    padding: 8px 5px;
    height: 100px;
    gap: 5px;
    overflow: hidden;
}

.myimageurl {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 4px;
    border: 1px solid #6e6e6e;
}

.tudslig {
    background: #cf9b69;
    padding: 0 7px;
    border-radius: 4px;
    color: #000;
    text-align: right;
    margin-left: auto;
}

.terxtimage {
    flex: 1;
    font-size: 12px;
    color: #666;
    line-height: 30px;
}

.butopkdo {
    background: #f0f0f0;
    margin: 10px 20px 20px 20px;
    border-radius: 5px;
}

.butopkdo-text {
    padding: 10px 20px;
    font-size: 14px;
    color: #a06a30;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #ddd;
}

.butopkdo-texta {
    padding: 10px 20px;
    font-size: 14px;
    color: #a06a30;
    display: flex;
    align-items: center;
}

/* 底部导航 */
.buttnone {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    max-width: 500px;
    margin: 0 auto;
    padding: 10px 0 19px;
    background: #f7f7f7;
    border-top: 1px solid #ddd;
    z-index: 999;
}

.buttnone-all {
    display: flex;
}

.buttnone-alla {
    width: 25%;
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    font-size: 11px;
    color: #d6a6d6;
}

.badge {
    position: absolute;
    top: -4px;
    right: -6px;
    min-width: 16px;
    height: 16px;
    background: #ff33ee;
    color: #fff;
    font-size: 10px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #02fc17;
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

.kdilspsdas {
    display: flex;
    flex-direction: row;
    font-size: 12px;
    background-color: #c0bfbf17;
    margin: 10px 20px 0 20px;
    padding-bottom: 10px;
    border-radius: 6px;
    border: 1px solid #ddd;
}

.username-text {
    padding: 1px 5px;
}

.opsklfop {
    padding: 10px;
    background: linear-gradient(325deg, #ff33ee 0%, #fff 50%, #ff33ee 100%);
    margin: 10px 20px 0 20px;
    border-radius: 5px;
    font-size: 13px;
    gap: 5px;
    display: flex;
    flex-direction: column;
    color: #000;
}

/* 隱藏滾動態，開*/
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