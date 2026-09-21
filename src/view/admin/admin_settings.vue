<template>
    <div class="admin-page">
        <div class="page-title">数据设置</div>

        <el-tabs v-model="activeTab">
            <!-- 1. 抽成设置 -->
            <el-tab-pane label="抽成设置" name="rate">
                <el-table :data="statisticslist" border stripe v-loading="rateLoading" style="width: 100%; max-width: 720px">
                    <el-table-column prop="id" label="ID" width="100" align="center" />
                    <el-table-column label="员工抽成比例（会影响所有数据）" align="center">
                        <template #default="{ row }">{{ row.staff_rate != null ? row.staff_rate + '%' : '0%' }}</template>
                    </el-table-column>
                    <el-table-column label="操作" width="140" align="center">
                        <template #default="{ row }">
                            <el-button
                                size="small"
                                type="primary"
                                :disabled="userInfo.status === 3"
                                @click="usercuiocenga(row.id)"
                            >编辑</el-button>
                        </template>
                    </el-table-column>
                    <template #empty>暂无数据</template>
                </el-table>
            </el-tab-pane>

            <!-- 2. 充值套餐（约会卡设置） -->
            <el-tab-pane label="充值套餐" name="package">
                <div class="filter-bar">
                    <span class="section-title">约会卡设置</span>
                    <el-button type="primary" @click="openAddPackage">新增</el-button>
                </div>
                <el-table :data="packageList" border stripe v-loading="packageLoading" style="width: 100%; max-width: 720px">
                    <el-table-column type="index" label="序号" width="100" align="center" />
                    <el-table-column label="价格(美元)" width="180" align="right">
                        <template #default="{ row }">{{ formatMoney(row.package_price) }}</template>
                    </el-table-column>
                    <el-table-column label="服务时间" align="center">
                        <template #default="{ row }">{{ row.card_num }}小时</template>
                    </el-table-column>
                    <el-table-column label="状态" width="120" align="center">
                        <template #default="{ row }">
                            <el-tag :type="row.status === 0 ? 'success' : 'info'">
                                {{ row.status === 0 ? '启用' : '禁用' }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="200" align="center">
                        <template #default="{ row }">
                            <el-button
                                size="small"
                                :type="row.status === 0 ? 'warning' : 'success'"
                                @click="togglePackageStatus(row)"
                            >{{ row.status === 0 ? '禁用' : '启用' }}</el-button>
                            <el-button size="small" type="primary" @click="openEditPackage(row)">编辑</el-button>
                        </template>
                    </el-table-column>
                    <template #empty>暂无套餐</template>
                </el-table>
            </el-tab-pane>

            <!-- 3. VIP配置 -->
            <el-tab-pane label="VIP配置" name="vip">
                <div class="filter-bar">
                    <span class="section-title">VIP设置</span>
                </div>
                <el-table :data="vipList" border stripe v-loading="vipLoading" style="width: 100%">
                    <el-table-column type="index" label="序号" width="80" align="center" />
                    <el-table-column label="价格(美元)" width="140" align="right">
                        <template #default="{ row }">{{ formatMoney(row.recharge_amount) }}</template>
                    </el-table-column>
                    <el-table-column prop="vip_level" label="等级" width="100" align="center" />
                    <el-table-column prop="privilege_desc" label="权益说明" min-width="220" show-overflow-tooltip />
                    <el-table-column label="状态" width="100" align="center">
                        <template #default="{ row }">
                            <el-tag :type="row.status === 0 ? 'success' : 'info'">
                                {{ row.status === 0 ? '启用' : '禁用' }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="200" align="center">
                        <template #default="{ row }">
                            <el-button
                                size="small"
                                :type="row.status === 0 ? 'warning' : 'success'"
                                :disabled="userInfo.status === 3"
                                @click="toggleVipStatus(row)"
                            >{{ row.status === 0 ? '禁用' : '启用' }}</el-button>
                            <el-button
                                size="small"
                                type="primary"
                                :disabled="userInfo.status === 3"
                                @click="openEditVip(row)"
                            >编辑</el-button>
                        </template>
                    </el-table-column>
                    <template #empty>暂无VIP配置</template>
                </el-table>
            </el-tab-pane>
        </el-tabs>

        <!-- 抽成比例修改弹窗 -->
        <el-dialog v-model="rateDialogVisible" :title="rateDialogTitle" width="420px" :close-on-click-modal="false">
            <el-form label-width="110px">
                <el-form-item label="抽成比例">
                    <el-input v-model="rateValue" placeholder="请输入抽成比例" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="rateDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="submitRate">确定</el-button>
            </template>
        </el-dialog>

        <!-- 套餐 新增/编辑 弹窗 -->
        <el-dialog
            v-model="showPackageDialog"
            :title="packageDialogType === 'add' ? '新增套餐' : '编辑套餐'"
            width="460px"
            :close-on-click-modal="false"
        >
            <el-form :model="packageForm" label-width="100px">
                <el-form-item label="价格(美元)">
                    <el-input v-model="packageForm.package_price" type="number" placeholder="请输入价格" />
                </el-form-item>
                <el-form-item label="服务时间">
                    <el-input v-model="packageForm.card_num" type="number" placeholder="请输入服务时间" />
                </el-form-item>
                <el-form-item label="状态">
                    <el-select v-model="packageForm.status" style="width: 100%">
                        <el-option label="启用" :value="0" />
                        <el-option label="禁用" :value="1" />
                    </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="showPackageDialog = false">取消</el-button>
                <el-button type="primary" :loading="packageSubmitLoading" @click="submitPackage">确定</el-button>
            </template>
        </el-dialog>

        <!-- VIP 编辑弹窗 -->
        <el-dialog v-model="showVipDialog" title="编辑VIP配置" width="520px" :close-on-click-modal="false">
            <el-form :model="vipForm" label-width="120px">
                <el-form-item label="VIP等级">
                    <el-input v-model.number="vipForm.vip_level" type="number" placeholder="如：1、2、3" />
                </el-form-item>
                <el-form-item label="升级价格(美元)">
                    <el-input v-model.number="vipForm.recharge_amount" type="number" placeholder="请输入价格" />
                </el-form-item>
                <el-form-item label="权益描述">
                    <el-input v-model="vipForm.privilege_desc" placeholder="如：unlimitedChat" />
                </el-form-item>
                <el-form-item label="状态">
                    <el-select v-model.number="vipForm.status" style="width: 100%">
                        <el-option label="启用" :value="0" />
                        <el-option label="禁用" :value="1" />
                    </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="showVipDialog = false">取消</el-button>
                <el-button type="primary" :loading="vipSubmitLoading" @click="submitVip">确定</el-button>
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
    group_level?: number | string
}

interface RateItem {
    id: number
    staff_rate?: number | string
}

interface PackageItem {
    id: number
    package_price: number | string
    card_num: number | string
    status: number
}

interface VipItem {
    id: number
    vip_level: number
    recharge_amount: number | string
    privilege_desc: string
    icon_url: string
    status: number
}

// 标签页
const activeTab = ref<string>('rate')

const userInfo = reactive<AdminUser>(JSON.parse(localStorage.getItem('adminuser') || '{}'))

const formatMoney = (val: number | string) => {
    const num = Number(val || 0)
    return isNaN(num) ? '0.00' : num.toFixed(2)
}

// ===================== 抽成相关 =====================
const statisticslist = ref<RateItem[]>([])
const rateLoading = ref(false)

const recommendlist = async () => {
    try {
        const group_user = userInfo.group_level
        const status = userInfo.status
        rateLoading.value = true
        const { data } = await request.get('/api/admin/settings/recommendlist', {
            params: { group_user, status }
        })
        if (data.code === 1) {
            statisticslist.value = data.data
        }
    } catch (e) {
        console.log('统计加载失败', e)
    } finally {
        rateLoading.value = false
    }
}

const rateDialogTitle = ref('员工抽成比例调整')
const rateDialogVisible = ref(false)
const rateEditId = ref<number | string>('')
const rateKind = ref<'a' | 'b' | 'c'>('b')
const rateValue = ref('')

// 小组抽成
const usercuiocengioeps = (value: number | string) => {
    rateKind.value = 'a'
    rateEditId.value = value
    rateDialogTitle.value = '小组抽成比例调整'
    rateValue.value = ''
    rateDialogVisible.value = true
}
// 员工抽成
const usercuiocenga = (value: number | string) => {
    rateKind.value = 'b'
    rateEditId.value = value
    rateDialogTitle.value = '员工抽成比例调整'
    rateValue.value = ''
    rateDialogVisible.value = true
}
// 推荐抽成
const usercuiocengbaq = (value: number | string) => {
    rateKind.value = 'c'
    rateEditId.value = value
    rateDialogTitle.value = '推荐抽成比例调整'
    rateValue.value = ''
    rateDialogVisible.value = true
}

const submitRate = async () => {
    let endpoint = ''
    if (rateKind.value === 'a') endpoint = 'updateRegroupuser'
    if (rateKind.value === 'b') endpoint = 'updateReguserr'
    if (rateKind.value === 'c') endpoint = 'updateRecommendRate'

    try {
        const { data: res } = await request.post('/api/admin/' + endpoint, {
            user_id: rateEditId.value,
            recommend_rate: rateValue.value
        })
        if (res.code === 1) {
            ElMessage.success('设置成功')
            rateDialogVisible.value = false
            recommendlist()
        } else {
            ElMessage.error(res.msg || '操作失败')
        }
    } catch (error) {
        console.error(error)
        ElMessage.error('网络请求失败')
    }
}

// ===================== 约会卡套餐 =====================
const packageList = ref<PackageItem[]>([])
const packageLoading = ref(false)

const getPackageList = async () => {
    try {
        packageLoading.value = true
        const { data: res } = await request.get('/api/admin/settings/package/list')
        if (res.code === 200) {
            packageList.value = res.data || []
        }
    } catch (err) {
        console.log(err)
    } finally {
        packageLoading.value = false
    }
}

const packageDialogType = ref<'add' | 'edit'>('add')
const showPackageDialog = ref(false)
const packageSubmitLoading = ref(false)
const packageForm = reactive({
    id: 0,
    package_price: '' as string | number,
    card_num: '' as string | number,
    status: 0
})

const openAddPackage = () => {
    packageDialogType.value = 'add'
    packageForm.id = 0
    packageForm.package_price = ''
    packageForm.card_num = ''
    packageForm.status = 0
    showPackageDialog.value = true
}

const openEditPackage = (item: PackageItem) => {
    packageDialogType.value = 'edit'
    packageForm.id = item.id
    packageForm.package_price = item.package_price
    packageForm.card_num = item.card_num
    packageForm.status = item.status
    showPackageDialog.value = true
}

const togglePackageStatus = async (item: PackageItem) => {
    const newStatus = item.status === 0 ? 1 : 0
    const tip = newStatus === 0 ? '启用' : '禁用'
    try {
        await ElMessageBox.confirm(`确定${tip}该套餐？`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        })
    } catch {
        return
    }
    try {
        const { data } = await request.post('/api/recharge/package/changeStatus', {
            id: item.id,
            status: newStatus
        })
        if (data.code === 200) {
            ElMessage.success(`${tip}成功`)
            getPackageList()
        } else {
            ElMessage.error(data.msg || '操作失败')
        }
    } catch (err) {
        console.log(err)
        ElMessage.error('网络请求失败')
    }
}

const submitPackage = async () => {
    const price = Number(packageForm.package_price)
    const num = Number(packageForm.card_num)
    if (!packageForm.package_price || isNaN(price) || price <= 0) {
        ElMessage.warning('请输入合法价格')
        return
    }
    if (!packageForm.card_num || isNaN(num) || num <= 0) {
        ElMessage.warning('请输入合法服务数量')
        return
    }
    packageSubmitLoading.value = true
    try {
        const params = {
            package_price: price,
            card_num: num,
            status: packageForm.status
        }
        let res: { data: { code: number; msg?: string } }
        if (packageDialogType.value === 'add') {
            res = await request.post('/api/recharge/package/add', params)
        } else {
            res = await request.post('/api/recharge/package/edit', { id: packageForm.id, ...params })
        }
        if (res.data.code === 200) {
            ElMessage.success(packageDialogType.value === 'add' ? '新增成功' : '编辑成功')
            showPackageDialog.value = false
            getPackageList()
        } else {
            ElMessage.error(res.data.msg || '提交失败')
        }
    } catch (err) {
        console.log(err)
        ElMessage.error('网络请求失败')
    } finally {
        packageSubmitLoading.value = false
    }
}

// ===================== VIP =====================
const vipList = ref<VipItem[]>([])
const vipLoading = ref(false)

const getVipList = async () => {
    try {
        vipLoading.value = true
        const { data: res } = await request.get('/api/admin/settings/viplist')
        if (res.code === 200) {
            vipList.value = res.data || []
        }
    } catch (err) {
        console.error('获取VIP列表失败', err)
    } finally {
        vipLoading.value = false
    }
}

const showVipDialog = ref(false)
const vipSubmitLoading = ref(false)
const vipForm = reactive({
    id: 0,
    vip_level: '' as number | string,
    recharge_amount: '' as number | string,
    privilege_desc: '',
    icon_url: '',
    status: 0
})

const openEditVip = (item: VipItem) => {
    vipForm.id = item.id
    vipForm.vip_level = item.vip_level
    vipForm.recharge_amount = item.recharge_amount
    vipForm.privilege_desc = item.privilege_desc
    vipForm.icon_url = item.icon_url
    vipForm.status = item.status
    showVipDialog.value = true
}

const toggleVipStatus = async (item: VipItem) => {
    const newStatus = item.status === 0 ? 1 : 0
    const tip = newStatus === 0 ? '启用' : '禁用'
    try {
        await ElMessageBox.confirm(`确定${tip}该VIP等级？`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        })
    } catch {
        return
    }
    try {
        const { data } = await request.post('/api/vip/changeStatus', {
            id: item.id,
            status: newStatus
        })
        if (data.code === 200) {
            ElMessage.success(`${tip}成功`)
            getVipList()
        } else {
            ElMessage.error(data.msg || '操作失败')
        }
    } catch (err) {
        console.log(err)
        ElMessage.error('网络请求失败')
    }
}

const submitVip = async () => {
    const level = Number(vipForm.vip_level)
    const price = Number(vipForm.recharge_amount)
    if (!vipForm.vip_level || isNaN(level) || level <= 0) {
        ElMessage.warning('请输入合法VIP等级')
        return
    }
    if (!vipForm.recharge_amount || isNaN(price) || price <= 0) {
        ElMessage.warning('请输入合法价格')
        return
    }
    if (!vipForm.privilege_desc) {
        ElMessage.warning('请填写权益说明')
        return
    }
    vipSubmitLoading.value = true
    try {
        const params = {
            vip_level: level,
            recharge_amount: price,
            privilege_desc: vipForm.privilege_desc,
            icon_url: vipForm.icon_url,
            status: vipForm.status
        }
        const { data } = await request.post('/api/vip/edit', { id: vipForm.id, ...params })
        if (data.code === 200) {
            ElMessage.success('编辑成功')
            showVipDialog.value = false
            getVipList()
        } else {
            ElMessage.error(data.msg || '提交失败')
        }
    } catch (err) {
        console.log(err)
        ElMessage.error('网络请求失败')
    } finally {
        vipSubmitLoading.value = false
    }
}

onMounted(() => {
    recommendlist()
    getPackageList()
    getVipList()
})
</script>

<style scoped>
.section-title {
    font-size: 15px;
    font-weight: bold;
    color: #333;
}
</style>
