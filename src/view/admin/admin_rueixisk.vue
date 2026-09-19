<template>
    <div class="maina">
        <div class="all">
            <div class="search-box">
                <span class="search-label">输入用户名：</span>
                <input v-model="searchName" placeholder="请输入用户名模糊搜索" @input="getUserList" class="input" />
            </div>

            <div class="role-tabs">
                <div class="tab-item" :class="{ active: currentRole === 1 }" @click="switchRole(1)">
                    普通用户
                </div>
                <div class="tab-item" :class="{ active: currentRole === 2 }" @click="switchRole(2)">
                    入驻用户
                </div>
            </div>

            <div class="user-table-wrap no-scroll" style="max-height: 650px; overflow-y: auto; display: block;margin-top: 15px;"
                ref="scrollBox">
                <div class="user-item"
                    style="display: flex; align-items: center; padding: 5px 15px;background-color: #ff33ee;color: #fff;">
                    <div class="user-info" style="flex: 1; display: flex;">
                        <div style="width: 10%;">ID</div>
                        <div style="width: 10%;">用户名</div>
                        <div style="width: 10%;">昵称</div>
                        <div style="width: 10%;">角色</div>
                        <div style="width: 10%;">点赞数</div>
                        <div style="width: 10%;">查看数</div>
                        <div style="width: 10%;">VIP</div>
                        <div style="width: 10%;">余额</div>
                    </div>
                    <div style="width: 10%; text-align: left;font-size: 13px;">编辑</div>
                </div>

                <div v-for="item in showList" :key="item.id" class="user-item" style="display: flex;">
                    <div class="user-info" style="flex: 1; display: flex;text-align: left;">
                        <div style="width: 10%;">{{ item.id }}</div>
                        <div style="width: 10%;">{{ item.username }}</div>
                        <div style="width: 10%;">{{ item.nickname }}</div>
                        <div style="width: 10%;">{{ item.role_level == 1 ? '普通用户' : '入驻' }}</div>
                        <div style="width: 10%;">{{ item.like_count }}</div>
                        <div style="width: 10%;">{{ item.view_count }}</div>
                        <div style="width: 10%;">{{ item.vip_level }}</div>
                        <div style="width: 10%;">{{ item.balance }}</div>
                    </div>
                    <div style="width: 10%; text-align: center;font-size: 13px;display: flex;">
                        <div class="primary" @click="openEdit(item)" :style="userinfo.status != 3 ? '' : 'pointer-events: none;background-color: #555;'">编辑</div>
                    </div>
                </div>
                <div v-if="loading" style="padding:10px;text-align:center;font-size: 13px;">加载中.....</div>
                <div v-if="noMore" style="padding:10px;text-align:center;font-size: 13px;">已加载全部</div>
            </div>
        </div>

        <!-- eDIV 弹窗：遮�?+ 内容 -->
        <div v-if="editVisible" class="my-dialog-mask" @click.self="editVisible = false"></div>
        <div v-if="editVisible" class="my-dialog">
            <div class="my-dialog-head">编辑用户信息</div>
            <div class="edit-form">
                <div class="form-item">
                    <label>用户名</label>
                    <div class="text">{{ editForm.username }}</div>
                </div>
                <div class="form-item">
                    <label>角色等级</label>
                    <el-select v-model="roleText" placeholder="请选择角色">
                        <el-option label="普通用户" value="普通用户" />
                        <el-option label="入驻用户" value="入驻用户" />
                    </el-select>
                </div>
                <div class="form-item">
                    <label>点赞数</label>
                    <el-input v-model.number="editForm.like_count" :disabled="roleText === '普通用户'" />
                </div>
                <div class="form-item">
                    <label>查看数</label>
                    <el-input v-model.number="editForm.view_count" :disabled="roleText === '普通用户'" />
                </div>
            </div>
            <div style="display: flex;flex-direction: row;justify-content: flex-end;gap:10px;padding: 30px;">
                <div class="primaryno" @click="editVisible = false">取消</div>
                <div class="primaryyes" @click="saveEdit">保存修改</div>
            </div>
        </div>
        
        <!-- 提示 -->
        <div class="copy-toast" v-if="showToast">
            <div style="font-size:30px;">
                <Icon icon="iconoir:xmark" width="58" v-if="!yesno" />
                <Icon icon="iconoir:check" width="58" v-else />
            </div>
            <div style="font-size:16px; margin-top:10px;">{{ showtext }}</div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref, onUnmounted } from 'vue';
import request from '@/utils/request';
import router from '@/router';
import { Icon } from '@iconify/vue';
const showToast = ref(false);
const showtext = ref('');
const yesno = ref(false);

const searchName = ref('');
const currentRole = ref(1);
const allUserList = ref<any[]>([]);
const userList = ref<any[]>([]);
const showList = ref<any[]>([]);

const scrollBox = ref<HTMLDivElement>();
const page = ref(1);
const pageSize = 20;
const loading = ref(false);
const noMore = ref(false);

const editVisible = ref(false);
const userInfo = reactive(JSON.parse(localStorage.getItem("adminuser") || "{}"));
const zubeikd = ref<any[]>([]);
const grouplevel = ref('');


const xujfkdwobei = async () => {
    const { data } = await request.get('/api/admin/admin_user/zubeikd');
    zubeikd.value = data.data || [];
};

const editForm = ref({
    id: 0,
    username: '',
    role_level: 1,
    like_count: 0,
    view_count: 0,
    vip_level: '',
    balance: 0,
    city: '',
    group_user: '',
});

const roleText = ref('')

const roleMap = {
    1: '普通用户',
    2: '入驻用户'
}
const roleToNum = {
    '普通用户': 1,
    '入驻用户': 2
}

const resetPage = () => {
    page.value = 1;
    showList.value = [];
    noMore.value = false;
};

// 过滤角色 只过滤一级列表
const filterUserList = () => {
    // 全部原始数据
    let temp = allUserList.value.filter(item => item.role_level === currentRole.value);
    userList.value = temp;

    resetPage();
    // 先加载第一级列表
    loadFirstPage();
};

// 初始加载第一级列表
const loadFirstPage = () => {
    const start = 0;
    const end = pageSize;
    showList.value = userList.value.slice(start, end);
    noMore.value = showList.value.length >= userList.value.length;
};

// 滚动加载下一步
const loadMore = () => {
    if (noMore.value) return;

    const el = scrollBox.value;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollTop + clientHeight >= scrollHeight - 50) {
        page.value++;
        const start = (page.value - 1) * pageSize;
        const end = page.value * pageSize;

        // 关键：往后截，不是从头截'
        const nextArr = userList.value.slice(start, end);
        showList.value = [...showList.value, ...nextArr];

        if (end >= userList.value.length) {
            noMore.value = true;
        }
    }
};

const switchRole = (val: number) => {
    currentRole.value = val;
    filterUserList();
};


//用户列表'
const getAllUser = async () => {
    const status = userInfo.status;
    const { data } = await request.get('/api/admin/admin_user/listAll', {
        params: {
            status: status,
            page: page.value,
            pageSize: pageSize
        }
    });
    allUserList.value = data.data;
    filterUserList();
};

//查询用户 原版逻辑不动'
const getUserList = async () => {
    resetPage();
    if (!searchName.value) {
        getAllUser();
        return;
    }
    const { data } = await request.get('/api/admin/admin_user/search', {
        params: { username: searchName.value }
    });
    allUserList.value = data.data;
    filterUserList();
};

const openEdit = async (row) => {
    editVisible.value = true
    editForm.value = { ...row }
    roleText.value = roleMap[row.role_level]
    await xujfkdwobei();
    grouplevel.value = row.group_user;
}
//保存修改 原版不动'
const saveEdit = async () => {
    try {
        const role_level = roleToNum[roleText.value];
        const params = {
            id: editForm.value.id,
            role_level: role_level,
            like_count: editForm.value.like_count,
            view_count: editForm.value.view_count,
        };

        const { data } = await request.get('/api/admin/admin_user/update', { params });

        if (data.code === 1) {
            editVisible.value = false
            showtext.value = '保存成功';
            yesno.value = true;
            showToast.value = true;
            setTimeout(() => showToast.value = false, 1500);

            getUserList();
        } else {
            showtext.value = '保存失败';
            yesno.value = false;
            showToast.value = true;
            setTimeout(() => showToast.value = false, 1500);
        }
    } catch (err) {
        showtext.value = '保存失败';
        yesno.value = false;
        showToast.value = true;
        setTimeout(() => showToast.value = false, 1500);
        console.error(err);
    }
};

onMounted(() => {
    const adminStr = localStorage.getItem('adminuser');
    if (!adminStr) {
        router.replace('/admin_login');
    }
    getUserList();

    // 只加这一句：绑定滚动'
    scrollBox.value?.addEventListener('scroll', loadMore);
});

onUnmounted(() => {
    scrollBox.value?.removeEventListener('scroll', loadMore);
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

.role-tabs {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
}

.tab-item {
    padding: 2px 16px;
    border: 1px solid #ccc;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
}

.tab-item:hover {
    background: #fcebfc;
}

.tab-item.active {
    background: #ff33ee;
    color: #333;
    border-color: #ff33ee;
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
    /* color: #333; */
}

.empty-tip {
    text-align: center;
    padding: 30px 0;
    color: #666;
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

.form-item :deep(.input),
.form-item :deep(.select) {
    flex: 1;
}

/* 自定义弹窗样�?*/
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
    /* padding: 20px; */
}

.my-dialog-head {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 15px;
    color: #333;
    background-color: #e02ddb;
    padding: 10px 0;
    border-radius: 8px 8px 0 0;
}

/* 弹窗 */
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

:global(.input:focus) {
  border: 1px solid #ccc;
  /* 强制提权，覆盖全局样式 */
  /* border-color: #ff33ee !important; */
}
</style>