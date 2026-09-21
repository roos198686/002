<template>
    <div class="admin-page">
        <div class="page-title">商品管理</div>

        <!-- 顶部筛选栏 -->
        <div class="filter-bar">
            <el-input
                v-model="searchKey"
                placeholder="請輸入商品名稱搜尋"
                clearable
                style="width: 260px"
                @keyup.enter="handleSearch"
            />
            <el-button type="primary" @click="handleSearch">搜尋</el-button>
            <el-button @click="handleReset">重置</el-button>
        </div>

        <!-- 商品列表 -->
        <el-table :data="goodsList" border stripe v-loading="loading" style="width: 100%">
            <el-table-column prop="id" label="ID" width="80" align="center" />
            <el-table-column label="商品圖片" width="90" align="center">
                <template #default="{ row }">
                    <el-image
                        class="thumb"
                        :src="baseURL + row.cover"
                        :preview-src-list="[baseURL + row.cover]"
                        fit="cover"
                        preview-teleported
                    />
                </template>
            </el-table-column>
            <el-table-column prop="name" label="商品名稱" min-width="180" show-overflow-tooltip />
            <el-table-column label="售價" width="120" align="right">
                <template #default="{ row }">{{ formatMoney(row.price) }}</template>
            </el-table-column>
            <el-table-column prop="stock" label="庫存" width="90" align="center" />
            <el-table-column prop="sales" label="已售" width="90" align="center" />
            <el-table-column label="狀態" width="100" align="center">
                <template #default="{ row }">
                    <el-tag :type="row.status === 1 ? 'success' : 'info'">
                        {{ row.status === 1 ? '已上架' : '已下架' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="220" align="center" fixed="right">
                <template #default="{ row }">
                    <el-button
                        size="small"
                        type="primary"
                        :disabled="userInfo.status === 3"
                        @click="openEditDialog(row)"
                    >編輯</el-button>
                    <el-button
                        size="small"
                        :type="row.status === 1 ? 'warning' : 'success'"
                        :disabled="userInfo.status === 3"
                        @click="changeShelf(row)"
                    >{{ row.status === 1 ? '下架' : '上架' }}</el-button>
                    <el-button
                        size="small"
                        type="danger"
                        :disabled="userInfo.status === 3"
                        @click="delGoods(row.id)"
                    >刪除</el-button>
                </template>
            </el-table-column>
            <template #empty>暫無商品數據</template>
        </el-table>

        <!-- 分页器（服务端分页，参数名 page / pageSize 保持不变） -->
        <div class="pager-bar">
            <el-pagination
                background
                layout="total, sizes, prev, pager, next, jumper"
                :page-sizes="[10, 20, 50]"
                :total="total"
                v-model:current-page="page"
                v-model:page-size="pageSize"
                @size-change="onSizeChange"
                @current-change="onPageChange"
            />
        </div>

        <!-- 編輯商品彈窗 -->
        <el-dialog v-model="dialogVisible" title="編輯商品" width="600px" :close-on-click-modal="false">
            <el-form :model="form" label-width="100px">
                <el-form-item label="商品名稱">
                    <el-input v-model="form.goods_name" placeholder="請輸入商品名稱" />
                </el-form-item>
                <el-form-item label="商品售價">
                    <el-input v-model="form.price" type="number" placeholder="請輸入售價" />
                </el-form-item>
                <el-form-item label="商品庫存">
                    <el-input v-model="form.stock" type="number" placeholder="請輸入庫存數量" />
                </el-form-item>
                <el-form-item label="已銷售數量">
                    <el-input v-model="form.sales" type="number" placeholder="請輸入已銷售數量" />
                </el-form-item>
                <el-form-item label="商品描述">
                    <el-input v-model="form.goods_desc" type="textarea" :rows="3" placeholder="請輸入商品描述" />
                </el-form-item>
                <el-form-item label="上架狀態">
                    <el-radio-group v-model="form.status">
                        <el-radio :value="1">上架</el-radio>
                        <el-radio :value="0">下架</el-radio>
                    </el-radio-group>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="submitForm">確認提交</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import request from '@/utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'
import './admin-common.css'

interface AdminUser {
    status?: number
}

interface GoodsItem {
    id: number
    name: string
    cover: string
    price: number | string
    stock: number
    intro: string
    status: number
    sales: number | string
}

const baseURL: string = request.defaults.baseURL || ''
const userInfo = reactive<AdminUser>(JSON.parse(localStorage.getItem('adminuser') || '{}'))

// 搜尋關鍵字
const searchKey = ref('')

// 商品列表
const goodsList = ref<GoodsItem[]>([])

// 彈窗
const dialogVisible = ref(false)

// 表單數據
const form = reactive({
    id: 0,
    goods_name: '',
    price: '' as string | number,
    stock: '' as string | number,
    goods_img: '',
    goods_desc: '',
    status: 1,
    sales: '' as string | number
})

// 分页参数
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)

const formatMoney = (val: number | string) => {
    const num = Number(val || 0)
    return isNaN(num) ? '0.00' : num.toFixed(2)
}

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

// 分页获取商品列表
const getGoodsList = async () => {
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
            const list: GoodsItem[] = data.data || []
            goodsList.value = list
            // 后端未返回总数，按本页条数推算：满页则认为还有下一页
            if (list.length < pageSize.value) {
                total.value = (page.value - 1) * pageSize.value + list.length
            } else {
                total.value = page.value * pageSize.value + 1
            }
        } else {
            ElMessage.error(data.msg || '取得列表失敗')
        }
    } catch (err) {
        console.log(err)
        ElMessage.error('網路異常')
    } finally {
        loading.value = false
    }
}

const handleSearch = () => {
    page.value = 1
    getGoodsList()
}

const handleReset = () => {
    searchKey.value = ''
    page.value = 1
    getGoodsList()
}

const onSizeChange = () => {
    page.value = 1
    getGoodsList()
}

const onPageChange = () => {
    getGoodsList()
}

// 開啟編輯彈窗（回显原有数据）
const openEditDialog = (row: GoodsItem) => {
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

// 提交編輯：空字段不傳，保留原數據
const submitForm = async () => {
    const params: Record<string, string | number> = { id: form.id }
    if (form.goods_name !== '') params.goods_name = form.goods_name
    if (form.price !== '') params.price = form.price
    if (form.stock !== '') params.stock = form.stock
    if (form.goods_img !== '') params.goods_img = form.goods_img
    if (form.goods_desc !== '') params.goods_desc = form.goods_desc
    if (form.sales !== '') params.sales = form.sales
    // 状态始终传递（单选框必有值）
    params.status = form.status

    try {
        const res = await request.post('/api/admin/admin_shop/edit', params)
        if (res.data.code === 1) {
            ElMessage.success('編輯成功')
            dialogVisible.value = false
            getGoodsList()
        } else {
            ElMessage.error(res.data.msg || '操作失敗')
        }
    } catch (err) {
        console.log(err)
        ElMessage.error('網路異常')
    }
}

// 上下架切換
const changeShelf = async (row: GoodsItem) => {
    try {
        const { data } = await request.post('/api/admin/admin_shop/shelf', {
            id: row.id,
            status: row.status === 1 ? 0 : 1
        })
        if (data.code === 1) {
            ElMessage.success('狀態切換成功')
            getGoodsList()
        } else {
            ElMessage.error(data.msg || '操作失敗')
        }
    } catch (err) {
        console.log(err)
        ElMessage.error('網路異常')
    }
}

// 刪除商品
const delGoods = async (id: number) => {
    try {
        await ElMessageBox.confirm('確定要刪除此商品嗎？', '提示', {
            confirmButtonText: '確定',
            cancelButtonText: '取消',
            type: 'warning',
            confirmButtonClass: 'el-button--danger'
        })
    } catch {
        return
    }
    try {
        const { data } = await request.get('/api/admin/admin_shop/del', { params: { id } })
        if (data.code === 1) {
            ElMessage.success('刪除成功')
            // 删除后若当前页清空，回退一页
            if (goodsList.value.length === 1 && page.value > 1) {
                page.value--
            }
            getGoodsList()
        } else {
            ElMessage.error('刪除失敗')
        }
    } catch (err) {
        console.log(err)
        ElMessage.error('網路異常')
    }
}

onMounted(() => {
    getGoodsList()
})
</script>

<style scoped>
</style>
