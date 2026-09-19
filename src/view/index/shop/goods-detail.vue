<template>
    <div class="detail-main">
        <div class="container-wrap">
            <div class="top-all">
                <div class="mobile-header" :class="{ headerBgWhite: scrollOverImg }">
                    <div class="header-top-bar">
                        <div class="header-left-group">
                            <div class="mobile-back-btn" @click="goBack">
                                <Icon icon="weui:back-filled" />
                            </div>
                            <div class="mobile-back-btn-ss">
                                <Icon icon="boxicons:search-big" height="18" />
                                <span>搜尋</span>
                            </div>
                        </div>
                        <div class="header-right-group">
                            <div class="mobile-back-btn" @click="$router.push('/cart')">
                                <Icon icon="f7:cart" />
                            </div>
                            <div class="mobile-back-btn more-btn-wrap" @click.stop="toggleMoreMenu">
                                <Icon icon="mdi:more-horiz" />
                                <!-- 悬浮菜单 -->
                                <div class="more-menu" v-if="showMoreMenu" @click.stop>
                                    <div class="menu-item" @click="goHome">前往主頁</div>
                                    <div class="menu-item" @click="goMessage">發送訊息</div>
                                    <div class="menu-item" @click="gomyshop">前往小店</div>
                                </div>
                            </div>
                            <!-- 遮罩：点击空白关闭菜单-->
                            <div class="menu-mask" v-if="showMoreMenu" @click="closeMoreMenu"></div>
                        </div>
                    </div>
                    <div class="mobile-header-text">
                        <div class="tab-item" @click="scrollToArea('goods-area')">商品</div>
                        <div class="tab-item" @click="scrollToArea('detail-area')">詳情</div>
                        <div class="tab-item" @click="scrollToArea('shop-area')">商品圖片</div>
                        <div class="tab-item" @click="scrollToArea('recommend-area')">推薦</div>
                    </div>
                </div>
            </div>

            <div class="scroll-wrap" ref="scrollRef" id="goods-area">
                <div class="swiper-box">
                    <div class="swiper-scroll" ref="swiperRef" @touchstart="touchStart" @touchmove="touchMove"
                        @touchend="touchEnd">
                        <div class="swiper-wrapper" :style="{ transform: `translateX(${swiperX}px)` }">
                            <div class="swiper-item" v-for="(img, idx) in imgList" :key="idx">
                                <img :src="baseURL + img" class="swiper-img" />
                            </div>
                        </div>
                    </div>
                    <div class="dots" v-if="imgList.length > 1">
                        <span class="dot" :class="{ active: idx === current }" v-for="(dot, idx) in imgList"
                            :key="idx"></span>
                    </div>
                </div>

                <div class="info-card">
                    <div class="goods-name">{{ data.name }}</div>
                    <div class="goods-price">
                        <span class="price-label">優惠價</span>
                        <span class="price-symbol">$</span>
                        <span>{{ data.price }}</span>
                        <span class="base-info">
                            <span>庫存：{{ data.stock }}</span>
                            <span class="split-text">已售：{{ data.sales }}</span>
                        </span>
                    </div>
                </div>

                <div class="detail-card" id="detail-area">
                    <div class="card-title">商品詳情</div>
                    <div style="padding: 0 15px;">
                        <div class="spec-group">
                            <div class="spec-label">材質</div>
                            <div class="spec-tag">{{ data.material }}</div>
                        </div>
                        <div class="spec-row" v-if="data.color || data.spec">
                            <div class="spec-group" v-if="data.color">
                                <div class="spec-label">顏色</div>
                                <div class="spec-tags">
                                    <div v-for="(c, i) in data.color.split('/')" :key="i" class="spec-tag">{{ c }}</div>
                                </div>
                            </div>
                            <div class="spec-group" v-if="data.spec">
                                <div class="spec-label">規格</div>
                                <div class="spec-tags">
                                    <div v-for="(s, i) in data.spec.split('/')" :key="i" class="spec-tag">{{ s }}</div>
                                </div>
                            </div>
                        </div>
                        <div class="goods-intro">
                            {{ data.intro || '暫無商品介紹' }}
                        </div>
                    </div>
                </div>

                <div class="detail-cardaa" v-if="detailImgs.length > 0" id="shop-area">
                    <div class="card-titlea">商品圖片</div>
                    <div class="detail-imgs">
                        <img v-for="img in detailImgs" :key="img" :src="baseURL + img" />
                    </div>
                </div>
                <!-- 推荐商品 -->
                <div class="recommend-wrap" id="recommend-area">
                    <div class="recommend-title">為你推薦</div>
                    <div class="waterfall-box">
                        <div class="waterfall-item" v-for="item in showList" :key="item.id" @click="toDetail(item.id)">
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
                <div class="empty-height"></div>
                <div class="empty-height" id="shop-area"></div>
            </div>

            <div class="detail-bottom">
                <div class="bottom-icon-group">
                    <div class="icon-btn" @click="user_service">
                        <Icon icon="mdi:support" height="20" />
                    </div>
                    <div class="icon-btn" @click="toggleCollect">
                        <Icon :icon="isCollect ? 'uim:favorite' : 'uit:favorite'" height="20"
                            :class="{ collected: isCollect }" />
                    </div>
                </div>
                <div class="bottom-btn-group">
                    <div class="buy-btn" @click="openCartPopup">加入購物車</div>
                    <div class="buy-btna" @click="openBuyPopup">立即購買</div>
                </div>
            </div>


            <div class="buy-popup-mask" v-show="showPopup"></div>
            <div class="buy-popup" :class="{ show: showPopup }">
                <div class="popup-inner">
                    <div class="popup-head">
                        <div class="popup-title">
                            <div @click="submitSelect" v-if="isCartOper">加入購物車</div>
                            <div @click="submitSelect" v-else>確認購買</div>
                        </div>
                        <div class="close" @click="closePopup">×</div>
                    </div>
                    <div class="popup-header">
                        <div class="address" @click="openAddressPopup">
                            <div v-if="selectedAddress" class="address-row">
                                <Icon icon="mdi:address-marker-outline" height="25" class="addr-icon" />
                                <div class="addr-text-wrap">
                                    <div class="addr-name-phone">收件人：{{ selectedAddress.receiver_name }} | {{
                                        selectedAddress.receiver_phone }}</div>
                                    <div class="addr-detail">地址：{{ selectedAddress.country }} {{ selectedAddress.region
                                        }} {{ selectedAddress.detail_address }}</div>
                                </div>
                                <div class="addr-arrow">
                                    <Icon icon="mdi:chevron-right" height="25" />
                                </div>
                            </div>
                            <div v-else class="empty-address-row">
                                <div>請選擇收貨地址</div>
                                <div class="addr-arrow">
                                    <Icon icon="mdi:chevron-right" height="25" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="popup-goods">
                        <img :src="baseURL + data.cover" class="goods-img" />
                        <div class="info">
                            <div class="price">
                                <span class="pop-price-label">優惠價</span>
                                <span class="price-symbol">$</span>
                                <span> {{ data.price }}</span>
                            </div>
                            <div class="num-box">
                                <div class="num-box-but" @click="num > 1 && num--">-</div>
                                <span>{{ num }}</span>
                                <div class="num-box-but" @click="num < data.stock && num++">+</div>
                            </div>
                        </div>
                    </div>

                    <div class="popup-spec">
                        <div class="spec-item" v-if="data.color">
                            <label>顏色</label>
                            <div class="tags">
                                <div v-for="(c, i) in data.color.split('/')" :key="i" :class="{ act: selColor === c }"
                                    @click="selColor = c">{{ c }}</div>
                            </div>
                        </div>
                        <div class="spec-item" v-if="data.spec">
                            <label>尺寸</label>
                            <div class="tags">
                                <div v-for="(s, i) in data.spec.split('/')" :key="i" :class="{ act: selSpec === s }"
                                    @click="selSpec = s">{{ s }}</div>
                            </div>
                        </div>
                    </div>

                    <div class="popup-submit" @click="submitSelect" v-if="isCartOper">加入購物車</div>
                    <div class="popup-submit" @click="submitSelect" v-else>確認購買 ${{ data.price * num }}</div>
                </div>
            </div>

            <div class="buy-popup-mask" v-show="showPayPopup" @click="closePayPopup"></div>
            <div class="buy-popup" :class="{ show: showPayPopup }">
                <div class="popup-inner">
                    <div class="popup-head">
                        <div></div>
                        <div class="close" @click="closePayPopup">×</div>
                    </div>
                    <div class="pay-popup-content">
                        <div class="pay-title">訂單付款</div>
                        <div class="pay-total">
                            <span>總金額：</span>
                            <span class="price-symbol">$</span>
                            <span class="pay-money">{{ data.price * num }}</span>
                        </div>
                        <div class="pwd-input-wrap">
                            <div class="pwd-label">請輸入支付密碼</div>
                            <input v-model="payPwd" type="password" placeholder="請輸入支付密碼" class="pwd-input" />
                        </div>
                        <div class="popup-submit" @click="submitPay">確認付款 ${{ data.price * num }}</div>
                    </div>
                </div>
            </div>

            <div class="buy-popup-mask" v-show="showSetPwdPopup" @click="closeSetPwdPopup"></div>
            <div class="buy-popup" :class="{ show: showSetPwdPopup }">
                <div class="popup-inner">
                    <div class="popup-head">
                        <div></div>
                        <div class="close" @click="closeSetPwdPopup">×</div>
                    </div>
                    <div class="setpwd-content">
                        <div class="pay-title">設定支付密碼</div>
                        <div class="input-row">
                            <div class="pwd-label">支付密碼</div>
                            <input v-model="newPwd" type="password" placeholder="請輸入支付密碼" class="pwd-input" />
                        </div>
                        <div class="input-row">
                            <div class="pwd-label">確認密碼</div>
                            <input v-model="confirmPwd" type="password" placeholder="請再次輸入密碼" class="pwd-input" />
                        </div>
                        <div class="err-text" v-if="pwdErrMsg">{{ pwdErrMsg }}</div>
                        <div class="popup-submit" @click="submitSetFundPwd"
                            :style="{ background: loading ? '#ccc' : '' }">
                            {{ loading ? '提交中' : '確認設定' }}
                        </div>
                    </div>
                </div>
            </div>

            <div class="buy-popup-mask" v-show="showAddressListPopup"></div>
            <div class="buy-popup" :class="{ show: showAddressListPopup }">
                <div class="popup-inner">
                    <div class="popup-head">
                        <div class="popup-title">選擇收貨地址</div>
                        <div class="close" @click="closeAddressListPopup">×</div>
                    </div>

                    <div class="address-list-wrap">
                        <div v-for="item in addressList" :key="item.id" class="address-item"
                            @click="selectAddress(item)">
                            <div class="addr-name-phone">
                                收件人：{{ item.receiver_name }}
                                <span v-if="item.is_default" class="default-tag">[預設]</span>
                            </div>
                            <div class="addr-line">電話：{{ item.receiver_phone }}</div>
                            <div class="addr-line">國家/地區：{{ item.country }}</div>
                            <div class="addr-line">省市：{{ item.region }}</div>
                            <div class="addr-line">詳細地址：{{ item.detail_address }}</div>
                        </div>
                        <div v-if="addressList.length === 0" class="empty-address-tip">
                            暫無地址，請新增地址
                        </div>
                    </div>

                    <div class="add-address-btn" @click="openAddAddressPopup">+ 新增收貨地址</div>
                </div>
            </div>

            <div class="buy-popup-mask" v-show="showAddAddressPopup"></div>
            <div class="buy-popup" :class="{ show: showAddAddressPopup }">
                <div class="popup-inner">
                    <div class="popup-head">
                        <div class="popup-title">編輯地址</div>
                        <div class="close" @click="closeAddAddressPopup">×</div>
                    </div>

                    <div class="edit-address-form">
                        <div class="form-item">
                            <div class="form-label">國家/地區</div>
                            <input v-model="addressForm.country" placeholder="請輸入國家/地區" class="form-input" />
                        </div>
                        <div class="form-item">
                            <div class="form-label">省市</div>
                            <input v-model="addressForm.region" placeholder="請輸入省市" class="form-input" />
                        </div>
                        <div class="form-item">
                            <div class="form-label">詳細地址</div>
                            <input v-model="addressForm.detail_address" placeholder="請輸入詳細地址" class="form-input" />
                        </div>
                        <div class="form-item">
                            <div class="form-label">收件人姓名</div>
                            <input v-model="addressForm.receiver_name" placeholder="請輸入姓名" class="form-input" />
                        </div>
                        <div class="form-item">
                            <div class="form-label">聯絡電話</div>
                            <input v-model="addressForm.receiver_phone" placeholder="請輸入電話" class="form-input" />
                        </div>
                        <div class="checkbox-row">
                            <input type="checkbox" v-model="addressForm.is_default" id="default" />
                            <label for="default">設為預設地址</label>
                        </div>
                    </div>
                    <div class="add-address-btn" @click="saveAddress">儲存地址</div>
                </div>
            </div>

            <div class="copy-toast" v-if="showToast">
                <div class="toast-icon">
                    <Icon icon="iconoir:xmark" width="58" v-if="yesno" />
                    <Icon icon="iconoir:check" width="58" v-else />
                </div>
                <div class="toast-text">{{ showtext }}</div>
            </div>
            <div class="copy-toast" v-if="showToastaqw">
                <div class="toast-icon">
                    <Icon icon="svg-spinners:12-dots-scale-rotate" width="58" />
                </div>
                <div class="toast-text">付款成功</div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
import { useRoute, useRouter } from 'vue-router'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const baseURL = request.defaults.baseURL || ''
const scrollRef = ref(null)
const showToast = ref(false)
const showToastaqw = ref(false)
const showtext = ref('')
const yesno = ref(false)
const yesnoa = ref(false)

const data = ref({
    id: '',
    name: '',
    price: 0,
    cover: '',
    intro: '',
    stock: 0,
    sales: 0,
    like: 0,
    color: '',
    spec: '',
    detail_images: '',
    material: ''
})

const imgList = ref([])
const detailImgs = ref([])
const scrollOverImg = ref(false)
const swiperRef = ref(null)
const swiperX = ref(0)
const current = ref(0)
let startX = 0
let moveX = 0

const user_service = () => router.push('/message/' + userid.value)

const isCollect = ref(false)
const getUserId = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    return user.id || ''
}

const checkCollect = async () => {
    try {
        const gid = route.query.id
        const uid = getUserId()
        if (!uid || !gid) return
        const { data } = await request.get('/api/collect/isCollect', { params: { user_id: uid, goods_id: gid } })
        isCollect.value = data.isCollect
    } catch (err) { }
}
//收藏成功  取消收藏'
const toggleCollect = async () => {
    try {
        const uid = getUserId()
        if (!uid) {
            showtext.value = '請先登入';
            showToast.value = true;
            yesno.value = true;
            setTimeout(() => showToast.value = false, 1000)
            return
        }
        const gid = route.query.id
        if (!gid) return
        const { data } = await request.post('/api/collect/collect', { user_id: uid, goods_id: gid })
        if (data.code === 1) {
            isCollect.value = !isCollect.value
            showtext.value = isCollect.value ? '收藏成功' : '取消收藏成功';
            showToast.value = true;
            yesnoa.value = true;
            setTimeout(() => showToast.value = false, 1000)
        } else {
            ElMessage.error('操作失敗')
        }
    } catch (err) { ElMessage.error('操作失敗') }
}

const showPopup = ref(false)
const showPayPopup = ref(false)
const isCartOper = ref(false)
const num = ref(1)
const selColor = ref('')
const selSpec = ref('')
const payPwd = ref('')

const showSetPwdPopup = ref(false)
const newPwd = ref('')
const confirmPwd = ref('')
const pwdErrMsg = ref('')
const loading = ref(false)

const goodsname = ref('')
const goodscover = ref('')
const userid = ref('')
// ==================== 地址相關 ====================
const selectedAddress = ref(null)
const addressList = ref([])
const showAddressListPopup = ref(false)
const showAddAddressPopup = ref(false)
const editAddress = ref(null)

const addressForm = ref({
    country: '',
    region: '',
    detail_address: '',
    receiver_name: '',
    receiver_phone: '',
    is_default: 0
})

const openAddressPopup = async () => {
    await loadAddressList()
    showAddressListPopup.value = true
}
const closeAddressListPopup = () => showAddressListPopup.value = false

const openAddAddressPopup = () => {
    showAddAddressPopup.value = true
    editAddress.value = null
    addressForm.value = { country: '', region: '', detail_address: '', receiver_name: '', receiver_phone: '', is_default: 0 }
}
const closeAddAddressPopup = () => showAddAddressPopup.value = false

//获取地址'
const loadAddressList = async () => {
    const user_id = getUserId()
    if (!user_id) return
    try {
        const { data } = await request.post('/api/address/list', { user_id })
        if (data.code === 1) {
            addressList.value = data.list
            // 优先选中默认地址
            const def = data.list.find((i: { is_default: number }) => i.is_default === 1)
            if (def) {
                selectedAddress.value = def
            } else if (data.list.length > 0) {
                // 没有默认地址，选中第一致'
                selectedAddress.value = data.list[0]
            } else {
                // 无地址清空'
                selectedAddress.value = null
            }
        }
    } catch (e) { }
}

const selectAddress = (item: any) => {
    selectedAddress.value = item
    closeAddressListPopup()
    showPopup.value = true
}

// ========== 保存地址  刷新列表並回限り有==========
const saveAddress = async () => {
    const { country, region, detail_address, receiver_name, receiver_phone } = addressForm.value
    if (!country || !region || !detail_address || !receiver_name || !receiver_phone) {
        showtext.value = '請填寫完整資訊';
        showToast.value = true;
        yesno.value = true;
        setTimeout(() => showToast.value = false, 1000)
        return
    }
    const user_id = getUserId()
    try {
        const params = { ...addressForm.value, user_id }
        const { data } = await request.post('/api/address/save', params)
        if (data.code === 1) {
            showtext.value = '儲存成功';
            showToast.value = true;
            yesnoa.value = true;
            setTimeout(() => showToast.value = false, 1000)
            closeAddAddressPopup()
            await loadAddressList()
            await nextTick()
            showAddressListPopup.value = true
        }
    } catch (e) {
        showtext.value = '儲存失敗';
        showToast.value = true;
        yesno.value = true;
        setTimeout(() => showToast.value = false, 1000)
    }
}

//验证是否有地址'
const checkAddressBeforeSubmit = () => {
    if (!selectedAddress.value) {
        showtext.value = '請先新增收貨地址';
        showToast.value = true;
        yesno.value = true;
        setTimeout(() => showToast.value = false, 1000)
        ElMessage.warning('')
        openAddressPopup()
        return false
    }
    return true
}

// ==================== 商品詳情 ====================
const getDetail = async () => {
    const goodsId = route.query.id || route.params.id
    if (!goodsId) return
    try {
        const { data: res } = await request.post('/api/goods-detail/detail', { id: goodsId })
        if (res.code === 1) {
            data.value = { ...res.data, id: goodsId }
            goodscover.value = res.data.cover
            goodsname.value = res.data.name
            imgList.value = [res.data.cover]
            userid.value = res.data.user_id

            try {
                const imgs = JSON.parse(res.data.detail_images)
                if (imgs && imgs.length) {
                    imgList.value = [...imgList.value, ...imgs]
                    detailImgs.value = imgs
                }
            } catch (e) { }
            checkCollect()
        }
    } catch (err) { }
}

function touchStart(e: any) { startX = e.touches[0].clientX }
function touchMove(e: any) {
    moveX = e.touches[0].clientX - startX
    swiperX.value = -current.value * swiperRef.value.offsetWidth + moveX
}
function touchEnd() {
    if (moveX < -50 && current.value < imgList.value.length - 1) current.value++
    else if (moveX > 50 && current.value > 0) current.value--
    swiperX.value = -current.value * swiperRef.value.offsetWidth
    moveX = 0
}

const goBack = () => router.back()
const handleScroll = () => {
    if (!scrollRef.value) return
    scrollOverImg.value = scrollRef.value.scrollTop > 300
}
const scrollToArea = (id: string) => {
    const el = document.getElementById(id)
    if (!el || !scrollRef.value) return
    scrollRef.value.scrollTo({ top: el.offsetTop - 78, behavior: 'smooth' })
}

const openCartPopup = async () => {
    isCartOper.value = true;
    resetSelect();
    await loadAddressList()
    showPopup.value = true
}
const openBuyPopup = async () => {
    isCartOper.value = false;
    resetSelect();
    await loadAddressList()
    showPopup.value = true
}
const resetSelect = () => {
    num.value = 1
    selColor.value = data.value.color ? data.value.color.split('/')[0] : ''
    selSpec.value = data.value.spec ? data.value.spec.split('/')[0] : ''
}
const closePopup = () => { showPopup.value = false }
const closePayPopup = () => { showPayPopup.value = false; payPwd.value = '' }
const closeSetPwdPopup = () => {
    showSetPwdPopup.value = false
    newPwd.value = ''
    confirmPwd.value = ''
    pwdErrMsg.value = ''
}

const checkHasPayPwd = async () => {
    try {
        const userInfo = JSON.parse(localStorage.getItem('user') || '{}')
        const user_id = userInfo.id
        if (!user_id) return false
        const { data } = await request.post('/api/user/check-pay-pwd', { user_id })
        return data?.has_pay_pwd || false
    } catch (err) { return false }
}

// 提交規格（加入購物購買約會卡'
const submitSelect = async () => {
    if (!checkAddressBeforeSubmit()) return

    if (!selColor.value && data.value.color) {
        showtext.value = '請選擇顏色';
        showToast.value = true;
        yesno.value = true;
        setTimeout(() => showToast.value = false, 1000);
        return
    }
    if (!selSpec.value && data.value.spec) {
        showtext.value = '請選擇尺寸';
        showToast.value = true;
        yesno.value = true;
        setTimeout(() => showToast.value = false, 1000);
        return
    }

    const userInfo = JSON.parse(localStorage.getItem('user') || '{}')
    const user_id = userInfo.id || 1
    const touser_id = userid.value ? String(userid.value) : ''
    const params = {
        user_id,
        touser_id,
        goods_id: route.query.id,
        color: selColor.value,
        spec: selSpec.value,
        number: num.value,
        price: data.value.price,
        address_id: selectedAddress.value?.id,
    }

    if (isCartOper.value) {
        try {
            const res = await request.post('/api/cart/add', params)
            if (res.data.code === 1) {
                showtext.value = '加入購物車成功';
                showToast.value = true;
                yesnoa.value = true;
                setTimeout(() => showToast.value = false, 1000);
                closePopup()
            } else {
                showtext.value = '加入購物車失敗';
                showToast.value = true;
                yesno.value = true;
                setTimeout(() => showToast.value = false, 1000);
                ElMessage.error('')
            }
        } catch (e) {
            showtext.value = '加入購物車失敗';
            showToast.value = true;
            yesno.value = true;
            setTimeout(() => showToast.value = false, 1000);
        }
    } else {
        const hasSet = await checkHasPayPwd()
        closePopup()
        if (hasSet) {
            showPayPopup.value = true
        } else {
            showSetPwdPopup.value = true
        }
    }
}

// 提交支付'
const submitPay = async () => {
    if (!payPwd.value) {
        showtext.value = '請輸入密碼';
        showToast.value = true;
        yesno.value = true;
        yesnoa.value = false;
        setTimeout(() => showToast.value = false, 1000);
        return
    }
    showToastaqw.value = true
    const userInfo = JSON.parse(localStorage.getItem('user') || '{}')
    const user_id = userInfo.id
    const payParams = {
        user_id,
        touser_id: userid.value,
        goods_id: route.query.id,
        color: selColor.value,
        spec: selSpec.value,
        number: num.value,
        price: data.value.price,
        pay_password: payPwd.value,
        goods_name: goodsname.value,
        goods_cover: goodscover.value,
        address_id: selectedAddress.value?.id,
        logistics_content: '',
        logistics_status: '1'
    }

    try {
        const { data } = await request.post('/api/order/pay', payParams)
        showToastaqw.value = false
        if (data.code === 1) {
            showtext.value = '付款成功';
            showToast.value = true;
            yesnoa.value = true;
            yesno.value = false;

            setTimeout(() => {
                showToast.value = false;
                closePayPopup();
                router.push('/orders');
            }, 1000);
        } else if (data.code === 403) {
            showtext.value = '密碼錯誤';
            showToast.value = true;
            yesno.value = true;
            yesnoa.value = false;
            setTimeout(() => showToast.value = false, 1000);
        } else if (data.code === 405) {
            showtext.value = '餘額不足';
            showToast.value = true;
            yesno.value = true;
            yesnoa.value = false;
            setTimeout(() => showToast.value = false, 1000);
        } else {
            showtext.value = '付款失敗';
            showToast.value = true;
            yesno.value = true;
            yesnoa.value = false;
            setTimeout(() => showToast.value = false, 1000);
        }
    } catch (e) {
        showToastaqw.value = false
    }
}

// 設定密碼'
const submitSetFundPwd = async () => {
    if (!newPwd.value || !confirmPwd.value) {
        showtext.value = '請填寫完整密碼';
        showToast.value = true;
        yesno.value = true;
        setTimeout(() => showToast.value = false, 1000);
        return
    }
    if (newPwd.value.length < 6) {
        showtext.value = '密碼至少6位';
        showToast.value = true;
        yesno.value = true;
        setTimeout(() => showToast.value = false, 1000);
        return
    }
    if (newPwd.value !== confirmPwd.value) {
        showtext.value = '兩次密碼不一致';
        showToast.value = true;
        yesno.value = true;
        setTimeout(() => showToast.value = false, 1000);
        return
    }
    loading.value = true
    try {
        const userInfo = JSON.parse(localStorage.getItem('user') || '{}')
        const { data } = await request.post('/api/user/set-fund-pwd', {
            user_id: userInfo.id,
            pay_pwd: newPwd.value
        })
        if (data.code === 1) {
            showtext.value = '設定成功';
            showToast.value = true;
            yesnoa.value = true;
            setTimeout(() => showToast.value = false, 1000);
            closeSetPwdPopup()
        }
    } catch (e) {
        showtext.value = '設定失敗';
        showToast.value = true;
        yesno.value = true;
        setTimeout(() => showToast.value = false, 1000);
    }
    loading.value = false
}
// 更多悬浮菜单'
const showMoreMenu = ref(false)

// 前往主页'
const goHome = () => {
    router.push('/artist?id=' + userid.value)
    showMoreMenu.value = false
}

// 发送消收藏成'
const goMessage = () => {
    router.push('/message/' + userid.value)
    showMoreMenu.value = false
}

// 点击图标切换菜单显示'
const toggleMoreMenu = () => {
    showMoreMenu.value = !showMoreMenu.value
}

//前往小店'
const gomyshop = () => {
    router.push('/myshop?id=' + userid.value)
    showMoreMenu.value = false
}

// 点击空白关闭菜单'
const closeMoreMenu = () => {
    showMoreMenu.value = false
}

//推荐商品'
const showList = ref<any[]>([])
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

const toDetail = (id: number) => {
    router.push({ path: '/goods-detail', query: { id: id.toString() } })
}

onMounted(() => {
    getDetail()
    loadAddressList()
    loadGoods()
    const el = scrollRef.value
    if (el) el.addEventListener('scroll', handleScroll)
})
</script>

<style scoped>
@import '../../../assets/css/all.css';
.detail-main {
    width: 100vw;
    height: 100vh;
    background: #fff;
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    flex-direction: column;
}

.container-wrap {
    max-width: 500px;
    margin: 0 auto;
    width: 100%;
    height: 100%;
}

.top-all {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 9999;
}

.mobile-header {
    height: 78px;
    background: transparent;
    transition: all 0.3s;
    display: flex;
    flex-direction: column;
    max-width: 500px;
    margin: 0 auto;
    padding-top: env(safe-area-inset-top);
    box-sizing: content-box;
}

.mobile-header.headerBgWhite {
    background: #ffffff;
}

.header-top-bar {
    display: flex;
    flex-direction: row;
    height: 48px;
    align-items: center;
    padding: 0 10px;
    color: #000;
}

.header-left-group {
    display: flex;
    flex-direction: row;
    gap: 15px;
    flex: 1;
    padding-right: 15px;
    width: 100%;
}

.header-right-group {
    display: flex;
    flex-direction: row;
    gap: 5px;
    position: relative;
}

.mobile-back-btn {
    width: 35px;
    height: 35px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.4);
    color: #ffffff;
    cursor: pointer;
}

.mobile-header.headerBgWhite .mobile-back-btn {
    background: #fff;
    color: #000;
}

.mobile-back-btn-ss {
    flex: 1;
    background-color: rgba(219, 217, 217, 0.64);
    height: 30px;
    border-radius: 6px;
    margin-top: 3px;
    font-size: 13px;
    text-align: left;
    padding: 0 10px;
    align-items: center;
    display: none;
}

.mobile-header.headerBgWhite .mobile-back-btn-ss {
    display: flex;
}

.mobile-header-text {
    display: flex;
    flex-direction: row;
    align-items: center;
    white-space: nowrap;
    flex: 1;
    height: 30px;
    font-size: 13px;
    margin-bottom: 5px;
    width: 100%;
    visibility: hidden;
}

.mobile-header.headerBgWhite .mobile-header-text {
    visibility: visible;
}

.tab-item {
    flex: 1;
    display: flex;
    justify-content: center;
    cursor: pointer;
}

.more-btn-wrap {
    position: relative;
}

/* 更多菜单 */
.menu-mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 9998;
    background: transparent;
}

.more-menu {
    position: absolute;
    top: 40px;
    right: 0;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
    min-width: 100px;
    z-index: 9999;
    overflow: hidden;
}

.menu-item {
    padding: 10px 15px;
    font-size: 15px;
    color: #333;
    cursor: pointer;
    text-align: center;
}

.menu-item:hover {
    background: #f5f5f5;
}

.menu-item+.menu-item {
    border-top: 1px solid #eee;
}

/* 主滚动区�?*/
.scroll-wrap {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding-bottom: calc(64px + env(safe-area-inset-bottom));
    height: 100vh;
    box-sizing: border-box;
    /* background-color: #fff; */
}

.swiper-box {
    width: 100%;
    height: 0;
    padding-top: 100%;
    position: relative;
    /* background: #fff; */
    overflow: hidden;
}

.swiper-scroll {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.swiper-wrapper {
    height: 100%;
    display: flex;
    transition: transform 0.3s ease;
}

.swiper-item {
    width: 100%;
    height: 100%;
    flex-shrink: 0;
}

.swiper-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.dots {
    position: absolute;
    bottom: 12px;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    gap: 6px;
}

.dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.4);
}

.dot.active {
    background: #fff;
}

.info-card {
    background: #fff;
    padding: 15px 15px 35px 15px;
    color: #000;
    text-align: left;
}

.goods-name {
    font-size: 15px;
    font-weight: bold;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
}

.goods-price {
    color: #ff33ee;
    font-size: 24px;
    font-weight: bold;
}

.price-label {
    color: #000;
    font-size: 15px;
    font-weight: 500;
    margin-right: 5px;
}

.price-symbol {
    font-size: 13px;
}

.base-info {
    color: #646464;
    font-size: 12px;
    margin-left: 20px;
    font-weight: 100;
}

.split-text {
    margin-left: 10px;
}

.detail-card {
    padding: 15px 0 35px 0;
    margin-top: -15px;
    border-radius: 25px 25px 0 0;
    background-color: #faedf7;
}

.card-title {
    color: #000;
    font-size: 15px;
    font-weight: bold;
    margin-top: -25px;
    margin-bottom: 20px;
    border-radius: 25px 25px 0 0;
    padding: 10px 15px;
    background-color: #fdbef3;
}

.spec-group {
    display: flex;
    align-items: center;
    gap: 6px;
    text-align: left;
    width: 100%;
    margin-bottom: 15px;
}

.spec-row {
    display: flex;
    flex-direction: column;
}

.spec-label {
    color: #ffffff;
    font-size: 14px;
    background: #e003fd;
    padding: 2px 6px;
    border-radius: 4px;
}

.spec-tags {
    display: flex;
    gap: 5px;
}

.spec-tag {
    background: #fdbef3;
    color: #333;
    font-size: 13px;
    padding: 2px 6px;
    border-radius: 4px;
}

.goods-intro {
    color: #333;
    font-size: 15px;
    line-height: 1.6;
    text-align: left;
    padding: 5px 0 10px 0;
    word-wrap: break-word;
}

.detail-cardaa {
    background: #e8e8e8;
    /* padding-top: 15px; */
    /* margin-top: -25px; */
    border-radius: 25px 25px 0 0;
}
.card-titlea {
    color: #ffffff;
    font-size: 15px;
    font-weight: bold;
    margin-top: -25px;
    /* margin-bottom: 20px; */
    border-radius: 10px 10px 0 0;
    padding: 10px 15px;
    background-color: #d102af;
}
.detail-imgs {
    display: flex;
    flex-direction: column;
}

.detail-imgs img {
    width: 100%;
}
/* --------------------------------------------- */


.empty-height {
    height: 40px;
}

/*底部固定成功*/
.detail-bottom {
    min-height: 56px;
    background: #f7f7f7;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px 15px calc(8px + env(safe-area-inset-bottom));
    gap: 10px;
    position: fixed;
    max-width: 500px;
    bottom: 0;
    z-index: 999;
    box-sizing: border-box;
    width: 100%;
}

.bottom-icon-group {
    display: flex;
    flex-direction: row;
}

.icon-btn {
    display: flex;
    /* align-items: center; */
    cursor: pointer;
    width: 30px;
    color: #333;
    padding: 4px 10px;
}

.icon-btn .collected {
    color: #ff4d4f;
}

.bottom-btn-group {
    display: flex;
    flex-direction: row;
    flex: 1;
    /* background-color: #ff33ee; */
    border-radius: 6px;
}

.buy-btn {
    width: 40%;
    height: 32px;
    background: #e7e7e7;
    color: #000;
    border-radius: 6px 0 0 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: bold;
    cursor: pointer;
    
}

.buy-btna {
    width: 60%;
    height: 32px;
    background: #db01c9;
    color: #fff;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: bold;
    cursor: pointer;
    margin-left: -15px;
}

/*弹窗通用样式*/
.buy-popup-mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.6);
    z-index: 99999;
}

.buy-popup {
    position: fixed;
    margin: 0 auto;
    bottom: 0;
    height: 85%;
    width: 100%;
    max-width: 500px;
    background: #fff;
    border-radius: 20px 20px 0 0;
    padding: 4px 0;
    padding-bottom: 65px;
    z-index: 999999;
    transform: translateY(100%);
    transition: 0.3s ease;
    max-height: 80vh;
    overflow-y: auto;
}

.buy-popup.show {
    transform: translateY(0);
}

.popup-inner {
    padding: 0 20px;
}

.popup-head {
    display: flex;
    width: 100%;
    align-items: center;
}

.popup-title {
    font-size: 14px;
    font-weight: bold;
}

.close {
    font-size: 24px;
    color: #666;
    cursor: pointer;
    text-align: right;
    margin-left: auto;
}

.popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 10px;
    border-bottom: 1px solid #f2f2f2;
}

.address {
    font-size: 14px;
    cursor: pointer;
    flex: 1;
}

.address-row {
    display: flex;
    flex-direction: row;
    align-items: center;
}

.addr-icon {
    color: #ff33ee;
    margin-right: 5px;
}

.addr-text-wrap {
    flex: 1;
    text-align: left;
}

.addr-name-phone {
    color: #ff33ee;
    font-weight: 600;
}

.addr-detail {
    font-size: 12px;
    font-weight: 100;
}

.empty-address-row {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    color: #ff33ee;
    width: 100%;
}

.addr-arrow {
    text-align: right;
    margin-left: auto;
}

.popup-goods {
    display: flex;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 1px solid #f2f2f2;
    margin-bottom: 15px;
}

.goods-img {
    width: 70px;
    height: 70px;
    object-fit: cover;
    border-radius: 8px;
}

.info .price {
    color: #ff33ee;
    font-size: 18px;
    font-weight: bold;
    text-align: left;
    padding: 5px 0;
}

.pop-price-label {
    font-size: 13px;
    color: #000;
    font-weight: 200;
    margin-right: 5px;
}

.num-box {
    display: flex;
    align-items: center;
    gap: 10px;
}

.num-box-but {
    width: 25px;
    height: 25px;
    border: 1px solid #ddd;
    background: #fff;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.popup-spec {
    margin-bottom: 20px;
}

.spec-item {
    margin-bottom: 20px;
    text-align: left;
    font-size: 14px;
}

.spec-item label {
    font-size: 14px;
    display: block;
    margin-bottom: 6px;
}

.tags {
    display: flex;
    gap: 8px;
}

.tags div {
    padding: 6px 10px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
}

.tags div.act {
    background: #ff33ee;
    color: #fff;
    border-color: #ff33ee;
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
    bottom: 15px;
    z-index: 9999999;
    margin-bottom: 30px;
    cursor: pointer;
}

/*付款弹窗*/
.pay-popup-content {
    padding: 15px 0;
}

.pay-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 15px
}

.pay-total {
    margin-bottom: 12px;
    font-size: 13px;
}

.pay-money {
    font-size: 18px;
    color: #ff33ee;
    font-weight: bold;
}

.pwd-input-wrap {
    margin-bottom: 20px;
}

.pwd-label {
    font-size: 14px;
    margin-bottom: 6px;
    text-align: left;
}

.pwd-input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 6px;
    box-sizing: border-box;
    text-align: center;
}

/*设置密码弹窗*/
.setpwd-content {
    padding: 20px 0;
}

.input-row {
    margin-bottom: 12px;
}

.err-text {
    color: red;
    font-size: 12px;
    margin-bottom: 10px;
}

.form-item {
    margin-bottom: 10px;
}

.form-label {
    font-size: 12px;
    margin-bottom: 4px;
}

.form-input {
    width: 100%;
    padding: 10px;
    border: 1px solid #eee;
    border-radius: 8px;
    box-sizing: border-box;
}

.checkbox-row {
    display: flex;
    align-items: center;
    margin-top: 10px;
}

.checkbox-row label {
    margin-left: 5px;
    font-size: 13px;
}

.add-address-btn {
    font-size: 14px;
    background: #ff33ee;
    color: #fff;
    text-align: center;
    padding: 7px 10px;
    border-radius: 6px;
    cursor: pointer;
}

.address-list-wrap {
    max-height: 60vh;
    overflow-y: auto;
}

.address-item {
    padding: 10px 12px;
    border-bottom: 1px solid #eee;
    cursor: pointer;
    text-align: left;
}

.default-tag {
    color: #ff33ee;
    margin-left: 8px;
}

.addr-line {
    font-size: 12px;
    color: #666;
}

.empty-address-tip {
    font-size: 14px;
    padding: 30px 0;
    text-align: center;
    color: #666;
}

/*Toast提示*/
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
    margin-top: 8px;
}

/*隐藏滚动态数据*/
::-webkit-scrollbar {
    display: none;
}
</style>