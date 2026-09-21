import { nextTick, getCurrentInstance, onActivated, onDeactivated } from 'vue'
import { useRoute } from 'vue-router'

/**
 * 頁面滾動位置緩存（配合 keep-alive）
 * 進入下一頁時保存當前滾動容器位置，返回時恢復到原位
 * 用法：在頁面 setup 中調用 useScrollCache()，並給滾動容器加 data-scroll-cache 屬性
 */
const scrollTops = new Map<string, number>()

export function useScrollCache(selector = '[data-scroll-cache]') {
    const instance = getCurrentInstance()
    if (!instance) return

    // setup 時綁定當前路由：deactivated 觸發時全局 route 已切到下一頁，不能在回調裡取
    const route = useRoute()
    const myKey = route.fullPath || route.path

    const findEl = (): HTMLElement | null => {
        const root = instance.proxy?.$el as HTMLElement | undefined
        if (!root || root.nodeType !== 1) return null
        if ((root as HTMLElement).matches?.(selector)) return root as HTMLElement
        return (root as HTMLElement).querySelector<HTMLElement>(selector)
    }

    const cacheKey = () => myKey

    onDeactivated(() => {
        const el = findEl()
        if (el && el.scrollTop > 0) {
            scrollTops.set(cacheKey(), el.scrollTop)
        }
    })

    onActivated(async () => {
        const top = scrollTops.get(cacheKey())
        if (top == null) return
        await nextTick()
        // 等兩幀，確保圖片/列表佈局完成後再定位，避免回彈
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const el = findEl()
                if (el) el.scrollTop = top
            })
        })
    })
}
