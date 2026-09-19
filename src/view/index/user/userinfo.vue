<template>
    <div class="main">
        <div class="register-container">
            <div class="register-all">
                <!-- 顶部标题：只保留返回按钮 -->
                <div class="allar-top allar-top-transparent">
                    <div @click="goBack" class="allar-topgoBack">
                        <Icon icon="tabler:chevron-left" height="30" />
                    </div>
                </div>
                <!-- 中间滚动区域：完全统一 -->
                <div class="content-wrapper">
                    <div class="cuekdil">
                        <div :style="bgStyle" class="jkfosll">
                            <div style="text-align: right;margin-left: auto;margin-right: 15px;">
                                <div style="font-size: 13px;background-color: #a88035;color:#333;padding: 2px 5px;border-radius: 5px;"
                                    @click="selectBgFile" v-if="!showBgSave">
                                    修改
                                </div>
                                <div style="font-size: 13px;background-color: #ff40ff;padding: 2px 5px;border-radius: 5px;"
                                    v-if="showBgSave" @click="saveAvatarbg">
                                    儲存
                                </div>
                            </div>
                        </div>
                        <div class="username-avatar">
                            <img :src="username.avatar" alt="avatar" />
                            <div class="avatar-btn-wrap">
                                <div class="avatext" style="font-size: 13px;" @click="selectAvatarFile"
                                    v-if="!showAvatarSave">
                                    修改
                                </div>
                                <div class="avatext" style="font-size: 13px;" v-if="showAvatarSave" @click="saveAvatar">
                                    儲存頭像
                                </div>
                            </div>
                        </div>
                        <div class="jkfosllaqw" style=" border-top: 5px solid #eee;margin-top: 15px;">
                            <div>個人簡介</div>
                            <div class="avatext kdilsl" style="" @click="openEditProfile"
                                v-if="username.rolelevel > '0'">個人簡介
                            </div>
                        </div>
                        <div class="jkfosllaqw">
                            <div>暱稱：{{ username.nickname }}</div>
                            <div class="avatext kdilsl" @click="nickname">
                                修改
                            </div>
                        </div>
                        <div class="jkfosllaqw">
                            <div>使用者名稱：@{{ username.name }}</div>
                            <div class=" kdilsl">
                                修改
                            </div>
                        </div>

                        <div class="jkfosllaqw">
                            <div>登入密碼</div>
                            <div class="avatext kdilsl" @click="password">
                                修改
                            </div>
                        </div>
                        <div class="jkfosllaqw">
                            <div>資金密碼</div>
                            <div class="avatext kdilsl" @click="fundpassword">
                                修改
                            </div>
                        </div>

                        <div class="cardlist-bottom">
                            <div class="cardlist-add" @click="addcard">登出</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 昵称弹窗 - 底部滑出 -->
        <div v-if="showNicknameInput" class="popup-mask" @click.self="showNicknameInput = false">
            <div class="nickname-box slide-bottom">
                <div class="nickname-all">
                    <input v-model="nicknameValue" class="nick-input" placeholder="請輸入暱稱" />
                    <div class="nick-btns">
                        <div class="cancel-btn" @click="showNicknameInput = false">取消</div>
                        <div class="confirm-btn" @click="saveNickname">儲存</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 分開兩次密碼file 輸入，各自對應頭像</ 背景 -->
        <input ref="avatarFileRef" type="file" accept="image/*" style="display: none;" @change="onAvatarChange" />
        <input ref="bgFileRef" type="file" accept="image/*" style="display: none;" @change="onBgChange" />

        <!-- 提示 toast -->
        <div class="copy-toast" v-if="showToast">
            <div style="font-size: 30px;">
                <Icon icon="iconoir:check" width="58" />
            </div>
            <div class="toast-text" style="font-size: 16px;">更新成功</div>
        </div>

        <!-- 编辑资料弹窗 - 底部滑出 -->
        <div class="first-login-modal" v-if="rolelevel" @click.self="rolelevel = false">
            <div class="modal-mask"></div>
            <div class="modal-content slide-bottom">
                <div
                    style="background:#ff40ff;color:#333; border-radius:7px 7px 0 0;padding:7px 15px;margin-bottom:15px;">
                    <div style="font-size:15px;">個人資料</div>
                </div>

                <div style="padding:0 20px;">
                    <div style="padding:5px 0;display: flex;align-items: center;gap:10px;">
                        <div>年齡</div>
                        <input v-model="profile.age" class="nick-inputaa" placeholder="年齡" />
                    </div>

                    <div style="padding:5px 0;display: flex;align-items: center;gap:10px;">
                        <div>身高</div>
                        <input v-model="profile.height" class="nick-inputaa" placeholder="身高" />
                    </div>

                    <div style="padding:5px 0;display: flex;align-items: center;gap:10px;">
                        <div>體型</div>
                        <select v-model="profile.figure" class="nick-inputaa"
                            style="flex: 1; padding: 6px 8px; border: 1px solid #ccc; border-radius: 4px;">
                            <option value="" disabled selected>體型</option>
                            <option value="G+">G+</option>
                            <option value="F">F</option>
                            <option value="E(DD)">E(DD)</option>
                            <option value="D">D</option>
                            <option value="C">C</option>
                            <option value="B">B</option>
                            <option value="A">A</option>
                        </select>
                    </div>
                    <div style="padding:5px 0;">
                        <div style="margin-bottom:5px;">自我介紹</div>
                        <textarea v-model="profile.intro" class="intro-input" placeholder="自我介紹"></textarea>
                    </div>

                    <div style="display:flex;justify-content:center;padding:15px 0 20px 0;gap: 10px;">
                        <div class="modal-btna" @click="rolelevel = false">取消</div>
                        <div class="modal-btn" @click="submitProfile">確認</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref, computed } from 'vue';
import router from '../../../router';
import { Icon } from '@iconify/vue';
import request from '@/utils/request';

const goBack = () => router.go(-1);
const showToast = ref(false);
const rolelevel = ref(false);
const yesno = ref(false);
const showtext = ref('');

// ========== 拆分狀態：頭像、背景各自獨�?==========
const showAvatarSave = ref(false)
const showBgSave = ref(false)

// 文件DOM引用'
const avatarFileRef = ref<HTMLInputElement | null>(null)
const bgFileRef = ref<HTMLInputElement | null>(null)

const username = reactive({
    id: '',
    name: '',
    avatar: '',
    nickname: '',
    rolelevel: '',
    avatar_bg: ''
});

const baseURL = request.defaults.baseURL || ''
const bgStyle = computed(() => {
    let bgUrl = username.avatar_bg
    if (bgUrl && !bgUrl.startsWith('blob:')) {
        bgUrl = baseURL + bgUrl
    }
    return {
        height: '220px',
        display: 'flex',
        alignItems: 'center',
        backgroundImage: `url(${bgUrl || '/images/userbg.png'})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
    }
})

const profile = reactive({
    age: '',
    height: '',
    figure: '',
    intro: ''
})

// 统一更新本地 user 缓存'
const updateLocalUserCache = (newUserObj: Record<string, any>) => {
    localStorage.setItem('user', JSON.stringify(newUserObj))
}

// ========== 個人資料保存 ==========
const submitProfile = async () => {
    if (!profile.age) {
        showtext.value = '請輸入年齡'
        yesno.value = true
        return
    }
    if (!profile.height) {
        showtext.value = '請輸入身高'
        yesno.value = true
        return
    }

    try {
        const { data: res } = await request.post('/api/userinfo/updateProfile', {
            user_id: username.id,
            age: profile.age,
            height: profile.height,
            figure: profile.figure,
            intro: profile.intro
        })

        if (res.code === 1) {
            showtext.value = '儲存成功'
            yesno.value = true
            rolelevel.value = false
            // 重新拉取最新数据并更新缓存'
            await loadUserInfo()
        } else {
            showtext.value = '儲存失敗'
            yesno.value = true
        }
    } catch (err) {
        showtext.value = '儲存失敗'
        yesno.value = true
    }
}

// ========== 頭像相關 ==========
const selectAvatarFile = () => {
    avatarFileRef.value?.click()
}
const onAvatarChange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    username.avatar = url;
    showAvatarSave.value = true;
}
//更新头像'
const saveAvatar = async () => {
    try {
        const formData = new FormData();
        const file = avatarFileRef.value?.files?.[0];
        if (!file) return;

        formData.append('avatar_file', file);
        formData.append('user_id', username.id);

        const { data: res } = await request.post('/api/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (res.code === 1) {
            showAvatarSave.value = false;
            showToast.value = true;
            setTimeout(() => showToast.value = false, 1000);
            username.avatar = baseURL + res.data.avatar
            // 更新本地缓存'
            const localUser = JSON.parse(localStorage.getItem('user') || '{}')
            localUser.avatar = res.data.avatar
            updateLocalUserCache(localUser)
        }
        loadUserInfo()
    } catch (err) {
        console.log(err);
    }
};

// ========== 背景圖相關條款==========
const selectBgFile = () => {
    bgFileRef.value?.click()
}
const onBgChange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const localPreviewUrl = URL.createObjectURL(file);
    username.avatar_bg = localPreviewUrl;
    showBgSave.value = true;
}
//更新背景�?
const saveAvatarbg = async () => {
    try {
        const formData = new FormData();
        const file = bgFileRef.value?.files?.[0];
        if (!file) return;

        formData.append('avatar_file', file);
        formData.append('user_id', username.id);

        const { data: res } = await request.post('/api/avatar_bg', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (res.code === 1) {
            showBgSave.value = false;
            showToast.value = true;
            setTimeout(() => showToast.value = false, 1000);
            username.avatar_bg = res.data.avatar_bg
            // 更新本地缓存'
            const localUser = JSON.parse(localStorage.getItem('user') || '{}')
            localUser.avatar_bg = res.data.avatar_bg
            updateLocalUserCache(localUser)
        }
        loadUserInfo()
    } catch (err) {
        console.log(err);
    }
};

// ========== 更新昵称 ==========
const showNicknameInput = ref(false);
const nicknameValue = ref(username.name);

const nickname = () => {
    showNicknameInput.value = true;
};

const saveNickname = async () => {
    if (!nicknameValue.value.trim()) return;

    try {
        const { data: res } = await request.post('/api/updateNickname', {
            user_id: username.id,
            nickname: nicknameValue.value.trim()
        });

        if (res.code === 1) {
            username.name = nicknameValue.value.trim();
            username.nickname = nicknameValue.value.trim();
            showNicknameInput.value = false;
            showToast.value = true;
            setTimeout(() => showToast.value = false, 1000);
            // 更新本地缓存'
            const localUser = JSON.parse(localStorage.getItem('user') || '{}')
            localUser.nickname = nicknameValue.value.trim()
            localUser.username = nicknameValue.value.trim()
            updateLocalUserCache(localUser)
        }
        loadUserInfo()
    } catch (err) {
        console.log(err);
    }
};

// ========== 登出 ==========
const addcard = async () => {
    try {
        // 1. 解析本地用户信息，获取用户ID
        const userStr = localStorage.getItem('user');
        let userId = '';
        if (userStr) {
            const userInfo = JSON.parse(userStr);
            userId = userInfo.id;
        }

        // 有用户ID才请求登出接口，重置数据库状态'
        if (userId) {
            const { data: res } = await request.post('/api/user/userlogout', {
                userId: userId
            });
        }
    } catch (err) {
        console.log(err);
    }

    // 2. 清空前端所有缓�?
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('last_operate_time'); // 一并清除计时字不能为'
    localStorage.removeItem('home_cached_list');
    localStorage.removeItem('home_page');
    localStorage.removeItem('home_finished');
    localStorage.removeItem('home_top');
    sessionStorage.clear();

    // 3. 跳转到登录页'
    router.push('/login');
};

const fundpassword = () => router.push('/user_resrtpaypass');
const password = () => router.push('/user_resetpass');

// 加载用户信息 + 同步本地缓存'
const loadUserInfo = async () => {
    try {
        const u = localStorage.getItem('user') || '';
        if (!u) return;
        const user = JSON.parse(u);
        const userId = user.id || user.userId;

        const { data: res } = await request.post('/api/user/user/info', { user_id: userId });
        if (res.code === 1 && res.data) {
            const data = res.data;
            username.id = data.id || '';
            username.name = data.username || '';
            username.nickname = data.nickname || '';
            username.avatar = baseURL + (data.avatar || '');
            username.rolelevel = data.role_level || '';
            username.avatar_bg = data.avatar_bg || ''

            // 拉取后端最新数据，全量覆盖本地缓存'
            updateLocalUserCache(data)
        }
    } catch (err) { }
};
//获取用户信息'
const openEditProfile = async () => {
    rolelevel.value = true
    try {
        const { data: res } = await request.post('/api/user/info', {
            user_id: username.id
        })
        if (res.code === 1 && res.data) {
            const d = res.data
            profile.age = d.age || ''
            profile.height = d.height || ''
            profile.figure = d.figure || ''
            profile.intro = d.intro || ''
        }
    } catch (err) { }
}

onMounted(() => {
    loadUserInfo()
});
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

/* ========== 全局布局�?00% 统一 ========== */
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

/* ========== 顶部标题：统一 fixed ========== */
.allar-top {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    max-width: 500px;
    margin: 0 auto;
    z-index: 999;
    display: flex;
    align-items: center;
    height: 45px;
    border-bottom: 1px solid #ddd;
    padding-top: env(safe-area-inset-top);
    box-sizing: content-box;
}

.allar-top-a {
    font-size: 15px;
    font-weight: bold;
    text-align: center;
    width: 100%;
    margin-right: 40px;
}

/* ========== 滚动容器：完全统一 ========== */
.content-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow-y: auto;
    overflow-x: hidden;
    box-sizing: border-box;
    padding-bottom: 20px !important;
    background: #fff !important;
}

/* 透明頂欄：讓背景圖延伸到劉海區域 */
.allar-top-transparent {
    background: transparent !important;
    border-bottom: none !important;
}

.allar-top-transparent .allar-top-a,
.allar-top-transparent>div {
    color: #fff;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}

.cuekdil {
    width: 100%;
    min-height: 100%;
    background: #fff;
    padding-bottom: 10px;
}

/* ========== 原有业务样式保留 ========== */
.username-avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid #eee;
    margin: -20px 20px 10px 20px;
    position: relative;


}

.username-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.jkfosll {
    display: flex;
    align-items: center;
    flex-direction: row;

}

.avatar-btn-wrap {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    /* background: rgba(0, 0, 0, 0.4); */
}

.avatext {
    color: #fff;
    cursor: pointer;
    text-align: center;
    background-color: #00000059;
    padding: 2px 5px;
    border-radius: 5px;
}

.avatext:hover {
    background-color: rgb(99, 98, 98);
}

.jkfosllaqw {
    display: flex;
    padding: 10px 20px;
    border-bottom: 1px solid #ddd;
    color: #363636;
    font-size: 13px;
    align-items: center;
}

/* 底部弹窗遮罩通用 */
.popup-mask,
.first-login-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    z-index: 9999;
    display: flex;
    align-items: flex-end;
    justify-content: center;
}

/* 底部滑入动画 */
.slide-bottom {
    width: 100%;
    max-width: 500px;
    background: #fff;
    border-radius: 8px 8px 0 0;
    transform: translateY(100%);
    animation: slideUp 0.3s ease forwards;
}

@keyframes slideUp {
    to {
        transform: translateY(0);
    }
}

/* 昵称弹窗 */
.nickname-box {
    color: #333;
    font-size: 15px;
    height: 80%;
}

.nickname-all {
    width: 100%;
    height: 200px;
    background: rgb(255, 255, 255);
    border-radius: 8px 8px 0 0;
    align-items: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.nick-input {
    width: 80%;
    height: 40px;
    background: #e6e5e5;
    border: none;
    border-radius: 6px;
    color: #000;
    margin-bottom: 10px;
    padding: 0 10px;
    display: block;
    font-size: 14px;
}

.nick-inputaa {
    flex: 1;
    height: 30px !important;
    background: #ffffff !important;
    border: 1px solid #ccc !important;
    border-radius: 6px !important;
    color: #000 !important;
    padding: 0 10px !important;
    outline: none !important;
}

.intro-input {
    width: 100%;
    height: 100px;
    background: #fff;
    border: 1px solid #cccccc;
    border-radius: 6px;
    padding: 8px;
    font-size: 15px;
    box-sizing: border-box;
    resize: none;
}

.nick-btns {
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: 10px;
    margin-top: 20px;
}

.cancel-btn {
    color: #e2e1e1;
    cursor: pointer;
    background-color: #3a7700;
    padding: 3px 20px;
    border-radius: 6px;
    border: 1px solid #979797;
}

.confirm-btn {
    color: #000;
    cursor: pointer;
    background-color: #e2b521;
    padding: 3px 20px;
    border-radius: 6px;
    border: 1px solid #cacaca;
}

.list-wrapper {
    width: 100%;
    background: #f5f5f5;
}

.cardlist-bottom {
    margin-top: 30px;
    padding: 15px 30px;
    color: #cc9b5a;
    font-weight: bold;
}

.cardlist-add {
    background-color: #347afd;
    padding: 7px;
    color: #fff;
    border-radius: 10px;
    margin-bottom: 20px;
    text-align: center;
}

.cardlist-add:hover {
    background-color: #b4ccf8;
    cursor: pointer;
}

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

/* 资料编辑弹窗 */
.modal-mask {
    display: none;
}

.modal-content {
    width: 100%;
    height: 80%;
    position: relative;
    z-index: 1;
    font-size: 15px;
    color: #000;
}

.kdilsl {
    text-align: right;
    margin-left: auto;
    border: 1px solid #347afd;
    font-size: 12px;
    border-radius: 5px;
    padding: 1px 5px;
    background-color: #8ba4f8;
}

.modal-btna {
    /* background-color: #ccc; */
    border-radius: 5px;
    padding: 3px 25px;
    border: 1px solid #666;
}

.modal-btn {
    background-color: #ff33ee;
    border-radius: 5px;
    padding: 3px 25px;
    border: 1px solid #ff33ee;
    color: #fff;
}

/* ========== 全局统一：滚动条隐藏 + 禁止回弹 ========== */
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

.allar-topgoBack {
    margin-left: 10px;
    cursor: pointer;
    width: 30px;
    height: 30px;
    background-color: #0000008c;
    border-radius: 5px;
}
</style>