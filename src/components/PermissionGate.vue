<template>
    <div v-if="visible" class="permission-gate">
        <div class="gate-box">
            <div class="gate-icon">
                <Icon :icon="icon" width="56" />
            </div>
            <div class="gate-title">{{ title }}</div>
            <div class="gate-desc">{{ desc }}</div>
            <div class="gate-btn gate-btn-primary" @click="$emit('settings')">前往設定開啟權限</div>
            <div class="gate-btn gate-btn-ghost" @click="$emit('retry')">重新檢測</div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { Icon } from '@iconify/vue'

withDefaults(defineProps<{
    visible: boolean
    title: string
    desc: string
    icon?: string
}>(), {
    icon: 'material-symbols:lock-outline'
})

defineEmits<{
    (e: 'retry'): void
    (e: 'settings'): void
}>()
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
    font-size: 15px;
    cursor: pointer;
    user-select: none;
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
</style>
