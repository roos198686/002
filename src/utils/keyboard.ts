/**
 * H5 軟鍵盤適配
 * 問題：iOS/安卓瀏覽器聚焦彈窗內輸入框時，會把整個 fixed 頁面/滾動容器往上頂。
 * 方案：監聽 visualViewport，在 <html> 上標記 kb-open 並下發鍵盤高度、可視高度 CSS 變量，
 *      CSS 讓底部彈窗貼著鍵盤上沿、居中彈窗在可視區內重新居中；同時禁止系統的自動平移。
 * App 端（Capacitor）原生鍵盤行為不同，此適配僅 H5 需要，但加了也無副作用。
 */
export function setupKeyboard(): void {
    if (typeof window === 'undefined' || !window.visualViewport) return

    const vv = window.visualViewport
    const root = document.documentElement

    const apply = () => {
        const kb = window.innerHeight - vv.height
        if (kb > 100) {
            root.classList.add('kb-open')
            root.style.setProperty('--kb-h', `${kb}px`)
            root.style.setProperty('--vv-h', `${vv.height}px`)
        } else {
            root.classList.remove('kb-open')
            root.style.removeProperty('--kb-h')
            root.style.removeProperty('--vv-h')
        }
    }

    vv.addEventListener('resize', apply)
    vv.addEventListener('scroll', () => {
        // 阻止 iOS 鍵盤彈起時拖動整個 visual viewport
        window.scrollTo(0, 0)
        apply()
    })

    // 聚焦輸入框後 iOS 會異步把頁面滾到輸入框位置，立即拉回
    document.addEventListener(
        'focusin',
        () => {
            requestAnimationFrame(() => window.scrollTo(0, 0))
        },
        true
    )

    window.addEventListener(
        'scroll',
        () => {
            if (root.classList.contains('kb-open')) window.scrollTo(0, 0)
        },
        { passive: true }
    )
}
