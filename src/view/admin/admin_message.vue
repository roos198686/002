<template>
    <div
        style="display: flex; height: calc(100vh - 40px); padding: 0 50px 20px 0; box-sizing: border-box; overflow: hidden;">
        <!-- 左侧联系人列表失败固定宽度 150px -->
        <div class="left-contact">
            <div style="width: 100%; height: 100%; display: flex; flex-direction: column;">
                <div class="user-item top-title">
                    <div class="title-text">用户</div>
                </div>

                <div ref="scrollBox" class="scroll-container">
                    <div class="list-inner">
                        <template v-for="group in groupedContacts" :key="group.userId">
                            <div class="user-item group-header" :class="{ activeaa: group.expanded }"
                                @click="toggleGroup(group.userId)">
                                <div class="avatar-wrap">
                                    <img class="avatar" :src="baseURL + group.avatar" alt="" />
                                </div>
                                <div class="content-wrap">
                                    <div class="name">{{ group.name }}</div>
                                </div>
                                <span class="expand-icon">{{ group.expanded ? '?' : '+' }}</span>
                            </div>

                            <div v-if="group.expanded" class="sub-list">
                                <div v-if="subLoading[group.userId]" class="tip-text">加载聊天记录..</div>
                                <div v-for="item in group.subList" :key="item.id" class="user-item sub-item"
                                    :class="{ active: currentChatId === item.id }"
                                    @click="toChat(item.id, group.userId, item.name, item.avatar)" :style="userinfo.status != 3 ? '' : 'pointer-events: none;background-color: #555;'">
                                    <div class="avatar-wrap">
                                        <img class="avataraa" :src="baseURL + item.avatar" alt="" />
                                    </div>
                                    <div class="content-wrap">
                                        <div class="name">{{ item.name }}</div>
                                        <div class="last-msg">
                                            {{
                                                item.lastMsg == "[T]" ? $t("image")
                                                    : item.lastMsg == "[Z]" ? $t("transfer")
                                                        : item.lastMsg == "[Y]" ? $t("card")
                                                            : item.lastMsg == "[S]" ? $t("video")
                                                                : item.lastMsg
                                            }}
                                        </div>
                                    </div>
                                </div>
                                <div v-if="!subLoading[group.userId] && group.subList.length === 0" class="tip-text">
                                    暂无会话
                                </div>
                            </div>
                        </template>

                        <div v-if="loading" class="tip-text">加载聊天记录..</div>
                        <div v-if="finished && groupedContacts.length > 0" class="tip-text">已加载全部</div>
                        <div v-if="groupedContacts.length === 0 && !loading" class="tip-text empty-tip">暂无联系人</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 右侧聊天区域 -->
        <div class="right-chat">
            <div class="search-box">
                <!-- <span class="search-label">搜索</span> -->
                <div style="display: flex;width: 250px;height: 30px;">
                    <el-input v-model="searchKey" placeholder="输入昵称/用户名搜索" clearable @input="refreshContacts"
                        size="small" />
                </div>
            </div>
            <div v-if="!currentChatId" class="chat-empty">请点击左侧联系人开始聊天</div>
            <div v-else class="chat-content">
                <!-- <div class="chat-title">当前聊天：{{ chatTargetName }}</div> -->
                <div ref="chatListRef" class="chat-list">
                    <div v-if="msgList.length === 0" class="empty-msg">暂无聊天记录</div>

                    <!-- 只循环一次，通过class区分左右 -->
                    <div v-for="msg in msgList" :key="msg.id" class="msg-item"
                        :class="msg.from_id === activeMainUserId ? 'right-msg' : 'left-msg'">
                        <!-- 头像+昵称 -->
                        <div class="user-info">
                            <img class="msg-avatar"
                                :src="msg.from_id === activeMainUserId ? baseURL + selfAvatar : baseURL + chatTargetAvatar"
                                alt="" />
                        </div>
                        <!-- 消息内容或上传-->
                        <div class="msg-box">
                            <div class="nickname"
                                :style="msg.from_id === activeMainUserId ? 'text-align: right;' : 'text-align: left'">
                                {{ msg.from_id === activeMainUserId ? selfName : chatTargetName }}
                            </div>
                            <div class="msg-text" v-if="msg.msg_type === 1">{{ msg.content }}</div>
                            <div class="msg-img" v-else-if="msg.msg_type === 2">
                                <img :src="baseURL + msg.content" alt="" />
                            </div>
                            <div class="msg-other" v-else-if="msg.msg_type === 3">【转账消息】{{ msg.content }}</div>
                            <!-- <div class="msg-transfer" v-else-if="msg.msg_type === 4">【转账消息】</div>
                            <div class="msg-card" v-else-if="msg.msg_type === 5">【约会卡设置</div> -->
                            <div class="msg-video" v-else-if="msg.msg_type === 6">
                                <video class="message-video" controls preload="metadata"
                            loading="lazy">
                            <source :src="baseURL + msg.content" type="video/mp4">
                        </video>
                            </div>
                            <div class="msg-goods" v-else-if="msg.msg_type === 7">【商品消息】</div>
                            <div class="msg-unknown" v-else>【未知消息】</div>

                            <div class="msg-time">{{ moment(msg.create_time).format('YY/MM/DD HH:mm:ss') }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, watch, onActivated, nextTick, reactive } from "vue";
import { useRoute } from "vue-router";
import request from "@/utils/request";
import moment from 'moment';
const baseURL = request.defaults.baseURL || "";
const route = useRoute();
const userInfo = reactive(JSON.parse(localStorage.getItem("adminuser") || "{}"))
const chatListRef = ref<HTMLDivElement | null>(null);
const groupedContacts = ref<any[]>([]);
const loading = ref(false);
const finished = ref(false);
const page = ref(1);
const pageSize = ref(20);
const searchKey = ref("");
const scrollBox = ref<HTMLDivElement | null>(null);
const currentChatId = ref<number | null>(null);
const subLoading = ref<Record<number, boolean>>({});

let socket: any = null;
let hasBindScroll = false;
const msgList = ref<any[]>([]);
const activeMainUserId = ref<number | null>(null);

// 聊天对方信息"
const chatTargetName = ref("");
const chatTargetAvatar = ref("");
// 自身信息"
const selfName = ref("");
const selfAvatar = ref("");

// 点击联系人切换聊天记录
const toChat = async (friendId: number, mainId: number, name: string, avatar: string) => {
    currentChatId.value = friendId;
    activeMainUserId.value = mainId;
    chatTargetName.value = name;
    chatTargetAvatar.value = avatar;

    const group = groupedContacts.value.find(g => g.userId === mainId);
    if (group) {
        selfName.value = group.name;
        selfAvatar.value = group.avatar;
    }

    msgList.value = [];
    try {
        const { data: res } = await request.post('/api/admin/message/getMessageList', {
            mainUserId: mainId,
            friendId: friendId
        });
        if (res.code === 1) {
            msgList.value = res.data || [];
            await nextTick();
            if (chatListRef.value) {
                chatListRef.value.scrollTop = chatListRef.value.scrollHeight;
            }
        }
    } catch (err) {
        console.error('加载聊天记录失败', err);
    }
};

// 展开/折叠分组（互斥：只允许一个分组展开始聊天
const toggleGroup = async (userId: number) => {
    const targetGroup = groupedContacts.value.find(g => g.userId === userId);
    if (!targetGroup) return;

    // 当前已展开，直接收貨地址
    if (targetGroup.expanded) {
        targetGroup.expanded = false;
        return;
    }

    // 关闭所有其他分尊重您
    groupedContacts.value.forEach(group => {
        group.expanded = false;
    });

    // 展开当前分组'
    targetGroup.expanded = true;

    // 已有数据或正在加载，不再请求'
    if (targetGroup.subList.length > 0 || subLoading.value[userId]) return;

    subLoading.value[userId] = true;
    try {
        const { data: res } = await request.post("/api/admin/message/getSubList", {
            userId
        });
        if (res.code === 1) {
            targetGroup.subList = res.data || [];
        }
    } catch (err) {
        console.error('加载二级列表失败：', err);
    } finally {
        subLoading.value[userId] = false;
    }
};


// 加载一级分组列表失败'
const loadMore = async () => {
    if (loading.value || finished.value) return;
    loading.value = true;

    try {
        const { data: res } = await request.post("/api/admin/message/adminlistadmin", {
            keyword: searchKey.value,
            page: page.value,
            limit: pageSize.value,
        });
        if (res.code === 1) {
            const list = res.data || [];
            const newGroups = list.map(item => ({
                userId: item.id,
                name: item.name,
                avatar: item.avatar,
                expanded: false,
                subList: []
            }));
            groupedContacts.value = page.value === 1 ? newGroups : [...groupedContacts.value, ...newGroups];
            finished.value = list.length < pageSize.value;
            if (!finished.value) page.value++;
        } else {
            finished.value = true;
        }
    } catch (err) {
        console.error("加载一级列表失败：", err);
        finished.value = true;
    } finally {
        loading.value = false;
    }
};

// 刷新所有列表失败
const refreshContacts = async () => {
    page.value = 1;
    finished.value = false;
    groupedContacts.value = [];
    subLoading.value = {};
    msgList.value = [];
    currentChatId.value = null;
    activeMainUserId.value = null;
    chatTargetName.value = "";
    chatTargetAvatar.value = "";
    selfName.value = "";
    selfAvatar.value = "";
    await nextTick();
    loadMore();
    if (scrollBox.value) scrollBox.value.scrollTop = 0;
};

// 滚动加载"
const handleScroll = () => {
    const el = scrollBox.value;
    if (!el || loading.value || finished.value) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollTop + clientHeight >= scrollHeight - 50) {
        loadMore();
    }
};

watch(() => route.path, (newPath) => {
    if (newPath === "/contacts") refreshContacts();
});

onMounted(() => {
    refreshContacts();
    nextTick(() => {
        if (!hasBindScroll && scrollBox.value) {
            scrollBox.value.addEventListener("scroll", handleScroll);
            hasBindScroll = true;
        }
    });
});

onActivated(() => refreshContacts());

onUnmounted(() => {
    if (scrollBox.value) scrollBox.value.removeEventListener("scroll", handleScroll);
    hasBindScroll = false;
    if (socket) socket.disconnect();
    window.removeEventListener("messageRead", refreshContacts);
});
</script>

<style scoped>
.left-contact {
    width: 150px;
    height: 100%;
    border-right: 1px solid #eee;
    flex-shrink: 0;
}

.right-chat {
    flex: 1;
    height: 100%;
    padding: 0 15px;
    overflow: hidden;
}

.search-box {
    display: flex;
    padding: 10px;
    width: 250px;
}

.search-label {
    font-size: 12px;
    color: #666;
}

.top-title {
    background-color: #e6e6e6;
    width: 100%;
    box-sizing: border-box;
}

.title-text {
    font-size: 14px;
    font-weight: 700;
    text-align: center;
    padding: 5px 0;
}

.scroll-container {
    flex: 1;
    width: 100%;
    height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: none;
    -ms-overflow-style: none;
}

.scroll-container:deep(::webkit-scrollbar) {
    display: none;
}

.user-item {
    display: flex;
    align-items: center;
    padding: 3px 6px;
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer;
}

.user-item:hover {
    background-color: #fcf2f2;
}

.user-item.active {
    background-color: #ffd4fb;
}

.user-item.activeaa {
    background-color: #f8b8f2;
}

.group-header {
    justify-content: space-between;
}

.expand-icon {
    font-size: 20px;
    color: #fd0000;
    flex-shrink: 0;
}

.sub-list {
    background: #fef5ff;
}

.sub-item {
    padding-left: 26px;
    font-size: 12px;

    /* background-color: #dddddd; */
}

.avatar-wrap {
    flex-shrink: 0;
    margin-right: 6px;
}

.avatar {
    width: 35px;
    height: 35px;
    border-radius: 50%;
    object-fit: cover;
    background-color: #e0e0e0;
}

.avataraa {
    width: 25px;
    height: 25px;
    border-radius: 50%;
    object-fit: cover;
    background-color: #e0e0e0;
}

.content-wrap {
    flex: 1;
    min-width: 0;
    text-align: left;
}

.name {
    font-size: 13px;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 800;
}

.last-msg {
    font-size: 11px;
    color: #666;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.tip-text {
    padding: 10px;
    text-align: center;
    font-size: 12px;
    color: #777;
}

.empty-tip {
    color: #666;
}

.chat-empty {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
    font-size: 14px;
}

.chat-content {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.chat-title {
    font-size: 15px;
    font-weight: 500;
    padding: 10px 0;
    border-bottom: 1px solid #eee;
}

.chat-list {
    flex: 1;
    padding-top: 10px;
    overflow-y: auto;
    margin-bottom: 100px;
}

.chat-list::-webkit-scrollbar {
    display: none;
}

.empty-msg {
    text-align: center;
    color: #666;
    padding: 20px 0;
}

/* 消息布局 */
.msg-item {
    display: flex;
    margin-bottom: 10px;
    align-items: flex-start;
    gap: 10px;
    padding-right: 20px;
}

/* 对方消息 居左 */
.left-msg {
    justify-content: flex-start;
}

/* 自己消息 居右 */
.right-msg {
    /* justify-content: flex-end; */
    flex-direction: row-reverse;

}

/* 头像+昵称 */
.user-info {
    display: flex;
    flex-direction: row;
    align-items: center;
}

.msg-avatar {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    object-fit: cover;
}

.nickname {
    font-size: 14px;
    color: #666;
    text-align: left;
}

/* 消息内容 */
.msg-box {
    max-width: 60%;
}

.msg-text {
    padding: 8px 12px;
    background: #f5f5f5;
    border-radius: 6px;
    font-size: 14px;
    line-height: 1.5;
}

.msg-img img {
    max-width: 180px;
    border-radius: 6px;
}

.msg-transfer,
.msg-card,

.msg-goods,
.msg-other,
.msg-unknown {
    padding: 8px 12px;
    background: #f5f5f5;
    border-radius: 6px;
    font-size: 14px;
    color: #333;
}
.msg-video{
    border-radius: 6px;
}
.msg-time {
    font-size: 11px;
    color: #666;
    margin-top: 4px;
    text-align: left;
}

.message-video {
    max-width: 220px;
    max-height: 280px;
    border-radius: 8px;
    background: #fff;
    outline: none;
}
</style>