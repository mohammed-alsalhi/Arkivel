# Offline And PWA

Arkivel v4.88.2 defines the installable-app and offline-reading contract for self-host installs.

## Surfaces

- `/sw.js` registers the service worker for static assets, public reading pages, read-only article/category/tag/search/customization APIs, and selected retryable mutations.
- `/offline.html` is the static fallback page shown when a navigation request has no network response and no cached copy.
- `/api/offline/contract` publishes cache rules, retry queue rules, stale indicators, mobile QA checkpoints, privacy limits, and draft warnings.
- `offlinePwa` in `/api/customization` exposes the schema version, manifest route, service-worker route, fallback URL, strategy summary, and mobile QA ids.

## Cache Strategy

Static assets, brand images, the app manifest, and the offline fallback are cache-first after installation. Public reading pages and article list surfaces are network-first with a cached fallback. Read-only article, category, tag, search, and customization API responses are network-first and return stale headers when served from cache.

Admin, auth, export, webhook, observability, upload, and plugin routes bypass offline caches. They are never queued for replay.

## Retry Queues

The service worker queues same-origin article, category, tag, and discussion mutations only when the network fails. Queued requests are stored in browser-local IndexedDB and replay when the browser reports connectivity again or when the user presses retry in the offline banner.

Keep editor tabs open until the reconnect message appears. Private browsing modes and browser storage eviction can remove queued work without notice.

## Stale Indicators

Cached fallback responses include:

- `X-Arkivel-Offline: true`
- `X-Arkivel-Cache-Stale: true`
- `X-Arkivel-Cached-At: <timestamp>`

The app shell shows offline, reconnect, queued-save, and install-prompt messages when the browser exposes those events.

## Mobile QA

- Installed app launches in standalone mode from `/`.
- Recently opened articles, article lists, search, help, and features remain readable while offline.
- Install prompts appear only after the browser fires `beforeinstallprompt` and can be dismissed.
- Queued article mutations replay after reconnect.

## Privacy Limits

Offline caches are local browser storage. Recently viewed article HTML and API JSON may remain available to anyone with access to the same browser profile. On shared devices, sign out and clear site data when cached knowledge should not remain readable. Browser storage quotas and operating-system cleanup can evict caches at any time.
