# Roadmap

This document outlines planned features and improvements for Wiki App. Contributions toward any of these are welcome.

---

## Completed (v1.0 - v3.0)

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

## Planned (v4.0+)

### AI Intelligence Layer

- [x] **Semantic search via embeddings** — use `pgvector` to index article embeddings; find conceptually related articles even when no keywords match
- [x] **Knowledge gap detector** — AI scans all articles and surfaces topics that are heavily referenced (via wiki links) but have no article yet; shown as a prioritised "create these" list
- [x] **Smart duplicate detection** — warn editors when a new article draft is semantically close to existing content, with a similarity score and diff
- [x] **AI writing coach** — inline suggestions while editing: reading level meter, passive-voice alerts, clarity score, and "this section seems incomplete" nudges
- [x] **Auto-generated article summaries** — one-sentence and three-sentence summaries stored separately, used in previews, search snippets, and the daily digest
- [x] **Category gap suggestions** — on any category page the AI proposes sub-topics that fit the theme but haven't been written yet

### Learning & Retention

- [x] **Learning paths** — editors curate ordered sequences of articles into named tracks (e.g. "Onboarding", "Advanced Topic"); readers see progress through a path
- [x] **Spaced-repetition flashcards** — highlight any passage and add it to a personal flashcard deck; the app surfaces cards on an Anki-style schedule via email or push notification
- [x] **"Quiz me on this"** — AI generates multiple-choice and short-answer questions from any article for self-testing; scores are logged to the user profile
- [x] **Personal reading progress** — track which articles you have read per category; show a % completion ring on category pages
- [x] **Article complexity score** — Flesch-Kincaid readability, median sentence length, jargon density, and section-by-section estimated reading time shown alongside each article
- [x] **Daily digest** — morning email/push notification summarising articles on your watchlist that changed in the past 24 hours, with a bullet-point diff

### Rich Content Blocks

- [x] **Mermaid diagrams** — fenced ` ```mermaid ``` ` blocks render flowcharts, sequence diagrams, ER diagrams, and Gantt charts inline; editable in a split-pane code+preview
- [ ] **Excalidraw whiteboards** — embed a live Excalidraw canvas inside any article; the SVG is stored in object storage and updated on save
- [x] **KaTeX math** — `$inline$` and `$$block$$` LaTeX math rendering with copy-as-LaTeX support
- [x] **Interactive data tables** — paste a CSV or JSON array into a special block; readers get a sortable, filterable, searchable table with optional chart toggle
- [x] **Decision tree blocks** — a branching-logic tree editor (condition → yes/no branches) rendered as an interactive flowchart; useful for troubleshooting guides
- [x] **Voice dictation** — microphone button in the toolbar triggers Web Speech API dictation directly into the cursor position
- [x] **"Present" mode** — one click converts any article's headings and content blocks into a Reveal.js slideshow; sharable via a `/present/slug` URL

### Discovery & Navigation

- [x] **Smart collections** — define a collection by a tag/category/author query; it stays live and auto-updates as matching articles are created or edited
- [ ] **Concept map per category** — an auto-generated, force-directed mind-map of all articles in a category and their wiki-link relationships; zoomable and clickable
- [x] **Session reading trail** — a collapsible "you were here" panel showing the last N articles visited in this browser session with forward/back navigation
- [x] **Personal bookmarks with sticky notes** — bookmark any article with a private freetext note visible only to you; listed on your profile
- [x] **Shareable reading lists** — any user can build a named, ordered list of articles and share a public link; useful for onboarding packs or curated references
- [x] **Guided "Explore" mode** — a "take me somewhere interesting" button that random-walks through the wiki following semantic similarity rather than pure chance, showing a breadcrumb of the path taken
- [x] **"Today I Learned" board** — community-curated TIL snippets (max 280 chars + article link) posted by any user; filterable by tag; archived monthly

### Collaboration 2.0

- [ ] **Expert badges per category** — admins designate domain experts; their byline is highlighted on articles and their edits are marked "expert reviewed" in history
- [ ] **Knowledge bounties** — any user can request an article on a specific topic; editors can claim and fulfill the request; requester is notified and the bounty is linked from the new article
- [ ] **Article forking** — branch a complete rewrite as a personal draft without touching the live article; propose a merge when ready; diff is shown to admins before accepting
- [ ] **@mentions in discussions** — `@username` in article discussion comments triggers an in-app and optional email notification to that user
- [ ] **Peer-review certification** — after two or more expert reviewers approve an article, it receives a "Verified" badge visible on the article header and in search results
- [ ] **"This helped me" signal** — a thumbs-up / reaction strip at the foot of every article; aggregate score and top reaction shown on article cards and in analytics

### Integrations & Import/Export

- [ ] **Obsidian two-way sync** — import a vault (Markdown + front matter), and export any subset back; optional watch-folder for continuous sync via the CLI tool
- [ ] **Notion import** — authenticate with Notion OAuth and import a page tree with inline images, tables, and callouts preserved
- [ ] **Export as ePub / PDF / DOCX** — single article or entire category; preserves headings, images, footnotes, and syntax highlighting
- [ ] **Slack / Discord bot** — `/wiki <query>` returns a formatted search result; articles can be auto-posted to a channel on publish
- [ ] **Embeddable article widget** — a `<script>` tag drop-in that renders any article as a live-updating card on external sites (docs sites, internal portals, etc.)
- [ ] **GitHub Issues / Jira ticket linking** — attach issue URLs to articles; the article shows live status (open/closed/in-progress) via the respective API

### Analytics & Health

- [ ] **Per-article scroll-depth heatmap** — aggregate scroll positions from readers to show which sections actually get read vs. where people drop off
- [ ] **Search gap dashboard** — admin view of the most-searched queries that returned zero results, sorted by frequency; each row has a "create article" shortcut
- [ ] **Staleness score** — articles not updated in N months (configurable) get a freshness badge; a report sorts by staleness × view-count to prioritise what needs updating
- [ ] **Contributor achievements** — automated badges: First Edit, 100 Edits, Category Expert (top editor in a category), Streak (7/30/90 days of consecutive edits), etc.
- [ ] **Reader path analysis** — after reading article X, where do readers go next? Logged as events and surfaced as a "readers also visited" panel and a Sankey diagram in analytics
- [ ] **Wiki health score** — a composite dashboard metric: link coverage, average freshness, stub ratio, search gap ratio, and accessibility audit pass rate; shown as a score card on the admin home

### Accessibility & Internationalisation

- [ ] **Full RTL support** — Arabic, Hebrew, Persian language articles with mirrored layout, correct bidirectional text handling in the editor, and RTL-aware CSS
- [ ] **Machine translation drafts** — one-click "Translate to…" via DeepL or Google Translate API creates a draft `ArticleTranslation`; editors can then review and publish
- [ ] **Dyslexia-friendly reading mode** — toggle OpenDyslexic font, increased letter/word spacing, pastel background tint, and wider line measure; persisted in user preferences
- [ ] **Article audio narration** — browser TTS (or optional ElevenLabs API) generates a playable audio version of any article; player appears below the title
- [ ] **Complete keyboard navigation** — every interactive element reachable and operable without a mouse; focus-visible styles throughout; skip-to-content link on every page

---

Have an idea that's not listed here? Open a [GitHub Issue](https://github.com/mohammed-alsalhi/wiki-app/issues) to discuss it.
