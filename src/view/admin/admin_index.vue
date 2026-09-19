<template>
    <div class="main">
        <!-- 顶部資料-->
        <div class="allar-top">
            <!-- 移动端：左上角菜单按讚失敗-->
            <div class="mobile-menu-btn" @click="showMobileMenu = true">
                <Icon icon="ic:baseline-menu" height="24" />
            </div>

            <div class="allar-top-a">
                <div class="topone">
                    <div class="lksfokof-all-texta">欢迎使用管理后台系统</div>
                    <div class="lksfokof-all-textb">
                        <div class="lksfokof-all-textb-a">登录用户： {{ userInfo.username }}</div>
                        <div class="lksfokof-all-textb-a">
                            用户角色： {{ userInfo.juese }}
                        </div>
                    </div>
                </div>
            </div>
            <div class="allar-top-r"></div>
        </div>

        <div class="alla">
            <!-- 桌面端左侧导�?-->
            <div class="allal">
                <div class="allal-top">
                    <div v-for="menu in menuList" :key="menu.key" class="allal-top-ba"
                        :class="{ 'allal-top-babutt': isMenuActive(menu.key) }" @click="activeMenu(menu.path)">
                        <Icon :icon="menu.icon" height="20" />
                        <div>{{ menu.namea }}</div>
                    </div>
                </div>
            </div>

            <div class="allar">
                <div class="lksfokof" style="justify-content: center">
                    <div v-if="invitedadd" class="lksfokof-all">
                        <div style="padding: 30px;display: flex;flex-direction: row;gap: 10px;">
                            <div
                                style="background-color: #b2ecf7;border-radius: 6px;padding: 15px 20px;flex: 1;border: 1px solid #999898;">
                                <div style=" font-size: 50px;font-weight: bold;text-align: center;color: #a3329e;">
                                    {{ statistics.count_level_2 || 0 }}
                                </div>
                                <div>入驻用户数</div>
                            </div>
                            <div
                                style="background-color: #b2ecf7;border-radius: 6px;padding: 15px 20px;flex: 1; border: 1px solid #999898;">
                                <div style=" font-size: 50px;font-weight: bold; text-align: center;color: #a3329e; ">
                                    {{ statistics.count_level_1 || 0 }}
                                </div>
                                <div>客户数</div>
                            </div>
                            <div
                                style="background-color: #b2ecf7;border-radius: 6px;padding: 15px 20px; flex: 1;border: 1px solid #999898; ">
                                <div style=" font-size: 50px; font-weight: bold; text-align: center; color: #a3329e; ">
                                    {{ statistics.amount_rya || '0.00' }}
                                </div>
                                <div>总充值金额</div>
                            </div>
                            <div
                                style=" background-color: #b2ecf7; border-radius: 6px; padding: 15px 20px;flex: 1;border: 1px solid #999898;">
                                <div style=" font-size: 50px; font-weight: bold;text-align: center;color: #a3329e;">
                                    {{ statistics.amount_ryb || '0.00' }}
                                </div>
                                <div>总提现金额</div>
                            </div>
                        </div>

                        <div style="display: flex;flex-direction: row;gap: 30px;padding:0 30px;">
                            <div style="width: 100%;">
                                <div
                                    style=" display: flex; justify-content: space-between; align-items: center;margin-bottom: 15px; ">
                                    <div style=" font-size: 15px; font-weight: bold;color: #a3329e;">
                                        钱包列表
                                    </div>
                                    <button @click="showAddModal = true" v-if="userInfo.status != 3"
                                        style="font-size: 13px; padding: 3px 12px;background-color: #a3329e; color:#333; border: none;border-radius: 4px; cursor: pointer;">
                                        + 添加钱包地址
                                    </button>
                                </div>

                                <div v-if="loading" style="text-align: center; padding: 20px">
                                    加载中.....
                                </div>

                                <div v-else style="border: 1px solid #ddd; border-radius: 8px; overflow: hidden; ">
                                    <table style=" width: 100%; border-collapse: collapse; text-align: center;">
                                        <thead>
                                            <tr
                                                style="background-color: #fdf6fd; height: 35px;font-weight: bold; font-size: 14px; ">
                                                <td>币种类型</td>
                                                <td>钱包地址</td>
                                                <td>当前状态</td>
                                                <td>已完成提现笔数</td>
                                                <td>总充值金额</td>
                                                <td>操作</td>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="item in walletList" :key="item.id"
                                                style="height: 35px; border-top: 1px solid #eee;font-size: 13px;">
                                                <td>{{ item.coin_type }}</td>
                                                <td style="font-family: monospace">{{ item.address }}</td>
                                                <td>
                                                    <span :style="{ color: item.status == 1 ? '#00b42a' : '#ff4d4f' }">
                                                        {{ item.status == 1 ? "启用" : "停用" }}
                                                    </span>
                                                </td>
                                                <td>{{ item.withdrawCount || 0 }}</td>
                                                <td style="color:#a33299; font-weight:bold">
                                                    {{ item.totalRecharge ? Number(item.totalRecharge).toFixed(2) :
                                                        '0.00'
                                                    }}
                                                </td>
                                                <td>
                                                    <span :style="userinfo.status != 3 ? '' : 'pointer-events: none;background-color: #555;'">
                                                    <button @click="handleChangeStatus(item)" "
                                                        :style="{ padding: '2px 10px', border: 'none', borderradius: '4px', cursor: 'pointer', color: '#fff', backgroundcolor: item.status == 1 ? '#ff4d4f' : '#00b42a' }">
                                                        {{ item.status == 1 ? "停用" : "启用" }}
                                                    </button>
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr
                                                style="height: 38px; border-top: 2px solid #a3329e; font-weight: bold; font-size: 14px; background: #fdf6fd;">
                                                <td>总计</td>
                                                <td>-</td>
                                                <td>-</td>
                                                <td style="color:#000;">{{ totalWithdrawCount }}</td>
                                                <td style="color:#a3329e;">{{ totalRechargeAmount }}</td>
                                                <td>-</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-else style="flex: 1; display: flex; width: 100%; flex-direction: column">
                        <router-view></router-view>
                    </div>
                </div>
            </div>
        </div>

        <!-- 原底部导航（手机端隐藏） -->
        <div class="buttnone">
            <div class="buttnone-all">
                <div v-for="menu in menuList" :key="menu.key" class="buttnone-alla"
                    :style="{ color: ismenuactive(menu.key) ? '#ac00ac' : '#000' }" @click="activeMenu(menu.path)">
                    <Icon :icon="menu.icon" height="30" />
                    <div>{{ menu.mobileName }}</div>
                </div>
            </div>
        </div>

        <!-- ========== 移动端左上角弹出侧边菜单 ========== -->
        <div v-if="showMobileMenu" class="mobile-menu-mask" @click.self="showMobileMenu = false">
            <div class="mobile-menu-panel">
                <div class="menu-title">功能菜单</div>
                <div v-for="menu in menuList" :key="menu.key" class="mobile-menu-item"
                    :class="{ 'mobile-menu-active': isMenuActive(menu.key) }" @click="handleMobileMenuClick(menu.path)">
                    <Icon :icon="menu.icon" height="20" style="margin-right:8px" />
                    <span>{{ menu.namea }}</span>
                </div>
            </div>
        </div>

        <!-- 添加钱包弹窗 -->
        <div v-if="showAddModal" style="
        position: fixed;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
      " @click.self="showAddModal = false">
            <div style="
          width: 90%;
          max-width: 450px;
          background: #fff;
          border-radius: 10px;
          padding: 25px;
          position: relative;
        ">
                <div style="
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 20px;
            color: #a3329e;
            text-align: center;
          ">
                    添加钱包地址
                </div>
                <div style="margin-bottom: 15px">
                    <div style="margin-bottom: 6px; font-weight: 500">币种类型</div>
                    <input v-model="addForm.coin_type" placeholder="例如：USDT、TRX、ETH" style="
              width: 100%;
              padding: 10px;
              border: 1px solid #ddd;
              border-radius: 6px;
              box-sizing: border-box;
            " />
                </div>
                <div style="margin-bottom: 15px">
                    <div style="margin-bottom: 6px; font-weight: 500">钱包地址</div>
                    <input v-model="addForm.address" placeholder="请输入钱包地址" style="
              width: 100%;
              padding: 10px;
              border: 1px solid #ddd;
              border-radius: 6px;
              box-sizing: border-box;
            " />
                </div>
                <div style="
            display: flex;
            justify-content: center;
            gap: 15px;
            margin-top: 10px;
          ">
                    <button @click="showAddModal = false" style="
              padding: 8px 20px;
              border: 1px solid #ddd;
              background: #f5f5f5;
              border-radius: 6px;
              cursor: pointer;
            ">
                        取消
                    </button>
                    <button @click="handleAddWallet" :disabled="addLoading" style="
              padding: 8px 20px;
              background: #a3329e;
              color:#333;
              border: none;
              border-radius: 6px;
              cursor: pointer;
            ">
                        {{ addLoading ? "提交中....." : "确认添加" }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref, watch, computed } from "vue";
import { Icon } from "@iconify/vue";
import router from "../../router";
import { useRoute } from "vue-router";
import request from '@/utils/request'
const route = useRoute();
const invitedadd = ref(false);

// ========== 新增：移动端菜单显示状态==========
const showMobileMenu = ref(false);

const userInfo = reactive(JSON.parse(localStorage.getItem("adminuser") || "{}"));

const fjkfdlsojkgwldsads = ref(false);
const form = reactive({
    username: '',
    password: '',
    group_user: '',
})
const fkldilsjfkjfkdso = async () => {
    if (!form.username || !form.password || !form.group_user) {
        return alert('请填写完整信息')
    }
    try {
        const res = await request.post('/api/admin/addGroup', {
            username: form.username,
            password: form.password,
            group_user: form.group_user
        })
        if (res.data.code === 100) {
            alert("用户名已存在，请重新录入统计");
            form.username = ''
        }
        if (res.data.code === 200) {
            fjkfdlsojkgwldsads.value = false
            form.username = ''
            form.password = ''
            form.group_user = ''
        }
    } catch (err) {
        console.error(err)
    }
}

const menuList = ref([
    {
        key: "a",
        path: "/admin_index",
        pathPrefix: "/admin_index",
        namea: "首页",
        mobileName: "系统首页",
        icon: "ic:baseline-widgets",
    },
    {
        key: "b",
        path: "/admin_rueixisk",
        pathPrefix: "/admin_rueixisk",
        namea: "用户管理",
        mobileName: "用户管理",
        icon: "ic:baseline-rocket",
    },
    {
        key: "c",
        path: "/admin_publiczl",
        pathPrefix: "/admin_publiczl",
        namea: "资金管理",
        mobileName: "资金管理",
        icon: "ic:baseline-spa",
    },
    {
        key: "d",
        path: "/admin_ruklose",
        pathPrefix: "/admin_ruklose",
        namea: "贴子管理",
        mobileName: "贴子管理",
        icon: "material-symbols:article-rounded",
    },
    {
        key: "e",
        path: "/admin_shopgl",
        pathPrefix: "/admin_shopgl",
        namea: "商品管理",
        mobileName: "商品管理",
        icon: "material-symbols:shopping-cart-checkout-rounded",
    },
    {
        key: "f",
        path: "/admin_suoruotoji",
        pathPrefix: "/admin_suoruotoji",
        namea: "收入统计",
        mobileName: "收入统计",
        icon: "tabler:copy-check-filled",
    },
    {
        key: "g",
        path: "/admin_message",
        pathPrefix: "/admin_message",
        namea: "聊天查询",
        mobileName: "聊天查询",
        icon: "tabler:brand-messenger-filled",
    },
    {
        key: "h",
        path: "/admin_apply",
        pathPrefix: "/admin_apply",
        namea: "入驻审核",
        mobileName: "入驻审核",
        icon: "material-symbols-light:beenhere-rounded",
    },
    {
        key: "i",
        path: "/admin_settings",
        pathPrefix: "/admin_settings",
        namea: "数据设置",
        mobileName: "数据设置",
        icon: "lucide:settings",
    },
    {
        key: "j",
        path: "/admin_user",
        pathPrefix: "/admin_user",
        namea: "个人中心",
        mobileName: "个人中心",
        icon: "ic:baseline-face-6",
    },
]);

const statistics = ref({
    total_user: 0,
    count_level_1: 0,
    count_level_2: 0,
    amount_rya: 0,
    amount_ryb: 0
});

const walletList = ref<any[]>([]);
const loading = ref(false);

const showAddModal = ref(false);
const addLoading = ref(false);
const addForm = ref({
    coin_type: "",
    address: "",
});

const totalWithdrawCount = computed(() => {
    return walletList.value.reduce((sum, item) => sum + (item.withdrawCount || 0), 0);
});

const totalRechargeAmount = computed(() => {
    const total = walletList.value.reduce((sum, item) => sum + (Number(item.totalRecharge) || 0), 0);
    return total.toFixed(2);
});

const getStatistics = async () => {
    try {
        let status = userInfo.status;
        const { data } = await request.get('/api/admin/statistics', {
            params: {
                status
            }
        });
        if (data.code === 1) {
            statistics.value = data.data;
            console.log(statistics.value)
        }
    } catch (e) {
        console.log("统计加载失败", e);
    }
};

const getWalletList = async () => {
    loading.value = true;
    try {
        let group_user = userInfo.group_level;
        let status = userInfo.status;
        const { data } = await request.get('/api/admin/getRechargeWallet', {
            params: {
                group_user,
                status
            }
        });
        if (data.code !== 0) throw new Error(data.msg || "获取失败");
        walletList.value = data.list || [];
    } catch (err) {
        console.error("钱包列表异常：", err);
        alert("加载钱包列表失败");
    } finally {
        loading.value = false;
    }
};

const handleChangeStatus = async (item: any) => {
    const nextStatus = item.status == 1 ? 2 : 1;
    const text = nextStatus == 1 ? "启用" : "停用";
    if (!confirm(`确定要{text}该钱包吗？`)) return;
    try {
        const { data } = await request.post('/api/admin/updateWalletStatus', {
            id: item.id,
            status: nextStatus
        });
        if (data.code !== 0) {
            alert(data.msg || "操作失败");
            return;
        }
        item.status = nextStatus;
        alert(`${text}成功`);
    } catch (err) {
        console.error(err);
        alert("请求失败");
    }
};

const handleAddWallet = async () => {
    const { coin_type, address } = addForm.value;
    if (!coin_type || !address) {
        alert("请填写完整信息");
        return;
    }
    let group_user = userInfo.group_level;
    console.log(group_user, coin_type, address)
    addLoading.value = true;
    try {
        const { data } = await request.post('/api/admin/addRechargeWallet', {
            coin_type,
            address,
            status: 1,
            remark: group_user
        });
        if (data.code !== 0) {
            alert(data.msg || "添加失败");
            return;
        }
        alert("添加成功！");
        showAddModal.value = false;
        addForm.value = { coin_type: "", address: "" };
        getWalletList();
    } catch (err) {
        console.error(err);
        alert("请求失败");
    } finally {
        addLoading.value = false;
    }
};

const isMenuActive = (menuKey: string) => {
    const menu = menuList.value.find((m) => m.key === menuKey);
    return menu ? route.path.startsWith(menu.pathPrefix) : false;
};

const activeMenu = (path: string) => {
    router.push(path);
    localStorage.setItem("last_path", path);
    invitedadd.value = path === "/admin_index";
};

// ========== 新增：移动端菜单点击事件 ==========
const handleMobileMenuClick = (path: string) => {
    activeMenu(path);
    showMobileMenu.value = false; // 点击后关闭菜单"
};

watch(
    () => route.path,
    (newPath) => {
        invitedadd.value = newPath === "/admin_index";
        localStorage.setItem("last_path", newPath);
        if (newPath === "/admin_index") {
            getStatistics();
            getWalletList();
        }
    },
    { immediate: true }
);

onMounted(() => {
    const adminStr = localStorage.getItem('adminuser');
    if (!adminStr) {
        router.replace('/admin_login');
    }
});
</script>

<style scoped>
.topone {
    display: flex;
    flex-direction: row;
    width: 100%;
}

.main {
    position: absolute;
    display: flex;
    flex-direction: column;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    font-family: "Consolas";
    overflow-y: hidden;
    color: #b2ecf7;
}

.allar-top {
    display: flex;
    flex-direction: row;
    padding: 10px;
    font-size: 14px;
    background-color: #e9e9e9;
    color: #000;
    border-bottom: 1px solid #999898;
    align-items: center;
}

/* 移动端左上角菜单按钮 */
.mobile-menu-btn {
    display: none;
    font-size: 24px;
    cursor: pointer;
    color: #a3329e;
    margin-right: 10px;
}

.allar-top-a {
    margin: 0 15px;
    font-size: 18px;
    font-weight: bold;
    color: #a3329e;
    width: 100%;
}

.allar-top-r {
    text-align: right;
    margin-left: auto;
}

.alla {
    background-color: #fff;
    display: flex;
    flex-direction: row;
    color: #000;
}

.allal {
    height: 100%;
    width: 80px;
    background-color: #e7e7e7;
    display: flex;
    flex-direction: column;
    border-right: 5px solid #c5c5c5;
}

.allal-top {
    display: flex;
    flex-direction: column;
    width: 80px;
    background-color: #a3329e;
}

.allal-top-b {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: left;
    margin-top: -0.5px;
}

.allal-top-ba {
    width: 100%;
    height: 60px;
    cursor: pointer;
    font-size: 13px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #e7e7e7;
    border-bottom: 1px solid #b67676;
}

.allal-top-ba:hover {
    background-color: #e64dde;
    color: #333;
}

.allal-top-babutt {
    width: 100%;
    height: 60px;
    background-color: #a3329e;
    cursor: pointer;
    font-size: 13px;
    color: #333;
    pointer-events: none;
}

.allar {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.lksfokof {
    overflow-y: auto;
    height: 100vh;
    display: flex;
}

.lksfokof-all {
    display: flex;
    flex-direction: column;
    text-align: left;
    flex: 1;
}

.lksfokof-all-texta {
    font-size: 22px;
    font-weight: bold;
    color: #9e026a;
}

.lksfokof-all-textb {
    font-size: 14px;
    display: flex;
    flex-direction: row;
    gap: 20px;
    text-align: right;
    margin-left: auto;
}

.lksfokof-all-textb-a {
    margin: 5px 0;
}

.buttnone {
    position: fixed;
    bottom: 0;
    padding: 10px 10px 40px 10px;
    display: none;
    width: 100%;
    background-color: #e9e9e9;
    color: #000;
    border-top: 1px solid #999898;
}

.buttnone-all {
    display: flex;
    flex-direction: row;
    font-size: 13px;
    line-height: 14px;
}

.buttnone-alla {
    width: 20%;
    text-align: center;
    cursor: pointer;
}

::-webkit-scrollbar {
    display: none;
}

/* ========== 移动端侧边菜单样�?========== */
.mobile-menu-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 9999;
}

.mobile-menu-panel {
    width: 240px;
    height: 100%;
    background: #fff;
    padding-top: 20px;
}

.menu-title {
    font-size: 16px;
    font-weight: bold;
    color: #a3329e;
    text-align: center;
    padding: 10px 0 20px;
    border-bottom: 1px solid #eee;
}

.mobile-menu-item {
    padding: 14px 20px;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #f5f5f5;
}

.mobile-menu-item:hover {
    background: #f9f0f8;
}

.mobile-menu-active {
    background: #a3329e;
    color: #333;
}

.mobile-menu-active:hover {
    background: #a3329e;
}

/* 媒体查询：手机端 历史失80px */
@media (max-width: 780px) {

    /* 显示左上角菜单按讚失敗*/
    .mobile-menu-btn {
        display: block;
    }

    /* 隐藏左侧导航、底部导�?*/
    .allal {
        display: none;
    }

    .buttnone {
        display: none;
    }

    .topone {
        flex-direction: column;
    }

    .lksfokof-all-texta {
        display: none;
    }
}
</style>