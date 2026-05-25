export const OFFLINE_PWA_SCHEMA_VERSION = "2026-05-25.v4.88.2";

export type OfflineRouteStrategy = "network-first" | "stale-while-revalidate" | "cache-first" | "bypass";

export type OfflineRouteRule = {
  cacheName: string;
  description: string;
  maxAgeSeconds: number | null;
  pattern: string;
  strategy: OfflineRouteStrategy;
};

export type RetryQueueRule = {
  bodyPolicy: string;
  description: string;
  methods: string[];
  pattern: string;
};

export type MobileQaCheckpoint = {
  expected: string;
  id: string;
  viewport: string;
};

export const offlineCacheRules: OfflineRouteRule[] = [
  {
    cacheName: "arkivel-static-v4.88.2",
    description: "Static assets, manifest, favicon, and brand images are cache-first once installed.",
    maxAgeSeconds: 60 * 60 * 24 * 30,
    pattern: "/_next/static/*, /brand/*, /favicon.ico, /manifest.webmanifest",
    strategy: "cache-first",
  },
  {
    cacheName: "arkivel-pages-v4.88.2",
    description: "Public article shells, article lists, search, help, and feature pages are refreshed from the network first and fall back to the last cached copy.",
    maxAgeSeconds: 60 * 60 * 24 * 7,
    pattern: "/articles/*, /article/*, /categories*, /tags*, /search*, /help, /features",
    strategy: "network-first",
  },
  {
    cacheName: "arkivel-api-v4.88.2",
    description: "Read-only article, category, tag, search, and customization API responses are available offline with stale indicators.",
    maxAgeSeconds: 60 * 60 * 6,
    pattern: "/api/articles*, /api/categories*, /api/tags*, /api/search*, /api/customization",
    strategy: "network-first",
  },
  {
    cacheName: "none",
    description: "Admin, auth, export, webhook, metrics, upload, and mutating routes always bypass offline caches.",
    maxAgeSeconds: null,
    pattern: "/admin*, /api/admin*, /api/auth*, /api/export*, /api/webhooks*, /api/observability*, /api/upload*",
    strategy: "bypass",
  },
];

export const retryQueueRules: RetryQueueRule[] = [
  {
    bodyPolicy: "Store the serialized request body locally until replay succeeds or the server returns a non-5xx response.",
    description: "Article create/update/delete requests can be queued when the device is offline.",
    methods: ["POST", "PUT", "PATCH", "DELETE"],
    pattern: "/api/articles*",
  },
  {
    bodyPolicy: "Queue only JSON or form payloads that stay on same-origin API routes; admin/auth/export/upload routes are excluded.",
    description: "Retry queues are intentionally narrow so private admin actions are not silently replayed later.",
    methods: ["POST", "PUT", "PATCH", "DELETE"],
    pattern: "/api/categories*, /api/tags*, /api/discussions*",
  },
];

export const staleIndicatorContract = {
  responseHeaders: ["X-Arkivel-Offline", "X-Arkivel-Cache-Stale", "X-Arkivel-Cached-At"],
  uiSurfaces: ["offline banner", "install prompt", "queued mutation toast", "reconnect toast"],
  warningCopy: "Cached content may be stale until the connection returns and the service worker refreshes it.",
} as const;

export const offlineDraftWarnings = [
  "Keep edit tabs open until the reconnect toast confirms queued saves replayed.",
  "Do not close a browser private window with unsynced drafts; private storage may be cleared immediately.",
  "Admin, auth, import, export, upload, and plugin actions are never queued for offline replay.",
] as const;

export const mobileStartupChecklist: MobileQaCheckpoint[] = [
  {
    expected: "Installed app opens in standalone display mode and reaches the home page from cache.",
    id: "standalone-launch",
    viewport: "390x844 iPhone-sized viewport",
  },
  {
    expected: "Recently opened article, article list, help, and search pages show cached content with an offline warning.",
    id: "offline-reading",
    viewport: "390x844 iPhone-sized viewport",
  },
  {
    expected: "Install prompt appears only after the browser fires beforeinstallprompt and can be dismissed for the session.",
    id: "install-prompt",
    viewport: "412x915 Android-sized viewport",
  },
  {
    expected: "Queued article mutations replay when the connection returns and surface a reconnect toast.",
    id: "retry-replay",
    viewport: "430x932 mobile viewport",
  },
];

export const offlinePrivacyLimits = [
  "Offline caches are browser-local and may contain recently viewed article HTML or API JSON.",
  "Users on shared devices should sign out and clear browser site data if cached pages should not remain readable.",
  "Arkivel does not queue admin, auth, upload, export, webhook, or plugin-management requests for offline replay.",
  "Service-worker caching depends on browser storage quotas and may be evicted by the operating system.",
] as const;

export const offlinePwaContract = {
  apiRoute: "/api/offline/contract",
  docs: "docs/offline-pwa.md",
  fallbackUrl: "/offline.html",
  install: {
    manifestRoute: "/manifest.webmanifest",
    serviceWorker: "/sw.js",
    startUrl: "/",
    standaloneDisplay: true,
  },
  mobileQa: mobileStartupChecklist.map((checkpoint) => checkpoint.id),
  retryQueuePatterns: retryQueueRules.map((rule) => rule.pattern),
  schemaVersion: OFFLINE_PWA_SCHEMA_VERSION,
  staleIndicators: staleIndicatorContract.responseHeaders,
  strategyRules: offlineCacheRules.map((rule) => ({ pattern: rule.pattern, strategy: rule.strategy })),
} as const;

export function getOfflineRouteStrategy(pathname: string): OfflineRouteRule {
  if (isAdminOrPrivatePath(pathname)) {
    return offlineCacheRules[3];
  }
  if (isStaticAssetPath(pathname)) {
    return offlineCacheRules[0];
  }
  if (isReadOnlyApiPath(pathname)) {
    return offlineCacheRules[2];
  }
  return offlineCacheRules[1];
}

export function shouldQueueOfflineMutation(pathname: string, method: string): boolean {
  const normalizedMethod = method.toUpperCase();
  if (isAdminOrPrivatePath(pathname) || normalizedMethod === "GET") return false;

  return retryQueueRules.some((rule) => {
    const allowedMethod = rule.methods.includes(normalizedMethod);
    const normalizedPatterns = rule.pattern.split(",").map((pattern) => pattern.trim().replace("*", ""));
    return allowedMethod && normalizedPatterns.some((pattern) => pathname.startsWith(pattern));
  });
}

export function createOfflineStaleHeaders(cachedAt = new Date().toISOString()) {
  return {
    "X-Arkivel-Cache-Stale": "true",
    "X-Arkivel-Cached-At": cachedAt,
    "X-Arkivel-Offline": "true",
  };
}

function isStaticAssetPath(pathname: string) {
  return (
    pathname.startsWith("/_next/static/") ||
    pathname.startsWith("/brand/") ||
    pathname === "/favicon.ico" ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/offline.html"
  );
}

function isReadOnlyApiPath(pathname: string) {
  return ["/api/articles", "/api/categories", "/api/tags", "/api/search", "/api/customization"].some((prefix) =>
    pathname.startsWith(prefix),
  );
}

function isAdminOrPrivatePath(pathname: string) {
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
