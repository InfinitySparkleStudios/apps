// ISS Boarding App – offline support. Bump VERSION whenever you change index.html.
const VERSION = "iss-boarding-v9";
const SHELL = ["./", "./index.html", "./brand.js", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/apple-touch-icon.png", "./icons/favicon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET" || req.url.includes("script.google")) return;
  // Pages: try the network first so updates show, fall back to the saved copy offline
  if (req.mode === "navigate") { e.respondWith(fetch(req).then(r => { if (r.ok) { const c = r.clone(); caches.open(VERSION).then(x => x.put(req, c)); } return r; })
    .catch(() => caches.match(req, { ignoreSearch: true }).then(hit => hit || caches.match("./index.html")))); return; }
  // Everything else (icons, fonts): saved copy first
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok && (req.url.startsWith(self.location.origin) || req.url.includes("fonts.g"))) { const c = r.clone(); caches.open(VERSION).then(x => x.put(req, c)); } return r; })));
});
