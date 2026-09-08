# Roadmap Archive — v4.13

This file archives all completed roadmap items shipped in v4.13.
For the active roadmap see [`/ROADMAP.md`](../../ROADMAP.md).

---

## Content & Editor
- [x] **Article transclusion** — `{{embed:slug}}` syntax resolved at render time via `resolveTransclusions()` in `src/lib/wikilinks.ts`; expands to a styled `<div class="transclusion">` block containing the target article's HTML
- [x] **Inline text annotations** — highlight any passage and save a private or shared margin note; stored in new `Annotation` model; API at `/api/annotations`; `AnnotationLayer` client component on every article page

## Navigation & Discovery
- [x] **Smart redirects** — new `Redirect` model; slug changes in the article PUT handler auto-create `Redirect` records; article page checks the table on 404 and redirects automatically; admin UI at `/admin/redirects`
- [x] **Article stub tracker** — `/admin/stubs` lists articles below a configurable word threshold with stub badges and "Expand" links; threshold adjustable via query param

## Quality & Analytics
- [x] **Article quality score** — composite 0–100 score (word count, links, images, freshness, excerpt) via `/api/articles/[id]/quality-score`; `ArticleQualityBadge` client component; admin overview at `/admin/quality` sorted worst-first
- [x] **AI revision summaries** — "What changed?" button on history page calls `/api/articles/[id]/revisions/summarize` (Claude Haiku); `RevisionSummaryButton` client component shows inline expandable summary

## Personalization
- [x] **Reading goals** — `/api/reading-goals` GET/PUT; weekly article reading target stored in `UserPreference.data.readingGoal`; `ReadingGoalWidget` component with SVG progress arc and streak counter

## Admin & Bulk Operations
- [x] **Bulk article operations** — `/api/articles/bulk` POST; supports `setStatus`, `setCategory`, `addTag`, `removeTag` on multiple article IDs; `BulkActionBar` sticky bottom component for multi-select workflows
