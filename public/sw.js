/* SKS PWA Service Worker
 * 目的：支持瀏覽器“添加到桌面”並全屏運行；離線時可打開已緩存的靜態資源。
 * 策略：頁面導航 network-first（保證及時更新）；同源靜態資源 stale-while-revalidate。
 */
const CACHE = 'sks-static-v1'
const STATIC_RE = /^\/(assets|icons|images)\//

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(['/'])).catch(() => undefined)
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return

  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return

  // 頁面導航：網絡優先，失敗時回退緩存首頁（SPA）
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put('/', copy)).catch(() => undefined)
          return res
        })
        .catch(() => caches.match('/').then((r) => r || caches.match(req.url)))
    )
    return
  }

  // 靜態資源：緩存優先，後台更新
  if (STATIC_RE.test(url.pathname)) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const network = fetch(req)
          .then((res) => {
            if (res && res.status === 200) {
              const copy = res.clone()
              caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => undefined)
            }
            return res
          })
          .catch(() => cached)
        return cached || network
      })
    )
  }
})
