# Roadmap

Planned features and improvements for Arkivel, starting from v4.19.

Previous completed work:
- [v1.0–v4.11 archive](docs/archive/ROADMAP-v1-v4.md)
- [v4.12 archive](docs/archive/ROADMAP-v4.12.md)
- [v4.13 archive](docs/archive/ROADMAP-v4.13.md)
- [v4.14 archive](docs/archive/ROADMAP-v4.14.md)
- [v4.15 archive](docs/archive/ROADMAP-v4.15.md)
- [v4.16 archive](docs/archive/ROADMAP-v4.16.md)
- [v4.17 archive](docs/archive/ROADMAP-v4.17.md)
- [v4.18 archive](docs/archive/ROADMAP-v4.18.md)

Have an idea? Open a [GitHub Issue](https://github.com/mohammed-alsalhi/arkivel/issues) to discuss it.

---

## v4.71.2

- [x] Collapsed article tables - editor, article, and shared UI tables now use zero-spaced collapsed borders so adjacent cells read as one merged grid
- [x] Presentation table hardening - `/present/[slug]` keeps article tables in native table layout with fixed columns, wrapped cell content, and no slide-stage overflow
- [x] Table regression coverage - responsive presentation QA now includes a real HTML table and asserts collapsed borders stay inside the viewport

## v4.71.1

- [x] Presentation layout hardening - `/present/[slug]` now reserves separate progress, topbar, slide-stage, and footer regions so content cannot overlap deck controls
- [x] Scrollable slide stage - long titles, tall body content, code, tables, images, and embeds stay contained inside the slide viewport
- [x] Responsive controls - overview, slide count, dots, keyboard hint, and previous/next buttons wrap or stack cleanly on narrow screens
- [x] Presentation regression QA - responsive shell tests now mock a long presentation and assert that slide content does not collide with top or bottom chrome
- [x] CI shell alignment - homepage and command-palette e2e tests now match the compact search trigger, phone Browse drawer, and case-insensitive `Ctrl+K` / `Cmd+K` behavior
- [x] Wiki-link alias regression - unit tests now mock alias lookups so broken-link coverage follows the alias-aware resolver path

## v4.71.0

- [x] Canon Trails - `/trails` turns the wiki into guided reader routes through strongest canon, recent work, deep pages, and repair paths
- [x] Route engine - trail stops are built from live wiki links, backlinks, categories, recency, word depth, revisions, discussions, reads, views, reactions, and bookmarks
- [x] Trails JSON feed - `/api/trails` exposes the same route report for demos, automation, and future clients
- [x] Reader-first positioning - Canon Trails is linked from the sidebar, home page, command palette, sitemap, feature docs, help docs, and API docs
- [x] README documentation polish - the repository front page now reads like an actual documentation entry with logo, badges, button-style links, quickstart, deployment, configuration, core experiences, and API references

## v4.70.0

- [x] Canon Atlas - `/atlas` turns the wiki into a live world map with territories, article signals, story threads, and a flagship dossier
- [x] Continuity pressure - atlas metrics surface stub, category, tag, thread, excerpt, and infobox gaps as direct work queues
- [x] Atlas JSON feed - `/api/atlas` exposes the same territories, signals, threads, dossier, continuity, and next moves for demos or automation
- [x] Sidebar visibility - Canon Atlas and Knowledge cockpit now sit in the primary Browse block instead of being buried lower in the navigation
- [x] Responsive atlas QA - homepage, command palette, sitemap, docs, and responsive shell coverage include the new atlas surface

## v4.69.0

- [x] Knowledge cockpit - `/intelligence` now opens with a live article constellation, readiness radar, and impact simulator before the 20-engine grid
- [x] Graph constellation - top connected articles are plotted from real wiki-link data with direct links and selected-node readouts
- [x] Readiness radar - operational health is broken into readiness, graph, structure, freshness, trust, audience, and momentum axes
- [x] Impact simulator - editors can model gains from resolving stubs, orphans, broken links, stale pages, taxonomy debt, and verification debt
- [x] Product promotion - home actions, feature docs, help docs, architecture notes, and responsive tests now treat the command center as a flagship workspace

## v4.68.0

- [x] Knowledge Command Center - `/intelligence` turns the wiki into an operational cockpit with 20 live quality, graph, canon, audience, and editorial engines
- [x] Mission readiness scoring - stubs, orphans, stale pages, taxonomy gaps, broken links, and featured canon roll into a single readiness percentage
- [x] Next-best-work queue - prioritized actions point editors toward the most valuable fixes instead of leaving them to hunt through separate dashboards
- [x] Intelligence API feed - `/api/intelligence` exposes the same 20-engine report for external dashboards and automation
- [x] Product-surface integration - sidebar, homepage, command palette, sitemap, docs, versioning, and responsive QA now include the command center

## v4.67.1

- [x] Preliminary logo integration - public brand assets now provide the sidebar mark, mobile header mark, app icon, and metadata image
- [x] Header search simplification - the top-bar search is now a compact trigger that expands only when the reader asks for it
- [x] Browse affordance polish - the phone navigation opens the sidebar through a clearer Browse grid control instead of a generic menu icon
- [x] Local shell fallbacks - public announcement, article, category, and tag lists resolve to empty collections when the local database is unavailable
- [x] Branding documentation - README, architecture, design, feature, and help references describe the logo configuration and calmer search pattern

## v4.67.0

- [x] Main page redesign - home now acts as a compact wiki front page with stats, quick actions, featured content, browse directory links, recent updates, and sidebar modules
- [x] Shared page shell standard - page headers, deks, action clusters, compact lists, and category trees have reusable CSS primitives
- [x] Core browse route refresh - Articles, Categories, Search, Dashboard, Help, and Features use the same responsive page header structure
- [x] Home module alignment - New Articles, On This Day, and Trending widgets now use the same portal/list treatment as the rest of the app

## v4.66.2

- [x] Article action rail rethink - primary Navigate, Collect, and Share actions stay visible while Read and Tools move into compact disclosure menus
- [x] Article tabbar reset - article section tabs now use dedicated shell styles instead of sharing the in-content tab block CSS
- [x] Serif reading default - article body text defaults to serif, and the font picker now offers Serif, Sans, and Mono
- [x] Dek wrapping polish - article excerpts can use more of the header width with cleaner wrapping on wide shells

## v4.66.1

- [x] Article action panel polish - the article controls now render as a compact wrapping toolbar instead of a tiled grid with empty rows
- [x] Read controls containment - font, width, theme, and reading-mode controls are constrained so they wrap without clipping the right edge
- [x] Patch release documentation - version, changelog, roadmap, design guidance, feature docs, and help pages document the refined article action standard

## v4.66

- [x] Article page shell refresh - article display now uses a dedicated hero header, grouped action panel, taxonomy footer, and cleaner notice stack
- [x] Article action redesign - Navigate, Collect, Share, Read, and Tools controls are grouped in a responsive action panel instead of stacked toolbar rows
- [x] Reading surface polish - summary, flags, freshness, review notices, backlinks, fork actions, and category/tag context now use shared semantic UI primitives
- [x] Responsive article layout - tabs, infoboxes, table of contents, action groups, link chips, and mobile typography are constrained for phone through wide desktop widths

## v4.65

- [x] Unified search response handling — header instant search, search page, command palette, wiki-link autocomplete, split-view pickers, and article edit fallback now consume the same `/api/search` response contract
- [x] Command and navigation registry — command destinations and focused workspace route detection are centralized so global commands, sidebar toggles, and mobile navigation behavior stay aligned
- [x] Responsive discovery surfaces — search filters, semantic search results, article filters, batch bars, and listing tables wrap or scroll intentionally across phone, tablet, laptop, and wide desktop widths
- [x] Responsive QA guardrails — unit tests cover search/navigation helpers and Playwright checks core shell routes across phone, tablet, laptop, and wide desktop breakpoints

## v4.64

- [x] UI restandardization — shared compact wiki primitives for titles, buttons, icon buttons, inputs, selects, toolbars, panels, dropdowns, chips, tables, empty states, article cards, article tools, auth forms, and admin/listing surfaces
- [x] Responsive app shell — desktop/tablet sidebar remains the dense navigation spine, while phone layouts get a safe-area-aware bottom navigation for Home, Search, Create, Recent, and Menu
- [x] Focused workspace navigation — dense canvas routes such as `/ask`, `/graph`, `/split`, `/map`, and `/present/*` suppress the bottom nav and keep a compact top menu so the primary workspace keeps full height
- [x] Overlay and modal hardening — dropdowns, notifications, AI chat, synthesis, speed reader, quiz mode, article Q&A, data tables, and map controls wrap or clamp instead of overlapping across mobile, tablet, and desktop widths
- [x] Documentation/version discipline — changelog, roadmap, architecture/design docs, feature references, and in-app help/features pages updated alongside the package version bump

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

## v4.37

- [x] PWA manifest — `manifest.ts` makes the wiki installable as a home-screen app
- [x] External link click tracking — outbound links logged via `sendBeacon`; admin page at `/admin/external-links`
- [x] Prefetch on hover — `PrefetchArticleLinks` prefetches `/articles/*` pages on hover for instant navigation

## v4.38

- [x] Font size preference — S/M/L/XL reading size control on article pages; persisted to localStorage
- [x] Focus paragraph mode — dims non-hovered paragraphs in article content; toggle with persistence
- [x] Saved search alerts — `alertEnabled` toggle on saved searches; daily cron at `/api/cron/search-alerts` sends in-app notifications for new matches
- [x] Saved searches settings page — manage saved searches with alert toggle at `/settings/saved-searches`

## v4.50

- [x] Bulk JSON export — `/api/export/json`; downloads all articles as structured JSON (admin only)
- [x] Per-article analytics tab — `/articles/[slug]/analytics`; 30-day view chart + summary stats
- [x] Series progress tracker — ArticleSeriesNav shows "X of N read" from browser reading history

## v4.49

- [x] Image lightbox — click any article image to view full-size; close with Esc or click outside
- [x] AI expand section — "AI Expand" toolbar button; select text, click to expand into more detail

## v4.48

- [x] Article width preference — narrow/default/full toggle in article toolbar; persisted to localStorage
- [x] Local timezone timestamps — `LocalDate` client component renders dates in the user's browser timezone
- [x] Category growth chart — `/admin/category-growth`; stacked bar chart of new articles per category per month (last 12 months)

## v4.47

- [x] Auto-save indicator — edit form auto-saves draft to localStorage after 2 s of inactivity; shows "Unsaved changes" / "Draft saved" status
- [x] Character count — shown alongside word count in article byline (abbreviated for large articles)
- [x] Did-you-mean suggestions — zero-result searches suggest the closest matching article title
- [x] Tag cloud page — `/tags/cloud` shows tags sized by article count; linked from All Tags

## v4.46

- [x] Featured article badge — admins can mark articles as Featured; gold star badge on article page
- [x] AI title suggestions — "AI suggest" in edit form returns 5 clickable alternative titles; click to apply

## v4.45

- [x] Session management — view/revoke active sessions at `/settings/sessions`; device and IP info
- [x] AI tag suggestions — "AI suggest" button in article edit form auto-adds relevant tags
- [x] AI category suggestions — "AI suggest" button picks best-fit category from content
- [x] Writing velocity — admin weekly bar chart of words added over last 12 weeks

## v4.44

- [x] Scheduled announcements — set future go-live datetime; hidden until that time
- [x] Read-only mode — admin toggle; blue site-wide banner; blocks non-admin edits
- [x] Revision pruning — admin tool; preview then delete oldest revisions beyond threshold
- [x] User activity log — admin page; select user to see full revision history

## v4.43

- [x] Cleanup tags — admin flags (needs-images, needs-expansion, etc.) on articles; orange notice banner on article page
- [x] Article adoption — mark article as abandoned; adoption banner + one-click claim for editors
- [x] Copy as plain text — button in article toolbar strips HTML and copies to clipboard

## v4.42

- [x] Theme customizer — HSL hue slider for accent color; live preview; persisted to localStorage
- [x] Font preference — serif/sans/mono selector for article body; injects override CSS; persisted
- [x] Article quick notes — private per-article notes stored in browser localStorage; save/delete controls
- [x] Maintenance mode — admin toggle at `/admin/maintenance`; yellow site-wide banner when active

## v4.41

- [x] High-contrast accessibility mode — pure black/white/yellow theme toggle in article toolbar; persisted
- [x] Text-only mode — hides images/media in article content; toolbar toggle; persisted
- [x] Content warning tags — CW badges (spoilers, violence, mature, etc.) on articles; dismissible amber banner; editable in article form
- [x] Content gap analysis — admin page showing zero/low-result searches to identify missing wiki topics

## v4.40

- [x] Reading ETA — `~X min left` in article byline, updates dynamically while scrolling
- [x] Night reading mode — warm sepia theme toggled from article toolbar, persisted to localStorage
- [x] Search history — last 20 searches in localStorage; shown as chips when query is empty

## v4.60

- [x] Ask my wiki — streaming AI oracle at /ask; semantic search + SSE streaming; source attribution; multi-turn
- [x] Knowledge synthesis — AI synthesizes all articles in a category into an overview; one-click to article
- [x] Cinematic presentation mode — full rewrite of /present/[slug]; animations, overview grid, fullscreen

## v4.59

- [x] Button / CTA blocks — `/button` slash command, configurable label/URL/style
- [x] Divider with label blocks — `/divider` slash command, optional centered label
- [x] AI revision summary generation — "AI summarize" button auto-fills edit summary
- [x] Article quiz mode — "Quiz me" button generates 5 AI questions, full flashcard UI

## v4.63

- [x] Wiki Health Dashboard — `/health` page with health score, 7 issue dimensions, per-article fix links
- [x] AI Auto-fill from Title — template-based full article generation in new article editor
- [x] Category Overview Generator — AI-written intro prose button on all category pages
- [x] Article Audio Narration — browser TTS player with pause/stop/progress on all articles
- [x] AI Fact-Check — claim-by-claim verification with Verified/Plausible/Uncertain/Questionable verdicts
- [x] Smart Editor Suggestions — live panel: unlinked mentions, related articles, AI-suggested missing sections

## v4.62

- [x] Daily Digest — personalised in-app briefing at `/digest`
- [x] Image → Wiki Article — Claude Vision reads photo/screenshot and generates article
- [x] YouTube → Wiki Article — transcript extraction → structured article
- [x] Historical Timeline — `/timeline/historical` year-extraction timeline with decade scrubber
- [x] Semantic Search Toggle — semantic mode on search page
- [x] AI Tutor Mode — Socratic chat tutor on article pages

## v4.61

- [x] Adaptive Reading Level — Beginner / Technical / ELI5 on-the-fly AI rewrite
- [x] Spaced Repetition Review Queue — SM-2 scheduling with flip-card UI at `/review`
- [x] Import from URL — AI extracts and formats web page content into wiki article
- [x] Knowledge Coverage Map — category health grid at `/coverage`
- [x] Structured Claims — mark text as certain/probable/disputed with tooltip badges
- [x] Real-time Collaborative Editing — Yjs-powered simultaneous editing with cursor presence

## v4.58

- [x] Tabbed content blocks — `/tabs` slash command, interactive tab panels
- [x] Gallery grid blocks — `/gallery` slash command, responsive image grid
- [x] Conversational AI wiki assistant — floating chat panel on article pages
- [x] AI article generation from outline — "AI Generate" toolbar button fills headings with content

## v4.57

- [x] Smart URL paste → auto-link in editor
- [x] Typewriter scrolling mode
- [x] Short-article merger suggestions admin page
- [x] Sidebar position preference (left / right)

## v4.39

- [x] Speed reader (RSVP) — flashes one word at a time with ORP highlighting; 150/250/400/600 WPM; modal in article toolbar
- [x] Article blame view — paragraph-level authorship tab at `/articles/[slug]/blame`; colour-coded by revision
- [x] Article polls — admins attach polls to articles; session-based voting; vote-to-reveal results; admin close/reopen/delete
