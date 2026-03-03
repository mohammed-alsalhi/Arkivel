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

Have an idea that's not listed here? Open a [GitHub Issue](https://github.com/mohammed-alsalhi/wiki-app/issues) to discuss it.
