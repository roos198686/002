<template>
    <div class="main">
        <div class="register-container">
            <div class="register-all">
                <!-- 滾動內容區 -->
                <div class="content-wrapper">
                    <div class="cuekdil">
                        <!-- 店鋪資訊卡片 -->
                        <div class="shop-info-card">
                            <div @click="goBack" class="back-icon">
                                <Icon icon="material-symbols:arrow-back-ios-rounded" width="18" />
                            </div>
                            <div style="display: flex;flex-direction: row;">
                                <div class="shop-avatar">
                                    <img :src="getShopAvatar()" alt="店鋪頭像" />
                                </div>
                                <div class="shop-desc">
                                    <div class="shop-name">{{ shopName || nickname || '未命名店鋪' }}</div>
                                    <div class="shop-tip">
                                        商品總數：{{ goodsTotal }} | 已上架：{{ onSaleNum }}
                                    </div>
                                    <div class="shop-intro">{{ shopDesc || '暫無店鋪簡介' }}</div>
                                </div>
                            </div>
                        </div>

                        <!-- 功能按鈕�?-->
                        <div class="btn-group" v-if="userId === userid">
                            <div class="func-btn" @click="goAddGoods">
                                <Icon icon="material-symbols:add-box-rounded" height="24" />
                                <span>新增商品</span>
                            </div>
                            <div class="func-btn" @click="orderLogistics">
                                <Icon icon="material-symbols:add-box-rounded" height="24" />
                                <span>订单物流</span>
                            </div>
                            <div class="func-btn" @click="openShopPopup">
                                <Icon icon="lucide:settings" height="24" />
                                <span>店鋪設定</span>
                            </div>
                        </div>

                        <!-- 商品列表標題 -->
                        <div class="list-title">所有商品</div>

                        <!-- 商品列表 -->
                        <div style="padding: 0 5px;">
                            <div class="goods-list">
                                <div class="goods-item" v-for="item in goodsList" :key="item.id"
                                    @click="toDetail(item)">

                                    <div
                                        style="width:100%; border-radius:6px 6px 0 0; overflow:hidden;background-color: #fff;">
                                        <img :src="baseURL + item.cover"
                                            style="width:100%; height:auto; object-fit:cover;max-height: 270px; ">
                                    </div>
                                    <div style="padding:5px 10px 10px 10px;text-align: left;background-color: #fff;">
                                        <div
                                            style="color:#333; font-size:14px; line-height:1.4; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2;-webkit-box-orient: vertical;">
                                            {{ item.name }}
                                        </div>
                                        <div style="color:#ff40ff; font-size:16px; font-weight:bold;">
                                            <span style="font-size: 11px;color:#333;margin-right: 5px;">售價</span>
                                            <span style="font-size: 11px;color: #ff40ff;">$</span>{{ item.price }}
                                            <span
                                                style="font-size: 11px;color:#333;margin-right: 5px;font-weight: 100;">庫存：{{
                                                    item.stock }}</span>
                                        </div>
                                        <div
                                            style="color:#666; font-size:11px; display:flex; justify-content:space-between;">
                                            <span>銷售：{{ item.sales }}</span>
                                            <span style="margin-left: 5px;">收藏：{{ item.like
                                                }}</span>
                                        </div>
                                    </div>
                                    <div class="goods-operate" v-if="item.user_id === userid">
                                        <div class="operate-btn edit" @click="goEditGoods(item, $event)">編輯</div>
                                        <div class="operate-btn" :class="item.status === 1 ? 'change-status'
                                            : 'change-status-a'"
                                            @click=" changeGoodsStatus(item.id, item.status, $event)">
                                            {{ item.status === 1 ? '下架' : '上架' }}
                                        </div>
                                    </div>
                                </div>

                                <!-- 空資訊失敗-->
                                <div class="empty-box" v-if="goodsList.length === 0">
                                    暫無商品，趕緊新增吧
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        <!-- 底部滑出編輯商品彈窗 -->
        <div class="edit-mask" v-if="editDialogVisible" @click.self="closeEditDialog">
            <div class="edit-popup">
                <div class="popup-header">
                    <span class="title">編輯商品</span>
                    <span class="close-btn" @click="closeEditDialog">×</span>
                </div>

                <div class="popup-body">
                    <div style="display: flex;flex-direction: row;gap: 10px;">
                        <div class="form-item">
                            <label>商品名稱</label>
                            <el-input v-model="editForm.name" placeholder="請輸入商品名稱"></el-input>
                        </div>
                        <div class="form-item">
                            <label>售價</label>
                            <el-input v-model.number="editForm.price" type="number" placeholder="請輸入售價"></el-input>
                        </div>
                    </div>
                    <div style="display: flex;flex-direction: row;gap: 10px;">
                        <div class="form-item">
                            <label>庫存</label>
                            <el-input v-model.number="editForm.stock" type="number" placeholder="請輸入庫存"></el-input>
                        </div>
                        <div class="form-item">
                            <label>顏色</label>
                            <el-input v-model="editForm.color" placeholder="例：黑色/白色"></el-input>
                        </div>
                    </div>
                    <div style="display: flex;flex-direction: row;gap: 10px;">
                        <div class="form-item">
                            <label>規格</label>
                            <el-input v-model="editForm.spec" placeholder="例：L/XL"></el-input>
                        </div>
                        <div class="form-item">
                            <label>材質</label>
                            <el-input v-model="editForm.material" placeholder="商品材質"></el-input>
                        </div>
                    </div>
                    <div style="display: flex;flex-direction: row;gap: 10px;">
                        <div class="form-item">
                            <label>銷量</label>
                            <el-input v-model.number="editForm.sales" type="number" placeholder="銷量"></el-input>
                        </div>
                        <div class="form-item">
                            <label>收藏數</label>
                            <el-input v-model.number="editForm.like" type="number" placeholder="收藏數"></el-input>
                        </div>
                    </div>
                    <div style="font-size: 13px;text-align: right;color:#666;margin-bottom: 10px;width: 60px;">商品簡介
                    </div>
                    <div class="form-item">
                        <textarea v-model="editForm.intro" class="intro-textarea" :rows="6"
                            placeholder="商品簡介"></textarea>
                    </div>
                </div>

                <div class="popup-footer">
                    <div class="popup-footer-bit" @click="closeEditDialog">取消</div>
                    <div class="popup-footer-bita" :loading="editLoading" @click="submitEdit">儲存修改</div>
                </div>
            </div>
        </div>

        <!-- 店鋪設定：底部滑動完成-->
        <div v-if="shopPopupShow" class="shop-mask" @click.self="closeShopPopup">
            <div class="shop-popup">
                <div class="popup-header">
                    <span class="title">店鋪設定</span>
                    <span class="close-btn" @click="closeShopPopup">×</span>
                </div>

                <div class="shop-form">
                    <!-- 商店頭像 -->
                    <div class="form-item">
                        <label>店鋪頭像</label>
                        <div class="avatar-upload">
                            <!-- 預覽展示區：-->
                            <div class="avatar-preview" @click="triggerShopAvatarFile">
                                <img :src="shopAvatarPreview" alt="" />
                                <!-- 浮層文字 -->
                                <div class="avatar-mask">
                                    <span v-if="!hasNewShopFile">點擊選圖</span>
                                    <span v-else>預覽中</span>
                                </div>
                            </div>
                            <!-- 隱藏檔案選擇幣種-->
                            <input ref="shopAvatarFileRef" type="file" accept="image/*" style="display: none"
                                @change="handleShopAvatarChange" />
                        </div>
                    </div>

                    <!-- 商店名稱 -->
                    <div class="form-item">
                        <label>店鋪名稱</label>
                        <el-input v-model="shopForm.shop_name" placeholder="請輸入商店名稱" maxlength="50" clearable />
                    </div>

                    <!-- 商店簡介 -->
                    <div class="form-item">
                        <label>店鋪簡介</label>
                        <el-input v-model="shopForm.shop_desc" type="textarea" :rows="4" placeholder="請輸入商店簡介"
                            maxlength="200" />
                    </div>
                </div>

                <div class="popup-footer">
                    <div class="btn cancel" @click="closeShopPopup">取消</div>
                    <div class="btn confirm" @click="saveShopSetting" :class="{ loading: shopLoading }">
                        <span v-if="!shopLoading">儲存</span>
                        <span v-else class="loading-dot"></span>
                    </div>
                </div>
            </div>
        </div>

        <!-- 全域提示 -->
        <div class="copy-toast" v-if="showToast">
            <div style="font-size: 30px;">
                <Icon icon="iconoir:check" width="58" />
            </div>
            <div class="toast-text">{{ toastText }}</div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed, reactive, onUnmounted } from 'vue'
import { Icon } from '@iconify/vue'
import router from '../../../router'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'
import { useRoute } from 'vue-router'
const route = useRoute()
const baseURL = request.defaults.baseURL || ''

const userid = ref<number>(0)
const goBack = () => router.go(-1)

// 提示：充值'
const showToast = ref(false)
const toastText = ref('')

// 商品列表'
const goodsList = ref<any[]>([])
const goodsTotal = computed(() => goodsList.value.length)
const onSaleNum = computed(() => goodsList.value.filter(item => item.status === 1).length)

// 店鋪資訊'
const username = ref('')
const nickname = ref('')
const myavatar = ref('')
const userId = ref<number>(0)
const shopName = ref('')
const shopDesc = ref('')
const shopAvatarUrl = ref('')

const orderLogistics = () => router.push('/orderLogistics');

// 拼接店鋪頭像位址'
const getShopAvatar = () => {
    return shopAvatarUrl.value ? baseURL + shopAvatarUrl.value : baseURL + myavatar.value
}

//获取店铺主页信息  用户信息'
const getUserId = async () => {
  const user_id = route.query.id || route.params.id
  if (!user_id) return
  try {
    const { data: res } = await request.post('/api/myshop/info', { user_id: user_id })
    if (res.code === 1) {
      const user = res.data || {}
      username.value = user.username || ''
      nickname.value = user.nickname || ''
      myavatar.value = user.avatar || ''
      userId.value = user.id || 0
      shopName.value = user.shop_name || ''
      shopDesc.value = user.shop_desc || ''
      shopAvatarUrl.value = user.shop_avatar || ''

      // ============ 新增：同步更新localStorage ============
      const localUser = JSON.parse(localStorage.getItem('user') || '{}')
      localUser.shop_name = shopName.value
      localUser.shop_desc = shopDesc.value
      localUser.shop_avatar = shopAvatarUrl.value
      localStorage.setItem('user', JSON.stringify(localUser))

      loadMyGoods()
    }
  } catch (err) {
    console.error('獲取店鋪資訊失敗：', err)
  }
}


// ========== 編輯商品彈窗 ==========
const editDialogVisible = ref(false)
const editLoading = ref(false)
const editForm = ref({
    id: 0,
    name: '',
    price: 0,
    stock: 0,
    color: '',
    spec: '',
    material: '',
    sales: 0,
    like: 0,
    intro: ''
})

const goEditGoods = (row: any, e: Event) => {
    e.stopPropagation()
    editForm.value = {
        id: row.id,
        name: row.name || '',
        price: Number(row.price) || 0,
        stock: Number(row.stock) || 0,
        color: row.color || '',
        spec: row.spec || '',
        material: row.material || '',
        sales: Number(row.sales) || 0,
        like: Number(row.like) || 0,
        intro: row.intro || ''
    }
    editDialogVisible.value = true
}

const closeEditDialog = () => {
    editDialogVisible.value = false
}

const submitEdit = async () => {
    const form = editForm.value
    if (!form.name.trim()) return ElMessage.warning('請填寫商品名稱')
    if (form.price <= 0) return ElMessage.warning('售價必須大於0')

    editLoading.value = true
    try {
        const { data: res } = await request.post('/api/myshop/goodsUpdate', form)
        if (res.code === 1) {
            ElMessage.success('修改成功')
            closeEditDialog()
            loadMyGoods()
        } else {
            ElMessage.error(res.msg || '修改失敗')
        }
    } catch (err) {
        ElMessage.error('網路異常')
    } finally {
        editLoading.value = false
    }
}

// 載入我的商品列表'
const loadMyGoods = async () => {
    if (!userId.value) return

    try {
        const { data: res } = await request.post('/api/myshop/myGoods', { user_id: userId.value })
        if (res.code === 1) {
            goodsList.value = res.data || []
        }
    } catch (err) {
        console.error(err)
    }
}

// 切換商品上下架'
const changeGoodsStatus = async (id: number, status: number, e: Event) => {
    e.stopPropagation()
    try {
        const { data: res } = await request.post('/api/myshop/changeStatus', {
            id,
            status: status === 1 ? 0 : 1
        })
        if (res.code === 1) {
            showToast.value = true
            toastText.value = '操作成功'
            loadMyGoods()
        } else {
            showToast.value = true
            toastText.value = res.msg || '操作失敗'
        }
    } catch (err) {
        showToast.value = true
        toastText.value = '網路異常'
    } finally {
        setTimeout(() => showToast.value = false, 2000)
    }
}

// ========== 店鋪設定彈窗 ==========
const uploadApi = '/api/upload'
// const blobUrlList: string[] = []

const shopPopupShow = ref(false)
const shopLoading = ref(false)

// 店鋪表單'
const shopForm = reactive({
    shop_name: '',
    shop_desc: '',
    shop_avatar: ''
})

// 原生上傳相關'
const shopAvatarFileRef = ref<HTMLInputElement | null>(null)
const hasNewShopFile = ref(false)          // 是否選擇了新圖片'
const shopAvatarPreview = ref('')          // 預覽圖位址'
const tempShopImgUrl = ref('')             // 暫存blob位址'

// 開啟彈窗+回顯資料'
const openShopPopup = () => {
  // 優先使用當前頁面已經加載完成的店鋪數據（接口來源，權重最高）
  shopForm.shop_name = shopName.value
  shopForm.shop_desc = shopDesc.value
  shopForm.shop_avatar = shopAvatarUrl.value

  // url拼接工具，自動處理 baseURL 末尾 / 避免 //
  const joinUrl = (base: string, path: string) => {
    if (!base) return path
    return base.replace(/\/$/, '') + '/' + path.replace(/^\//, '')
  }

  // 回顯頭像
  if (shopAvatarUrl.value) {
    shopAvatarPreview.value = joinUrl(baseURL, shopAvatarUrl.value)
  } else {
    shopAvatarPreview.value = ''
  }

  // 重置上傳狀態
  hasNewShopFile.value = false
  if (tempShopImgUrl.value) {
    URL.revokeObjectURL(tempShopImgUrl.value)
    tempShopImgUrl.value = ''
  }
  shopPopupShow.value = true
}


const closeShopPopup = () => {
    shopPopupShow.value = false
    // 釋放暫存圖片資源'
    if (tempShopImgUrl.value) {
        URL.revokeObjectURL(tempShopImgUrl.value)
        tempShopImgUrl.value = ''
    }
    hasNewShopFile.value = false
    shopAvatarPreview.value = ''
}
// 點擊頭像區域，喚起檔案選擇
const triggerShopAvatarFile = () => {
    shopAvatarFileRef.value?.click()
}

// 選擇圖片時間完本機預覽
const handleShopAvatarChange = (e: Event) => {
    const target = e.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) return

    // 釋放舊暫存位址'
    if (tempShopImgUrl.value) {
        URL.revokeObjectURL(tempShopImgUrl.value)
    }

    // 產生預覽位址'
    const blobUrl = URL.createObjectURL(file)
    tempShopImgUrl.value = blobUrl
    shopAvatarPreview.value = blobUrl
    hasNewShopFile.value = true
}

const user = JSON.parse(localStorage.getItem('user') || '{}')
// 儲存店鋪設定'
const saveShopSetting = async () => {
    if (!shopForm.shop_name.trim()) return ElMessage.warning('請輸入商店名稱')
    shopLoading.value = true

    try {
        let newAvatarPath = shopForm.shop_avatar
        // 有新圖片 -> 先上傳失敗'
        if (hasNewShopFile.value && shopAvatarFileRef.value?.files?.[0]) {
            const file = shopAvatarFileRef.value.files[0]
            const formData = new FormData()
            formData.append('file', file)

            const { data: resImg } = await request.post(uploadApi, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            if (resImg.code !== 1) throw new Error('頭像上傳失敗')
            newAvatarPath = resImg.data
        }

        // 提交店鋪資訊'

        const params = {
            user_id: Number(user.id),
            shop_name: shopForm.shop_name.trim(),
            shop_desc: shopForm.shop_desc.trim(),
            shop_avatar: newAvatarPath
        }
        const { data } = await request.post('/api/myshop/shop_setting', params)

        if (data.code === 1) {
            ElMessage.success('店鋪設定儲存成功')
            // 更新本機儲存 & 頁面資料來源'
            user.shop_name = shopForm.shop_name
            user.shop_desc = shopForm.shop_desc
            user.shop_avatar = newAvatarPath
            localStorage.setItem('user', JSON.stringify(user))

            shopName.value = shopForm.shop_name
            shopDesc.value = shopForm.shop_desc
            shopAvatarUrl.value = newAvatarPath

            closeShopPopup()
            getUserId() // 強制重新整理頂部店鋪頭像'
        } else {
            ElMessage.error(data.msg || '儲存失敗')
        }
    } catch (err: any) {
        ElMessage.error(err.message || '操作失敗')
    } finally {
        shopLoading.value = false
    }
}

// 路由跳轉'
const goAddGoods = () => router.push('/shop_goodsadd')
const toDetail = (item: any) => {
    router.push({ path: '/goods-detail', query: { id: item.id.toString() } });
}

onMounted(() => {
    getUserId()
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    userid.value = user.id
})

// 釋放暫存圖片位址'
onUnmounted(() => {
    if (tempShopImgUrl.value) {
        URL.revokeObjectURL(tempShopImgUrl.value)
    }
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

/* 全局布局 與會員頁保持完全一致*/
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
.back-icon {
    color: #000000;
    cursor: pointer;
    margin-bottom: 15px;
    /* margin-left: 15px; */
}

.allar-top {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    max-width: 500px;
    margin: 0 auto;
    z-index: 999;
    display: flex;
    background: #f7f7f7;
    height: 45px;
    align-items: center;
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
    margin-right: 25px;
}

/* 滾動內容區 */
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

.cuekdil {
    width: 100%;
    min-height: 100%;
    background: #fff;
}

/* 店鋪資訊卡片 */
.shop-info-card {
    display: flex;
    flex-direction: column;
    background: linear-gradient(375deg, #ff33ee 0%, #ecc97f 50%, #fff 100%);
    padding: calc(15px + env(safe-area-inset-top)) 25px 35px 25px;
    text-align: left;
    border-bottom-left-radius: 60% 40px;
    border-bottom-right-radius: 60% 40px;
}

.shop-avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;
    border: 2px solid #c5a100;
}

.shop-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.shop-desc {
    flex: 1;
    margin-left: 12px;
    color: #222222;
}

.shop-name {
    font-size: 16px;
    font-weight: bold;
    color: #000;
}

.shop-tip {
    font-size: 12px;
    color: #3d3d3d;
    margin: 4px 0;
}

.shop-intro {
    font-size: 12px;
    color: #5c5c5c;
    line-height: 1.4;
    /* 强制自动换行 */
    word-wrap: break-word;
    word-break: break-all;
    white-space: normal;

}

/* 功能按鈕�?*/
.btn-group {
    display: flex;
    gap: 10px;
    margin-top: 15px;
    padding: 0 15px;

}

.func-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 5px 0;
    background: linear-gradient(325deg, #ff33ee 0%, #ecc97f 50%, #fff 100%);
    border-radius: 8px;
    font-size: 13px;
    color: #000;
    cursor: pointer;
}

/* 列表標題 */
.list-title {
    font-size: 14px;
    color: #111;
    text-align: center;
    border-radius: 20px 20px 0 0;
    padding: 10px 20px;
    z-index: 99999;

}

/* 商品列表 一行两次输入*/
.goods-list {
    width: 100%;
    column-count: 2;
    column-gap: 0px;
    column-fill: balance;
}

.goods-item {
    break-inside: avoid;
    padding: 5px;

}

.goods-img {
    width: 100%;
    aspect-ratio: 1 / 1;
    flex-shrink: 0;
    border-radius: 6px;
    overflow: hidden;
}

.goods-img img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.goods-info {
    flex: 1;
    margin: 0 10px;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.goods-name {
    font-size: 13px;
    color: #666;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.goods-price {
    font-size: 14px;
    color: #ff33ee;
    font-weight: bold;
    margin: 4px 0;
}

.goods-other {
    font-size: 11px;
    color: #666;
    display: flex;
    gap: 8px;
}

.tag-on {
    color: #4cd964;
}

.tag-off {
    color: #ff4d4f;
}

.goods-operate {
    display: flex;
    flex-direction: row;
    justify-content: left;
    gap: 6px;
    padding: 0 10px 10px 10px;
    background-color: #fff;
    border-radius: 0 0 6px 6px;
}

.operate-btn {
    width: 50px;
    height: 24px;
    line-height: 24px;
    text-align: center;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
}

.edit {
    background: #ff33ee;
    color: #fff;
}

.change-status {
    background: #fdc571;
    color: #000;
}

.change-status-a {
    background: #17fa76;
    color: #000;
}

/* 空狀態*/
.empty-box {
    text-align: center;
    padding: 40px 0;
    color: #666;
    font-size: 13px;
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

.toast-text {
    margin-top: 8px;
    font-size: 16px;
}

/* 底部编辑弹窗遮罩 */
.edit-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    z-index: 9999;
    display: flex;
    align-items: flex-end;
    justify-content: center;
}

.edit-popup {
    width: 100%;
    max-width: 500px;
    height: 90%;
    background: #fff;
    border-radius: 12px 12px 0 0;
    color: #333;
    animation: slideUp 0.3s ease;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

@keyframes slideUp {
    from {
        transform: translateY(100%);
    }

    to {
        transform: translateY(0);
    }
}

.popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    border-bottom: 1px solid #c5c5c5;
}

.popup-header .title {
    font-size: 16px;
    color: #000;
}

.close-btn {
    font-size: 22px;
    color: #383838;
    cursor: pointer;
}

.popup-body {
    padding: 20px;
    overflow-y: auto;
    flex: 1;
    text-align: right;
}

.form-item {
    margin-bottom: 14px;
    flex: 1;
    display: flex;
    flex-direction: row;
    align-items: center;
}

.form-item label {
    display: block;
    margin-bottom: 5px;
    font-size: 13px;
    color: #383838;
    width: 80px;
    margin-right: 5px;
}

/* 深度修改 el-input 样式，适配暗黑主题 */
:deep(.el-input__wrapper) {
    background: #fff !important;
    box-shadow: none !important;
}

:deep(.el-input__inner) {
    color: #333 !important;
}

:deep(.el-textarea__inner) {
    background: #fff !important;
    color: #333 !important;
}

.popup-footer {
    padding: 15px;
    border-top: 1px solid #444;
    display: flex;
    gap: 10px;
    justify-content: flex-end;
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

/* 默认边框 */
.intro-textarea {
    width: 100%;
    padding: 8px 10px;
    background: #fff;
    color: #333;
    border: 1px solid #ddd;
    border-radius: 4px;
    outline: none;
    box-sizing: border-box;
}

.intro-textarea:focus {
    border-color: #ddd;
}

.popup-footer-bit {
    background-color: #c6fdca;
    font-size: 13px;
    padding: 3px 10px;
    border-radius: 5px;
    color: #000;
}

.popup-footer-bita {
    background-color: #ff33ee;
    font-size: 13px;
    padding: 3px 10px;
    border-radius: 5px;
    color: #fff;
}

/* 店铺设置弹窗样式 */
.shop-mask {
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    z-index: 9999;
    display: flex;
    align-items: flex-end;
    justify-content: center;
}

/* 底部弹出主体 */
.shop-popup {
    width: 100%;
    max-width: 500px;
    height: 80vh;
    background: #fff;
    border-radius: 12px 12px 0 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    animation: slideUp 0.3s ease;
}

/* 表单区域 - 可滚�?*/
.shop-form {
    flex: 1;
    padding: 15px;
    overflow-y: auto;
    -ms-overflow-style: none;
    scrollbar-width: none;
}

.shop-form::-webkit-scrollbar {
    display: none;
}

.form-item {
    margin-bottom: 18px;
}

.form-item label {
    display: block;
    color: #313131;
    margin-bottom: 8px;
    font-size: 13px;
}

/* 店铺头像上传样式 【和用户页头像视觉统一级列表*/
.avatar-upload {
    width: 80px;
    height: 80px;
}

.avatar-preview {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    overflow: hidden;
    border: 3px solid #bdbcbc;
    position: relative;
    cursor: pointer;
}

.avatar-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.avatar-mask {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #333;
    font-size: 12px;
}

.upload-text {
    color: #666;
    font-size: 12px;
}

/* 底部按钮�?*/
.popup-footer {
    display: flex;
    gap: 10px;
    padding: 15px;
    border-top: 1px solid #dadada;
}

.btn {
    flex: 1;
    height: 36px;
    line-height: 36px;
    text-align: center;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
}

.cancel {
    background: #e0e0e0;
    color: #333;
}

.confirm {
    background-color: #ff33ee;
    color: #fff;
}

.confirm.loading {
    pointer-events: none;
    opacity: 0.8;
}

/* 加载旋转动画 */
.loading-dot {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid #fff;
    border-top-color: transparent;
    border-radius: 50%;
    animation: rotate 0.6s linear infinite;
}

@keyframes rotate {
    to {
        transform: rotate(360deg);
    }
}

/* 输入框暗黑样�?*/
.shop-form :deep(.el-input__wrapper) {
    background-color: #fff;
    box-shadow: none;
}

.shop-form :deep(.el-input__inner) {
    color: #333;
}

.shop-form :deep(.el-textarea__inner) {
    background-color: #fff;
    color: #333;
    border: none;
}
</style>