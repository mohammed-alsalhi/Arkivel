# Roadmap Archive — v4.17

This file archives all completed roadmap items shipped in v4.17.
For the active roadmap see [`/ROADMAP.md`](../../ROADMAP.md).

---

## Content & Editor
- [x] **Named article snapshots** — `ArticleSnapshot` model; `POST /api/articles/[id]/snapshots` creates a labeled manual snapshot of the current content; listed on the history page; `DELETE` removes a snapshot (admin only)
- [x] **Article co-authors** — `ArticleCoAuthor` model; `POST /api/articles/[id]/co-authors` links users as contributors; co-author names shown in the article byline; `DELETE` removes a co-author (admin only)
- [x] **Article flags** — `flags String[]` field on Article; `PUT /api/articles/[id]/flags` replaces the flag array; `ArticleFlags` component renders orange badge chips near the article title

## Discovery & Navigation
- [x] **Tag synonyms** — `TagSynonym` model storing alternate aliases per tag; API at `/api/tags/[id]/synonyms` (GET/POST/DELETE); alias is unique across all tags
- [x] **Discussion index** — `/discussions` page listing all top-level discussion threads across every article with filtering by article slug and author; shows reply counts

## Article Page
- [x] **Floating table of contents** — `TableOfContentsFloat` client component uses `IntersectionObserver` to highlight the active section; fixed sidebar visible only on `xl:` breakpoints (≥1280 px)
- [x] **Article stats panel** — `ArticleStatsPanel` collapsible component shows reads, reactions, word count, article age, and quality score/label on every article page

## Admin & Governance
- [x] **Revision history export** — `GET /api/articles/[id]/revisions/export` returns all revisions as a UTF-8 CSV (revision ID, date, author, edit summary); admin-only; file named `[slug]-revisions.csv`
