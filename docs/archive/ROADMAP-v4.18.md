# Roadmap Archive — v4.18

All items completed and shipped in v4.18.

## UI & Navigation
- [x] **Keyboard shortcuts overlay** — press `?` anywhere to open a categorized modal listing all keyboard shortcuts (navigation, article page, editor, general); enhanced `KeyboardShortcuts` component with grouped layout
- [x] **Reading mode** — distraction-free reading toggle on article pages; hides header and sidebar, widens content; state persisted in `localStorage`; toggle via button or `R` hotkey; `ReadingModeToggle` component + `globals.css` `data-reading-mode` attribute

## Analytics & Discovery
- [x] **Activity heat map** — GitHub-style contribution calendar on `/activity` showing daily edit count over the past 52 weeks; `ActivityHeatmap` client component + `/api/activity/heatmap` route
- [x] **Wiki stats page** — public `/stats` page showing total articles, total words, categories, tags, contributors, revisions, weekly active users, and top-5 contributor leaderboard

## Collaboration
- [x] **Article lock** — `ArticleLock` model; when a user opens the editor a 10-minute lock is acquired; other users see a "Being edited by X" warning banner with force-unlock for admins; `ArticleLockGuard` component + `/api/articles/[id]/lock` GET/POST/DELETE
- [x] **Revision restore** — "restore" button on the article history page; `POST /api/articles/[id]/revisions/[revId]/restore` snapshots current content then applies old revision; `RestoreRevisionButton` client component

## Content
- [x] **Mentions feed** — `/mentions` page shows all discussion threads containing `@username` for the logged-in user; requires auth; sorted by recency
- [x] **Cover image focal point** — `coverFocalX` / `coverFocalY` Float fields on Article; focal-point picker (`FocalPointPicker` component) in edit form; `object-position` applied to cover image in `InfoboxDisplay`
