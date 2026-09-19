<template>
    <div class="goods-manage">
        <!-- 顶部搜索&操作失敗-->
        <div class="search-bar">
            <div class="search-item">
                <input v-model="searchKey" type="text" placeholder="請輸入商品名稱搜尋" class="search-input" />
                <div class="btn search-btn" @click="handleSearch">搜尋</div>
            </div>
        </div>

        <!-- 商品列表区域 -->
        <div class="table-wrap" >
            <div class="table-head">
                <div class="td td-id">ID</div>
                <div class="td td-img">商品圖片</div>
                <div class="td td-name">商品名稱</div>
                <div class="td td-price">售價</div>
                <div class="td td-stock">庫存</div>
                <div class="td td-stock">已售</div>
                <div class="td td-status">狀態</div>
                <div class="td td-operate">操作</div>
            </div>

            <div class="table-body hide-scroll" ref="scrollBox" @scroll="onScroll">
                <div class="table-row" v-for="item in goodsList" :key="item.id">
                    <div class="td td-id">{{ item.id }}</div>
                    <div class="td td-img">
                        <img :src="baseURL + item.cover" alt="" class="goods-img" />
                    </div>
                    <div class="td td-name">{{ item.name }}</div>
                    <div class="td td-price">{{ item.price }}</div>
                    <div class="td td-stock">{{ item.stock }}</div>
                    <div class="td td-stock">{{ item.sales }}</div>
                    <div class="td td-status">
                        <span :class="item.status === 1 ? 'status-on' : 'status-off'">
                            {{ item.status === 1 ? '已上架' : '已下架' }}
                        </span>
                    </div>
                    <div class="td td-operate">
                        <span class="operate-btn edit" @click="openEditDialog(item)" :style="userinfo.status != 3 ? '' : 'pointer-events: none;background-color: #ccc;'">編輯</span>
                        <span class="operate-btn shelf" @click="changeShelf(item)" :style="userinfo.status != 3 ? '' : 'pointer-events: none;background-color: #ccc;'">
                            {{ item.status === 1 ? '下架' : '上架' }}
                        </span>
                        <span class="operate-btn del" @click="delGoods(item.id)" :style="userinfo.status != 3 ? '' : 'pointer-events: none;background-color: #ccc;'">刪除</span>
                    </div>
                </div>
                <!-- 空數據-->
                <div class="empty-tip" v-if="goodsList.length === 0 && !loading">暫無商品數據</div>
                <!-- 加载提示 -->
                <div class="loading-tip" v-if="loading">載入中.....</div>
                <!-- 无更多數據-->
                <div class="nomore-tip" v-if="noMore && goodsList.length">沒有更多數據</div>
            </div>
        </div>

        <!-- 編輯商品彈窗（已改：图片地址→已售数量、全部非必填欄位-->
        <div class="dialog-mask" v-if="dialogVisible">
            <div class="dialog-box">
                <div class="dialog-title">
                    編輯商品
                </div>
                <div class="dialog-form">
                    <div class="form-item">
                        <label>商品名稱</label>
                        <input v-model="form.goods_name" placeholder="請輸入商品名稱" />
                    </div>
                    <div style="display: flex;flex-direction: row;gap: 10px;">
                        <div class="form-item">
                            <label>商品售價</label>
                            <input v-model="form.price" type="number" placeholder="請輸入售價" />
                        </div>
                        <div class="form-item">
                            <label>商品庫存</label>
                            <input v-model="form.stock" type="number" placeholder="請輸入庫存數量" />
                        </div>
                        <!-- 原：商品圖片地址"  ：改为：已销售数据设置-->
                        <div class="form-item">
                            <label>已銷售數量</label>
                            <input v-model="form.sales" type="number" placeholder="請輸入已銷售數量" />
                        </div>
                    </div>
                    <div class="form-item">
                        <label>商品描述</label>
                        <textarea v-model="form.goods_desc" placeholder="請輸入商品描述"></textarea>
                    </div>
                    <div class="form-item">
                        <label>上架狀態</label>
                        <div class="radio-group">
                            <div style="width: 100px;display: flex;flex-direction: row;gap: 10px;">
                                <span><input type="radio" v-model="form.status" :value="1" /></span><span>上架</span> 
                            </div>
                            <div style="width: 100px;display: flex;flex-direction: row;gap: 10px;">
                                 <span><input type="radio" v-model="form.status" :value="0" /></span><span>下架</span> 
                            </div>
                        </div>
                    </div>
                </div>
                <div class="dialog-btn">
                    <div class="btn cancel" @click="dialogVisible = false">取消</div>
                    <div class="btn submit" @click="submitForm">確認提交</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'
const baseURL = request.defaults.baseURL || '';
const userInfo = reactive(JSON.parse(localStorage.getItem("adminuser") || "{}"));
// 搜尋關鍵字
const searchKey = ref('')
// 滾動容器
const scrollBox = ref<HTMLDivElement | null>(null)

// 商品列表
const goodsList = ref<any[]>([])

// 彈窗狀態切換'
const dialogVisible = ref(false)

// 表單數據：新登入sales 字段'
const form = reactive({
    id: 0,
    goods_name: '',
    price: '',
    stock: '',
    goods_img: '',
    goods_desc: '',
    status: 1,
    sales: ''
})

// 分页参数'
const page = ref(1)
const pageSize = ref(10)
const loading = ref(false)
const noMore = ref(false)

// 重置表单'
const resetForm = () => {
    form.id = 0
    form.goods_name = ''
    form.price = ''
    form.stock = ''
    form.goods_img = ''
    form.goods_desc = ''
    form.status = 1
    form.sales = ''
}

// 分页获取商品列表'
const getGoodsList = async () => {
    if (loading.value || noMore.value) return
    loading.value = true

    try {
        const { data } = await request.get('/api/admin/admin_shop/list', {
            params: {
                goods_name: searchKey.value,
                page: page.value,
                pageSize: pageSize.value
            }
        })

        if (data.code === 1) {
            const list = data.data || []
            if (page.value === 1) {
                goodsList.value = list
            } else {
                goodsList.value.push(...list)
            }
            if (list.length < pageSize.value) {
                noMore.value = true
            }
        } else {
            ElMessage.error(data.msg || '取得列表失敗')
        }
    } catch (err) {
        ElMessage.error('網路異常')
    } finally {
        loading.value = false
    }
}

// 搜索重置分页
const handleSearch = () => {
    page.value = 1
    noMore.value = false
    goodsList.value = []
    getGoodsList()
}

// 滚动触底加载下一步
const onScroll = () => {
    if (!scrollBox.value) return
    const { scrollTop, scrollHeight, clientHeight } = scrollBox.value
    if (scrollTop + clientHeight >= scrollHeight - 20) {
        page.value++
        getGoodsList()
    }
}

// 開啟編輯彈窗：回显完整原有数据）
const openEditDialog = (row: any) => {
    resetForm()
    form.id = row.id
    form.goods_name = row.name
    form.price = row.price
    form.stock = row.stock
    form.goods_img = row.cover
    form.goods_desc = row.intro
    form.status = row.status
    form.sales = row.sales
    dialogVisible.value = true
}

// 提交編輯：空字段不傳，保留原數據'
const submitForm = async () => {
    // 组装参数：只传非空字段，空值不传后台系统'
    const params: any = { id: form.id }
    if (form.goods_name !== '') params.goods_name = form.goods_name
    if (form.price !== '') params.price = form.price
    if (form.stock !== '') params.stock = form.stock
    if (form.goods_img !== '') params.goods_img = form.goods_img
    if (form.goods_desc !== '') params.goods_desc = form.goods_desc
    if (form.sales !== '') params.sales = form.sales
    // 状态始终传递（单选框必有值）'
    params.status = form.status

    try {
        const res = await request.post('/api/admin/admin_shop/edit', params)
        if (res.data.code === 1) {
            ElMessage.success('編輯成功')
            dialogVisible.value = false
            // 刷新列表'
            page.value = 1
            noMore.value = false
            goodsList.value = []
            getGoodsList()
        } else {
            ElMessage.error(res.data.msg || '操作失敗')
        }
    } catch (err) {
        ElMessage.error('網路異常')
    }
}

// 上下架切換成功'
const changeShelf = async (row: any) => {
    try {
        const { data } = await request.post('/api/admin/admin_shop/shelf', {
            id: row.id,
            status: row.status === 1 ? 0 : 1
        })
        if (data.code === 1) {
            ElMessage.success('狀態切換成功')
            page.value = 1
            noMore.value = false
            goodsList.value = []
            getGoodsList()
        } else {
            ElMessage.error(data.msg || '操作失敗')
        }
    } catch (err) {
        ElMessage.error('網路異常')
    }
}

// 刪除商品'
const delGoods = async (id: number) => {
    if (!window.confirm('確定要刪除此商品嗎？')) return
    try {
        const { data } = await request.get('/api/admin/admin_shop/del', { params: { id } })
        if (data.code === 1) {
            ElMessage.success('刪除成功')
            page.value = 1
            noMore.value = false
            goodsList.value = []
            getGoodsList()
        } else {
            ElMessage.error('刪除失敗')
        }
    } catch (err) {
        ElMessage.error('網路異常')
    }
}

onMounted(() => {
    getGoodsList()
})

onUnmounted(() => {
    scrollBox.value?.removeEventListener('scroll', onScroll)
})
</script>

<style scoped>
/* 隱藏滾動態，開*/
.hide-scroll {
    -ms-overflow-style: none;
    scrollbar-width: none;
    max-height: 550px;
    overflow-y: auto;
}

.hide-scroll::-webkit-scrollbar {
    display: none;
}

.goods-manage {
    width: 100%;
    height: 100%;
    padding: 20px;
    box-sizing: border-box;
    background: #fff;
    color: #333;
    font-size: 13px;
}

/* 搜尋聯絡人*/
.search-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    gap: 15px;
}

.search-item {
    display: flex;
    gap: 10px;
    align-items: center;
}

.search-input {
    width: 280px;
    height: 25px;
    padding: 0 10px;
    background: #fff;
    border: 1px solid #ccc;
    border-radius: 4px;
    color: #333;
    outline: none;
}

/* 按鈕通用樣式 */
.btn {
    padding: 3px 16px;
    border-radius: 4px;
    cursor: pointer;
    text-align: center;
    user-select: none;
}

.search-btn {
    background: #ff33ee;
    color: #fff;
}

/* 表格區：*/
.table-wrap {
    
    border: 1px solid #ccc;
    border-radius: 4px;
}

.table-head {
    display: flex;
    background: #ff33ee;
    font-weight: bold;
    padding: 10px 0;
    color: #fff;
}

.table-row {
    display: flex;
    align-items: center;
    padding: 5px 0;
    border-bottom: 1px solid #ccc;
}

.table-row:hover {
    background: #f9f9f9;
}

/* 單元格寬�?*/
.td {
    padding: 0 8px;
    box-sizing: border-box;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.td-id {
    width: 5%;
    text-align: center;
}

.td-img {
    width: 10%;
    text-align: center;
}

.td-name {
    width: 24%;
}

.td-price {
    width: 7%;
    text-align: center;
}

.td-stock {
    width: 7%;
    text-align: center;
}

.td-status {
    width: 10%;
    text-align: center;
}

.td-operate {
    width: 22%;
    text-align: center;
}

.goods-img {
    width: 40px;
    height: 40px;
    object-fit: cover;
    border-radius: 4px;
}

/* 狀態標�?*/
.status-on {
    color: #67c23a;
    
}

.status-off {
    color: #f56c6c;
}

/* 操作按鈕 */
.operate-btn {
    margin: 0 4px;
    cursor: pointer;
    /* border: 1px solid #ccc; */
    padding: 2px 10px;
    border-radius: 5px;
}

.edit {
    color: #047cf5;
    background-color: #d9e9fa;
}

.shelf {
    color: #e78b01;
    background-color: #f8eddc;
}

.del {
    color: #ee0101;
    background-color: #f8dede;
}

.empty-tip,
.loading-tip,
.nomore-tip {
    text-align: center;
    padding: 20px 0;
    color: #666;
}

/* 彈窗遮罩 */
.dialog-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;
}

.dialog-box {
    width: 600px;
    background: #fff;
    border: 1px solid #444;
    border-radius: 6px;
    overflow: hidden;
    text-align: left;
}

.dialog-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 7px 20px;
    font-size: 14px;
    font-weight: bold;
    border-bottom: 1px solid #ddd;
    background-color: #ff33ee;
    color: #fff;
}


.dialog-form {
    padding: 20px;
}

.form-item {
    margin-bottom: 15px;
}

.form-item label {
    display: block;
    /* margin-bottom: 6px; */
    color: #333;
}

.form-item input,
.form-item textarea {
    width: 100%;
    box-sizing: border-box;
    padding: 8px 10px;
    background: #fff;
    border: 1px solid #ccc;
    border-radius: 4px;
    color: #333;
    outline: none;
}

.form-item textarea {
    min-height: 80px;
    resize: none;
}
.radio-group {
    display: flex;
    flex-direction: row;
}
.radio-group label {
    /* margin-right: 15px; */
    cursor: pointer;
}

.dialog-btn {
    display: flex;
    gap: 10px;
    padding: 15px 20px 30px 20px;
    justify-content: right;
}

.dialog-btn .btn {
    /* flex: 1; */
    padding: 3px 20px;
}

.cancel {
    border: 1px solid #999;
    color: #666;
    background: transparent;
}

.submit {
    background: #ff33ee;
    color: #fff;
}
</style>