<template>
    <div class="main">
        <div class="register-container">
            <div class="register-all">
                <!-- 顶部 -->
                <div class="allar-top">
                    <div @click="goBack" style="margin-left:10px;cursor:pointer;color:#a88035;width:30px;">
                        <Icon icon="material-symbols:arrow-back-ios-rounded" width="18" />
                    </div>
                    <div class="allar-top-a">收貨地址</div>
                </div>

                <!-- 内容或上传-->
                <div class="content-wrapper">
                    <div style="padding:10px;overflow-y: auto;height: 100%;margin: 0 auto;">

                        <!-- 地址列表 -->
                        <div class="address-item" v-for="item in addressList" :key="item.id">
                            <div style="display:flex;gap:5px;margin-bottom: 5px;">
                                <div style="background-color: #cc9b5a;padding: 0 3px;border-radius: 5px; color:#000;font-size:11px;cursor:pointer;"
                                    @click="editAddress(item)">編輯</div>
                                <div style="background-color: #fc0202;padding: 0 3px;border-radius: 5px; color:#333;font-size:11px;cursor:pointer;"
                                    @click="delAddress(item.id)">刪除</div>
                                <div v-if="item.is_default"
                                    style="background-color: #02fc17;padding: 0 3px;border-radius: 5px; color:#000;font-size:11px;margin-left:auto;text-align: right;">
                                    預設
                                </div>
                            </div>
                            <div style="display:flex;justify-content:space-between;">
                                <div style="color:#333;font-size:14px;font-weight:bold;">
                                    收件人：{{ item.receiver_name }} | {{ item.receiver_phone }}
                                </div>
                            </div>
                            <div style="color:#666;font-size:12px;margin-top:6px;line-height:1.4;text-align: left;">
                                {{ item.country }} {{ item.region }} {{ item.detail_address }}
                            </div>
                            <div style="display:flex;justify-content:space-between;margin-top:8px;">
                                <div style="color:#666;font-size:11px;">
                                    建立時間：{{ item.create_time }}
                                </div>
                                <div v-if="!item.is_default" style="color:#cc9b5a;font-size:11px;cursor:pointer;"
                                    @click="setDefault(item.id)">
                                    設為預設
                                </div>
                            </div>
                        </div>

                        <!-- 空地址 -->
                        <div style="color:#666;text-align:center;padding:60px 0;"
                            v-if="addressList.length === 0 && !loading">
                            暫無收貨地址
                        </div>
                        <div style="color:#666;text-align:center;padding:20px;" v-if="loading">載入中.....</div>

                        <!-- 新增按钮 -->
                        <div style="margin-top:20px;">
                            <div class="add-btn" @click="addAddress">+ 新增收貨地址</div>
                        </div>

                        <!-- 推荐商品 -->
                        <div style="margin-top:30px;padding-top:10px;border-top:1px solid #333;">
                            <div style="color:#333; font-size:14px; font-weight:bold; margin-bottom:10px;">
                                為你推薦
                            </div>
                            <div class="waterfall-box">
                                <div class="waterfall-item" v-for="item in showList" :key="item.id"
                                    @click="toDetail(item.id)">
                                    <div class="waterfall-item-all">
                                        <div style="width:100%; border-radius:6px; overflow:hidden;">
                                            <img :src="baseURL + item.cover"
                                                style="width:100%; height:auto; object-fit:cover;">
                                        </div>
                                        <div style="padding:5px 10px 10px 10px;text-align: left;">
                                            <div
                                                style="color:#333; font-size:14px; line-height:1.4; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2;-webkit-box-orient: vertical;">
                                                {{ item.name }}
                                            </div>
                                            <div
                                                style="color:#ff40ff; font-size:16px; font-weight:bold; margin-top:4px;">
                                                <span style="font-size:11px; color:#333; margin-right:5px;">驚喜價</span>
                                                <span style="font-size:11px;">$</span>{{ item.price }}
                                                <span style="font-size:11px; color:#666; margin-right:5px;font-weight: 100;">已售：{{ item.sales }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style="height:40px;"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 地址弹窗 -->
        <div class="buy-popup-mask" v-show="showAddressPopup"></div>
        <div class="buy-popup" :class="{ show: showAddressPopup }">
            <div style="margin: 0 auto;max-width: 500px;background: #fff;border-radius: 20px 20px 0 0;height: 100%;">
                <div style="padding: 20px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <div style="font-weight:bold;font-size:15px;">{{ editId ? '編輯地址' : '新增地址' }}</div>
                        <div class="close" @click="closeAddressPopup">×</div>
                    </div>

                    <div style="padding:10px 0;text-align: left;">
                        <div style="font-size:12px;color:#666;margin-bottom:4px;">國家/地區</div>
                        <input v-model="form.country" placeholder="請輸入國家/地區" class="input" />

                        <div style="font-size:12px;color:#666;margin-bottom:4px;margin-top:10px;">省市</div>
                        <input v-model="form.region" placeholder="請輸入省市" class="input" />

                        <div style="font-size:12px;color:#666;margin-bottom:4px;margin-top:10px;">詳細地址</div>
                        <input v-model="form.detail_address" placeholder="請輸入詳細地址" class="input" />

                        <div style="font-size:12px;color:#666;margin-bottom:4px;margin-top:10px;">收件人姓名</div>
                        <input v-model="form.receiver_name" placeholder="請輸入姓名" class="input" />

                        <div style="font-size:12px;color:#666;margin-bottom:4px;margin-top:10px;">聯絡電話</div>
                        <input v-model="form.receiver_phone" placeholder="請輸入電話" class="input" />

                        <div style="display:flex;align-items:center;margin-top:12px;">
                            <input type="checkbox" v-model="form.is_default" id="d" />
                            <label for="d" style="font-size:12px;margin-left:6px;">設為預設地址</label>
                        </div>
                    </div>

                    <div class="popup-submit" @click="saveAddress">儲存地址</div>
                </div>
            </div>
        </div>

        <!-- 提示 -->
        <div class="copy-toast" v-if="showToast">
            <div style="font-size:30px;">
                <Icon icon="iconoir:xmark" width="58" v-if="!yesno" />
                <Icon icon="iconoir:check" width="58" v-if="yesno" />
            </div>
            <div>{{ showtext }}</div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import router from '@/router'
import { Icon } from '@iconify/vue'
import request from '@/utils/request'

const baseURL = request.defaults.baseURL || ''
const goBack = () => router.go(-1)

const addressList = ref<any[]>([])
const loading = ref(false)
const showToast = ref(false)
const showtext = ref('')
const yesno = ref(false)

const showAddressPopup = ref(false)
const editId = ref<number | null>(null)

const form = ref({
    country: '',
    region: '',
    detail_address: '',
    receiver_name: '',
    receiver_phone: '',
    is_default: 0
})

const showList = ref<any[]>([])

const getUserId = () => {
    const u = localStorage.getItem('user')
    return u ? JSON.parse(u).id : ''
}

const loadAddress = async () => {
    const user_id = getUserId()
    if (!user_id) return
    loading.value = true
    try {
        const { data } = await request.post('/api/address/list', { user_id })
        if (data.code === 1) {
            addressList.value = data.list || []
        }
    } catch (e) { }
    finally { loading.value = false }
}

const addAddress = () => {
    editId.value = null
    form.value = {
        country: '',
        region: '',
        detail_address: '',
        receiver_name: '',
        receiver_phone: '',
        is_default: 0
    }
    showAddressPopup.value = true
}

const editAddress = (item: any) => {
    editId.value = item.id
    form.value = {
        country: item.country,
        region: item.region,
        detail_address: item.detail_address,
        receiver_name: item.receiver_name,
        receiver_phone: item.receiver_phone,
        is_default: item.is_default
    }
    showAddressPopup.value = true
}

const saveAddress = async () => {
    const { country, region, detail_address, receiver_name, receiver_phone } = form.value
    if (!country || !region || !detail_address || !receiver_name || !receiver_phone) {
        showtext.value = '請填寫完整資訊'
        yesno.value = false
        showToast.value = true
        setTimeout(() => showToast.value = false, 1500)
        return
    }

    try {
        const params = {
            user_id: getUserId(),
            ...form.value,
            id: editId.value
        }
        await request.post('/api/address/save', params)

        showtext.value = editId.value ? '編輯成功' : '新增成功'
        yesno.value = true
        showToast.value = true
        setTimeout(() => showToast.value = false, 1500)

        closeAddressPopup()
        loadAddress()
    } catch (e) { }
}

const delAddress = async (id: number) => {
    try {
        await request.post('/api/address/delete', {
            user_id: getUserId(),
            id
        })
        loadAddress()
        showtext.value = '刪除成功'
        yesno.value = true
        showToast.value = true
        setTimeout(() => showToast.value = false, 1500)
    } catch (e) {
        showtext.value = '刪除失敗'
        yesno.value = false
        showToast.value = true
        setTimeout(() => showToast.value = false, 1500)
    }
}

const setDefault = async (id: number) => {
    try {
        await request.post('/api/address/setDefault', {
            user_id: getUserId(),
            id
        })
        loadAddress()
        showtext.value = '設為預設成功'
        yesno.value = true
        showToast.value = true
        setTimeout(() => showToast.value = false, 1500)
    } catch (e) {
        showtext.value = '操作失敗'
        yesno.value = false
        showToast.value = true
        setTimeout(() => showToast.value = false, 1500)
    }
}

const closeAddressPopup = () => {
    showAddressPopup.value = false
}

const toDetail = (id: number) => {
    router.push({ path: '/goods-detail', query: { id: id.toString() } })
}
//推荐商品'
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

onMounted(async () => {
    loadAddress()
    loadGoods()
})
</script>

<style scoped>
:global(html),
:global(body) {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden !important;
  position: fixed;
  width: 100%;
}
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
    /* 关键：居住城市*/
    overflow: hidden;
}

.register-all {
    width: 100%;
    max-width: 500px;
    height: 100vh;
    position: relative;
}

.allar-top {
    position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    /* 关键：居住城市*/
    width: 100%;
    max-width: 500px;
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
    margin-right: 40px;
}

.content-wrapper {
    position: absolute;
    top: 45px;
    left: 0;
    right: 0;
    bottom: 0;
    overflow-y: auto;
    background: #fff;
}

/* 地址：*/
.address-item {
    background: #fff;
    border-radius: 8px;
    padding: 14px;
    margin-bottom: 10px;
}

/* 输入中..*/
.input {
    width: 100%;
    padding: 10px;
    border: 1px solid #444;
    border-radius: 6px;
    /* background: #fff; */
    color: #000;
    box-sizing: border-box;
    outline: none;
}

.add-btn {
    background: #cc9b5a;
    color: #000;
    text-align: center;
    padding: 7px 0;
    border-radius: 8px;
    font-weight: bold;
    font-size: 15px;
}

/* 瀑布时间：*/
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

/* 弹窗 */
.buy-popup-mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 9999;
}

.buy-popup {
    position: fixed;
    width: 100%;
    bottom: 0;
    color: #000;
    z-index: 99999;
    transform: translateY(100%);
    transition: 0.3s ease;
    height: 85%;
    overflow-y: auto;
}

.buy-popup.show {
    transform: translateY(0);
}

.close {
    font-size: 24px;
    /* color: #666; */
    cursor: pointer;
}

.popup-submit {
    /* height: 38px; */
    background: #cc9b5a;
    color: #000;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    margin-top: 20px;
    font-size: 13px;
    padding: 7px 0;
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

::-webkit-scrollbar {
    display: none;
}
</style>