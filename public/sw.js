// Arkivel Service Worker - offline reading, install support, and narrow retry queues.

const STATIC_CACHE = "arkivel-static-v4.88.2";
const PAGE_CACHE = "arkivel-pages-v4.88.2";
const API_CACHE = "arkivel-api-v4.88.2";
const OFFLINE_URL = "/offline.html";

// Pages to pre-cache on install
const PRECACHE_URLS = ["/", "/help", "/features", "/search", "/manifest.webmanifest", OFFLINE_URL];

// ── Install: pre-cache key pages ──────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: clean up old caches ────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => ![STATIC_CACHE, PAGE_CACHE, API_CACHE].includes(key))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ── Fetch: network-first with cache fallback ──────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  if (isBypassPath(url.pathname)) {
    event.respondWith(fetch(request));
    return;
  }

  // Intercept selected non-GET mutations: queue for later sync.
  if (request.method !== "GET") {
    if (shouldQueueMutation(url.pathname, request.method)) {
      event.respondWith(handleMutation(request));
    }
    return;
  }

  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  } else if (isReadOnlyApi(url.pathname)) {
    event.respondWith(networkFirstWithCache(request, API_CACHE, true));
  } else if (isReadablePage(url.pathname)) {
    event.respondWith(networkFirstWithCache(request, PAGE_CACHE, false));
  } else {
    event.respondWith(networkFirstWithOfflineFallback(request, PAGE_CACHE));
  }
});

/**
 * Network-first strategy: tries the network, falls back to cache.
 * Caches successful GET responses for offline use.
 */
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  const networkResponse = await fetch(request);
  if (networkResponse.ok) {
    cache.put(request, withCachedAt(networkResponse.clone()));
  }
  return networkResponse;
}

async function networkFirstWithCache(request, cacheName, jsonFallback) {
  const cache = await caches.open(cacheName);
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, withCachedAt(networkResponse.clone()));
    }
    return networkResponse;
  } catch {
    const cached = await cache.match(request);
    if (cached) return withOfflineHeaders(cached);

    if (jsonFallback) {
      return new Response(JSON.stringify({ error: "Offline", cached: false }), {
        status: 503,
        headers: { "Content-Type": "application/json", "X-Arkivel-Offline": "true" },
      });
    }

    return offlineTextResponse();
  }
}

/**
 * Network-first for HTML navigation requests.
 * Shows the offline page when both network and cache fail.
 */
async function networkFirstWithOfflineFallback(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok && request.method === "GET") {
      cache.put(request, withCachedAt(networkResponse.clone()));
    }
    return networkResponse;
  } catch {
    const cached = await cache.match(request);
    if (cached) return withOfflineHeaders(cached);

    // For HTML navigation, show the offline page
    const acceptHeader = request.headers.get("Accept") || "";
    if (acceptHeader.includes("text/html")) {
      const staticCache = await caches.open(STATIC_CACHE);
      const offlinePage = await staticCache.match(OFFLINE_URL);
      if (offlinePage) return withOfflineHeaders(offlinePage);
    }

    return offlineTextResponse();
  }
}

/**
 * Handles POST/PUT/PATCH/DELETE requests.
 * Tries the network; if offline, stores the request in IndexedDB for later sync.
 */
async function handleMutation(request) {
  try {
    return await fetch(request);
  } catch {
    // Clone the request to read its body
    const cloned = request.clone();
    const body = await cloned.text().catch(() => "");

    await enqueueSync({
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body,
      timestamp: Date.now(),
    });

    if ("sync" in self.registration) {
      await self.registration.sync.register("wiki-sync-mutations").catch(() => undefined);
    }

    return new Response(
      JSON.stringify({ queued: true, message: "Request queued for sync when online" }),
      { status: 202, headers: { "Content-Type": "application/json" } }
    );
  }
}

function withCachedAt(response) {
  const headers = new Headers(response.headers);
  headers.set("X-Arkivel-Cached-At", new Date().toISOString());
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function withOfflineHeaders(response) {
  const headers = new Headers(response.headers);
  headers.set("X-Arkivel-Offline", "true");
  headers.set("X-Arkivel-Cache-Stale", "true");
  if (!headers.has("X-Arkivel-Cached-At")) {
    headers.set("X-Arkivel-Cached-At", new Date().toISOString());
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function offlineTextResponse() {
  return new Response("You are offline", {
    status: 503,
    headers: { "Content-Type": "text/plain", "X-Arkivel-Offline": "true" },
  });
}

function isStaticAsset(pathname) {
  return (
    pathname.startsWith("/_next/static/") ||
    pathname.startsWith("/brand/") ||
    pathname === "/favicon.ico" ||
    pathname === "/manifest.webmanifest" ||
    pathname === OFFLINE_URL
  );
}

function isReadOnlyApi(pathname) {
  return ["/api/articles", "/api/categories", "/api/tags", "/api/search", "/api/customization"].some((prefix) =>
    pathname.startsWith(prefix)
  );
}

function isReadablePage(pathname) {
  return (
    pathname === "/" ||
    pathname === "/help" ||
    pathname === "/features" ||
    pathname.startsWith("/articles") ||
    pathname.startsWith("/article/") ||
    pathname.startsWith("/categories") ||
    pathname.startsWith("/tags") ||
    pathname.startsWith("/search")
  );
}

function isBypassPath(pathname) {
  return [
    "/admin",
    "/api/admin",
    "/api/auth",
    "/api/export",
    "/api/webhooks",
    "/api/observability",
    "/api/upload",
    "/api/plugins",
  ].some((prefix) => pathname.startsWith(prefix));
}

function shouldQueueMutation(pathname, method) {
  if (method === "GET" || isBypassPath(pathname)) return false;
  return ["/api/articles", "/api/categories", "/api/tags", "/api/discussions"].some((prefix) => pathname.startsWith(prefix));
}

/**
 * Stores a pending mutation in IndexedDB under the "syncQueue" store.
 */
async function enqueueSync(entry) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("wiki-sync", 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("syncQueue")) {
        db.createObjectStore("syncQueue", {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    };

    request.onsuccess = (event) => {
      const db = event.target.result;
      const tx = db.transaction("syncQueue", "readwrite");
      tx.objectStore("syncQueue").add(entry);
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => { db.close(); reject(tx.error); };
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * Replays all queued mutations from IndexedDB.
 * Removes each entry after a successful response.
 */
async function replayQueue() {
  return new Promise((resolve, reject) => {
    const dbRequest = indexedDB.open("wiki-sync", 1);

    dbRequest.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("syncQueue")) {
        db.createObjectStore("syncQueue", {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    };

    dbRequest.onsuccess = async (event) => {
      const db = event.target.result;

      // Read all queued entries
      const tx = db.transaction("syncQueue", "readonly");
      const store = tx.objectStore("syncQueue");
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = async () => {
        const entries = getAllRequest.result;
        db.close();

        for (const entry of entries) {
          try {
            const response = await fetch(entry.url, {
              method: entry.method,
              headers: entry.headers,
              body: entry.body || undefined,
            });

            if (response.ok || response.status < 500) {
              // Remove from queue
              await deleteFromQueue(entry.id);
            }
          } catch {
            // Still offline — stop processing
            break;
          }
        }
        resolve();
      };

      getAllRequest.onerror = () => { db.close(); reject(getAllRequest.error); };
    };

    dbRequest.onerror = () => reject(dbRequest.error);
  });
}

/**
 * Deletes a single entry from the IndexedDB syncQueue by its id.
 */
async function deleteFromQueue(id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("wiki-sync", 1);
    request.onsuccess = (event) => {
      const db = event.target.result;
      const tx = db.transaction("syncQueue", "readwrite");
      tx.objectStore("syncQueue").delete(id);
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => { db.close(); reject(tx.error); };
    };
    request.onerror = () => reject(request.error);
  });
}

// ── Background sync: replay queued mutations when connection resumes ──────────
self.addEventListener("sync", (event) => {
  if (event.tag === "wiki-sync-mutations") {
    event.waitUntil(replayQueue());
  }
});

// ── Message handler: manual trigger for sync replay ───────────────────────────
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
  if (event.data?.type === "REPLAY_QUEUE") {
    event.waitUntil(replayQueue());
  }
});
