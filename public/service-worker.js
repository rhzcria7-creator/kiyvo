// ─────────────────────────────────────────────────────────────
// KIYVO Service Worker v0.0.1 — PWA offline-first
// Cache de assets estáticos, estratégia network-first para API
// ─────────────────────────────────────────────────────────────

const CACHE_VERSION = 'kiyvo-v1'
const STATIC_CACHE = `${CACHE_VERSION}-static`
const IMAGE_CACHE = `${CACHE_VERSION}-images`
const API_CACHE = `${CACHE_VERSION}-api`
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`

const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/favicon.svg',
  '/logo-full.svg',
]

// Instalação: cache assets estáticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// Ativação: limpar caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('kiyvo-') && !name.startsWith(CACHE_VERSION))
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

// Estratégias de cache
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // API calls: network-first
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, API_CACHE))
    return
  }

  // Images: cache-first
  if (url.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE))
    return
  }

  // Static assets: cache-first
  if (STATIC_ASSETS.includes(url.pathname) || url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
    return
  }

  // Pages: network-first
  event.respondWith(networkFirst(request, DYNAMIC_CACHE))
})

// Cache-first: tenta cache, fallback para network
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request)
  if (cached) return cached

  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    return caches.match('/offline')
  }
}

// Network-first: tenta network, fallback para cache
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    const cached = await caches.match(request)
    if (cached) return cached
    return caches.match('/offline')
  }
}

// Background sync para analytics offline
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-analytics') {
    event.waitUntil(syncAnalytics())
  }
})

async function syncAnalytics() {
  try {
    const db = await openAnalyticsDB()
    const events = await db.getAll('events')
    
    if (events.length > 0) {
      await fetch('/api/v1/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events }),
      })
      
      await db.clear('events')
    }
  } catch (err) {
    console.error('Sync analytics failed:', err)
  }
}

function openAnalyticsDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('kiyvo-analytics', 1)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      db.createObjectStore('events', { autoIncrement: true })
    }
  })
}
