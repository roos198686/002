<template>
    <div class="main">
        <div class="register-container">
            <div class="register-all">
                <div class="form-wrap">
                    <div>
                        <div class="loginlog">SOCKLY</div>
                        <h1 class="register-title">註冊</h1>
                    </div>
                    <form class="register-form" @submit.prevent="handleSubmit">
                        <div class="input-label">
                            請輸入您的註冊帳號
                        </div>
                        <div class="form-item">
                            <input type="text" v-model="formData.username" class="form-input" placeholder="帳號" />
                        </div>

                        <div class="form-item">
                            <div class="input-label">
                                請輸入您的註冊密碼
                            </div>
                            <div class="input-wrap">
                                <input :type="showPwd ? 'text' : 'password'" v-model="formData.pwd" class="form-input"
                                    placeholder="密碼" />
                                <span class="eye-btn" @click.stop="showPwd = !showPwd">
                                    <Icon :icon="showPwd ? 'mdi:eye-off' : 'mdi:eye'" height="20" color="#333" />
                                </span>
                            </div>
                        </div>

                        <!-- 二次確認密碼 -->
                        <div class="form-item">
                            <div class="input-label">
                                請再次輸入密碼
                            </div>
                            <div class="input-wrap">
                                <input :type="showPwd ? 'text' : 'password'" v-model="formData.rePwd" class="form-input"
                                    placeholder="確認密碼" />
                            </div>
                        </div>

                        <!-- 滑塊驗證 -->
                        <div class="slider-verify" ref="sliderWrap">
                            <div class="slider-block" :style="{ left: sliderLeft + 'px' }" @mousedown="onDragStart"
                                @touchstart="onDragStart">
                                <Icon icon="mdi:arrow-right" color="#fff" />
                            </div>
                            <div class="slider-tips">{{ sliderTips }}</div>
                        </div>

                        <!-- 勾選協議 -->
                        <div class="form-item">
                            <input type="checkbox" v-model="formData.agree" id="agree-terms" />
                            <label for="agree-terms" class="agree-label">
                                我已閱讀並同意使用者條款
                            </label>
                        </div>

                        <div class="submit-btn"
                            :class="{ pass: !!formData.username.trim() && !!formData.pwd.trim() && !!formData.rePwd.trim() && isVerified }"
                            @click="handleSubmit" :disabled="loading">
                            {{ loading ? '註冊成功..' : '註冊' }}
                        </div>
                        <div class="jump-tip" @click.stop="loginto">
                            前往登入
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- 提示彈窗 -->
        <div v-if="alertVisible" class="custom-modal" @click="alertVisible = false">
            <div class="modal-box" @click.stop>
                <Icon icon="iconoir:xmark" width="58" v-if="!yesno" />
                <Icon icon="iconoir:check" width="58" v-if="yesno" />
                <div class="modal-text">{{ alertMsg }}</div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted, onMounted, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
import request from '@/utils/request'
import { useRouter } from 'vue-router'

const router = useRouter()

interface RegisterForm {
    username: string
    pwd: string
    rePwd: string
    agree: boolean
}
interface RegisterResponse {
    code: number
    msg: string
}

// 基礎變量'
const yesno = ref(false)
const formData = ref<RegisterForm>({
    username: '',
    pwd: '',
    rePwd: '',
    agree: false
})
const showPwd = ref<boolean>(false)
const loading = ref<boolean>(false)
const alertVisible = ref<boolean>(false)
const alertMsg = ref<string>('')
let autoCloseTimer: any = null

// 滑塊驗證變量'
const sliderWrap = ref<HTMLDivElement | null>(null)
const sliderLeft = ref(0)
const isDragging = ref(false)
const isVerified = ref(false)
const sliderTips = ref('請滑動完成驗證')
let targetX = 0
let wrapWidth = 0
const blockWidth = 45
const tolerance = 10
let startX = 0

// 彈窗提示'
const showToast = (msg: string): void => {
    yesno.value = false
    alertMsg.value = msg
    alertVisible.value = true
    if (autoCloseTimer) clearTimeout(autoCloseTimer)
    autoCloseTimer = setTimeout(() => (alertVisible.value = false), 2000)
}

// 初始化滑動完成'
const initSlider = async () => {
    await nextTick()
    if (!sliderWrap.value) return
    wrapWidth = sliderWrap.value.offsetWidth
    const maxMove = wrapWidth - blockWidth
    targetX = Math.floor(Math.random() * maxMove)
    sliderLeft.value = 0
    isVerified.value = false
    sliderTips.value = '請滑動完成驗證'
}

// 開始拖拽'
const onDragStart = (e: MouseEvent | TouchEvent) => {
    if (isVerified.value) return
    isDragging.value = true
    startX = 'touches' in e ? e.touches[0].clientX : e.clientX
}

// 拖拽移動'
const onDragMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging.value || !sliderWrap.value) return
    const currentX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const diff = currentX - startX
    const maxMove = wrapWidth - blockWidth
    let moveX = diff

    if (moveX <= 0) moveX = 0
    if (moveX >= maxMove) moveX = maxMove
    sliderLeft.value = moveX
}

// 結束拖拽'
const onDragEnd = () => {
    if (!isDragging.value) return
    isDragging.value = false
    const maxMove = wrapWidth - blockWidth

    if (Math.abs(sliderLeft.value - targetX) < tolerance || sliderLeft.value >= maxMove) {
        isVerified.value = true
        sliderTips.value = '驗證成功'
    } else {
        sliderTips.value = '驗證失敗，請重試'
        setTimeout(initSlider, 800)
    }
}

// 表單校驗（全部錯誤走彈窗�?
const validateForm = (): boolean => {
    const reg = /^[a-zA-Z0-9]{6,20}$/

    if (!formData.value.username.trim()) {
        showToast('請輸入帳號')
        return false
    }
    if (!reg.test(formData.value.username)) {
        showToast('帳號需為6-2-20位英文字母或數字')
        return false
    }

    if (!formData.value.pwd.trim()) {
        showToast('請輸入密碼')
        return false
    }
    if (!reg.test(formData.value.pwd)) {
        showToast('密碼需為6-2-20位英文字母或數字')
        return false
    }

    if (!formData.value.rePwd.trim()) {
        showToast('請再次輸入密碼')
        return false
    }
    if (formData.value.rePwd !== formData.value.pwd) {
        showToast('兩次輸入的密碼不一致')
        return false
    }

    if (!formData.value.agree) {
        showToast('請勾選同意使用者條款')
        return false
    }

    return true
}

// 註冊提交'
const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) return
    if (!isVerified.value) {
        showToast('請先完成滑塊驗證')
        return
    }

    try {
        loading.value = true
        const { data: res } = await request.post<RegisterResponse>('/api/user/register', {
            username: formData.value.username,
            password: formData.value.pwd,
            fund_password: formData.value.pwd,
            agree: formData.value.agree
        })

        if (res.code === 1) {
            yesno.value = true
            showToast('註冊成功')
            // 清空表單'
            formData.value = { username: '', pwd: '', rePwd: '', agree: false }
            setTimeout(() => {
                router.push('/login')
            }, 1200)
        } else {
            showToast(res.msg || '註冊失敗')
            initSlider()
        }
    } catch (err) {
        showToast('伺服器異常，請稍後再試')
        initSlider()
    } finally {
        loading.value = false
    }
}

// 跳轉登入'
const loginto = (): void => {
    router.push('/login')
}

// 事件掛載與銷毀'
onMounted(() => {
    initSlider()
    window.addEventListener('mousemove', onDragMove)
    window.addEventListener('mouseup', onDragEnd)
    window.addEventListener('touchmove', onDragMove, { passive: false })
    window.addEventListener('touchend', onDragEnd)
})

onUnmounted(() => {
    if (autoCloseTimer) clearTimeout(autoCloseTimer)
    window.removeEventListener('mousemove', onDragMove)
    window.removeEventListener('mouseup', onDragEnd)
    window.removeEventListener('touchmove', onDragMove)
    window.removeEventListener('touchend', onDragEnd)
})
</script>

<style scoped>
@import '../../assets/css/all.css';
html,
body {
    width: 100%;
    height: 100%;
    overflow: hidden;
    touch-action: none;
    margin: 0;
    padding: 0;
}

.main {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    width: 100%;
    height: 100dvh;
    font-family: "Microsoft YaHei", sans-serif;
    overflow: hidden;
}

.register-container {
    width: 100%;
    height: 100dvh;
    background: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: hidden;
}

.loginlog {
    color: #ff33ee;
    font-size: 50px;
    font-weight: bolder;
    margin-top: 30px;
}

.register-all {
    width: 100%;
    max-width: 500px;
    height: 100vh;
    position: relative;
    overflow: hidden;
}

.form-wrap {
    padding-top: calc(10px + env(safe-area-inset-top));
}

.register-title {
    text-align: left;
    color: #333;
    font-size: 20px;
    font-weight: 600;
    margin: 0 50px 15px 50px;
    padding: 0 10px;
}

.register-form {
    padding: 0 50px;
}

.input-label {
    font-size: 13px;
    margin: 0 0 5px 10px;
    color: #666;
    text-align: left;
}

.form-item {
    margin-bottom: 10px;
    position: relative;
}

.input-wrap {
    position: relative;
}

.eye-btn {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    z-index: 999;
    color: #000;
}

.form-input {
    width: 100%;
    height: 44px;
    padding: 0 25px;
    border: 1px solid #ebebeb;
    border-radius: 50px;
    font-size: 14px;
    color: #000;
    box-sizing: border-box;
    outline: none;
    transition: border-color 0.3s;
    background-color: #ebebeb;
}

.form-input::placeholder {
    color: #666;
}

.agree-label {
    font-size: 12px;
    text-align: left;
    color: #666;
    margin-bottom: 10px;
}

.slider-verify {
    width: 100%;
    height: 44px;
    line-height: 44px;
    background: #ebebeb;
    border-radius: 50px;
    margin: 30px 0 60px 0;
    position: relative;
    overflow: hidden;
    user-select: none;
    border: 1px solid #ebebeb;
    color: #000;
}

.slider-block {
    width: 44px;
    height: 100%;
    background: #ff33ee;
    border-radius: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 0;
    left: 0;
    cursor: grab;
}

.slider-block:active {
    cursor: grabbing;
}

.slider-tips {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: #000;
    pointer-events: none;
}

.submit-btn {
    user-select: none;
    width: 100%;
    height: 43px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #ff33ee;
    color: #fff;
    border-radius: 50px;
    font-size: 20px;
    font-weight: 900;
    cursor: pointer;
    transition: background-color 0.3s;
    position: relative;
    z-index: 999;
}

.submit-btn.pass {
    background-color: #ff33ee;
    color: #fff;
}

.submit-btn.pass:hover {
    filter: brightness(1.1);
}

.jump-tip {
    margin-top: 30px;
    font-size: 13px;
    color: #666;
    cursor: pointer;
    user-select: none;
}


</style>