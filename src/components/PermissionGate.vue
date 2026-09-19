<template>
    <div v-if="visible" class="permission-gate">
        <div class="gate-box">
            <div class="gate-icon">
                <Icon :icon="icon" width="56" />
            </div>
            <div class="gate-title">{{ title }}</div>
            <div class="gate-desc">{{ desc }}</div>
            <div class="gate-btn gate-btn-primary" :class="{ disabled: opening }" @click="onSettings">
                <Icon v-if="opening" icon="svg-spinners:ring-resize" width="18" />
                <span>{{ opening ? '正在開啟系統設定…' : '前往設定開啟權限' }}</span>
            </div>
            <div class="gate-btn gate-btn-ghost" :class="{ disabled: checking }" @click="onRetry">
                <Icon v-if="checking" icon="svg-spinners:ring-resize" width="18" />
                <span>{{ checking ? '檢測中…' : '重新檢測' }}</span>
            </div>
            <div v-if="hint" class="gate-hint">{{ hint }}</div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { Icon } from '@iconify/vue'

withDefaults(defineProps<{
    visible: boolean
    title: string
    desc: string
    icon?: string
}>(), {
    icon: 'material-symbols:lock-outline'
})

const emit = defineEmits<{
    (e: 'retry'): void
    (e: 'settings'): void
}>()

const checking = ref(false)
const opening = ref(false)
const hint = ref('')

const onRetry = () => {
    if (checking.value) return
    checking.value = true
    hint.value = ''
    emit('retry')
    // 授權成功則整層會被 v-if 移除；若 1 秒後仍在，說明仍未授權
    setTimeout(() => {
        checking.value = false
        hint.value = '仍未取得權限，請點擊上方按鈕前往系統設定開啟'
    }, 1000)
}

const onSettings = () => {
    if (opening.value) return
    opening.value = true
    emit('settings')
    setTimeout(() => { opening.value = false }, 1500)
}
</script>

<style scoped>
.permission-gate {
    position: fixed;
    inset: 0;
    z-index: 10000;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 30px;
    box-sizing: border-box;
}

.gate-box {
    width: 100%;
    max-width: 360px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

.gate-icon {
    width: 96px;
    height: 96px;
    border-radius: 50%;
    background: #fff0fe;
    color: #ff33ee;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
}

.gate-title {
    font-size: 20px;
    font-weight: bold;
    color: #333;
    margin-bottom: 12px;
}

.gate-desc {
    font-size: 14px;
    color: #666;
    line-height: 1.7;
    margin-bottom: 28px;
}

.gate-btn {
    width: 100%;
    height: 44px;
    border-radius: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 15px;
    cursor: pointer;
    user-select: none;
    box-sizing: border-box;
}

.gate-btn.disabled {
    opacity: 0.7;
    cursor: default;
}

.gate-btn-primary {
    background: #ff33ee;
    color: #fff;
    margin-bottom: 12px;
}

.gate-btn-primary:active {
    opacity: 0.85;
}

.gate-btn-ghost {
    background: #fff;
    color: #ff33ee;
    border: 1px solid #ff33ee;
}

.gate-hint {
    margin-top: 14px;
    font-size: 13px;
    color: #999;
    line-height: 1.6;
}
</style>
