<template>
    <div class="settings-wrap">
        <!-- 顶部标签�?-->
        <div class="tab-nav">
            <div class="tab-item" :class="{ active: activeTab === 'rate' }" @click="activeTab = 'rate'">
                抽成设置
            </div>
            <div class="tab-item" :class="{ active: activeTab === 'vip' }" @click="activeTab = 'vip'">
                VIP配置
            </div>
        </div>

        <!-- 1. 抽成设置 -->
        <div v-if="activeTab === 'rate'" class="tab-content">
            <div style="display: flex;flex-direction: row;gap: 20px;margin-bottom: 30px;">
                <div style="display: flex;flex-direction: column;flex: 1;">
                    <div
                        style="font-size: 15px; font-weight: bold;color: #a3329e;margin-bottom: 10px;text-align: left;">
                        员工抽成比例（会影响所有数据）
                    </div>
                    <div
                        style="width: 300px; display: flex;flex-direction: row;background: #fdf6fd;padding: 3px 5px;border: 1px solid #ddd;text-align: center;border-radius: 4px;">
                        <div style="flex: 1;">
                            {{ statisticslist[0]?.staff_rate || '0%' }}%
                        </div>
                        <div @click="usercuiocenga(statisticslist[0]?.id)" 
                            style="background-color: #a3329e;color:#333;padding: 3px 10px;border-radius: 4px;margin-left: 50px;font-size: 13px;cursor: pointer;" :style="userinfo.status != 3 ? '' : 'pointer-events: none;background-color: #555;'">
                            编辑
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 3. 约会卡套餐？-->
        <div v-if="activeTab === 'package'" class="tab-content">
            <div style="margin-bottom: 30px;">
                <div
                    style="font-size: 15px; font-weight: bold;color: #a3329e;flex: 1;margin: 10px 0;display: flex;flex-direction: row;">
                    约会卡设置
                    <div style="flex: 1;display: flex;gap: 5px;align-items: center;">
                        <div @click="openAddPackage"
                            style="background-color: #ff33ee;display: flex;color: #fff;padding: 2px 10px;border-radius: 6px;font-size: 13px;cursor: pointer;margin-left: 10px;">
                            新增
                        </div>
                    </div>
                </div>
                <div style="border:1px solid #eee;border-radius: 5px;font-size: 13px;">
                    <div
                        style="display: flex;flex-direction: row;padding:7px 10px;background-color: #ff33ee;border-radius: 5px 5px 0 0;color: #eee;">
                        <div style="flex: 1;">序号</div>
                        <div style="flex: 1;">价格(美元)</div>
                        <div style="flex: 1;">服务时间</div>
                        <div style="flex: 1;">操作</div>
                    </div>
                    <div v-for="(item, index) in packageList" :key="item.id"
                        style="display: flex;flex-direction: row;border-top:1px solid #eee;padding: 5px 10px;">
                        <div style="flex: 1;">{{ index + 1 }}</div>
                        <div style="flex: 1;">{{ item.package_price }}</div>
                        <div style="flex: 1;">{{ item.card_num }}小时</div>
                        <div style="flex: 1;display: flex;gap: 5px;justify-content: center;">
                            <div @click="togglePackageStatus(item)"
                                style="display: flex;color:#333;padding: 1px 5px;border-radius: 6px;font-size: 13px;cursor: pointer;"
                                :style="{ backgroundcolor: item.status == 0 ? '#a3329e' : '#cc7c21' }">
                                {{ item.status == 0 ? '启用' : '禁用' }}
                            </div>
                            <div @click="openEditPackage(item)"
                                style="background-color: #b2ecf7;display: flex;color: #000;padding: 1px 5px;border-radius: 6px;font-size: 13px;cursor: pointer;">
                                编辑
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 4. VIP配置 -->
        <div v-if="activeTab === 'vip'" class="tab-content">
            <div style="margin-bottom: 30px;">
                <div
                    style="font-size: 15px; font-weight: bold;color: #a3329e;flex: 1;margin: 10px 0;display: flex;flex-direction: row;">
                    VIP设置
                </div>
                <div style="border:1px solid #eee;border-radius: 5px;font-size: 13px;">
                    <div
                        style="display: flex;flex-direction: row;padding:7px 10px;background-color: #ff33ee;color: #fff;border-radius: 5px 5px 0 0;">
                        <div style="width: 50px;">序号</div>
                        <div style="width: 100px;">价格(美元)</div>
                        <div style="width: 50px;">等级</div>
                        <div style="flex: 1;">权益说明</div>
                        <div style="width: 100px;">操作</div>
                    </div>
                    <div v-for="(item, index) in vipList" :key="item.id"
                        style="display: flex;flex-direction: row;border-top:1px solid #eee;padding: 5px 10px;">
                        <div style="width: 50px;">{{ index + 1 }}</div>
                        <div style="width: 100px;">{{ item.recharge_amount }}</div>
                        <div style="width: 50px;">{{ item.vip_level }}</div>
                        <div style="flex: 1;">{{ item.privilege_desc }}</div>
                        <div style="width: 100px;display: flex;gap: 5px;":style="userInfo.status != 3 ? '' : 'pointer-events: none;'">
                            <div @click="toggleVipStatus(item)"
                                style="background-color: #a3329e;display: flex;color:#333;padding: 1px 5px;border-radius: 6px;font-size: 13px;cursor: pointer;"
                                :style="{ backgroundcolor: item.status == 0 ? '#a3329e' : '#cc7c21' }">
                                {{ item.status == 0 ? '启用' : '禁用' }}
                            </div>
                            <div @click="openEditVip(item)"
                                style="background-color: #b2ecf7;display: flex;color: #000;padding: 1px 5px;border-radius: 6px;font-size: 13px;cursor: pointer;">
                                编辑
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 抽成比例修改弹窗 -->
        <div v-if="fjkfdlsojkgwl"
            style="position: fixed;left: 0; top: 0;right: 0;bottom: 0;background: rgba(0, 0, 0, 0.5); display: flex;flex-direction: column; align-items: center;justify-content: center;z-index: 9999;"
            @click.self="fjkfdlsojkgwl = false">
            <div
                style=" width: 90%; max-width: 450px;background: #fff;border-radius: 10px;padding: 35px;position: relative;">
                <div style="margin-bottom: 6px; font-weight: 500;color: #000;margin-bottom: 15px;">{{ textuek }}</div>
                <input v-model="addaddress"
                    style="width: 80%;padding: 10px;border: 1px solid #ddd;border-radius: 6px;box-sizing: border-box;text-align: center;" />
                <div style="background-color: #a3329e;color:#333;padding: 3px 10px;border-radius: 4px;font-size: 13px;margin: 30px 100px;cursor: pointer;"
                    @click="fkldilsjfk">
                    确定
                </div>
            </div>
        </div>

        <!-- 套餐 新增/编辑 弹窗 -->
        <div v-if="showPackageDialog"
            style="position: fixed;left: 0;top: 0;right: 0;bottom: 0;background: rgba(0,0,0,0.5);display: flex;align-items: center;justify-content: center;z-index: 9999"
            @click.self="showPackageDialog = false">
            <div style=" width: 90%;max-width: 420px; background: #fff; border-radius: 10px;padding: 25px;">
                <div
                    style="font-size: 18px; font-weight: bold; color: #a3329e; text-align: center; margin-bottom: 20px; ">
                    {{ packageDialogType === 'add' ? '新增套餐' : '编辑套餐' }}
                </div>
                <div style="margin-bottom: 15px;text-align: left;color: #000;font-size: 13px;">
                    <div style="margin-bottom: 6px; font-weight: 500;">价格(美元)</div>
                    <input v-model="packageForm.package_price" type="number" placeholder="请输入价格"
                        style="width: 100%;padding: 10px; border: 1px solid #ddd;border-radius: 6px;box-sizing: border-box; " />
                </div>
                <div style="margin-bottom: 15px;text-align: left;color: #000;font-size: 13px;">
                    <div style="margin-bottom: 6px; font-weight: 500;">服务时间</div>
                    <input v-model="packageForm.card_num" type="number" placeholder="请输入服务时间"
                        style="width: 100%;padding: 10px;border: 1px solid #ddd;border-radius: 6px;box-sizing: border-box;" />
                </div>
                <div style="margin-bottom: 20px;text-align: left;color: #000;font-size: 13px;">
                    <div style="margin-bottom: 6px; font-weight: 500;">状态</div>
                    <select v-model="packageForm.status"
                        style="width: 100%;padding: 10px; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box;">
                        <option :value="0">启用</option>
                        <option :value="1">禁用</option>
                    </select>
                </div>
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button @click="showPackageDialog = false"
                        style="padding: 8px 24px; border: 1px solid #ddd; background: #f5f5f5; border-radius: 6px;cursor: pointer; ">
                        取消
                    </button>
                    <button @click="submitPackage" :disabled="packageSubmitLoading"
                        style=" padding: 8px 24px; background: #a3329e;color:#333; border: none; border-radius: 6px; cursor: pointer; ">
                        {{ packageSubmitLoading ? '提交失败..' : '确定' }}
                    </button>
                </div>
            </div>
        </div>

        <!-- VIP 编辑弹窗 -->
        <div v-if="showVipDialog"
            style="position: fixed;left: 0;top: 0;right: 0;bottom: 0;background: rgba(0,0,0,0.5);display: flex;align-items: center;justify-content: center;z-index: 9999;"
            @click.self="showVipDialog = false">
            <div style="width: 90%; max-width: 500px; background: #fff;border-radius: 10px;">
                <div
                    style="padding: 10px 0;border-radius: 10px 10px 0 0; background-color: #ff33ee;font-size: 15px; font-weight: bold; color: #fff; text-align: center; margin-bottom: 20px; ">
                    编辑VIP配置
                </div>
                <div style="padding: 0 30px 25px 30px;">
                    <div style="margin-bottom: 10px;text-align: left;color: #000;font-size: 13px;">
                        <div style="margin-bottom: 6px; font-weight: 500;">VIP等级</div>
                        <input v-model.number="vipForm.vip_level" type="number" placeholder="如：1、2、3"
                            style="width: 100%;padding: 10px;border: 1px solid #ddd; border-radius: 6px;box-sizing: border-box; " />
                    </div>
                    <div style="margin-bottom: 10px;text-align: left;color: #000;font-size: 13px;">
                        <div style="margin-bottom: 6px; font-weight: 500;">升级价格(美元)</div>
                        <input v-model.number="vipForm.recharge_amount" type="number" placeholder="请输入价格"
                            style=" width: 100%; padding: 10px;border: 1px solid #ddd;border-radius: 6px; box-sizing: border-box;" />
                    </div>
                    <div style="margin-bottom: 10px;text-align: left;color: #000;font-size: 13px;">
                        <div style="margin-bottom: 6px; font-weight: 500;">权益描述(用繁体</div>
                        <input v-model="vipForm.privilege_desc" placeholder="如：unlimitedChat"
                            style="width: 100%;padding: 10px;border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box;" />
                    </div>
                    <div style="margin-bottom: 10px;text-align: left;color: #000;font-size: 13px;">
                        <div style="margin-bottom: 6px; font-weight: 500;">状态</div>
                        <select v-model.number="vipForm.status"
                            style=" width: 100%;padding:10px;border: 1px solid #ddd;border-radius: 6px; box-sizing: border-box; ">
                            <option :value="0">启用</option>
                            <option :value="1">禁用</option>
                        </select>
                    </div>
                    <div style="display: flex; gap: 15px; justify-content: right;padding: 10px 0;font-size: 13px;">
                        <button @click="showVipDialog = false"
                            style="padding: 3px 24px; border: 1px solid #ddd; background: #f5f5f5;border-radius: 6px;cursor: pointer;">
                            取消
                        </button>
                        <button @click="submitVip" :disabled="vipSubmitLoading"
                            style="padding: 3px 24px;background: #a3329e;color:#333;border: none; border-radius: 6px;cursor: pointer;">
                            {{ vipSubmitLoading ? '提交失败..' : '确定' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from "vue";
import request from '@/utils/request'
import { AxiosResponse } from "axios";

// 标签页激活标�?
const activeTab = ref<string>('rate')

const userInfo = reactive(JSON.parse(localStorage.getItem("adminuser") || "{}"));

// 抽成相关"
const statisticslist = ref<any[]>([])
const recommendlist = async () => {
    try {
        let group_user = userInfo.group_level;
        let status = userInfo.status;
        const { data } = await request.get('/api/admin/settings/recommendlist', {
            params: { group_user, status }
        });
        if (data.code === 1) {
            statisticslist.value = data.data;
        }
    } catch (e) {
        console.log("统计加载失败", e);
    }
};

const textuek = ref('')
const fjkfdlsojkgwl = ref(false);
const xzjfkdwo = ref('')
const addaddress = ref('')
const jfkewk = ref('')

// 小组抽成'
const usercuiocengioeps = (value: any) => {
    jfkewk.value = 'a'
    fjkfdlsojkgwl.value = true
    xzjfkdwo.value = value
    textuek.value = '小组抽成比例调整'
}
// 员工抽成'
const usercuiocenga = (value: any) => {
    jfkewk.value = 'b'
    fjkfdlsojkgwl.value = true
    xzjfkdwo.value = value
    textuek.value = '员工抽成比例调整'
}
// 推荐抽成'
const usercuiocengbaq = (value: any) => {
    jfkewk.value = 'c'
    fjkfdlsojkgwl.value = true
    xzjfkdwo.value = value
    textuek.value = '推荐抽成比例调整'
}

const fkldilsjfk = async () => {
    let dklaf = ''
    if (jfkewk.value == 'a') dklaf = 'updateRegroupuser'
    if (jfkewk.value == 'b') dklaf = 'updateReguserr'
    if (jfkewk.value == 'c') dklaf = 'updateRecommendRate'

    try {
        const { data: res } = await request.post('/api/admin/' + dklaf, {
            user_id: xzjfkdwo.value,
            recommend_rate: addaddress.value
        })
        if (res.code === 1) {
            recommendlist()
            fjkfdlsojkgwl.value = false
        }
    } catch (error) {
        console.error(error)
    }
}


// 约会卡套餐？'
const packageList = ref<any[]>([])
const getPackageList = async () => {
    try {
        const { data: res } = await request.get('/api/admin/settings/package/list')
        if (res.code === 200) {
            packageList.value = res.data || []
        }
    } catch { }
}
const packageDialogType = ref<'add' | 'edit'>('add')
const showPackageDialog = ref(false)
const packageForm = reactive({
    id: 0,
    package_price: '',
    card_num: '',
    status: 0
})
const packageSubmitLoading = ref(false)

const openAddPackage = () => {
    packageDialogType.value = 'add'
    packageForm.id = 0
    packageForm.package_price = ''
    packageForm.card_num = ''
    packageForm.status = 0
    showPackageDialog.value = true
}
const openEditPackage = (item: any) => {
    packageDialogType.value = 'edit'
    packageForm.id = item.id
    packageForm.package_price = item.package_price
    packageForm.card_num = item.card_num
    packageForm.status = item.status
    showPackageDialog.value = true
}
const togglePackageStatus = async (item: any) => {
    const newStatus = item.status === 0 ? 1 : 0
    const tip = newStatus === 0 ? '启用' : '禁用'
    if (!confirm(`确定${tip}该套餐？`)) return
    try {
        const { data } = await request.post('/api/recharge/package/changeStatus', {
            id: item.id,
            status: newStatus
        })
        if (data.code === 200) {
            alert(`${tip}成功`)
            getPackageList()
        } else {
            alert(data.msg || '操作失败')
        }
    } catch (err) {
        alert('网络请求失败')
    }
}
const submitPackage = async () => {
    const price = Number(packageForm.package_price)
    const num = Number(packageForm.card_num)
    if (!packageForm.package_price || isNaN(price) || price <= 0) {
        alert('请输入合法价格')
        return
    }
    if (!packageForm.card_num || isNaN(num) || num <= 0) {
        alert('请输入合法服务数量')
        return
    }
    packageSubmitLoading.value = true
    try {
        const params = {
            package_price: price,
            card_num: num,
            status: packageForm.status
        }
        let res: AxiosResponse<any, any>
        if (packageDialogType.value === 'add') {
            res = await request.post('/api/recharge/package/add', params)
        } else {
            res = await request.post('/api/recharge/package/edit', { id: packageForm.id, ...params })
        }
        if (res.data.code === 200) {
            alert(packageDialogType.value === 'add' ? '新增成功' : '编辑成功')
            showPackageDialog.value = false
            getPackageList()
        } else {
            alert(res.data.msg || '提交失败')
        }
    } catch (err) {
        alert('网络请求失败')
    } finally {
        packageSubmitLoading.value = false
    }
}

// VIP
const vipList = ref<any[]>([])
const getVipList = async () => {
    try {
        const { data: res } = await request.get('/api/admin/settings/viplist')
        if (res.code === 200) {
            vipList.value = res.data || []
        }
    } catch (err) {
        console.error('获取VIP列表失败', err)
    }
}
const vipDialogType = ref<'add' | 'edit'>('edit')
const showVipDialog = ref(false)
const vipSubmitLoading = ref(false)
const vipForm = reactive({
    id: 0,
    vip_level: '',
    recharge_amount: '',
    privilege_desc: '',
    icon_url: '',
    status: 0
})
const openEditVip = (item: any) => {
    vipDialogType.value = 'edit'
    vipForm.id = item.id
    vipForm.vip_level = item.vip_level
    vipForm.recharge_amount = item.recharge_amount
    vipForm.privilege_desc = item.privilege_desc
    vipForm.icon_url = item.icon_url
    vipForm.status = item.status
    showVipDialog.value = true
}
const toggleVipStatus = async (item: any) => {
    const newStatus = item.status === 0 ? 1 : 0
    const tip = newStatus === 0 ? '启用' : '禁用'
    if (!confirm(`确定${tip}该VIP等级？`)) return
    try {
        const { data } = await request.post('/api/vip/changeStatus', {
            id: item.id,
            status: newStatus
        })
        if (data.code === 200) {
            alert(`${tip}成功`)
            getVipList()
        } else {
            alert(data.msg || '操作失败')
        }
    } catch (err) {
        alert('网络请求失败')
    }
}
const submitVip = async () => {
    const level = Number(vipForm.vip_level)
    const price = Number(vipForm.recharge_amount)
    if (!vipForm.vip_level || isNaN(level) || level <= 0) {
        alert('请输入合法VIP等级')
        return
    }
    if (!vipForm.recharge_amount || isNaN(price) || price <= 0) {
        alert('请输入合法价格')
        return
    }
    if (!vipForm.privilege_desc) {
        alert('请填写权益说明')
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
            alert('编辑成功')
            showVipDialog.value = false
            getVipList()
        } else {
            alert(data.msg || '提交失败')
        }
    } catch (err) {
        alert('网络请求失败')
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
.settings-wrap {
    width: 100%;
    box-sizing: border-box;
}

/* 标签栏样�?*/
.tab-nav {
    display: flex;
    border-bottom: 1px solid #ddd;
    margin-bottom: 25px;
}

.tab-item {
    padding: 7px 20px;
    cursor: pointer;
    font-size: 14px;
    color: #666;
    position: relative;
    transition: color 0.2s;
}

.tab-item.active {
    color: #a3329e;
    font-weight: bold;
}

.tab-item.active::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -1px;
    width: 100%;
    height: 2px;
    background-color: #a3329e;
}

.tab-content {
    /* width: 100%; */
    padding: 0 20px;
}
</style>