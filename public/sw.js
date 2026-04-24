const CACHE_NAME = 'jd-mate-v1'
const IS_DEV = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1'

self.addEventListener('install', () => {
  if (!IS_DEV) {
    self.skipWaiting()
  }
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  if (!IS_DEV) {
    self.clients.claim()
  }
})

self.addEventListener('fetch', (event) => {
  if (IS_DEV) return

  const { request } = event
  const url = new URL(request.url)

  if (request.method !== 'GET') return
  if (url.pathname.startsWith('/api/')) return
  if (url.pathname.startsWith('/_next/')) return

  if (request.destination === 'document') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/'))
    )
    return
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached
      return fetch(request).then((response) => {
        if (response.ok && url.origin === self.location.origin) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
        }
        return response
      })
    })
  )
})
