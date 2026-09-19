<template>
    <div class="maina">
        <div class="all">
            <div class="search-box">
                <span class="search-label">输入用户名：</span>
                <input v-model="searchName" placeholder="请输入用户名模糊搜索" @input="getApplyList" class="input" />
            </div>

            <div class="user-table-wrap no-scroll" style="max-height: 650px; overflow-y: auto; display: block;margin-top: 15px;">
                <div class="user-item" style="display: flex; align-items: center; padding: 5px 15px;background-color: #ff33ee;color: #fff;">
                    <div class="user-info" style="flex: 1; display: flex;">
                        <div style="width: 7%;">申請ID</div>
                        <div style="width: 10%;">用戶ID</div>
                        <div style="width: 15%;">联系方式</div>
                        <div style="flex: 1;">申請说明</div>
                        <div style="width: 15%;">申請狀態</div>
                        <div style="width: 10%;">申請時間</div>
                    </div>
                    <div style="width: 10%; text-align: left;font-size: 13px;">操作</div>
                </div>

                <div v-for="item in applyList" :key="item.id" class="user-item" style="display: flex;">
                    <div class="user-info" style="flex: 1; display: flex;text-align: left;">
                        <div style="width: 7%;">{{ item.id }}</div>
                        <div style="width: 10%;">{{ item.user_id }}</div>
                        <div style="width: 15%;">{{ item.contact }}</div>
                        <div style="flex: 1;">{{ item.remark }}</div>
                        <div style="width: 10%;">{{ statusMap[item.status] }}</div>
                        <div style="width: 15%;">{{ moment(item.create_time).format('YY/MM/DD HH:mm:ss') }}</div>
                    </div>
                    <div style="width: 10%; text-align: left;font-size: 13px;display: flex;" >
                        <div class="primary" @click="openAudit(item)" :style="userinfo.status != 3 ? '' : 'pointer-events: none; user-select: none;background-color: #ccc;color: #000;'">審核</div>
                    </div>
                </div>
                <div v-if="applyList.length === 0" style="padding:10px;text-align:center;font-size: 13px;">暫無數據</div>
            </div>
        </div>

        <!-- 审核弹窗 -->
        <div v-if="auditVisible" class="my-dialog-mask" @click.self="auditVisible = false"></div>
        <div v-if="auditVisible" class="my-dialog">
            <div class="my-dialog-head">入駐申請審核</div>
            <div class="edit-form">
                <div class="form-item">
                    <label style="width: 60px;text-align: left;">申請用戶</label>
                    <div class="text">@{{ auditForm.user_id }}</div>
                </div>
                <div class="form-item">
                    <label style="width: 80px;text-align: left;">審核狀態</label>
                    <el-select v-model="auditStatus" placeholder="請選擇審核結果">
                        <el-option label="通過" value="1" />
                        <el-option label="拒絕" value="2" />
                    </el-select>
                </div>
            </div>
            <div style="display: flex;flex-direction: row;justify-content: flex-end;gap:10px;padding: 30px;">
                <div class="primaryno" @click="auditVisible = false">取消</div>
                <div class="primaryyes" @click="saveAudit">提交</div>
            </div>
        </div>
        
        <!-- 提示彈窗 -->
        <div class="copy-toast" v-if="showToast">
            <div style="font-size:30px;">
                <Icon icon="iconoir:xmark" width="58" v-if="!isSuccess" />
                <Icon icon="iconoir:check" width="58" v-else />
            </div>
            <div style="font-size:16px; margin-top:10px;">{{ toastText }}</div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue';
import request from '@/utils/request';
import router from '@/router';
import { Icon } from '@iconify/vue';
import moment from 'moment';
const userInfo = reactive(JSON.parse(localStorage.getItem("adminuser") || "{}"));
// 提示相關"
const showToast = ref(false);
const toastText = ref('');
const isSuccess = ref(false);

// 搜索'
const searchName = ref('');
// 申請列表'
const applyList = ref<any[]>([]);

// 審核彈窗'
const auditVisible = ref(false);
const auditForm = ref({
    id: 0,
    user_id: 0,
    username: '',
    status: 0
});
const auditStatus = ref('');

// 狀態映�?
const statusMap: Record<number, string> = {
    0: '待審核',
    1: '已通過',
    2: '已拒絕'
};

// 獲取入駐申請列表'
const getApplyList = async () => {
    try {
        const { data } = await request.get('/api/admin/admin_user/admin_apply');
        if (data.code === 1) {
            applyList.value = data.data || [];
        }
    } catch (err) {
        showToastMsg('數據加載失敗', false);
    }
};

// 打開審核彈窗'
const openAudit = (row: any) => {
    auditVisible.value = true;
    auditForm.value = { ...row };
    auditStatus.value = String(row.status);
};

// 提交審核'
const saveAudit = async () => {
    if (!auditStatus.value) {
        showToastMsg('請選擇審核狀態', false);
        return;
    }
    try {
        console.log(auditForm.value.user_id,'11111111',auditStatus.value,'222222222',auditForm.value.id,'3333333',auditStatus.value)
        // 狀態=通過(角色改為2入駐用戶')，狀態=拒絕(角色維持1普通用户名：'
        const roleLevel = auditStatus.value === '1' ? 2 : 1;
        const { data } = await request.get('/api/admin/admin_user/settle_apply', {
            params: {
                id: auditForm.value.user_id,
                role_level: roleLevel,
                apply_id: auditForm.value.id,
                status: auditStatus.value
            }
        });

        if (data.code === 1) {
            auditVisible.value = false;
            showToastMsg('審核提交成功', true);
            getApplyList();
        } else {
            showToastMsg('審核提交失敗', false);
        }
    } catch (err) {
        showToastMsg('請求異常', false);
        console.error(err);
    }
};

// 統一提示方法'
const showToastMsg = (text: string, success: boolean) => {
    toastText.value = text;
    isSuccess.value = success;
    showToast.value = true;
    setTimeout(() => showToast.value = false, 1500);
};

onMounted(() => {
    // 後台登錄校驗'
    const adminStr = localStorage.getItem('adminuser');
    if (!adminStr) {
        router.replace('/admin_login');
        return;
    }
    getApplyList();
});
</script>

<style scoped>
.maina {
    padding: 20px;
}

.search-box {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    gap: 5px;
}

.search-label {
    white-space: nowrap;
    font-size: 13px;
}

.search-box :deep(.input) {
    width: 260px;
}

.user-table-wrap {
    border: 1px solid #eee;
    border-radius: 6px;
}

.no-scroll {
    -ms-overflow-style: none;
    scrollbar-width: none;
}

.no-scroll::-webkit-scrollbar {
    display: none;
}

.user-item {
    display: flex;
    padding: 5px 15px;
    border-bottom: 1px solid #d3d2d2;
    background-color: #eeeeee;
    text-align: left;
}

.user-item:hover {
    background-color: #dad8d8;
}

.user-item:last-child {
    border-bottom: none;
}

.user-info {
    display: flex;
    gap: 20px;
    font-size: 13px;
    text-align: left;
}

.edit-form {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 10px 30px;
    font-size: 13px;
}

.form-item {
    display: flex;
    align-items: center;
}

.form-item label {
    width: 60px;
    text-align: right;
    margin-right: 12px;
    font-weight: 500;
    color: #333;
}

.form-item .text {
    padding: 0 10px;
    line-height: 32px;
    text-align: left;
}

.primary {
    background-color: #02804b;
    color: #fff;
    padding: 2px 10px;
    border-radius: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
}

.primaryyes {
    background-color: #ff33ee;
    color: #fff;
    padding: 5px 15px;
    border-radius: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 13px;
    cursor: pointer;
}

.primaryno {
    background-color: #dfdfdf;
    color: #000;
    padding: 5px 15px;
    border-radius: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 13px;
    cursor: pointer;
}

/* 自定義彈窗遮�?*/
.my-dialog-mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.589);
    z-index: 999;
}

.my-dialog {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 520px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    z-index: 1000;
}

.my-dialog-head {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 15px;
    color: #333;
    background-color: #e02ddb;
    padding: 10px 0;
    border-radius: 8px 8px 0 0;
    text-align: center;
}

/* 提示彈窗 */
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

:global(.input) {
  border: 1px solid #ccc;
  padding: 5px;
  border-radius: 4px;
  outline: none;
}
</style>