<template>
    <div class="main">
        <div class="register-container">
            <div class="register-all">
                <div style="padding-top: calc(20px + env(safe-area-inset-top));">
                    <div style="display: flex;justify-content: center;align-items: center;flex-direction: column;">
                        <div class="loginlog">SOCKLY</div>
                        <div class="register-title">登入</div>
                    </div>
                    <form class="register-form" @submit.prevent="handleSubmit">
                        <div class="form-font-size">
                            請輸入您的登入帳號
                        </div>
                        <div class="form-item">
                            <input type="text" v-model="formData.username" class="form-input" placeholder="帳號"
                                :class="{ invalid: formError.username }" />
                            <p class="error-text" v-if="formError.username">
                                {{ formError.username }}
                            </p>
                        </div>
                        <div class="form-item">
                            <div class="form-font-size">
                                請輸入您的登入密碼
                            </div>
                            <div style="position: relative;display: flex;flex-direction: row;align-items: center;">
                                <input type="password" v-model="formData.pwd" class="form-input" placeholder="密碼"
                                    :class="{ invalid: formError.pwd }" />
                            </div>
                            <p class="error-text" v-if="formError.pwd">
                                {{ formError.pwd }}
                            </p>
                        </div>
                        <!-- 滑塊驗證 -->
                        <div class="slider-verify" ref="sliderWrap">
                            <div class="slider-block" :style="{ left: sliderLeft + 'px' }" @mousedown="onDragStart"
                                @touchstart="onDragStart">
                                <Icon icon="mdi:arrow-right" color="#fff" />
                            </div>
                            <div class="slider-tips">{{ sliderTips }}</div>
                        </div>
                        <div class="submit-btn"
                            :class="{ pass: !!formData.username.trim() && !!formData.pwd.trim() && isVerified }"
                            @click="handleSubmit" :disabled="loading">
                            {{ loading ? '登入成功..' : '登入' }}
                        </div>
                        <div style="margin-top: 30px; font-size: 13px; color:#666;cursor: pointer;user-select: none;"
                            @click.stop="toRegister">
                            註冊新帳號
                        </div>
                    </form>
                </div>
            </div>
        </div>

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
// import { updateOperateTime } from '../../utils/authTimeout'

const router = useRouter()

interface LoginForm {
    username: string
    pwd: string
}
interface FormError {
    username: string
    pwd: string
}
interface LoginResponse {
    code: number
    type?: string
    user?: any
}

// 基礎變量'
const yesno = ref(false)
const formData = ref<LoginForm>({ username: '', pwd: '' })
const formError = ref<FormError>({ username: '', pwd: '' })
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

// 提示彈窗'
const showToast = (msg: string): void => {
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
    if ('touches' in e) {
        startX = e.touches[0].clientX
    } else {
        startX = e.clientX
    }
}

// 拖拽移動'
const onDragMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging.value || !sliderWrap.value) return

    let currentX: number
    if ('touches' in e) {
        currentX = e.touches[0].clientX
    } else {
        currentX = e.clientX
    }

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

// 表單校驗'
const validateForm = (): boolean => {
    formError.value = { username: '', pwd: '' }
    let valid = true
    if (!formData.value.username.trim()) {
        formError.value.username = '請輸入帳號'
        valid = false
    }
    if (!formData.value.pwd.trim()) {
        formError.value.pwd = '請輸入密碼'
        valid = false
    }
    return valid
}

// 登入提交'
const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) return
    if (!isVerified.value) {
        showToast('請先完成滑塊驗證')
        return
    }

    try {
        loading.value = true
        const { data: res } = await request.post<LoginResponse>('/api/user/login', {
            username: formData.value.username,
            password: formData.value.pwd,
        })
        if (res.code == 3) {
            let originUser = res.user
            const saveUser = JSON.parse(JSON.stringify(originUser))
            localStorage.setItem('user', JSON.stringify(saveUser))

            showToast('登入成功')
            yesno.value = true
            localStorage.setItem("justLogin", "true")
            setTimeout(() => {
                // replace：登錄成功後歷史記錄中不再保留登錄頁，返回不會回到登錄頁
                router.replace('/index')
            }, 1200)
        } else if (res.code == 1) {
            showToast('用户不存在')
            yesno.value = false
            initSlider()
        } else if (res.code == 2) {
            showToast('密码错误')
            yesno.value = false
            initSlider()
        } else {
            showToast('登入失败')
            yesno.value = false
            initSlider()
        }
    } catch (err) {
        showToast('伺服器異常，請稍後再試')
        initSlider()
    } finally {
        loading.value = false
    }
}

const toRegister = (): void => {
    router.replace({ path: '/register' })
}

// 全局事件掛載'
onMounted(() => {
    initSlider()
    window.addEventListener('mousemove', onDragMove)
    window.addEventListener('mouseup', onDragEnd)
    window.addEventListener('touchmove', onDragMove, { passive: false })
    window.addEventListener('touchend', onDragEnd)
})

// 銷毀事件'
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
    margin: 30px 0;
    text-align: center;
}

.register-all {
    width: 100%;
    max-width: 500px;
    height: 100vh;
    position: relative;
    overflow: hidden;
}

.slider-verify {
    width: 100%;
    height: 44px;
    line-height: 44px;
    background: #fff;
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

.form-item {
    margin-bottom: 10px;
    position: relative;
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
    background-color: #ffffff;
}

.form-input.invalid {
    border-color: #f53f3f;
}

.form-input:focus {
    border-color: #4080ff;
}

.form-input::placeholder {
    color: #666;
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

/* 驗證通過後常態樣式永久生�?*/
.submit-btn.pass {
    background-color: #ff33ee;
    color: #fff;
}

/* 可選：滑鼠懸浮追加效果，不需要直接刪除成功*/
.submit-btn.pass:hover {
    filter: brightness(1.1);
}

.form-font-size {
    font-size: 13px;
    margin: 0 0 5px 10px;
    color: #666;
    text-align: left;
}
</style>