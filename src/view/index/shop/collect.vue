<template>
    <div class="main">
        <div class="register-container">
            <div class="register-all">
                <!-- 顶部 -->
                <div class="allar-top">
                    <div @click="goBack" style="margin-left: 10px;cursor: pointer;color: #a88035;width: 30px;">
                        <Icon icon="material-symbols:arrow-back-ios-rounded" width="18" />
                    </div>
                    <div class="allar-top-a">我的收藏</div>
                </div>

                <!-- 内容或上传-->
                <div class="content-wrapper" id="favScroll">
                    <div class="cuekdil">
                        <div style="padding:10px">
                            <!-- 收藏商品列表 -->
                            <div class="cart-item" v-for="item in favList" :key="item.id">
                                <div class="cart-goods" style="cursor: pointer;align-items: flex-start;">
                                    <div style="display: flex;" @click="toDetail(item.id)">
                                        <img :src="baseURL + item.cover" class="goods-img" />
                                    </div>
                                    <div class="goods-info">
                                        <div>
                                            <div class="goods-name">{{ item.name }}</div>
                                            <div v-if="item.color">
                                                <div style="display:flex; gap:5px;padding-bottom:5px;">
                                                    <div style="color:#333;font-size: 11px;">顏色</div>
                                                    <div v-for="(c, i) in item.color.split('/')" :key="i"
                                                        style="background:#555; padding:2px 6px; border-radius:3px; font-size:11px; color:#333;">
                                                        {{ c }}
                                                    </div>
                                                </div>
                                            </div>
                                            <div v-if="item.spec">
                                                <div style="display:flex; gap:5px;padding-bottom:5px;">
                                                    <div style="color:#333;font-size: 11px;">規格</div>
                                                    <div v-for="(s, i) in item.spec.split('/')" :key="i"
                                                        style="background:#555; padding:2px 6px; border-radius:3px; font-size:11px; color:#333;">
                                                        {{ s }}</div>
                                                </div>
                                            </div>
                                            <div class="price-row">
                                                <div class="now-price">
                                                    <span style="font-size: 11px;color:#666;margin-right: 3px;">單價</span>
                                                    <span style="font-size: 11px;color: #ff40ff;">$</span>
                                                    <span style="font-size: 15px;color: #ff40ff;margin-right: 5px;">{{ item.price }}</span>
                                                </div>
                                                <div style="font-size: 11px;color:#666;text-align: right;margin-left: auto;">
                                                    收藏時間：{{ formatTime(item.collect_time) }}</div>
                                            </div>
                                        </div>
                                        <div style="display: flex;flex-direction: row;justify-content: space-between;">
                                            <div class="buy-btn" @click="goCheck">立即購買</div>
                                            <div class="delete-btn" @click="deleteChecked(item.collect_id)">取消收藏</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- 空状态-->
                            <div style="color:#666;text-align:center;padding:60px 0;font-size: 13px;" v-if="favList.length === 0 && !loading">
                                暫無收藏商品
                            </div>
                            <div style="color:#666;text-align:center;padding:20px;" v-if="loading">載入中.....</div>
                        </div>

                        <!-- 为你推荐 -->
                        <div style="padding:10px 5px;">
                            <div style="color:#333; font-size:14px; font-weight:bold; margin-bottom:10px;">
                                為你推薦
                            </div>
                            <div class="waterfall-box">
                                <div class="waterfall-item" v-for="item in showList" :key="item.id" @click="toDetail(item.id)">
                                    <div class="waterfall-item-all">
                                        <div style="width:100%; border-radius:6px; overflow:hidden;">
                                            <img :src="baseURL + item.cover" style="width:100%; height:auto; object-fit:cover;max-height: 270px; ">
                                        </div>
                                        <div style="padding:5px 10px 10px 10px;text-align: left;">
                                            <div style="color:#333; font-size:14px; line-height:1.4; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2;-webkit-box-orient: vertical;">
                                                {{ item.name }}
                                            </div>
                                            <div style="color:#ff40ff; font-size:16px; font-weight:bold; margin-top:4px;">
                                                <span style="font-size:11px; color:#333; margin-right:5px;">驚喜價</span>
                                                <span style="font-size:11px;">$</span>{{ item.price }}
                                                 <span style="font-size:11px; color:#666; margin-right:5px;font-weight: 100;">已售：{{ item.sales }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style="height:120px;"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 提示 -->
        <div class="copy-toast" v-if="showToast">
            <div style="font-size:30px;">
                <Icon icon="iconoir:xmark" width="58" v-if="!yesno" />
                <Icon icon="iconoir:check" width="58" v-if="yesno" />
            </div>
            <div style="font-size:16px; margin-top:10px;">{{ showtext }}</div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import router from '../../../router';
import { Icon } from '@iconify/vue';
import request from '@/utils/request';

const baseURL = request.defaults.baseURL || '';
const favList = ref<any[]>([]);
const checkedIds = ref<any[]>([]);
const loading = ref(false);
const showToast = ref(false);
const showtext = ref('');
const yesno = ref(false);
const showList = ref<any[]>([]);

// 返回'
const goBack = () => {
    router.go(-1);
};

// 时间格式不正确'
function formatTime(timeStr: string) {
    if (!timeStr) return "";
    const date = new Date(timeStr);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

// 获取用户'
const getUser = () => {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
};

// 获取收藏列表'
const getFavList = async () => {
    const user = getUser();
    if (!user) return;
    loading.value = true;
    try {
        const { data } = await request.get('/api/collect/list', {
            params: { user_id: user.id }
        });
        if (data.code === 1) {
            favList.value = data.data || [];
        }
    } catch (err) { }
    finally {
        loading.value = false;
    }
};

// 取消收藏'
const deleteChecked = async (collectId: any) => {
    try {
        await request.post('/api/collect/delete', {
            id: collectId
        });
        showtext.value = '取消收藏成功';
        yesno.value = true;
        showToast.value = true;
        setTimeout(() => showToast.value = false, 1500);
        getFavList();
    } catch (err) {
        showtext.value = '取消收藏失敗';
        yesno.value = false;
        showToast.value = true;
        setTimeout(() => showToast.value = false, 1500);
    }
};

// 去购�?
const goCheck = () => {
    if (!checkedIds.value.length) {
        showtext.value = '請先選擇商品';
        yesno.value = false;
        showToast.value = true;
        setTimeout(() => showToast.value = false, 1500);
        return;
    }
    showtext.value = '請前往商品頁購買';
    yesno.value = false;
    showToast.value = true;
    setTimeout(() => showToast.value = false, 1500);
};

// 跳转详情'
const toDetail = (id: number) => {
    router.push({ path: '/goods-detail', query: { id: id.toString() } });
};

// 加载推荐'
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

onMounted(() => {
    getFavList();
    loadGoods();
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
    height: 100vh;
    position: relative;
}

.allar-top {
    position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 500px;
    z-index: 999;
    display: flex;
    align-items: center;
    background: #f7f7f7;
    height: 45px;
    border-bottom: 1px solid #ddd;
    padding-top: env(safe-area-inset-top);
    box-sizing: content-box;
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
    top: calc(45px + env(safe-area-inset-top));
    left: 0;
    right: 0;
    bottom: 60px;
    overflow-y: auto;
    background: #fff;
}

.cuekdil {
    width: 100%;
    min-height: 100%;
}

/* 列表异常：*/
.cart-item {
    display: flex;
    align-items: center;
    background: #f0f0f0;
    border-radius: 8px;
    padding: 14px;
    margin-bottom: 5px;
}



.cart-goods {
    display: flex;
    flex: 1;
    align-items: center;
}

.goods-img {
    width: 70px;
    height: 70px;
    border-radius: 6px;
    object-fit: cover;
    background: #fff;
}

.goods-info {
    flex: 1;
    padding-left: 12px;
    text-align: left;
}

.goods-name {
    color: #333;
    font-size: 12px;
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
    font-size: 11px;
    margin-bottom: 6px;
}

.price-row {
    display: flex;
    flex-direction: row;
    padding: 5px 0;
}

.now-price {
    color: #ff019e;
    font-size: 14px;
    font-weight: bold;
}

/* 底部 */
.cart-bottom {
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 500px;
    height: 60px;
    background: #f7f7f7;
    display: flex;
    align-items: center;
    padding: 0 14px;
    z-index: 99;
    box-sizing: border-box;
}

.total {
    flex: 1;
    color: #333;
    font-size: 14px;
    text-align: right;
    padding-right: 10px;
}

.delete-btn {
    background: #444;
    color: #333;
    padding: 3px 12px;
    border-radius: 4px;
    margin-right: 8px;
    font-size: 11px;
}

.buy-btn {
    background: #cc9b5a;
    color: #000;
    padding: 3px 18px;
    border-radius: 4px;
    font-weight: bold;
    font-size: 11px;
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
</style>