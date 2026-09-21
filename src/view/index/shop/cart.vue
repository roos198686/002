<template>
    <div class="main">
        <div class="register-container">
            <div class="register-all">
                <!-- 顶部 -->
                <div class="allar-top">
                    <div class="allar-top-a" @click="goBack">
                        <Icon icon="tabler:chevron-left" height="30" />
                    </div>
                    <div class="allar-top-r">購物車</div>
                </div>

                <!-- 内容或上传-->
                <div class="content-wrapper" id="cartScroll" data-scroll-cache>
                    <div class="cuekdil">
                        <div class="cart-list-wrap">
                            <!-- 购物车商品-->
                            <div class="cart-item" v-for="item in cartList" :key="item.id">
                                <div class="cart-check" @click="toggleCheck(item.id)">
                                    <div class="circle" :class="{ checked: checkedIds.includes(item.id) }"></div>
                                </div>
                                <div class="cart-goods">
                                    <div class="goods-pic-wrap">
                                        <img :src="baseURL + item.goods_cover" class="goods-img" />
                                    </div>

                                    <div class="goods-info">
                                        <div class="goods-name" @click="toDetail(item.goods_id)">{{ item.goods_name }}
                                        </div>
                                        <div class="goods-spec">
                                            <span>顏色</span>
                                            <select v-model="item.color" class="spec-select">
                                                <option v-for="(c, i) in (item.goods_color?.split('/') || [])" :key="i"
                                                    :value="c">{{ c }}</option>
                                            </select>
                                            <span class="spec-label-gap">規格</span>
                                            <select v-model="item.spec" class="spec-select">
                                                <option v-for="(c, i) in (item.goods_spec?.split('/') || [])" :key="i"
                                                    :value="c">{{ c }}</option>
                                            </select>
                                        </div>
                                        <div class="num-box">
                                            <div class="num-btn" @click.stop="updateNum(item, -1)">-</div>
                                            <div class="num-text">{{ item.number }}</div>
                                            <div class="num-btn" @click.stop="updateNum(item, 1)">+</div>
                                        </div>
                                        <div class="price-row">
                                            <div class="now-price">
                                                <span class="text-mini-gray">單價</span>
                                                <span class="text-mini-white">$</span>
                                                <span class="text-mini-white">{{ item.price }}</span>
                                                <span class="text-mini-gray text-gap-left">总價</span>
                                                <span>$</span>
                                                <span>{{ item.price * item.number }}</span>
                                            </div>
                                        </div>
                                        <div class="del-row">
                                            <div class="single-del-btn" @click.stop="delSingleItem(item.id)">
                                                刪除
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- 空状态-->
                            <div class="empty-tip" v-if="cartList.length === 0 && !loading">
                                購物車暫無商品
                            </div>
                            <div class="loading-tip" v-if="loading">載入中.....</div>
                        </div>
                        <!-- 推荐商品 -->
                        <div class="recommend-wrap" id="recommend-area">
                            <div class="recommend-title">為你推薦</div>
                            <div class="waterfall-box">
                                <div class="waterfall-item" v-for="item in showList" :key="item.id"
                                    @click="toDetail(item.id)">
                                    <div class="waterfall-item-all">
                                        <div class="goods-img-wrap">
                                            <img :src="baseURL + item.cover" class="rec-goods-img">
                                        </div>
                                        <div class="rec-info-wrap">
                                            <div class="rec-name">{{ item.name }}</div>
                                            <div class="rec-price-row">
                                                <span class="rec-price-tag">驚喜價</span>
                                                <span class="price-symbol">$</span>{{ item.price }}
                                                <span class="rec-sales">已售：{{ item.sales }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="blank-height"></div>
                    </div>
                </div>

                <!-- 底部结算工具栏【移动端适配优化�?-->
                <div class="cart-bottom">
                    <div class="check-all" @click="toggleAll">
                        <div class="circle" :class="{ checked: isAllChecked }"></div>
                        <span class="check-text">全選</span>
                    </div>
                    <div class="total">合計：<span class="total-price">${{ totalPrice }}</span></div>
                    <div class="delete-btn" @click="deleteChecked">刪除</div>
                    <div class="buy-btn" @click="goCheck">結帳</div>
                </div>
            </div>
        </div>

        <!-- Toast提示 -->
        <div class="copy-toast" v-if="showToast">
            <div class="toast-icon">
                <Icon icon="iconoir:xmark" width="58" v-if="!yesno" />
                <Icon icon="iconoir:check" width="58" v-if="yesno" />
            </div>
            <div class="toast-text">{{ showtext }}</div>
        </div>

        <!-- 支付loading -->
        <div class="copy-toast" v-if="showToastaqw">
            <div class="toast-icon">
                <Icon icon="svg-spinners:12-dots-scale-rotate" width="58" />
            </div>
            <div>付款成功</div>
        </div>

        <!-- 支付弹窗 -->
        <div class="buy-popup-mask" v-show="showPayPopup">
            <div class="buy-popup" :class="{ show: showPayPopup }">
                <div class="popup-head">
                    <div class="close" @click="closePayPopup">×</div>
                </div>
                <div class="popup-body">
                    <div class="popup-title">訂單付款</div>
                    <div class="money-row">
                        <span>應付金額：</span>
                        <span class="money-symbol">$</span>
                        <span class="money-num">{{ totalPrice }}</span>
                    </div>
                    <div class="input-wrap">
                        <label class="input-label">請輸入支付密碼</label>
                        <input v-model="payPwd" type="password" placeholder="請輸入支付密碼" class="popup-input" />
                    </div>
                    <div class="popup-submit" @click="submitPay">確認付款 ${{ totalPrice }}</div>
                </div>
            </div>
        </div>

        <!-- 设置密码弹窗 -->
        <div class="buy-popup-mask" v-show="showSetPwdPopup">
            <div class="buy-popup" :class="{ show: showSetPwdPopup }">
                <div class="popup-head">
                    <div class="close" @click="closeSetPwdPopup">×</div>
                </div>
                <div class="popup-body">
                    <div class="popup-title">設定支付密碼</div>
                    <div class="input-wrap">
                        <label class="input-label">支付密碼</label>
                        <input v-model="newPwd" type="password" placeholder="請輸入支付密碼" class="popup-input" />
                    </div>
                    <div class="input-wrap">
                        <label class="input-label">確認密碼</label>
                        <input v-model="confirmPwd" type="password" placeholder="請再次輸入密碼" class="popup-input" />
                    </div>
                    <div class="err-text" v-if="pwdErrMsg">{{ pwdErrMsg }}</div>
                    <div class="popup-submit" @click="submitSetFundPwd"
                        :style="{ background: loadingPay ? '#ccc' : '' }">
                        {{ loadingPay ? '提交中' : '確認設定' }}
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed } from 'vue';
import router from '../../../router';
import { Icon } from '@iconify/vue';
import request from '@/utils/request';
import { useScrollCache } from '@/composables/useScrollCache'

defineOptions({ name: 'CartList' })
useScrollCache()

const baseURL = request.defaults.baseURL || '';
const cartList = ref<any[]>([]);
const checkedIds = ref<any[]>([]);
const loading = ref(false);
const showToast = ref(false);
const showtext = ref('');
const yesno = ref(false);

const showList = ref<any[]>([]);
const showPayPopup = ref(false);
const payPwd = ref('');
const showSetPwdPopup = ref(false);
const newPwd = ref('');
const confirmPwd = ref('');
const pwdErrMsg = ref('');
const loadingPay = ref(false);
const showToastaqw = ref(false);

const goBack = () => {
    router.go(-1);
};

const getUser = () => {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
};

const getCart = async () => {
    const user = getUser();
    if (!user) return;
    loading.value = true;
    try {
        const { data } = await request.get('/api/cart/list', { params: { user_id: user.id } });
        if (data.code === 1) cartList.value = data.data || [];
    } catch (err) { } finally { loading.value = false; }
};

const toggleCheck = (id: any) => {
    if (checkedIds.value.includes(id)) {
        checkedIds.value = checkedIds.value.filter(i => i !== id);
    } else {
        checkedIds.value.push(id);
    }
};

const toggleAll = () => {
    if (checkedIds.value.length === cartList.value.length) {
        checkedIds.value = [];
    } else {
        checkedIds.value = cartList.value.map(i => i.id);
    }
};

const isAllChecked = computed(() => {
    return cartList.value.length > 0 && checkedIds.value.length === cartList.value.length;
});

const totalPrice = computed(() => {
    let total = 0;
    cartList.value.forEach(item => {
        if (checkedIds.value.includes(item.id)) total += item.price * item.number;
    });
    return total.toFixed(2);
});

const updateNum = async (item: any, type: number) => {
    let num = item.number + type;
    if (num < 1) num = 1;
    try {
        await request.post('/api/cart/update', { id: item.id, number: num });
        item.number = num;
    } catch (err) { }
};

const deleteChecked = async () => {
    if (!checkedIds.value.length) return;
    try {
        await request.post('/api/cart/delete', { ids: checkedIds.value });
        checkedIds.value = [];
        getCart();
    } catch (err) { }
};

const toDetail = (id: any) => {
    router.push({ path: '/goods-detail', query: { id: id.toString() } });
};

const goCheck = async () => {
    if (!checkedIds.value.length) {
        showtext.value = '請選擇商品';
        yesno.value = false;
        showToast.value = true;
        setTimeout(() => showToast.value = false, 1500);
        return;
    }
    const hasSet = await checkHasPayPwd();
    hasSet ? (showPayPopup.value = true) : (showSetPwdPopup.value = true);
};

const checkHasPayPwd = async () => {
    try {
        const user = getUser();
        const { data } = await request.post('/api/user/check-pay-pwd', { user_id: user.id });
        return data?.has_pay_pwd || false;
    } catch (e) {
        return false;
    }
};

const closePayPopup = () => {
    showPayPopup.value = false;
    payPwd.value = '';
};
const closeSetPwdPopup = () => {
    showSetPwdPopup.value = false;
    newPwd.value = '';
    confirmPwd.value = '';
    pwdErrMsg.value = '';
};

const submitSetFundPwd = async () => {
    if (!newPwd.value || !confirmPwd.value) {
        showtext.value = '請填寫完整密碼';
        showToast.value = true;
        yesno.value = false;
        return;
    }
    if (newPwd.value.length < 6) {
        showtext.value = '密碼至少6位';
        showToast.value = true;
        yesno.value = false;
        return;
    }
    if (newPwd.value !== confirmPwd.value) {
        showtext.value = '兩次密碼不一致';
        showToast.value = true;
        yesno.value = false;
        return;
    }

    loadingPay.value = true;
    try {
        const user = getUser();
        const { data } = await request.post('/api/user/set-fund-pwd', {
            user_id: user.id,
            pay_pwd: newPwd.value
        });
        if (data.code === 1) {
            closeSetPwdPopup();
            setTimeout(() => (showPayPopup.value = true), 500);
        }
    } catch (e) { } finally { loadingPay.value = false; }
};

const submitPay = async () => {
    if (showToastaqw.value) return;
    if (!payPwd.value) {
        showtext.value = '請輸入密碼';
        yesno.value = false;
        showToast.value = true;
        setTimeout(() => showToast.value = false, 1000);
        return;
    }

    showToastaqw.value = true;
    try {
        const user = getUser();
        const selectedCart = cartList.value
            .filter(item => checkedIds.value.includes(item.id))
            .map(item => ({
                cart_id: item.id,
                touser_id: item.touser_id
            }));

        if (selectedCart.length === 0) {
            showtext.value = '請選擇商品';
            yesno.value = false;
            showToast.value = true;
            setTimeout(() => showToast.value = false, 1000);
            return;
        }

        const reqData = {
            user_id: user.id,
            cart_list: selectedCart,
            pay_password: payPwd.value,
            logistics_content: '',
            logistics_status: '1'
        };

        const { data } = await request.post('/api/cart/cartPay', reqData);
        if (data.code === 1) {
            showtext.value = '付款成功';
            yesno.value = true;
            showToast.value = true;
            setTimeout(() => {
                showToast.value = false;
                getCart();
                closePayPopup();
                checkedIds.value = [];
                router.push('/orders');
            }, 1000);
        } else {
            showtext.value = data.msg || '付款失敗';
            yesno.value = false;
            showToast.value = true;
            setTimeout(() => showToast.value = false, 1000);
        }
    } catch (err) {
        showtext.value = '網路請求失敗';
        yesno.value = false;
        showToast.value = true;
        setTimeout(() => showToast.value = false, 1000);
    } finally {
        showToastaqw.value = false;
    }
};

const loadGoods = async () => {
    try {
        const { data } = await request.post('/api/shop/list', {
            page: 1,
            limit: 20,
            keyword: ''
        });
        if (data.code === 1) {
            showList.value = data.data;
        }
    } catch (err) { }
};

const delSingleItem = async (cartId: number | string) => {
    try {
        await request.post('/api/cart/delete', { ids: [cartId] });
        getCart();
        showtext.value = '刪除成功';
        yesno.value = true;
        showToast.value = true;
        setTimeout(() => showToast.value = false, 1500);
    } catch (err) {
        showtext.value = '刪除失敗';
        yesno.value = false;
        showToast.value = true;
        setTimeout(() => showToast.value = false, 1500);
    }
};

onMounted(async () => {
    getCart();
    loadGoods();
});
</script>

<style scoped>
@import '../../../assets/css/all.css';

.main {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    background: #fff;
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

.allar-top {
    display: flex;
    align-items: center;
    height: 45px;
    padding: 0 12px;
    width: 100%;
    box-sizing: border-box;
    padding-top: env(safe-area-inset-top);
    box-sizing: content-box;
}

.allar-top-a {
    cursor: pointer;
}

.allar-top-r {
    flex: 1;
    text-align: center;
    font-size: 16px;
    font-weight: bold;
}

/* 滚动内容区域 同步适配底部安全選*/
.content-wrapper {
    position: absolute;
    top: calc(45px + env(safe-area-inset-top));
    left: 0;
    right: 0;
    bottom: calc(60px + env(safe-area-inset-bottom));
    overflow-y: auto;
}

.cuekdil {
    width: 100%;
    min-height: 100%;
}

.cart-list-wrap {
    padding: 10px;
}

/* 购物车商品项 */
.cart-item {
    display: flex;
    align-items: flex-start;
    background: #f7f7f7;
    border-radius: 8px;
    padding: 14px;
    margin-bottom: 10px;
    box-shadow: 0 0 3px 1px rgb(223, 223, 223);
}

.cart-check {
    padding-right: 10px;
    padding-top: 6px;
}

.circle {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 1px solid #999;
}

.circle.checked {
    background: #d502ff;
    border-color: #999;
}

.cart-goods {
    display: flex;
    flex: 1;
}

.goods-img {
    width: 70px;
    height: 70px;
    border-radius: 6px;
    object-fit: cover;
}

.goods-info {
    flex: 1;
    padding-left: 12px;
    text-align: left;
}

.goods-name {
    color: #333;
    font-size: 14px;
    margin-bottom: 5px;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
}

.goods-spec {
    color: #777;
    font-size: 13px;
    margin-bottom: 6px;
}

.spec-label-gap {
    margin-left: 10px;
}

.spec-select {
    padding: 3px 6px;
    border-radius: 4px;
    border: 1px solid #666;
    margin: 0 5px;
    font-size: 11px;
    background: #fff;
    color: #333;
    outline: none;
}

.num-box {
    display: flex;
    align-items: center;
    gap: 3px;
    margin-bottom: 5px;
}

.num-btn {
    width: 24px;
    height: 24px;
    line-height: 24px;
    text-align: center;
    background: #fff;
    color: #000;
    border-radius: 4px;
    border: 1px solid #acb2ca;
}

.num-text {
    color: #333;
    padding: 0 5px;
    font-size: 13px;
}

.now-price {
    color: #ff019e;
    font-size: 15px;
    font-weight: bold;
}

.text-mini-gray {
    font-size: 13px;
    color: #777;
    margin-right: 3px;
}

.text-mini-white {
    font-size: 13px;
    color: #333;
}

.text-gap-left {
    margin-left: 10px;
}

.del-row {
    display: flex;
    justify-content: flex-end;
}

.single-del-btn {
    margin-top: 5px;
    background-color: #ff33ee;
    font-size: 14px;
    color: #fff;
    padding: 3px 10px;
    border-radius: 5px;
    cursor: pointer;
}

.empty-tip {
    color: #777;
    text-align: center;
    padding: 60px 0;
    font-size: 13px;
}

.loading-tip {
    color: #777;
    text-align: center;
    padding: 20px;
}

/* 推荐商品 */
/* .recommend-wrap {
    padding:10px 5px;
}
.recommend-title {
    color:#333;
    font-size:14px;
    font-weight:bold;
    margin-bottom:10px;
}
.waterfall-box {
    width: 100%;
    column-count: 2;
    column-gap: 0;
}
.waterfall-item {
    break-inside: avoid;
    padding: 5px;
}
.waterfall-item-all {
    background: #e8e8e8;
    border-radius: 6px;
    overflow: hidden;
}
.img-wrap {
    width:100%;
    border-radius:6px;
    overflow:hidden;
}
.rec-img {
    width:100%;
    height:auto;
    object-fit:cover;
    max-height: 270px;
}
.rec-info {
    padding:5px 10px 10px 10px;
    text-align: left;
}
.rec-name {
    color:#333;
    font-size:14px;
    line-height:1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
}
.rec-price-row {
    color:#ff33ee;
    font-size:16px;
    font-weight:bold;
    margin-top:4px;
} */
/* .sales-tip {
    font-size:11px;
    color: #666;
    margin-left:5px;
    font-weight: 100;
}
.blank-height {
    height:120px;
} */

/* ========== 底部结算栏【移动端全面适配置========== */
.cart-bottom {
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 500px;
    min-height: 60px;
    /* 增加底部安全内边距，避开iPhone底部手势�?*/
    padding: 8px 14px;
    padding-bottom: calc(8px + env(safe-area-inset-bottom));
    box-sizing: border-box;
    background: #f7f7f7;
    display: flex;
    align-items: center;
    gap: 8px;
    z-index: 99;
}

.check-all {
    display: flex;
    align-items: center;
    cursor: pointer;
    flex-shrink: 0;
}

.check-text {
    margin-left: 8px;
    color: #333;
    font-size: 13px;
}

.total {
    flex: 1;
    color: #333;
    font-size: 14px;
    white-space: nowrap;
    overflow: hidden;
    text-align: right;
}

.total-price {
    color: #e404a0;
    font-weight: bold;
}

.delete-btn {
    flex-shrink: 0;
    background: #fde3e3;
    color: #333;
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 13px;
    border: 1px solid #acb2ca;
    cursor: pointer;
}

.buy-btn {
    flex-shrink: 0;
    background: #72d2f8;
    color: #000;
    padding: 4px 14px;
    border-radius: 4px;
    font-weight: bold;
    font-size: 13px;
    border: 1px solid #0497d1;
    cursor: pointer;
}

/* Toast */
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

.toast-icon {
    font-size: 30px;
}

.toast-text {
    font-size: 16px;
    margin-top: 10px;
}

/* 弹窗 */
.buy-popup-mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    z-index: 9999;
}

.buy-popup {
    position: fixed;
    width: 100%;
    max-width: 500px;
    bottom: 0;
    background: #fff;
    border-radius: 20px 20px 0 0;
    padding: 4px 0;
    padding-bottom: calc(65px + env(safe-area-inset-bottom));
    z-index: 99999;
    transform: translateY(100%);
    transition: 0.3s ease;
    height: 80%;
    overflow-y: auto;
}

.buy-popup.show {
    transform: translateY(0);
}

.popup-head {
    display: flex;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
}

.close {
    font-size: 24px;
    color: #666;
    cursor: pointer;
    text-align: right;
    flex: 1;
}

.popup-body {
    padding: 0 20px;
}

.popup-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 15px
}

.money-row {
    margin-bottom: 12px;
    font-size: 13px
}

.money-symbol {
    color: #ff33ee;
    font-weight: bold;
}

.money-num {
    font-size: 18px;
    color: #ff33ee;
    font-weight: bold
}

.input-wrap {
    margin-bottom: 20px
}

.input-label {
    font-size: 14px;
    margin-bottom: 6px;
    display: block;
    text-align: left
}

.popup-input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 6px;
    box-sizing: border-box;
    text-align: center;
}

.err-text {
    color: red;
    font-size: 12px;
    margin-bottom: 10px
}

.popup-submit {
    height: 38px;
    background: #ff33ee;
    color: #fff;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 14px;
    position: fixed;
    left: 15px;
    right: 15px;
    bottom: calc(15px + env(safe-area-inset-bottom));
    z-index: 999999;
}

::-webkit-scrollbar {
    display: none;
}
</style>