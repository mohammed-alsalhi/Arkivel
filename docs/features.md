# Features

A complete overview of everything the wiki can do. For step-by-step instructions see [Help & Features Guide](help.md).

---

## Writing & Editing

- **Rich text editor** — Tiptap-based WYSIWYG editor with a calm icon-first toolbar, reusable feature trays, selection actions, claim marking, contextual table controls, slash commands, collapsed-border tables, and drag-and-drop block reordering
- **Markdown mode** — toggle between rich text and raw Markdown at any time
- **Editor feature trays** — Insert, Review, and Outline reveal advanced blocks, readiness signals, structure tools, grammar checks, and writing analysis only when needed
- **Selection actions** — selected text exposes rewrite, expand, wiki-link, URL-link, and footnote actions inline
- **Insert tray** — one-click scaffolds, reusable callout/metadata/timeline/infobox/decision/research/worldbuilding templates, tables, data tables, Mermaid diagrams, math, decision trees, collapsibles, and live query blocks
- **Editor control contract** — `/api/customization` exposes reusable editor primitive metadata, extension points, block templates, and shortcut scopes for self-hosters and trusted plugins
- **Contextual table lab** — row, column, merge, split, header, and delete-table controls appear only while editing a table
- **Slash commands** — type `/` for Mermaid diagrams, math blocks, Excalidraw drawings, data tables, decision trees, headings, and more; includes user snippets via `/snippet`
- **Inline AI rewrite** — select text and click "AI Rewrite" in the toolbar; optionally provide an instruction; requires `OPENAI_API_KEY`
- **Editor snippets** — define reusable HTML blocks at `/settings/snippets`; insert via slash-command menu
- **TOC generator** — toolbar button extracts all headings and inserts a linked table of contents at the cursor
- **Mermaid diagrams** — flowcharts, sequence diagrams, Gantt charts, and more rendered inline
- **Math (KaTeX)** — inline `$...$` and block `$$...$$` math expressions
- **Excalidraw drawings** — embed interactive whiteboard sketches directly in articles
- **Data tables** — paste CSV or JSON to create sortable, filterable tables with CSV download
- **Decision trees** — define yes/no trees as JSON; renders as an interactive SVG
- **Pull quotes** — large centred serif blockquote for emphasis; insert via `/pull quote` or `Mod+Shift+Q`
- **Smart typography** — auto-converts `--` → em dash, `...` → ellipsis, and straight quotes to curly quotes as you type
- **Outline builder** — AI-assisted panel generates H2/H3 section headings from the article title; three style modes; inserts headings into the editor
- **AI alt-text suggestions** — image caption prompt pre-filled from filename via `/api/ai/alt-text`
- **Footnotes & citations** — inline footnote references auto-numbered via CSS counters
- **Syntax highlighting** — code blocks with language detection and theme-aware colours
- **Voice dictation** — click the microphone button to insert speech at the cursor
- **Article templates** — Person, Place, Event, Thing, Group templates with infobox scaffolding
- **Image upload** — drag-and-drop or toolbar insert; stored via Vercel Blob; optional caption displayed as styled `<figcaption>` below the image
- **Auto-revisions** — every save snapshots the previous state automatically

---

## Knowledge Organization

- **Wiki links** — `[[Article Name]]` syntax with autocomplete; broken links shown in red
- **Backlinks** — every article shows which other articles link to it
- **Semantic relations** — link articles with typed relations (is-part-of, related-to, etc.)
- **Hierarchical categories** — tree-structured categories in the sidebar; each article belongs to one
- **Hierarchical tags** — many-to-many; browse all at `/tags` with a size-scaled tag cloud
- **Workspaces** — `Wiki` is the workspace boundary for v4.82+, with bootstrap profiles, visibility, default roles, invitations, settings, marketplace selections, and scoped article/search/category/tag APIs
- **Sync manifests** — `/api/sync-manifests` and `docs/sync-manifests.md` define preview-safe space moves between Arkivel installs with source/target metadata, checksums, dry-run reports, signed snapshot planning, and private/public visibility rules
- **External references** — `/api/external-references` and `docs/external-references.md` define imported/mirrored provenance, broken external reference diagnostics, and public index planning that excludes private content
- **Archive mirrors** — `/api/archive-mirrors` and `docs/archive-mirror-workflows.md` define read-only archive snapshots, private mirrors, selected-space transfers, repeated-sync conflict notes, and the pre-v5 federation decision checkpoint
- **Role templates** — personal admin, team owner, docs maintainer, editor, reviewer, contributor, viewer, and public reader templates define the permission matrix for pages, APIs, exports, webhooks, plugins, customization, and marketplace actions
- **Collaboration controls** — co-authors, edit locks, review assignments, comments, mentions, notifications, workspace digests, and contribution summaries follow workspace-aware policies
- **Collaboration UX** — live editing exposes presence names, connection/reconnect/offline states, conflict warnings, last-saved indicators, notification routing metadata, mobile editor QA, and accessibility checkpoints
- **Editorial governance** — review due dates, required reviewers, approval thresholds, change-request cycles, claim queues, verification expiry, and owner gaps feed release-blocker risk summaries
- **Redirects** — set a "Redirect to" slug to forward old URLs automatically
- **Disambiguation** — notice on articles with ambiguous titles
- **Article status** — Draft, Review, Published; non-published articles hidden from non-admins
- **Pinned articles** — pin important articles to the top of category pages
- **Custom metadata schemas** — define typed fields (text, number, date, boolean, select) per category at `/admin/metadata-schemas`
- **Concept maps** — visual relationship graph per category at `/categories/[slug]/concept-map`
- **Article graph** — D3 force-directed graph of all wiki-link connections at `/graph`
- **Tag synonyms** — define alternate aliases per tag (e.g. "JS" → "JavaScript") via `/api/tags/[id]/synonyms`

---

## Discovery & Navigation

- **Full-text search** — AND-logic multi-word search with relevance v2 ranking, facets, synonym/stemming expansion, stale/review/verification signals, and admin explain mode
- **Search API contract** — `/api/search/contract` publishes stable typed result shapes for articles, categories, tags, discussions, revisions, and marketplace items plus privacy, retention, and webhook planning metadata
- **Unified search surfaces** — the header search, search page, command palette, wiki-link autocomplete, split view, and edit fallback all use the same search response contract
- **Responsive app shell** — desktop/tablet users get the dense collapsible sidebar, while phone layouts get a safe-area-aware bottom nav for Home, Search, Create, Recent, and Browse; focused workspace pages keep their full-height canvas by using the compact top menu instead
- **Main page front page** — `/` combines live wiki stats, featured content, browse directory links, recent updates, and compact sidebar modules as the canonical wiki entry point
- **Shared page headers** — browse, discovery, reference, and personal pages use the same responsive header/dek/action structure so downstream pages wrap consistently
- **Brand mark and compact search** — the preliminary Arkivel mark appears in the sidebar/mobile header, while global search opens from a compact trigger so the top bar stays calm
- **Canon Atlas** — `/atlas` turns the wiki into a live map with category territories, article signals, story threads, a flagship dossier, continuity pressure, atlas moves, and a JSON feed
- **Canon Trails** — `/trails` turns live wiki links, backlinks, categories, freshness, depth, and engagement into guided reading routes for canon, recent work, deep pages, and repair paths
- **Knowledge Command Center** — `/intelligence` runs 20 live engines for mission readiness, editorial pressure, graph health, broken links, stubs, taxonomy debt, featured canon, translation surface, reader demand, verification debt, and cleanup flags, then opens with a live article constellation, readiness radar, and impact simulator
- **Command palette navigation** — `Cmd+K` / `Ctrl+K` opens grouped destinations across navigation, discovery, personal, reference, and admin surfaces
- **Discovery engines** — `/api/discovery` reports duplicate-page, unresolved-question, canon-conflict, glossary-gap, orphan-topic, topic-cluster, continue-reading, admin-action, and dashboard-widget opportunities
- **Word-count search filter** — advanced search includes min/max word count range to find articles by length
- **Search analytics** — every query is logged; admin page at `/admin/search-analytics` shows daily volume, top queries, and zero-result queries to find content gaps
- **30-day view sparkline** — article stats panel shows a mini bar chart of daily page views for the past 30 days
- **Article freshness badge** — colour-coded badge (Fresh/Recent/Aging/Stale) next to the "Last edited" date on every article
- **Reading streak** — consecutive days a user has read articles; shown as a dashboard widget
- **Federated search** — fans out to peer wiki instances and merges results under "Results from other wikis"
- **Explore mode** — guided walk through articles using semantic similarity at `/explore`
- **Random article** — `/random` jumps to a random published article
- **Recent changes** — timeline of all edits grouped by date at `/recent-changes`
- **Activity feed** — stream of recent contributions at `/activity`
- **Timeline view** — chronological view of articles at `/timeline`
- **Smart collections** — saved searches with filters (tags, category, author, date range) at `/collections`
- **Bookmarks** — save articles with optional notes at `/bookmarks`
- **Reading lists** — ordered sequences of articles, shareable via link at `/reading-lists`
- **TIL (Today I Learned)** — post short (280-char) notes at `/til`
- **Scratchpad** — persistent personal scratch space at `/scratchpad`
- **Session reading trail** — breadcrumb of your current session's navigation at the bottom of each article
- **Reading history** — browser-local log of the last 50 articles visited, with relative timestamps, at `/history`
- **Last-visit badge** — articles show "You read this X ago" on return visits
- **Sticky article header** — slim floating bar with title, Edit and Top links appears after scrolling past the article heading
- **Article Q&A** — collapsible panel at the bottom of each article; ask questions and get answers grounded in wiki content with cited sources
- **Edit suggestions** — readers can propose corrections via a "Suggest edit" button; admin review at `/admin/suggestions` supports accept, reject, comment, assign, convert-to-task, spam score, and moderation state
- **Reader retention analytics** — per-article scroll depth distribution funnel at `/admin/retention`
- **Referrer tracking** — incoming traffic sources tracked per article per day; aggregated at `/admin/referrers`
- **Satisfaction star rating** — 1–5 star widget on every article; per-session upsert; average and count shown in real time
- **Hot articles widget** — "Trending this week" panel on the homepage sidebar showing top-5 most-viewed articles in last 7 days
- **Article todo checklist** — per-article task list; readers check off items, admins add/delete tasks inline
- **AI grammar & style check** — Review tray disclosure analyses for errors, warnings, and style; Apply buttons fix inline; heuristic fallback when AI unavailable
- **Scroll position memory** — article scroll saved to localStorage; restored on return visits; capped at 50 articles
- **Bulk tag operations** — add or remove a tag from multiple articles at once via the article list batch bar
- **Offline/PWA** — web app manifest and service worker enable install prompts, cached offline reading for recently opened public pages, stale indicators, and narrow retry queues for eligible article work
- **External link click tracking** — outbound link clicks logged per article; aggregated at `/admin/external-links`
- **Prefetch on hover** — internal article links prefetched on mouseover for near-instant navigation
- **Font size preference** — S/M/L/XL reading size selector on article pages; persisted to localStorage
- **Focus paragraph mode** — dims non-hovered paragraphs for distraction-free reading; toggle persisted
- **Saved search alerts** — per-search notification toggle; daily cron notifies users when new articles match saved queries; managed at `/settings/saved-searches`
- **Reading ETA** — live `~X min left` in the article byline; updates as you scroll; disappears on completion
- **Night reading mode** — warm sepia dark theme toggled from the article toolbar; persisted to localStorage
- **Search history** — last 20 successful searches in localStorage; clickable chips on the search page when idle; Clear button
- **High-contrast mode** — pure black/white/yellow accessibility theme; toolbar toggle; persisted to localStorage
- **Text-only mode** — hides images and media in article content; toolbar toggle; persisted
- **Content warning tags** — CW labels (spoilers, violence, mature, etc.) on articles; dismissible amber banner; admin-configurable in edit form
- **Content gap analysis** — `/admin/content-gaps` shows zero-result and low-result search queries grouped by frequency
- **Theme customizer** — HSL hue slider in article toolbar for live accent color customization; persisted to localStorage
- **Font preference** — article body defaults to Serif, with a toolbar dropdown for Serif / Sans / Mono overrides; persisted
- **Article quick notes** — collapsible private note per article; browser localStorage only; save and delete controls
- **Maintenance mode** — admin toggle at `/admin/maintenance`; shows site-wide yellow banner when active
- **Cleanup tags** — admin flags (needs-images, needs-expansion, needs-citations, stub, outdated) on articles; orange notice banner on article page; set in edit form
- **Article adoption** — mark article as abandoned in edit form; article page shows orange adoption banner; one-click adopt clears the flag
- **Copy as plain text** — button in article toolbar strips HTML and copies article body to clipboard
- **Scheduled announcements** — set a future go-live datetime on announcements; hidden until that time
- **Read-only mode** — admin toggle; blue banner; blocks non-admin article edits when active
- **Revision pruning** — admin tool at `/admin/prune-revisions`; dry-run preview then delete oldest revisions beyond threshold
- **User activity log** — admin page at `/admin/user-activity`; select user to see full revision history
- **Session management** — `/settings/sessions` shows all active sessions with device/IP info; revoke individual or all other sessions
- **AI tag suggestions** — "AI suggest" button in article edit form; suggests existing tags based on content; falls back to keyword match
- **AI category suggestions** — "AI suggest" button on category picker; auto-selects best-fit category from article content
- **AI title suggestions** — "AI suggest" next to the title field; returns 5 clickable alternative encyclopedic titles; click any to apply
- **Featured article badge** — admins can mark articles as Featured; gold star badge shown in article title area
- **Auto-save indicator** — edit form auto-saves draft to localStorage after 2 s inactivity; "Unsaved changes" / "Draft saved" status above editor
- **Editor reliability contract** — `docs/editor-troubleshooting.md` covers collaborative sync, recoverable draft snapshots, offline warnings, autosave repair, paste/embed handling, health diagnostics, and large-document fixtures
- **Character count** — shown alongside word count in article byline; abbreviated for large articles
- **Did-you-mean suggestions** — zero-result search suggests the closest matching article title as a clickable link
- **Tag cloud** — `/tags/cloud`; tags sized proportionally by article count; linked from All Tags page
- **Article width preference** — narrow/default/full toggle in article toolbar; persisted to localStorage
- **Local timezone timestamps** — `LocalDate` client component renders dates in the user's browser timezone
- **Category growth chart** — `/admin/category-growth`; stacked bar chart of new articles per category per month (last 12 months)
- **Image lightbox** — click any image in article content to open full-size overlay; close with Esc or click outside; caption from alt text
- **AI expand section** — "AI Expand" in editor toolbar; select text, click to expand into more detailed prose via AI; replaces selection
- **Smart URL paste** — pasting a plain URL auto-creates a hyperlink; selection gets URL as href, otherwise URL inserted as linked text
- **Typewriter scrolling mode** — "Typewriter" toggle in editor toolbar; cursor stays vertically centred as you type; persisted to localStorage
- **Short-article merger suggestions** — `/admin/short-articles` lists stubs under 100 words with up to 3 merge targets per article
- **Sidebar position preference** — sidebar footer button swaps sidebar between left and right; persisted to localStorage
- **Tabbed content blocks** — `/tabs` slash command; interactive two-tab block; panels are editable inline; stacked view in editor
- **Gallery grid blocks** — `/gallery` slash command; responsive auto-fill image grid with captions and hover zoom
- **AI wiki assistant** — floating chat button on every article page; multi-turn context-aware Q&A over article and related wiki content
- **AI article generation from outline** — "AI Generate" in editor toolbar; reads headings and fills in encyclopedic paragraph content per section
- **Button / CTA blocks** — `/button` slash command inserts a styled call-to-action button with configurable label, URL, and style (primary / secondary / outline)
- **Divider with label blocks** — `/divider` slash command inserts a horizontal rule with an optional centered text label
- **AI revision summary** — "AI summarize" button next to the edit summary field; compares old vs. new content and auto-generates a concise edit summary sentence
- **Article quiz mode** — "Quiz me" in the article tools bar; AI generates 5 multiple-choice questions; full flashcard UI with answer reveal, score, and attempt recording
- **Ask my wiki — AI oracle** — full-page conversational AI at `/ask`; semantic search retrieves the most relevant articles per query; streaming token-by-token answers; multi-turn conversation; source attribution
- **Knowledge synthesis** — "Synthesize" on category pages; AI reads all articles and synthesises a comprehensive overview; preview modal; "Create as new article" one-click
- **Presentation mode** — every article has a "Present" button; `/present/[slug]` is a cinematic dark slideshow with reserved top/bottom chrome, a scrollable slide stage, animated transitions, slide overview, fullscreen, and dot navigation
- **Bulk JSON export** — `/api/export/json`; downloads all articles as structured JSON (admin only)
- **Per-article analytics** — `/articles/[slug]/analytics`; 30-day view chart + reads, reactions, revisions summary (admin only)
- **Series progress tracker** — series navigation shows "X of N read" from browser reading history
- **Series table of contents** — collapsible panel on article pages listing all entries in a series with read indicators and current position highlighted
- **Vertical timeline blocks** — `/timeline` slash command inserts a CSS-driven chronological timeline with date labels and accent-coloured dot connectors
- **Twitter / X post embeds** — `/twitter` slash command inserts a styled card with a link to the post
- **Bulk JSON article import** — admin import page (`/admin/import`) accepts a JSON array of articles (up to 500); auto-creates tags, resolves categories, skips existing slugs, creates revision snapshots
- **Editor zen mode** — toggle above the editor content label hides sidebar/header/tabs and widens editor to full width; press Esc to exit
- **Word frequency cloud** — client-side tag cloud at the bottom of every article showing top-40 most frequent non-stop words sized by frequency
- **Dead-end article finder** — `/admin/dead-ends`; lists published articles with no outgoing wiki links so editors can add cross-references
- **Duplicate content detector** — `/admin/duplicate-content`; Jaccard similarity across published articles; shows pairs ≥ 55% similar with edit links
- **Orphan article finder** — `/admin/orphans`; lists published articles that no other article links to; grouped by category; linked from admin sidebar
- **Writing session goal** — set a word-count target in the editor status bar; real-time progress bar, elapsed timer, and green completion indicator
- **Long article suggestions** — `/admin/long-articles`; lists published articles over a configurable word threshold (default 5,000) for potential splitting
- **Random article** — `/api/random` redirects to a random published article; optional `?category=slug` param; sidebar link; category-page button
- **New articles feed widget** — homepage sidebar widget showing the most recently created published articles
- **Top referrers dashboard** — `/admin/referrers`; top 30 referrer domains with percentage bars and 7/30/90d time windows
- **Tag usage trends** — `/admin/tag-trends`; heat-map table of new articles per tag per month (last 12 months)
- **Analytics CSV export** — `/api/export/analytics`; admin-only CSV download of all articles with read, reaction, revision counts
- **Writing velocity** — `/admin/writing-velocity`; weekly bar chart of words added over last 12 weeks
- **Speed reader (RSVP)** — modal speed-reading mode; 150/250/400/600 WPM; ORP pivot highlighting; progress bar; accessible from article toolbar
- **Article blame view** — `/articles/[slug]/blame` shows each paragraph colour-coded by the revision that introduced it; editor, date, and edit summary in sidebar
- **Article polls** — admins create polls on any article; session-based one-vote-per-user; vote counts revealed post-vote; admin close/reopen/delete controls
- **Table of contents** — auto-generated for articles with multiple headings
- **Popularity leaderboard** — `/popular` ranks published articles by reads × 2 + reactions
- **Article comparison** — side-by-side view of two live articles at `/compare?a=slug1&b=slug2`
- **"You might also like"** — sidebar widget on article pages suggesting up to 5 articles sharing the same tags
- **Contributor leaderboard** — `/leaderboard` ranks users by total revision count
- **Discussion index** — `/discussions` lists all open threads across every article
- **Activity heat map** — GitHub-style contribution calendar on `/activity` showing daily edit count over the past 52 weeks
- **Wiki stats page** — public `/stats` shows total articles, words, categories, tags, contributors, revisions, and top contributors
- **Mentions feed** — `/mentions` lists all discussions mentioning `@username` for the logged-in user

---

## Personal Dashboard

A personalizable homepage at `/dashboard` with a draggable widget grid.

- Available widgets: Recent articles, Watchlist, Recent edits, Random article, Scratchpad preview, Wiki stats, Notifications
- Toggle widgets on/off and reorder via "Customize" mode
- Layout saved to your user preferences and restored on next visit

---

## Learning & Retention

- **Learning paths** — curated ordered sequences of articles with per-path progress tracking at `/learning-paths`
- **Flashcards** — create decks from articles; SM-2 spaced repetition with 0–5 grading at `/flashcards`
- **AI quizzes** — Claude generates 5 multiple-choice questions from any article for self-testing
- **Reading progress** — mark articles as read; category pages show a completion ring
- **Presentation mode** — any article opens as a full-screen slideshow at `/present/[slug]`; each H2/H3 is a slide, and long content, code, and native collapsed tables stay within the slide stage rather than covering controls
- **Watchlist digest** — optional daily email summary of watched article changes at `/watchlist/digest`

---

## Article Page

- **Article hero header** — title, category, excerpt, freshness, verification, reading metrics, return-visit badge, and co-authors are grouped into a single scannable header
- **Grouped action panel** — Navigate, Workflow, Collect, and Share stay in a slim action rail, while dense Read and Tools controls open from disclosure menus
- **Taxonomy footer** — category and tags render as wrapping chips at the end of the article rather than pipe-separated text
- **Responsive article shell** — article tabs, infoboxes, collapsed article tables, table of contents, backlinks, and action groups wrap or scroll intentionally on narrow screens
- **Reading time estimator** — "~X min read" computed at 200 wpm displayed in every article's metadata line
- **Draft share links** — admins generate a secret-token URL (`/share/[token]`) so non-admins can preview a draft without publishing
- **Expiry warning banner** — yellow inline banner when an article's *reviewDueAt* is within 30 days
- **Mark as verified** — admin button stamps *lastVerifiedAt*; date shown as a ✓ badge in the article byline
- **Article series navigation** — prev/next links between articles belonging to a series
- **See also** — curated links to related articles, managed by admins
- **Changelog panel** — collapsible list of the last 5 edits with authors and diff links
- **Word goal progress** — progress bar shown until the article reaches its target word count
- **Floating table of contents** — sticky sidebar TOC with active-section highlighting on wide screens (≥1280 px)
- **Article stats panel** — collapsible panel showing reads, reactions, word count, quality score, and article age
- **Article flags** — admin-assigned labels (e.g. "Needs images", "Outdated") displayed as orange badge chips near the title
- **Article co-authors** — link additional contributors; co-author names appear in the byline
- **Named snapshots** — manually save a labeled snapshot beyond automatic revisions
- **Reading mode** — distraction-free reading toggle (button or `R` key) that hides header and sidebar
- **Reading level badge** — Flesch Reading Ease score shown as a colour-coded badge in the article header
- **Glossary hover cards** — defined terms in article text are underlined; hovering shows a floating definition card
- **In Brief summary** — when `summaryShort` is populated, shown as a highlighted callout at the top of article content
- **Heading permalink links** — ¶ anchor appears on heading hover; clicking copies the section URL to clipboard
- **Cover image focal point** — click/drag picker in the edit form sets `coverFocalX`/`coverFocalY`; applied as CSS `object-position` on cover images

---

## Collaboration

- **Real-time co-editing** — simultaneous editing with cursor presence, named participant indicators, connection states, conflict warnings, reconnect states, and last-saved copy via Yjs/y-prosemirror
- **Discussions** — threaded comments on every article; `@mention` triggers notifications; admin moderation supports reports, hidden/removed states, and reviewer-only visibility
- **Article reactions** — Helpful, Insightful, Outdated, Confusing via the reaction bar
- **Change requests** — propose edits without direct write access at `/change-requests`
- **Article forks** — propose a full rewrite; admins review/merge/reject at `/forks`
- **Review requests** — request review from an article, assign or self-assign reviewers, discuss the draft at `/reviews`, approve to publish, request changes, reject, or resubmit
- **Claim Review Mode** — editor-marked claims keep persistent review states on the article page: approved, needs source, disputed, rejected, or unreviewed, with reviewer notes and attribution
- **Knowledge bounties** — request new articles; contributors claim and fulfil them at `/bounties`
- **Expert badges** — admin-granted per category; highlighted in revision history and bylines
- **Article lock** — editor acquires a 10-min lock; others see "Being edited by X" warning; admins can force-unlock
- **Revision restore** — one-click restore to any prior revision from the history page (current state auto-saved first)
- **Article certification** — "Verified by experts" badge after review by 2+ experts
- **Contributor achievements** — First edit, 10/100 edits, streak badges, category expert; unlocked with toast notification

---

## AI Features

AI features degrade gracefully when API keys are absent.

- **Assistant packs** — `/api/assistant-packs`, `/admin/assistants`, and `docs/assistant-packs.md` expose opt-in drafting, summarization, search, claim extraction, taxonomy, alt-text, import cleanup, and review packs with per-space availability, prompt/context previews, usage/cost metadata, permissions, safety, and fallback metadata
- **Assistant governance** — `/api/assistant-packs/governance` and `docs/assistant-governance.md` publish privacy warnings, human-review requirements, citation prompts, confidence metadata, AI audit events, private/sensitive opt-outs, and the optional/non-blocking release gate
- **Writing coach** — Review tray disclosure with Flesch-Kincaid score, passive-voice count, sentence-length stats, and AI suggestions
- **Article summaries** — auto-generated on save; used as the page meta description
- **Semantic search** — vector embeddings via OpenAI blend meaning-based results with keyword matches
- **Duplicate detection** — warns when a new article is semantically similar to an existing one
- **Knowledge gaps** — surfaces referenced-but-uncreated topics at `/admin/knowledge-gaps`
- **Category suggestions** — Claude suggests topics missing from a category
- **Quiz generation** — 5 multiple-choice questions generated per article by Claude
- **Translation** — machine-translate articles via DeepL or Google Translate (requires API key)

---

## Whiteboards

Standalone Excalidraw canvases at `/whiteboards` — separate from article-embedded drawings.

- Create unlimited named canvases; auto-save to the database 2 seconds after each change
- Edit titles inline; full Excalidraw toolkit (shapes, text, arrows, images)
- Embed any whiteboard in an article via the Excalidraw slash command

---

## Web Clipping

Capture content from the web directly into the wiki without switching context.

- **Browser extension** — Manifest V3 Chrome/Edge/Brave extension; popup pre-fills title and selected text, saves as draft via the API. Install guide at `/clipper-extension`.
- **Bookmarklet** — drag-to-install JavaScript bookmark; clips any page URL + title (or selected text) as a draft article. Install at `/bookmarklet`.
- Selected text is wrapped in a blockquote with a source link; page HTML has nav/scripts stripped automatically

---

## Import & Export

### Import

- **File upload** — drag-and-drop `.md`, `.txt`, `.html`, or `.json` at `/import`
- **Obsidian vault** — upload a `.zip`; front matter and `[[wikilinks]]` resolved automatically
- **Notion** — connect integration token and import a page tree
- **Confluence** — paste or upload a Confluence HTML export; title and content extracted, macros stripped

### Export

- PDF (browser print), Markdown (`.md`), ePub 3, Word (.docx) — per article via the **Export ▾** menu
- Category export — entire category as multi-chapter ePub or zip from the admin area
- **Bulk ZIP export** — download the entire wiki (or a single category) as a `.zip` of Markdown files, one per article, organised in category subfolders with YAML front-matter

---

## APIs & Integrations

- **REST API v1** — `/api/v1/` with `X-API-Key` auth, frozen contract metadata at `/api/v1/contract`, OpenAPI JSON at `/api/v1/openapi.json`, standard v1 headers, fixture responses, and a pre-v5 migration guide. See `/api-docs`.
- **SDK types** — `/api/v1/sdk` and `docs/sdk-types.md` publish REST payload, webhook event, customization, marketplace pack, plugin manifest, export bundle, API key scope, generated client example, and sample script metadata
- **Webhook reliability** — timestamped signatures, retry metadata, delivery logs, redelivery, event schemas, replay protection, admin test sender, and local receiver docs
- **Operations dashboard** — `/admin/operations` and `/api/admin/operations?bundle=1` expose admin-only service health, queue health, slow pages, failed webhooks/imports/exports/plugins, alerts, acknowledgements, and redacted support bundles
- **Maintenance tooling** — `/admin/maintenance` and `/api/admin/maintenance/report` expose safe-upgrade checks, backup reminders, background task pausing, cleanup queues, and runbook metadata
- **Observability** — `/admin/observability`, `/api/admin/observability`, and `/api/observability/metrics` expose structured events, metric ingestion, privacy controls, and external collector guidance
- **Performance budgets** — `/admin/performance` and `/api/admin/performance` expose route p95, interaction, and bundle budgets, large-wiki fixtures, slow samples, and slow-query diagnostics
- **Cache strategy** — `/admin/cache` and `/api/admin/cache` expose cache invalidation rules, manual invalidation, stale warnings, Redis status, and CDN/Vercel/Docker/reverse-proxy recipes
- **Offline/PWA** — `/api/offline/contract`, `docs/offline-pwa.md`, `/sw.js`, and `/offline.html` define install metadata, offline cache rules, stale headers, retry queues, mobile QA, draft warnings, and privacy limits
- **Mobile polish** — `/api/mobile-polish` and `docs/mobile-polish.md` publish phone, tablet, laptop, and wide desktop QA for navigation, article actions, editor trays, admin panels, marketplace pages, and customization previews
- **Desktop research** — `/api/desktop-research` and `docs/desktop-app-research.md` document Electron, Tauri, browser PWA, and Docker Desktop packaging tradeoffs without committing desktop packaging to v5 scope
- **Accessibility finish** — `/api/accessibility` and `docs/accessibility.md` publish keyboard/focus/dialog/dropdown/control audits, screen-reader summaries, high-contrast/reduced-motion checks, contribution checklist, and release blockers
- **Migration readiness** — `/api/migration-readiness` and `docs/migration-readiness.md` publish blocking migration dry runs, backup prompts, schema compatibility reports, restore validation, representative v4 upgrade paths, and failure recovery guidance
- **Backup and restore** — `/api/backup-restore` and `docs/backup-restore.md` publish admin backup wizard sections, restore rehearsal validation, scheduled backup planning, external storage notes, and disaster-recovery drill guidance
- **Upgrade assistant** — `/api/upgrade-assistant` and `docs/v5-upgrade-planning.md` publish v5 readiness checks, pre-upgrade diagnostics, post-upgrade smoke checks, compatibility warnings, and release-note/migration doc links
- **Test quality gates** — `/api/test-quality` and `docs/test-quality-gates.md` publish expanded test surfaces, stable QA fixtures, CI matrix planning, warning policy, and release-manager dashboard planning
- **E2E smoke suite** — `/api/e2e-smoke-suite`, `e2e/smoke-suite.spec.ts`, and `docs/e2e-smoke-suite.md` publish product smoke flows, responsive smoke routes, fixture seeding, and failure screenshot/trace settings
- **Release gates** — `/api/release-gates`, `scripts/verify-docs-sync.mjs`, and `docs/release-gate-automation.md` publish release candidate gates, docs sync verification, checklist metadata, known issues, and blocker labels
- **Documentation onboarding** — `/api/documentation-onboarding`, `docs/index.md`, `docs/maintainer-guide.md`, `docs/setup-paths.md`, and `docs/troubleshooting.md` publish maintainer docs, setup paths, troubleshooting, docs IA, and practical link-test coverage
- **In-app onboarding** — `/api/in-app-onboarding`, `docs/in-app-onboarding.md`, and `examples/onboarding/demo-content-pack.json` publish the first-run checklist, guided admin setup topics, contextual help panel plan, demo content pack, and screenshot checkpoints
- **Example site recipes** — `/api/example-site-recipes`, `docs/example-site-recipes.md`, and `examples/recipes/site-recipes.json` publish setup recipes, env snippets, screenshot targets, pack recommendations, migration stories, and the v5 readiness checklist for self-host admins
- **Feature freeze** — `/api/release-freeze`, `docs/feature-freeze.md`, and `docs/known-issues.md` publish freeze policy, full rehearsal matrix, blocker labels, v5 gate ownership, and release-note draft sections
- **Release candidate one** — `/api/release-candidate-one`, `docs/release-candidate-one.md`, and `docs/rc-feedback-template.md` publish RC1 gates, deployment validation paths, starter/pack/import/export validation areas, review checklists, and feedback template
- **Final release gates** — `/api/final-release-gates` and `docs/final-release-gates.md` publish RC fixes, final beta freeze contracts, gate evidence, compatibility targets, correction windows, and stable v5 release gates
- **Security review** — `/api/security/review`, `docs/security-review.md`, and middleware headers define reviewed security surfaces, abuse-case gates, supply-chain checks, and the pre-v5 threat-model draft
- **Privacy controls** — `/api/privacy/controls` and `docs/privacy-controls.md` define deployment-mode privacy controls, retention settings, user export/deletion planning, and AI/external integration warnings
- **Marketplace security** — `/api/marketplace/security` and `docs/secure-marketplace-plugins.md` define unsafe pack rejection, blocked hooks/permissions, dangerous capability warnings, provenance requirements, and local-only installation guidance
- **Marketplace beta** — `/api/marketplace/beta` and `docs/marketplace-beta.md` publish beta metrics, featured/recent/recommended packs, collections, compatibility badges, search facets, install-intent steps, and limitations
- **Marketplace lifecycle** — `/api/marketplace/lifecycle` and `docs/marketplace-lifecycle.md` define pack states, transitions, local inventory, health checks, preview media validation, update metadata, compatibility warnings, and rollback guidance
- **Marketplace authoring** — `/api/marketplace/authoring` and `docs/marketplace-authoring.md` define pack author dashboard metadata, README generator/checklist output, Arkivel compatibility matrix rows, author quality expectations, and submission templates
- **Template marketplace** — `/api/marketplace/templates` and `docs/template-marketplace.md` define template-pack listings, included schema, category and article previews, compatibility notes, diff/merge contracts, and export-from-space fixture output
- **REST API v2** — pagination cursors, field selection
- **GraphQL API** — `/api/graphql` powered by graphql-yoga; includes GraphiQL playground. Queries for articles, categories, tags, revisions, search, and stats.
- **Customization manifest** — `/api/customization` exposes grouped brand, style preset, color theme, layout, feature flag, limit, map, reusable component, editor control, collaboration UX, public API v1, SDK type, webhook reliability, operations dashboard, maintenance tooling, observability, performance budgets, cache strategy, offline/PWA, mobile polish, accessibility finish, migration readiness, backup/restore, upgrade assistant, test quality gates, e2e smoke suite, release gate automation, documentation onboarding, in-app onboarding, example site recipes, feature freeze, release candidate one, final release gates, security review, privacy controls, marketplace security, marketplace beta, marketplace lifecycle, marketplace authoring, template marketplace, persisted space customization, marketplace registry/import-preview, plugin manifest schema/examples/compatibility matrix, plugin, theme-pack, template-pack, migration guidance, and theme-hook metadata for self-hosters, plugins, forks, and deployment dashboards.
- **Trusted local plugins** — `/admin/plugins` reads registered plugins plus trusted local `plugin.json` manifests only when `ARKIVEL_ENABLE_TRUSTED_PLUGINS=true` and `ARKIVEL_TRUSTED_PLUGIN_DIR` points to an absolute local directory. It shows permissions, routes, widgets, hooks, compatibility, and load errors before enabling a plugin.
- **Plugin permission review** — plugin manifests show permission prompts, risk labels, health status, last load/error metadata, routes, widgets, hooks, and version/source details. Enable/disable actions and hook failures are audit logged; remote arbitrary-code loading remains out of scope for v1.
- **Plugin starter kit** — `examples/plugins/starter-plugin/`, `docs/plugin-authoring.md`, `examples/plugins/marketplace-listing-template.json`, and `npm run plugin:validate` give authors a manifest, route, widget, setting, hook, job, smoke-test checklist, compatibility notes, and validation workflow.
- **Portable bundle contract** — `docs/portable-bundles.md` defines the pre-v5 full-site bundle manifest, checksums, source metadata, export scope, sessions/API-key/analytics exclusions, privacy filters, and import dry-run report shape for conflicts, missing assets, unsupported schemas, duplicate slugs, and permission gaps.
- **Export hardening** — Markdown, HTML, JSON, and ZIP exports emit manifest/checksum headers and record admin export history when persistence is available. `/api/export/history?download=1` downloads reports with file counts, byte counts, omitted private data, warnings, status, and scope metadata.
- **Import rehearsal** — `/api/import/rehearsal` exposes dry-run conflict categories, recommended actions, blocked changes, rollback plans, and fixture profiles for small wiki, large archive, docs portal, and worldbuilding atlas imports before any write-capable flow.
- **Workspace model contract** — `docs/workspaces.md` documents personal, team, public docs, private archive, and demo bootstrap profiles, invitation APIs, `workspaceId`/`wikiId`/`X-Arkivel-Workspace` scoping, and single-workspace migration.
- **Role template contract** — `docs/role-templates.md` documents role templates, API-key behavior, invitation expiration/resend/revoke actions, audit events, and self-host admin recovery guidance.
- **Private team knowledge base** — `docs/private-team-knowledge-base.md` documents private workspace setup, collaboration routing, user preferences, and public-surface visibility rules for team deployments.
- **Editorial governance API** — `/api/admin/editorial-governance/summary` reports release blockers, editorial risk, claim queues, verification renewals, and owner gaps; `docs/editorial-governance.md` documents the contract.
- **Space customization API** — `/api/categories/:id/customization` and `/api/articles/:id/customization` resolve global, parent-space, space, and article overrides for style, color theme, layout, component pack, template pack, navigation, and metadata schema while hiding private draft config from public reads.
- **Space customization editor** — `/admin/categories` lets admins edit category-space overrides, inspect inherited effective values and source badges, reset to parent/global values, preview article-list/metadata/navigation/theme outcomes, review conflict warnings, and check responsive QA notes.
- **Space templates** — `/api/space-templates` exposes preview-safe personal wiki, product docs, team handbook, worldbuilding bible, research notebook, reading archive, project knowledge base, and public documentation templates, with preview pages, JSON validation, one-click local import previews, category trees, starter articles, sample metadata, tags, infobox fields, navigation, dashboards, layouts, and recommended packs.
- **Domain workflows** — `/api/space-workflows` and `docs/domain-workflows.md` publish workflow controls, steps, starter template links, and release gates for docs portals, team handbooks, worldbuilding, research, and personal wiki products.
- **Space governance hooks** — `/api/categories/:id/governance` persists category owner, reviewer, default visibility, review cadence, stale-page threshold, and health-signal preferences. Article pages show inherited governance badges, and the admin dashboard summarizes space health widgets for stale pages, unreviewed claims, orphaned content, and broken links.
- **Component slot registry** — `/api/customization` exposes stable component slot contracts for article cards, article headers, metadata panels, infoboxes, dashboards, homepage sections, search results, editor panels, space navigation, and admin summaries with fallback, loading, error, permission, and data-boundary metadata.
- **Built-in component packs** — The local registry includes default wiki, docs portal, team knowledge base, worldbuilding atlas, and research notebook packs with named slot components and recommended layout metadata.
- **Layout composition hooks** — Built-in layouts publish shell density, homepage order, article column, right-rail, dashboard module, category landing, screenshot, and scoped `html[data-layout="..."]` hook metadata for previews and future runtime composition.
- **Component-pack developer experience** — Pack authors can scaffold component packs, validate manifests locally, start from `examples/marketplace/component-pack`, and plan previews with typed article, category, dashboard, marketplace, and editor fixtures.
- **Style presets** — `NEXT_PUBLIC_ARKIVEL_STYLE` switches between the default `classic-wiki` skin and the alternate `atlas-modern` skin without changing route code.
- **Color themes** — `NEXT_PUBLIC_ARKIVEL_COLOR_THEME` switches between `standard`, `forest`, and `ember` palettes independently from the selected style preset.
- **Layout presets** — `NEXT_PUBLIC_ARKIVEL_LAYOUT` publishes layout intent such as `classic-wiki`, `docs-portal`, `team-knowledge-base`, `worldbuilding-atlas`, or `research-notebook` for preview and future shell variants.
- **Customization Studio** — `/admin/customization` is a tabbed env-first workbench for brand copy, logos, style, color theme, layout, feature flags, browser-local drafts, named presets, active-vs-draft diffs, keyboard-accessible tabs, screen-reader summaries, responsive QA checkpoints, palette/dark-theme/asset-size diagnostics, preview panels, source badges, theme-pack JSON validation, downloadable support reports, and copy-ready `.env`, `.env.local`, Vercel, or Docker Compose output.
- **Built-in Marketplace** — `/admin/marketplace` lists and filters styles, color themes, layouts, component packs, plugins, and theme packs with versioned local-registry health, schema/source metadata, detail panels, screenshots, docs links, copy-ready env vars/JSON/install notes, license/checksum details, preview-only pack import parsing, theme token diffs, validation issue reporting, and no remote code fetching.
- **Marketplace contribution kit** — `docs/marketplace-contributions.md`, `examples/marketplace/`, and GitHub issue templates document preview-safe pack submissions, naming/versioning rules, review checklists, sample manifests, screenshots, compatibility notes, and validation expectations.
- **RSS & Atom feeds** — `/feed.xml` and `/feed/atom`
- **Webhooks** — HTTP callbacks dispatched on article events; delivery log at `/admin/webhooks`
- **Embeds** — iframe-safe embed tokens per article at `/embed/[token]`
- **Slack** — `/wiki <query>` slash command to search from Slack
- **Discord** — `/wiki` slash command in Discord
- **Issue links** — link GitHub, Jira, or Linear issues to articles with inline status badges
- **Federated peers** — configure peer wiki instances for cross-wiki search at `/admin/federated-peers`

---

## Interactive Map

Optional feature. Enable with `NEXT_PUBLIC_MAP_ENABLED=true`.

- Multiple maps with custom background images and named layers
- Clickable polygon areas linked to articles with hover tooltips
- Different marker detail levels per zoom tier
- Admin edit mode: draw, reshape, recolor, link to articles

---

## Accessibility & Reading Comfort

- **Dyslexia mode** — OpenDyslexic font, increased spacing, warm background tint (persists across sessions)
- **RTL toggle** — switch article content to right-to-left reading direction
- **Audio narration** — text-to-speech via ElevenLabs (if configured) or browser synthesis; includes speed control
- **Machine translation** — DeepL or Google Translate (requires API key)
- **Skip-to-content link** — visible on keyboard focus on every page
- **Keyboard shortcut customization** — remap navigation chords at `/settings/shortcuts`; overrides saved in browser localStorage

---

## Administration

- **Roles** — Viewer (read only), Editor (create/edit), Admin (full access)
- **Multi-user accounts** — registration, profiles at `/users/[username]`, settings at `/settings`
- **Admin dashboard** — `/admin`, review queue, statistics, embed tokens
- **Announcement banner** — post a site-wide notice with optional expiry at `/admin/announcements`; dismissible per session
- **Analytics** — scroll depth heatmap, navigation paths at `/admin/analytics`
- **Performance metrics** — system metrics at `/admin/metrics`
- **Health score** — A–F grade for link coverage, freshness, stub %, search gaps at `/admin/health`
- **Atlas JSON feed** — `/api/atlas` exposes territories, article signals, story threads, the flagship dossier, continuity pressure, and recommended atlas moves
- **Trails JSON feed** — `/api/trails` exposes guided reading routes, stop reasons, reading estimates, word totals, and link totals
- **Intelligence JSON feed** — `/api/intelligence` exposes the command-center score, summary, graph constellation, radar axes, pressure model, 20 engines, and next-best-work queue for dashboards or automation
- **Documentation, version, and commit discipline** — every user-visible, API, schema, configuration, workflow, design, or contributor-guidance change updates the matching root docs, markdown docs, in-app docs, changelog/roadmap entries, and package metadata in the same commit; release commit messages follow `vX.Y.Z: imperative summary`
- **Content lint** — broken links, missing excerpts, orphans at `/admin/lint`
- **Stale articles** — articles not updated in 180+ days at `/admin/staleness`
- **Operations dashboard** — service health, queues, slow pages, failed jobs, alerts, acknowledgements, and redacted bundles at `/admin/operations`
- **Maintenance tooling** — safe-upgrade checks, backup reminders, background task pausing, cleanup queues, and runbooks at `/admin/maintenance`
- **Observability** — structured operational events, metric ingestion, privacy controls, and event feed at `/admin/observability`
- **Performance budgets** — route budgets, large-wiki fixtures, slow samples, and Prisma query review guidance at `/admin/performance`
- **Cache strategy** — invalidation rules, manual invalidation, stale warnings, Redis status, and deployment recipes at `/admin/cache`
- **Offline/PWA** — install prompts, cached reading pages, stale indicators, retry queues, and mobile QA via `/api/offline/contract`
- **Security review** — browser headers, review checklist, abuse cases, supply-chain gates, and threat model via `/api/security/review`
- **Privacy controls** — deployment modes, retention keys, user data lifecycle, and integration warnings via `/api/privacy/controls`
- **Marketplace security** — unsafe pack rejection, blocked hooks/permissions, dangerous warnings, and provenance checks via `/api/marketplace/security`
- **Marketplace beta** — landing metrics, featured/recent/recommended packs, collections, facets, install intent, and limitations via `/api/marketplace/beta`
- **Marketplace lifecycle** — pack states, transitions, inventory, health checks, preview media validation, and rollback guidance via `/api/marketplace/lifecycle`
- **Marketplace authoring** — pack validation, metadata preview, screenshot/license/docs checks, README generation, compatibility matrix, and submission templates via `/api/marketplace/authoring`
- **Template marketplace** — template-pack listings, previews, diff/merge metadata, and export-from-space fixture output via `/api/marketplace/templates`
- **Embeddings coverage** — semantic search index per article at `/admin/embeddings`
- **Plugins** — enable/disable wiki plugins at `/admin/plugins`
- **Webhooks** — configure HTTP callbacks at `/admin/webhooks`
- **Templates** — manage reusable article templates at `/admin/templates`
- **Theme** — site-wide colour and typography at `/admin/theme`
- **Macros** — define reusable content macros at `/admin/macros`
- **Content schedule** — schedule article publishing at `/admin/content-schedule`
- **Kanban board** — manage articles as cards in a Kanban workflow at `/admin/kanban`
- **Audit log** — complete admin action log at `/admin/audit-log` with actor, target, workspace, severity, success, and date filters plus redacted JSON export
- **Moderation contract** — `docs/moderation.md` documents discussion reports, reviewer-only notes, suggestion queue actions, public contribution spam scoring, and rate-limit planning
- **Metadata schemas** — typed fields per category at `/admin/metadata-schemas`
- **Federated peers** — configure peer wikis for cross-wiki search at `/admin/federated-peers`
- **Import tools** — Confluence, Notion, Obsidian import at `/admin/import`
- **Category merge** — merge two categories at `/admin/categories`; all articles reassigned to target, source deleted
- **Word-count distribution** — histogram of article lengths at `/admin/word-count` with longest/shortest tables and average word count
- **Batch operations** — bulk-assign category, publish/unpublish, or delete from `/articles`
- **Tag management** — rename, recolor, and delete tags inline at `/admin/tags` with article count and filterable list
- **Custom branding** — name, tagline, welcome text, footer, logo, logo mark, and app icon via `NEXT_PUBLIC_*` environment variables
