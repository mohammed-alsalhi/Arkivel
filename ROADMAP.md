# Roadmap

This document outlines planned features and improvements for Wiki App. Contributions toward any of these are welcome.

## Near-Term

### Testing & Quality
- [ ] Unit test suite with Vitest for utility functions and API routes
- [ ] Integration tests for auth flows and article CRUD
- [ ] E2E tests with Playwright for critical user journeys
- [ ] Automated accessibility audit (axe-core) in CI pipeline

### Editor Improvements
- [ ] Slash command menu (`/` to insert blocks, headings, callouts)
- [ ] Drag-and-drop block reordering
- [ ] Inline comments and annotations
- [ ] Markdown paste detection (paste Markdown, render as rich text)
- [ ] Collapsible/toggle blocks

### Content Features
- [ ] Article templates marketplace (community-contributed templates)
- [ ] Scheduled publishing (set a future publish date)
- [ ] Article archival with soft-delete and restore
- [ ] Content linting (warn about broken links, missing excerpts, orphaned articles)
- [ ] Bulk tag editing from tag management page

## Medium-Term

### Search & Discovery
- [ ] PostgreSQL `tsvector` full-text search for better performance at scale
- [ ] Search filters UI (by category, tag, date range, author, status)
- [ ] Saved searches and search history
- [ ] Fuzzy matching and typo tolerance

### User Experience
- [ ] Mobile-responsive layout improvements
- [ ] Customizable dashboard / home page widgets
- [ ] User preferences (default editor mode, notification settings, locale)
- [ ] Inline article previews on wiki link hover
- [ ] Keyboard-driven command palette (Ctrl+K)

### Collaboration
- [ ] Real-time collaborative editing improvements (cursor presence, conflict resolution)
- [ ] Article review workflow with reviewer assignment and inline feedback
- [ ] Change request / suggestion mode (propose edits without direct write access)
- [ ] Activity feed showing recent edits across the wiki

## Long-Term

### Infrastructure
- [ ] S3/R2-compatible object storage as alternative to Vercel Blob
- [ ] Redis caching layer for search and frequently accessed articles
- [ ] Database read replicas for horizontal scaling
- [ ] Incremental static regeneration for published articles

### API & Integrations
- [ ] API v2 with pagination cursors and field selection
- [ ] OAuth2/OIDC login (Google, GitHub, custom SAML)
- [ ] Zapier/Make integration triggers
- [ ] CLI tool for managing wiki content from the terminal

### Advanced Features
- [ ] Fine-grained RBAC (per-category and per-article permissions)
- [ ] Custom theme builder with live preview
- [ ] AI-assisted features (auto-summarize, suggest related articles, content generation)
- [ ] Multi-wiki support (multiple wikis from a single deployment)
- [ ] Full offline mode with sync on reconnect

---

## Completed (v1.0 - v2.1)

<details>
<summary>All features shipped through v2.1.0</summary>

### Editor
- [x] Footnotes and citations
- [x] Code block syntax highlighting
- [x] Drag-and-drop image placement
- [x] Table editing (merge cells, resize columns)
- [x] Wiki link autocomplete

### Content
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

### Search & Discovery
- [x] Relevance-ranked full-text search with AND logic
- [x] Random article button
- [x] Article graph visualization (D3)

### Users & Auth
- [x] Multi-user authentication
- [x] User profiles with contribution history
- [x] Role-based permissions (admin, editor, viewer)
- [x] Watchlist and notifications

### API & Integration
- [x] Public REST API with documentation
- [x] Webhooks for article events
- [x] RSS/Atom feeds
- [x] MediaWiki XML import

### Infrastructure
- [x] CI/CD pipeline with GitHub Actions (lint, type-check, build)
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
