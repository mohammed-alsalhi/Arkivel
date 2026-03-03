// Wiki Service Worker — offline support with network-first strategy
// and background sync for queued mutations.

const CACHE_NAME = "wiki-v1";
const OFFLINE_URL = "/offline";

// Pages to pre-cache on install
const PRECACHE_URLS = ["/", "/help", "/search", OFFLINE_URL];

// ── Install: pre-cache key pages ──────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
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
            .filter((key) => key !== CACHE_NAME)
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

  // Intercept non-GET mutations: queue for later sync
  if (request.method !== "GET") {
    event.respondWith(handleMutation(request));
    return;
  }

  // Cache GET requests for article and API article routes
  const shouldCache =
    url.pathname.startsWith("/api/articles/") ||
    url.pathname.startsWith("/articles/");

  if (shouldCache) {
    event.respondWith(networkFirstWithCache(request));
  } else {
    event.respondWith(networkFirstWithOfflineFallback(request));
  }
});

/**
 * Network-first strategy: tries the network, falls back to cache.
 * Caches successful GET responses for offline use.
 */
async function networkFirstWithCache(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    const cached = await cache.match(request);
    return cached || new Response(JSON.stringify({ error: "Offline" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}

/**
 * Network-first for HTML navigation requests.
 * Shows the offline page when both network and cache fail.
 */
async function networkFirstWithOfflineFallback(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok && request.method === "GET") {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;

    // For HTML navigation, show the offline page
    const acceptHeader = request.headers.get("Accept") || "";
    if (acceptHeader.includes("text/html")) {
      const offlinePage = await cache.match(OFFLINE_URL);
      if (offlinePage) return offlinePage;
    }

    return new Response("You are offline", {
      status: 503,
      headers: { "Content-Type": "text/plain" },
    });
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

    return new Response(
      JSON.stringify({ queued: true, message: "Request queued for sync when online" }),
      { status: 202, headers: { "Content-Type": "application/json" } }
    );
  }
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
