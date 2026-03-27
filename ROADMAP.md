# Roadmap

Planned features and improvements for Wiki App, starting from v4.19.

Previous completed work:
- [v1.0–v4.11 archive](docs/archive/ROADMAP-v1-v4.md)
- [v4.12 archive](docs/archive/ROADMAP-v4.12.md)
- [v4.13 archive](docs/archive/ROADMAP-v4.13.md)
- [v4.14 archive](docs/archive/ROADMAP-v4.14.md)
- [v4.15 archive](docs/archive/ROADMAP-v4.15.md)
- [v4.16 archive](docs/archive/ROADMAP-v4.16.md)
- [v4.17 archive](docs/archive/ROADMAP-v4.17.md)
- [v4.18 archive](docs/archive/ROADMAP-v4.18.md)

Have an idea? Open a [GitHub Issue](https://github.com/mohammed-alsalhi/wiki-app/issues) to discuss it.

---

## v4.24

- [x] Search query analytics — log queries, surface top searches and zero-result terms in admin
- [x] Image captions — Tiptap image node with optional caption rendered below
- [x] Bulk Markdown export — download entire wiki or a category as a `.zip` of `.md` files
- [x] Notification preferences UI — granular per-user control over in-app/email notifications

## v4.25

- [x] Custom editor snippets — admin-defined reusable text blocks insertable via `/snippet` command
- [x] TOC generator in editor — toolbar button to insert/update a linked table of contents block
- [x] Per-article 30-day view sparkline — daily view trend chart in the article stats panel
- [x] Site-wide announcement banner — admin can pin a global notice to all pages

## v4.26

- [x] Category watchlist — follow a category to be notified when new articles are added
- [x] Inline AI text rewrite — select text in the editor, get AI rewrite suggestions
- [x] Article freshness badge — colour-coded indicator showing how recently an article was edited
- [x] Reading streak tracker — consecutive reading days tracked and shown on the dashboard

## v4.27

- [x] Category merge tool — admin tool to merge two categories, reassigning all articles
- [x] Word-count distribution chart — admin histogram of article lengths across the wiki
- [x] Keyboard shortcut customization — per-user reassignment of shortcuts in settings
- [x] Wiki creation timeline — visual page showing when each article was first created

## v4.28

- [x] Command palette — `Cmd+K` / `Ctrl+K` fuzzy-search articles and actions from anywhere
- [x] Find & replace in editor — inline match highlighting with Replace / Replace All
- [x] Copy as Markdown — one-click copy of article title + raw Markdown to clipboard
- [x] 500-feature backlog — `FEATURES_BACKLOG.md` documents planned features by theme

## v4.29

- [x] Glossary system — admin CRUD for terms + aliases; public A-Z browse at `/glossary`
- [x] Glossary hover cards — term occurrences in articles get dotted underlines with hover definitions
- [x] Reading level badge — Flesch Reading Ease score shown as colour-coded badge in article header
- [x] Pull quote blocks — styled centred blockquote node in editor, via slash command or `Mod+Shift+Q`

## v4.30

- [x] Heading permalink links — ¶ anchor links on all article headings for deep-linking
- [x] Category statistics admin page — sortable table of article count, word totals, last-edit per category
- [x] In Brief summary box — `summaryShort` displayed as highlighted callout at top of article
- [x] On This Day fix — corrected stale Prisma query field

## v4.31

- [ ] AI alt-text generation — automatically suggest alt text for uploaded images
- [ ] Grammar/style check panel — writing quality suggestions in the editor sidebar
- [ ] Outline builder — AI-generated article outline from a title/summary
- [ ] Q&A assistant — ask questions about a specific article and get cited answers
