# Roadmap

This document outlines planned features and improvements for Wiki App. Contributions toward any of these are welcome.

## Near-Term

### Editor Improvements
- [x] Footnotes and citations
- [x] Code block syntax highlighting
- [x] Drag-and-drop image placement within content
- [x] Undo/redo keyboard shortcut indicators in toolbar
- [x] Better table editing (merge cells, resize columns)

### Content Features
- [x] Article templates per category (auto-fill infobox + content skeleton)
- [x] Multi-language support for article content
- [x] Article versioning comparison improvements (inline diff view)
- [x] Related articles section (auto-suggested based on shared categories/tags)
- [x] Table of contents generation from headings

### Organization
- [x] Nested tags (tag hierarchy like categories)
- [x] Custom sort order for articles within categories
- [x] Article status workflow (draft → review → published)
- [x] Pinned/featured articles per category

## Medium-Term

### Search & Discovery
- [x] Full-text search with PostgreSQL `tsvector` for better performance
- [x] Search filters (by category, tag, date range)
- [x] Search result highlighting
- [x] Random article button

### User System
- [x] Multi-user authentication (sign up / sign in)
- [x] User profiles with contribution history
- [x] Role-based permissions (admin, editor, viewer)
- [x] Edit watchlist and notifications

### API & Integration
- [x] Public REST API with documentation
- [x] Webhooks for article create/update/delete events
- [x] RSS/Atom feed for recent changes
- [x] Import from MediaWiki XML dumps

## Long-Term

### Advanced Features
- [x] Real-time collaborative editing (CRDT or OT-based)
- [x] Semantic wiki links with relationship types
- [x] Graph visualization of article connections
- [x] Full-text PDF/EPUB export of entire wiki or category
- [x] Plugin/extension system for custom functionality

### Infrastructure
- [x] Automated test suite (unit, integration, e2e)
- [x] CI/CD pipeline with GitHub Actions
- [x] Database migration system (instead of `db push`)
- [x] Docker Compose setup for one-command local deployment
- [x] Performance monitoring and analytics dashboard

### Map Enhancements
- [x] Multiple maps per wiki
- [x] Map layer toggling (political boundaries, terrain, etc.)
- [x] Map area search and filtering
- [x] Zoomable map with different detail levels

---

Have an idea that's not listed here? Open a [GitHub Issue](https://github.com/mohammed-alsalhi/wiki-app/issues) to discuss it.
