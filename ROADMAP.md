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

- [x] Smart typography — `--` → em dash, `...` → ellipsis, straight quotes → curly quotes as you type
- [x] Browser-local reading history — last 50 articles visited, accessible at `/history`
- [x] Last-visit badge — "You read this X ago" shown on return visits to an article
- [x] Sticky article header — slim floating bar with title + Edit/Top links after scrolling past heading

## v4.32

- [x] Outline builder — AI-assisted panel in editor generates H2/H3 sections from title; three styles; inserts headings into document
- [x] AI alt-text suggestions — image caption prompt pre-filled from filename via `/api/ai/alt-text`
- [x] Article Q&A widget — collapsible ask-a-question panel on article pages backed by `/api/ai/qa`

## v4.33

- [x] Edit suggestion system — reader-facing form + admin review/accept/reject workflow
- [x] Reader retention analytics — per-article scroll depth funnel at `/admin/retention`
- [x] Referrer tracking — `document.referrer` logged per article per day; admin view at `/admin/referrers`

## v4.34

- [x] Superscript / subscript toolbar buttons
- [x] Text highlighting with 6-color picker
- [x] Accordion / FAQ collapsible blocks via `/accordion` slash command
- [x] Two-column layout block via `/two-column layout` slash command
- [x] YouTube / Vimeo responsive video embeds via `/youtube` slash command
- [x] GitHub Gist embed via `/github gist` slash command

## v4.35

- [x] Satisfaction rating widget — 5-star per-session rating on article pages, avg + count display
- [x] Hot articles widget — "Trending this week" panel on homepage from last-7-day view counts
- [x] Article todo list — per-article editor checklist with check-off, add, delete; admin-only editing
- [x] Tag management admin page — rename, recolor, delete tags with inline edit UI at `/admin/tags`
- [x] Word-count range filter in search — min/max word count filter in advanced search sidebar

## v4.36

- [x] AI grammar check panel — collapsible panel below editor; checks grammar/style via AI (or heuristic fallback); Apply buttons fix inline issues
- [x] Bulk tag operations — "Add tag" and "Remove tag" in the article list batch action bar
- [x] Scroll position memory — article scroll position saved to localStorage; restored on return visits
- [x] Search advanced filter enhancements — word count already wired; grammar API endpoint at `/api/ai/grammar`
