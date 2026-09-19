<template>
    <div \x00ATTR0\x00>
        <div \x00ATTR1\x00>
            <div \x00ATTR2\x00>
                <span \x00ATTR3\x00>搜索好友：</span>
                <el-input \x00ATTR4\x00 \x00ATTR5\x00 clearable \x00ATTR6\x00 />
            </div>

            <div \x00ATTR7\x00 \x00ATTR8\x00 \x00ATTR9\x00>
                <div \x00ATTR10\x00 \x00ATTR11\x00>
                    <div \x00ATTR12\x00 \x00ATTR13\x00>
                        <div \x00ATTR14\x00>头像</div>
                        <div \x00ATTR15\x00>名称</div>
                        <div \x00ATTR16\x00></div>
                        <div
                            \x00ATTR17\x00>
                            <div>时间</div>
                            <div \x00ATTR18\x00>未读</div>
                        </div>
                    </div>
                </div>

                <div \x00ATTR19\x00 \x00ATTR20\x00 \x00ATTR21\x00 \x00ATTR22\x00
                    \x00ATTR23\x00>
                    <div \x00ATTR24\x00 \x00ATTR25\x00>
                        <div \x00ATTR26\x00>
                            <div \x00ATTR27\x00 \x00ATTR28\x00>
                                <img \x00ATTR29\x00 \x00ATTR30\x00 />
                            </div>
                        </div>
                        <div \x00ATTR31\x00>
                            <div>{{ item.name }}</div>
                            <div \x00ATTR32\x00>
                                {{
                                    item.lastMsg == "[T]"
                                        ? $t("image")
                                        : item.lastMsg == "[Z]"
                                            ? $t("transfer")
                                            : item.lastMsg == "[Y]"
                                                ? $t("card")
                                                : item.lastMsg == "[S]"
                                                    ? $t("video")
                                                    : item.lastMsg
                                }}
                            </div>
                        </div>
                        <div
                            \x00ATTR33\x00>
                            <div>{{ formatRelativeTime(item.timestamp) }}</div>
                            <div \x00ATTR34\x00>
                                <div \x00ATTR35\x00 \x00ATTR36\x00>
                                    {{ item.unread_count > 99 ? "99+" : item.unread_count }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div \x00ATTR37\x00 \x00ATTR38\x00>
                    加载中.....
                </div>
                <div \x00ATTR39\x00 \x00ATTR40\x00>
                    已加载全部
                </div>
                <div \x00ATTR41\x00
                    \x00ATTR42\x00>
                    暂无联系人
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, watch, onActivated, nextTick } from "vue";
import router from "../../router";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import request from "@/utils/request";
import { io } from "socket.io-client";

const baseURL = request.defaults.baseURL || "";
const { t } = useI18n();
const route = useRoute();

interface ContactItem {
    id: number;
    name: string;
    avatar: string;
    lastMsg: string;
    timestamp: number;
    unread_count: number;
}

const filteredContacts = ref<ContactItem[]>([]);
const loading = ref(false);
const finished = ref(false);
const page = ref(1);
const pageSize = ref(10);
const searchKey = ref("");
const scrollBox = ref<any>(null);
let socket: any = null;

// 跳转聊天"
const toChat = (userId: number) => {
    router.push(`/message/${userId}`);
};

// 格式化时间
const formatRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (seconds < 60) return t("justNow");
    if (minutes < 60) return `${minutes}${t("minutesAgo")}`;
    if (hours < 24) return `${hours}${t("hoursAgo")}`;
    if (days < 7) return `${days}${t("daysAgo")}`;
    return t("longAgo");
};

// 获取当前用户"
const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem("adminuser") || "{}");
};

// 加载数据"
const loadMore = async () => {
    const currentUser = getCurrentUser();
    const group_user = currentUser.group_level || "";

    if (loading.value || finished.value) return;
    loading.value = true;

    try {
        const { data: res } = await request.post("/api/contact/listadmin", {
            keyword: searchKey.value,
            page: page.value,
            limit: pageSize.value,
            group_user,
        });

        if (res.code === 1) {
            const list = res.data || [];
            filteredContacts.value = page.value === 1 ? list : [...filteredContacts.value, ...list];
            finished.value = list.length < pageSize.value;
            if (!finished.value) page.value++;
        } else {
            finished.value = true;
        }
    } catch (err) {
        console.error("加载失败", err);
        finished.value = true;
    } finally {
        loading.value = false;
    }
};

// 刷新联系人列表（实时更新核心等待審
const refreshContacts = async () => {
    // 重置分页
    page.value = 1;
    finished.value = false;
    filteredContacts.value = [];
    await nextTick();
    loadMore();
};

// 滚动加载"
const handleScroll = () => {
    const el = scrollBox.value;
    if (!el) return;
    if (loading.value || finished.value) return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollTop + clientHeight >= scrollHeight - 100) {
        loadMore();
    }
};

// 路由监听"
watch(
    () => route.path,
    (newPath) => {
        if (newPath === "/contacts") {
            refreshContacts();
        }
    }
);
let timer:any = null;
onMounted(() => {
    refreshContacts();
    scrollBox.value?.addEventListener("scroll", handleScroll);
    // 3秒自动刷新，不用socket
    // timer = setInterval(refreshContacts, 3000);
});

// 页面激活刷新（keep-alivel||
onActivated(() => {
    refreshContacts();
});

// 销毁清空云端
onUnmounted(() => {
    scrollBox.value?.removeEventListener("scroll", handleScroll);
    if (socket) {
        socket.disconnect();
    }
    window.removeEventListener("messageRead", refreshContacts);
});
</script>

<style scoped>
.maina {
    padding: 20px 50px 20px 20px;
}

.search-box {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    gap: 10px;
}

.search-label {
    white-space: nowrap;
}

.search-box :deep(.el-input) {
    width: 260px;
}

.user-table-wrap {
    border: 1px solid #eee;
    border-radius: 6px;
    max-height: 650px;
    overflow-y: auto;
    display: block;
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
    padding: 8px 15px;
    border-bottom: 1px solid #d3d2d2;
    background-color: #eeeeee;
    text-align: left;
    align-items: center;
}

.user-item:hover {
    background-color: #dad8d8;
}

.user-item:last-child {
    border-bottom: none;
}

.avatar {
    width: 35px;
    height: 35px;
    border-radius: 50%;
    overflow: hidden;
}

.avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
</style>