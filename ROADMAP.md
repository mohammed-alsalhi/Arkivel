# Roadmap

Planned features and improvements for Wiki App, starting from v4.12.
Completed history is archived in [`docs/archive/ROADMAP-v1-v4.md`](docs/archive/ROADMAP-v1-v4.md).

Have an idea not listed here? Open a [GitHub Issue](https://github.com/mohammed-alsalhi/wiki-app/issues) to discuss it.

---

## Discussions & Collaboration
- [ ] **Nested discussion threads** — replies to comments with threading and collapse
- [ ] **@mentions in discussions** — `@username` triggers in-app and email notification

## Personalization
- [ ] **Personal scratchpad** — private, unsearchable scratch article per user for rough notes
- [ ] **Custom user homepage** — drag-and-drop widget grid: recent edits, watchlist, reading progress, pinned articles

## Content Pipeline & Governance
- [ ] **Admin audit log** — immutable log of all destructive actions (deletes, role changes, bulk edits) with timestamp and user; filterable and exportable
- [ ] **Kanban article board** — drag-to-promote view of articles by status (draft → review → published)
- [ ] **Article expiry / auto-archive** — set a TTL on time-sensitive articles; auto-move to draft and notify owner on expiry
- [ ] **Scheduled review reminders** — assign a "review by" date; overdue articles surface in a dashboard and notify assigned editors

## Navigation & Graph
- [ ] **Timeline view** — articles with a date metadata field plotted on a zoomable chronological axis
- [ ] **Graph clustering** — auto-detect densely linked article communities; highlight on hover
- [ ] **Concept map per category** — auto-generated force-directed mind-map of articles and their wiki-link relationships

## Search & AI
- [ ] **Natural language Q&A** — type a question and get a direct answer extracted from matching articles, shown above normal results
- [ ] **Cross-wiki federated search** — search across multiple wiki deployments from one query with ranked, deduplicated results

## Editor & Content
- [ ] **Macro / shortcode system** — reusable parameterised content snippets (e.g. `{{warning|text}}`), managed from admin panel
- [ ] **Excalidraw whiteboards** — live Excalidraw canvas embedded in articles; SVG stored in object storage

## Notifications
- [ ] **Per-article change digest** — weekly email summarising all edits to watchlist articles with paragraph-level diffs

## Developer & API
- [ ] **Custom metadata schemas** — admins define typed fields (date, URL, select, number) per category; values queryable via API
