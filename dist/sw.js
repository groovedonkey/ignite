// Minimal service worker: makes Ignite installable and gives it an offline
// fallback shell. Deliberately does NOT cache Firestore/Cloud Functions
// requests or third-party APIs — those must always hit the network so the
// CRM's live data stays correct.
const CACHE_NAME = 'ignite-shell-v1'
const SHELL_URLS = ['/', '/index.html', '/favicon.svg', '/manifest.webmanifest']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_URLS)).catch(() => {})
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  // Only handle same-origin navigation and static shell assets. Everything
  // else (Firestore, Cloud Functions, Gemini, FEMA, OpenStreetMap tiles,
  // Unsplash images) passes straight through untouched.
  if (url.origin !== self.location.origin) return
  if (!(request.mode === 'navigate' || SHELL_URLS.includes(url.pathname))) return

  event.respondWith(
    fetch(request)
      .then((response) => {
        const clone = response.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
        return response
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match('/index.html')))
  )
})
