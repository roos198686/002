<template>
    <div class="main">
        <div class="register-container">
            <div class="register-all">
                <!-- 頂部標題 -->
                <div class="allar-top">
                    <div @click="goBack" style="margin-left: 10px; cursor: pointer; color: #000; width: 30px;">
                        <Icon icon="material-symbols:arrow-back-ios-rounded" width="18" />
                    </div>
                    <div class="allar-top-a">我的提款帳戶</div>
                </div>

                <!-- 滾動內容區 -->
                <div class="content-wrapper">
                    <div class="cuekdil">
                        <div class="list-wrapper">
                            <div class="cardlist" v-if="source.length>0">
                                <div class="cardlist-list" v-for="value in source" :key="value.id">
                                    <div style="text-align:left;">{{ value.coin_type }}</div>
                                    <div style="font-size:16px;">
                                        {{ value.wallet_address.slice(0,5) + '***' + value.wallet_address.slice(-5) }}
                                    </div>
                                    <div class="delete">
                                        <div class="delete-butt" @click="deletecard(value.id)">
                                            刪除
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style="color:#666;text-align:center;padding:30px;background-color: #f5f5f5;" v-else>
                                <Icon icon="mdi:clipboard-outline" width="58" />
                            </div>
                        </div>

                        <div class="cardlist-bottom">
                            <div class="cardlist-add" @click="addcard">新增提款帳戶</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import request from '@/utils/request';

const router = useRouter();
const route = useRoute();
const goBack = () => void router.back();

interface WalletItem {
  id: string | number;
  coin_type: string;
  wallet_address: string;
}

const source = ref<WalletItem[]>([]);

const getUserId = () => {
  try {
    const u = localStorage.getItem('user');
    if (!u) return null;
    return JSON.parse(u).id || null;
  } catch {
    return null;
  }
};

const getList = async () => {
  const user_id = getUserId();
  if (!user_id) return;

  try {
    const { data: res } = await request.post('/api/withdraw/list', {
      user_id
    });
    if (res.code === 1) {
      source.value = res.data;
    }
  } catch (err) {
    console.error('取得資料失敗', err);
  }
};

const deletecard = async (id: string | number) => {
  const user_id = getUserId();
  if (!user_id) return;

  try {
    const { data: res } = await request.post('/api/withdraw/del', {
      id,
      user_id
    });
    if (res.code === 1) getList();
  } catch {}
};

const addcard = () => void router.push('/addcard');

onMounted(() => getList());

watch(() => route.path, () => {
  localStorage.setItem('last_path', route.fullPath);
}, { immediate: true });
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
    background: #f7f7f7;
    height: 45px;
    border-bottom: 1px solid #ddd;
    padding-top: env(safe-area-inset-top);
    box-sizing: content-box;
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

.list-wrapper {
  flex: 1;
  overflow-y: auto !important;
}
.list-wrapper::-webkit-scrollbar { display: none !important; }

.cardlist {
  padding: 15px 30px;
}

.cardlist-bottom {
  padding: 15px 30px;
  flex-shrink: 0;
}

.cardlist-list {
  background-color: #f5f5f5;
  margin-bottom: 10px;
  border-radius: 15px;
  color: #333;
  font-size: 12px;
  padding: 20px 30px;
  box-shadow: 0 0 1px 1px rgb(37, 37, 37);
}
.cardlist-add {
  background-color: #032de6;
  padding: 7px;
  color: #fff;
  border-radius: 50px;
  text-align: center;
  cursor: pointer;
}
.delete { display: flex; }
.delete-butt {
  background: #ff33ee;
  margin-left: auto;
  border-radius: 50px;
  padding: 3px 15px;
  cursor: pointer;
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