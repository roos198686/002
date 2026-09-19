<template>
    <div class="main">
        <div class="register-container">
            <div class="register-all">
                <!-- 頂部標題 -->
                <div class="allar-top">
                    <div @click="goBack" style="margin-left: 10px;cursor: pointer;color: #a88035;width: 30px;">
                        <Icon icon="material-symbols:arrow-back-ios-rounded" width="18" />
                    </div>
                    <div class="allar-top-a">訂單列表</div>
                </div>

                <!-- 中間滾動區：-->
                <div class="content-wrapper">
                    <div class="cuekdil">
                        <div class="ciurld">
                            <div class="status-tab" :class="{ active: activeTab === 'all' }" @click="ciurlist('all')">
                                全部
                            </div>
                            <div class="status-tab" :class="{ active: activeTab === 'Pending' }"
                                @click="ciurlist('Pending')">
                                待處理
                            </div>
                            <div class="status-tab" :class="{ active: activeTab === 'Completed' }"
                                @click="ciurlist('Completed')">
                                已完成
                            </div>
                            <div class="status-tab" :class="{ active: activeTab === 'Frozen' }"
                                @click="ciurlist('Frozen')">
                                已凍結
                            </div>
                        </div>

                        <div class="list-scroll-wrap" @scroll="handleScroll">
                            <div class="brislidlist" v-for="menu in showList" :key="menu.id">
                                <div style="border-radius: 10px;font-size: 13px;width: 100%;">
                                    <div style="display: flex;flex-direction: row;justify-content: space-between;">
                                        <div style="color:#666;">訂單編號：{{ menu.order_no }}</div>
                                        <div style="font-size: 12px;"
                                            :class="menu.status == '0' ? 'brislidlista' : menu.status == '1' ? 'brislidlistb' : 'brislidlistc'">
                                            {{ menu.status == '0' ? '處理中' : menu.status == '1' ? '已完成' : '已凍成' }}</div>
                                    </div>
                                    <!-- 用戶提現 -->
                                    <div v-if="menu.type == 1"
                                        style="font-size: 12px;text-align: left;margin-bottom: 5px;">
                                        <div
                                            style="flex:1;color: #f89f2b;padding: 10px 0;display: flex;justify-content: center;">
                                            <span style=" color:#666;margin-right: 10px;">{{ menu.remark }}</span>
                                            <span style="font-weight: 800;font-size: 16px;"
                                                :class="menu.amount < '0' ? 'brislidlista' : 'brislidlistb'">金額：{{
                                                    menu.amount }}</span>
                                        </div>
                                        <div style="">類型：{{ menu.coin_type }}</div>
                                        <div style="">提現地址：{{ menu.wallet_address }}</div>
                                    </div>
                                    <!-- 用戶儲值地址-->
                                    <div v-if="menu.type == 2"
                                        style="font-size: 12px;text-align: left;margin-bottom: 5px;">
                                        <div style="display: flex;flex-direction: row;">
                                            <div class="avatar">
                                                <img :src="baseURL + menu.proof_file" />
                                            </div>
                                            <div
                                                style="color: #f89f2b;padding: 10px;display: flex;align-items: center;">
                                                <span style="color:#666;margin-right: 10px;">{{ menu.remark }}</span>
                                                <span style="font-weight: 800;font-size: 16px;"
                                                    :class="menu.amount < '0' ? 'brislidlista' : 'brislidlistb'">金額：{{
                                                        menu.amount }}</span>
                                            </div>
                                        </div>

                                        <div style="">類型：{{ menu.coin_type }}</div>
                                        <div style="">儲值地址：{{ menu.wallet_address }}</div>
                                    </div>
                                    <!-- VIP -->
                                    <div v-if="menu.type == 3"
                                        style="font-size: 12px;text-align: left;margin-bottom: 5px;">
                                        <div
                                            style="flex:1;color: #f89f2b;padding: 10px 0;display: flex;justify-content: center;">
                                            <span style="color:#666;margin-right: 10px;">{{ menu.remark }}</span>
                                            <span style="font-weight: 800;font-size: 16px;"
                                                :class="menu.amount < '0' ? 'brislidlista' : 'brislidlistb'">金額：{{
                                                    menu.amount }}</span>
                                        </div>
                                        <div style="color: #02fc17;">升級至：VIP{{ menu.amount == '-100' ? '1' : menu.amount
                                            == '-300' ? '2' : '3' }}</div>
                                    </div>
                                    <!-- 商城交易 -->
                                    <div v-if="menu.type == 4"
                                        style="font-size: 12px;text-align: left;margin-bottom: 5px;display: flex;flex-direction: row;">
                                        <div style="">
                                            <div class="avatar">
                                                <img :src="baseURL + menu.goods_cover" />
                                            </div>
                                        </div>
                                        <div
                                            style="margin-left: 10px;display: flex;flex-direction: column;justify-content: center;gap: 10px;">
                                            <div style="color: #f89f2b;">
                                                <span style="color:#666;margin-right: 10px;">{{ menu.remark }}</span>
                                                <span style="font-weight: 800;font-size: 16px;"
                                                    :class="menu.amount < '0' ? 'brislidlista' : 'brislidlistb'">金額：{{
                                                        menu.amount }}</span>
                                            </div>
                                            <div style="">{{ menu.goods_name }}</div>
                                        </div>

                                    </div>
                                    <div style="text-align: right;font-size: 11px;color:#666;">日期：{{
                                        moment(menu.create_time).format('YYYY.MM.DD HH:mm') }}</div>
                                </div>
                            </div>

                            <div
                                style="padding:12px;text-align:center;color:#666;font-size:12px;background:#272727;border-top:1px solid #0e0808f1;height:50px;">
                                <span v-if="loading">載入中</span>
                                <span v-else-if="showList.length === 0">
                                    <Icon icon="mdi:clipboard-outline" width="38" />
                                </span>
                                <span v-else>已載入全部</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import router from '../../../router';
import { Icon } from '@iconify/vue';
import request from '@/utils/request';
import moment from 'moment';
const baseURL = request.defaults.baseURL || '';
const route = useRoute();
const goBack = () => router.go(-1);

const activeTab = ref('all')
const showList = ref<any[]>([])
const loading = ref(false)

function statusValue(tab: string) {
    if (tab === 'all') return
    if (tab === 'Pending') return 0
    if (tab === 'Completed') return 1
    if (tab === 'Frozen') return 2
    return 0
}
//取得記錄'
async function loadData() {
    loading.value = true
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const userId = user.userId || user.id;

    const { data: res } = await request.post('/api/withdraw/kdilsalist', {
        user_id: userId,
        status: statusValue(activeTab.value)
    })

    showList.value = res.data || []
    loading.value = false
}

function ciurlist(tab: string) {
    activeTab.value = tab
    showList.value = []
    loadData()
}

function handleScroll() { }

watch(() => route.path, () => {
    localStorage.setItem('last_path', route.path)
}, { immediate: true })

onMounted(() => {
    loadData()
})
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

/* ========== 頂部標題 ========== */
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
    padding: 9px 0;
    background: #f7f7f7;
}

.allar-top-a {
    font-size: 15px;
    font-weight: bold;
    color: #8a6520;
    text-align: center;
    width: 100%;
    margin-right: 40px;
}

/* ========== 滾動容器 ========== */
.content-wrapper {
    position: absolute;
    top: 40px;
    left: 0;
    right: 0;
    bottom: 0;
    overflow-y: auto;
    overflow-x: hidden;
    box-sizing: border-box;
    padding-bottom: 20px !important;
    background: #fff !important;
}

.cuekdil {
    width: 100%;
    min-height: 100%;
    background: #fff;
    padding-bottom: 10px;
}

/* ========== 分頁標籤 ========== */
.ciurld {
    display: flex;
    font-size: 13px;
    width: 100%;
    margin-top: 5px;
}

.status-tab {
    flex: 1;
    margin-top: 3px;
    background-color: #f8cc93;
    padding: 10px 0;
    text-align: center;
    color: #000;
    cursor: pointer;
}

.status-tab.active {
    background-color: #f89f2b;
    font-weight: 800;
}

.list-scroll-wrap {
    margin-top: 5px;
}

.brislidlist {
    display: flex;
    padding: 10px 12px;
    box-sizing: border-box;
    color: #666;
    background-color: #fff;
    margin: 10px;
    border-radius: 6px;
    box-shadow: 0 0 1px 1px rgba(90, 90, 90, 0.349);
}

.brislidlista {
    color: #ff6702;
}

.brislidlistb {
    color: #02e620;
}

/* ========== 隱藏捲軸 + 禁止彈回 ========== */
::-webkit-scrollbar {
    display: none;
}

:global(html),
:global(body) {
    background: #fff !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden;
    overscroll-behavior: none;
}

.avatar {
    width: 80px;
    height: 80px;
    border-radius: 5px;
    overflow: hidden;
    margin: 10px 0;
}

.avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
</style>