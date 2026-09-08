# Roadmap Archive — v4.12

This file archives all completed roadmap items from v4.12.
For the active roadmap see [`/ROADMAP.md`](../../ROADMAP.md).

---

## Discussions & Collaboration
- [x] **Nested discussion threads** — replies to comments with threading and collapse (depth limit 3)
- [x] **@mentions in discussions** — `@username` triggers in-app notification via `createMentionNotifications()`

## Personalization
- [x] **Personal scratchpad** — private Tiptap editor per user with autosave, stored in `Scratchpad` table
- [x] **Custom user homepage** — drag-and-drop widget grid (recent articles, watchlist, edits, random, scratchpad, stats, notifications); widget order/visibility persisted in `UserPreference`

## Content Pipeline & Governance
- [x] **Admin audit log** — paginated AuditLog table with action-type filtering; `logAudit()` called on destructive actions
- [x] **Kanban article board** — 3-column drag-and-drop pipeline (Draft → Review → Published) at `/admin/kanban`
- [x] **Article expiry / auto-archive** — `expiresAt` field + `/api/cron/expire-articles` auto-moves to draft on expiry
- [x] **Scheduled review reminders** — `reviewDueAt` field + `/api/cron/review-reminders` notifies author and watchers when overdue

## Navigation & Graph
- [x] **Timeline view** — articles grouped by year on a visual spine at `/timeline`, with category filter and search
- [x] **Graph clustering** — label-propagation community detection in `ArticleGraph.tsx`; cluster hulls drawn via D3 polygonHull
- [x] **Concept map per category** — D3 force simulation of same-category article links at `/categories/[slug]/concept-map`

## Search & AI
- [x] **Natural language Q&A** — `/api/ai/qa` sends top-5 relevant articles as context to Claude; returns answer + sources
- [x] **Cross-wiki federated search** — `/api/federated-search` queries all enabled FederatedPeer deployments in parallel with 5s timeout

## Editor & Content
- [x] **Macro / shortcode system** — `{{macroName|arg}}` syntax expanded at render time; CRUD UI at `/admin/macros`
- [x] **Excalidraw whiteboards** — dynamically imported Excalidraw canvas with 2s debounce autosave at `/whiteboards/[slug]`

## Notifications
- [x] **Per-article change digest** — `/api/cron/digest` creates Notification per watcher for articles revised in past 7 days

## Developer & API
- [x] **Custom metadata schemas** — typed fields (text, number, date, boolean, select) per category; CRUD at `/admin/metadata-schemas`
