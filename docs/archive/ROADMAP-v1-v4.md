# Roadmap Archive — v1.0 through v4.11

This file archives all completed roadmap items from the initial release through v4.11.0.
For the active roadmap see [`/ROADMAP.md`](../../ROADMAP.md).

---

## Completed (v1.0 – v3.0)

<details>
<summary>All features shipped through v3.0.0</summary>

### Testing & Quality
- [x] Unit test suite with Vitest for utility functions and API routes
- [x] Integration tests for auth flows and article CRUD
- [x] E2E tests with Playwright for critical user journeys
- [x] Automated accessibility audit (axe-core) in CI pipeline

### Editor Improvements
- [x] Slash command menu (`/` to insert blocks, headings, callouts)
- [x] Drag-and-drop block reordering
- [x] Inline comments and annotations
- [x] Markdown paste detection (paste Markdown, render as rich text)
- [x] Collapsible/toggle blocks

### Content Features
- [x] Article templates marketplace (community-contributed templates)
- [x] Scheduled publishing (set a future publish date)
- [x] Article archival with soft-delete and restore
- [x] Content linting (warn about broken links, missing excerpts, orphaned articles)
- [x] Bulk tag editing from tag management page

### Search & Discovery
- [x] PostgreSQL `tsvector` full-text search for better performance at scale
- [x] Search filters UI (by category, tag, date range, author, status)
- [x] Saved searches and search history
- [x] Fuzzy matching and typo tolerance

### User Experience
- [x] Mobile-responsive layout improvements
- [x] Customizable dashboard / home page widgets
- [x] User preferences (default editor mode, notification settings, locale)
- [x] Inline article previews on wiki link hover
- [x] Keyboard-driven command palette (Ctrl+K)

### Collaboration
- [x] Real-time collaborative editing improvements (cursor presence, conflict resolution)
- [x] Article review workflow with reviewer assignment and inline feedback
- [x] Change request / suggestion mode (propose edits without direct write access)
- [x] Activity feed showing recent edits across the wiki

### Infrastructure
- [x] S3/R2-compatible object storage as alternative to Vercel Blob
- [x] Redis caching layer for search and frequently accessed articles
- [x] Database read replicas for horizontal scaling
- [x] Incremental static regeneration for published articles

### API & Integrations
- [x] API v2 with pagination cursors and field selection
- [x] OAuth2/OIDC login (Google, GitHub)
- [x] Zapier/Make integration triggers
- [x] CLI tool for managing wiki content from the terminal

### Advanced Features
- [x] Fine-grained RBAC (per-category and per-article permissions)
- [x] Custom theme builder with live preview
- [x] AI-assisted features (auto-summarize, suggest related articles, content generation)
- [x] Multi-wiki support (multiple wikis from a single deployment)
- [x] Full offline mode with sync on reconnect

### Editor (v1–v2)
- [x] Footnotes and citations
- [x] Code block syntax highlighting
- [x] Drag-and-drop image placement
- [x] Table editing (merge cells, resize columns)
- [x] Wiki link autocomplete

### Content (v1–v2)
- [x] Article templates per category
- [x] Multi-language support
- [x] Revision history with inline diff
- [x] Related articles (auto-suggested)
- [x] Table of contents generation
- [x] Article status workflow (draft / review / published)
- [x] Pinned/featured articles per category
- [x] Semantic wiki links with relationship types

### Organization
- [x] Nested tags (hierarchical like categories)
- [x] Custom sort order for articles within categories
- [x] Breadcrumb navigation
- [x] Tag cloud

### Search & Discovery (v1–v2)
- [x] Relevance-ranked full-text search with AND logic
- [x] Random article button
- [x] Article graph visualization (D3)

### Users & Auth
- [x] Multi-user authentication
- [x] User profiles with contribution history
- [x] Role-based permissions (admin, editor, viewer)
- [x] Watchlist and notifications

### API & Integration (v1–v2)
- [x] Public REST API with documentation
- [x] Webhooks for article events
- [x] RSS/Atom feeds
- [x] MediaWiki XML import

### Infrastructure (v1–v2)
- [x] CI/CD pipeline with GitHub Actions (lint, type-check, build, test, E2E)
- [x] Database migration system
- [x] Docker Compose setup
- [x] Performance monitoring dashboard
- [x] Plugin/extension system

### Map
- [x] Multiple maps per wiki
- [x] Layer toggling
- [x] Map area search and filtering
- [x] Zoomable map with detail levels

</details>

---

## Completed (v4.0 – v4.11)

<details>
<summary>All features shipped in v4.0 through v4.11.0</summary>

### AI Intelligence Layer
- [x] **Semantic search via embeddings** — `pgvector` index for conceptually related articles
- [x] **Knowledge gap detector** — surfaces heavily-referenced but unwritten topics
- [x] **Smart duplicate detection** — semantic similarity warning on new article drafts
- [x] **AI writing coach** — reading level meter, passive-voice alerts, clarity score
- [x] **Auto-generated article summaries** — one-sentence and three-sentence summaries
- [x] **Category gap suggestions** — AI proposes sub-topics not yet written

### Learning & Retention
- [x] **Learning paths** — ordered article sequences with reader progress tracking
- [x] **Spaced-repetition flashcards** — Anki-style schedule via email or push notification
- [x] **"Quiz me on this"** — AI-generated multiple-choice and short-answer questions
- [x] **Personal reading progress** — % completion ring on category pages
- [x] **Article complexity score** — Flesch-Kincaid, jargon density, estimated reading time
- [x] **Daily digest** — morning email/push summarising watchlist changes

### Rich Content Blocks
- [x] **Mermaid diagrams** — flowcharts, sequence diagrams, ER diagrams, Gantt charts
- [x] **KaTeX math** — `$inline$` and `$$block$$` LaTeX rendering
- [x] **Interactive data tables** — CSV/JSON blocks with sort, filter, search, chart toggle
- [x] **Decision tree blocks** — branching-logic editor rendered as interactive flowchart
- [x] **Voice dictation** — Web Speech API dictation into cursor position
- [x] **"Present" mode** — Reveal.js slideshow from article headings at `/present/slug`

### Discovery & Navigation
- [x] **Smart collections** — live-updating collections defined by tag/category/author query
- [x] **Session reading trail** — collapsible "you were here" panel
- [x] **Personal bookmarks with sticky notes** — private freetext notes on bookmarks
- [x] **Shareable reading lists** — named, ordered, public-link article lists
- [x] **Guided "Explore" mode** — semantic random-walk with breadcrumb trail
- [x] **"Today I Learned" board** — community TIL snippets archived monthly

### Collaboration 2.0
- [x] **Expert badges per category** — designated domain experts with highlighted bylines
- [x] **Knowledge bounties** — request articles; editors claim and fulfill
- [x] **Article forking** — personal draft branch with merge proposal
- [x] **Peer-review certification** — "Verified" badge after two expert approvals
- [x] **"This helped me" signal** — reaction strip with aggregate score

### Integrations & Import/Export
- [x] **Obsidian two-way sync** — vault import/export with optional watch-folder via CLI
- [x] **Notion import** — OAuth import preserving tables, images, callouts
- [x] **Export as ePub / PDF / DOCX** — single article or full category
- [x] **Slack / Discord bot** — `/wiki <query>` returns formatted results; auto-post on publish
- [x] **Embeddable article widget** — `<script>` drop-in for external sites
- [x] **GitHub Issues / Jira ticket linking** — live issue status on article pages

### Analytics & Health
- [x] **Per-article scroll-depth heatmap** — shows which sections get read vs. dropped
- [x] **Search gap dashboard** — top zero-result queries with "create article" shortcuts
- [x] **Staleness score** — freshness badge + report sorted by staleness × view-count
- [x] **Contributor achievements** — automated badges for edits, streaks, category expertise
- [x] **Reader path analysis** — "readers also visited" panel + Sankey diagram
- [x] **Wiki health score** — composite metric: link coverage, freshness, stub ratio, etc.

### Accessibility & Internationalisation
- [x] **Full RTL support** — Arabic, Hebrew, Persian with mirrored layout
- [x] **Machine translation drafts** — one-click DeepL/Google Translate to `ArticleTranslation`
- [x] **Dyslexia-friendly reading mode** — OpenDyslexic font, spacing, tint
- [x] **Article audio narration** — browser TTS or ElevenLabs API audio player
- [x] **Complete keyboard navigation** — every element keyboard-accessible; skip-to-content link

</details>
