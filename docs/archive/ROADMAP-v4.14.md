# Roadmap Archive — v4.14

This file archives all completed roadmap items shipped in v4.14.
For the active roadmap see [`/ROADMAP.md`](../../ROADMAP.md).

---

## Content & Editor
- [x] **Article series** — `ArticleSeries` + `ArticleSeriesMember` Prisma models; series index at `/series`; series detail at `/series/[slug]`; `ArticleSeriesNav` component shows prev/next on article pages; admin CRUD at `/admin/series`; API at `/api/series` and `/api/series/[id]`
- [x] **Article duplication** — `POST /api/articles/[id]/duplicate` creates a copy with "(copy)" suffix, unique slug, same content/tags/category, status set to draft
- [x] **Article word goal** — `wordGoal` integer field on Article; `WordGoalBadge` component shows progress bar on article page until goal is met

## AI & Automation
- [x] **Auto-tagging** — `POST /api/articles/[id]/suggest-tags` sends article content to Claude Haiku and returns 3-6 tag suggestions as a JSON array

## Admin & Governance
- [x] **Content calendar** — `/admin/calendar` monthly grid showing scheduled (`publishAt`) and published articles; prev/next month navigation; orange = scheduled, green = published
- [x] **Pinned discussion comments** — `isPinned` boolean on Discussion model; `POST /api/discussions/[id]/pin` toggles pin with max-3 enforcement per article

## Discovery & Navigation
- [x] **"See also" curated links** — `SeeAlso` Prisma model; API at `/api/articles/[id]/see-also`; `SeeAlsoSection` server component rendered at bottom of article pages

## Article Page
- [x] **Article changelog panel** — `ArticleChangelogPanel` client component shows collapsible last-5-edits with summaries, authors, and diff links; wired into article page
