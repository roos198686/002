<template>
    <div class="pin-input" :class="{ 'is-focus': focused }" @click="focusInput">
        <div v-for="i in length" :key="i" class="pin-box"
            :class="{ filled: chars.length >= i, active: chars.length === i - 1 }">
            <span v-if="chars.length >= i" class="pin-dot"></span>
        </div>
        <!-- 透明真實輸入框：負責彈起數字鍵盤與取值，顯示由六個格子承擔 -->
        <input ref="inputRef" class="pin-native" type="text" inputmode="numeric" pattern="[0-9]*"
            autocomplete="one-time-code" :value="modelValue" :maxlength="length"
            @input="onInput" @keydown="onKeydown" @focus="focused = true" @blur="focused = false" />
    </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'

const props = withDefaults(defineProps<{
    modelValue?: string
    length?: number
    autofocus?: boolean
}>(), {
    modelValue: '',
    length: 6,
    autofocus: false
})

const emit = defineEmits<{
    (e: 'update:modelValue', v: string): void
    (e: 'complete', v: string): void
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const focused = ref(false)
const chars = computed(() => (props.modelValue || '').replace(/\D/g, '').slice(0, props.length))

const focusInput = () => {
    const el = inputRef.value
    if (!el) return
    el.focus()
    // 光標固定到末尾
    try { el.setSelectionRange(el.value.length, el.value.length) } catch { /* noop */ }
}

const onInput = (e: Event) => {
    const target = e.target as HTMLInputElement
    const v = target.value.replace(/\D/g, '').slice(0, props.length)
    target.value = v
    emit('update:modelValue', v)
    if (v.length === props.length) emit('complete', v)
}

const onKeydown = (e: KeyboardEvent) => {
    // 部分安卓鍵盤退格在空值時的兼容
    if (e.key === 'Backspace' && chars.value.length > 0) {
        const v = chars.value.slice(0, -1)
        emit('update:modelValue', v)
        e.preventDefault()
    }
}

const clear = () => emit('update:modelValue', '')
defineExpose({ focus: focusInput, clear })

onMounted(() => {
    if (props.autofocus) focusInput()
})
</script>

<style scoped>
.pin-input {
    position: relative;
    display: flex;
    justify-content: space-between;
    gap: 10px;
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
    cursor: pointer;
    box-sizing: border-box;
}

.pin-box {
    flex: 1;
    aspect-ratio: 1 / 1;
    max-width: 42px;
    min-width: 34px;
    border: 1.5px solid #d9d9d9;
    border-radius: 10px;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.pin-box.active {
    border-color: #ff33ee;
    box-shadow: 0 0 0 2px rgba(255, 51, 238, 0.15);
}

.pin-box.filled {
    border-color: #ff33ee;
}

.pin-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #333;
}

.pin-native {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    border: none;
    outline: none;
    background: transparent;
    caret-color: transparent;
    color: transparent;
    -webkit-text-fill-color: transparent;
    font-size: 16px;
    letter-spacing: 20px;
    padding: 0;
    margin: 0;
}
</style>
