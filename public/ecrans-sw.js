/*
 * Service worker of the in-store screens (/ecrans/*). It keeps the last screen
 * page, its scripts, photos and the last menu (/api/screens/*) on the TV, so a
 * screen that restarts while the network is down still shows its menu, then
 * picks up the new prices on its own when the network comes back.
 * The public site is not controlled by it (scope /ecrans/).
 */
const CACHE = "kerux-ecrans-v1";
const NETWORK_TIMEOUT_MS = 8000;

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("kerux-ecrans-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => reject(new Error("timeout")), ms);
    promise.then(
      (v) => (clearTimeout(id), resolve(v)),
      (e) => (clearTimeout(id), reject(e)),
    );
  });
}

/** Fresh copy when the network answers, else the last good copy kept on the TV. */
async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const res = await withTimeout(fetch(request), NETWORK_TIMEOUT_MS);
    if (res.ok) {
      cache.put(request, res.clone());
      return res;
    }
    return (await cache.match(request)) || res;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw err;
  }
}

/** Files that never change under the same URL (hashed scripts, photos): from the TV, refreshed in the background. */
async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((res) => {
      if (res.ok) cache.put(request, res.clone());
      return res;
    })
    .catch(() => undefined);
  return cached || (await network) || Response.error();
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate" && url.pathname.startsWith("/ecrans/")) {
    event.respondWith(networkFirst(request));
  } else if (url.pathname.startsWith("/api/screens/")) {
    event.respondWith(networkFirst(request));
  } else if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/_next/image") ||
    url.pathname.startsWith("/ecrans/photos/") ||
    url.pathname.startsWith("/brand/")
  ) {
    event.respondWith(cacheFirst(request));
  }
});
