# Features

A complete overview of everything the wiki can do. For step-by-step instructions see [Help & Features Guide](help.md).

---

## Writing & Editing

- **Rich text editor** — Tiptap-based WYSIWYG editor with toolbar, slash commands, and drag-and-drop block reordering
- **Markdown mode** — toggle between rich text and raw Markdown at any time
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

- **Full-text search** — AND-logic multi-word search with relevance ranking; instant results as you type
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
- **Edit suggestions** — readers can propose corrections via a "Suggest edit" button; admin review at `/admin/suggestions`
- **Reader retention analytics** — per-article scroll depth distribution funnel at `/admin/retention`
- **Referrer tracking** — incoming traffic sources tracked per article per day; aggregated at `/admin/referrers`
- **Satisfaction star rating** — 1–5 star widget on every article; per-session upsert; average and count shown in real time
- **Hot articles widget** — "Trending this week" panel on the homepage sidebar showing top-5 most-viewed articles in last 7 days
- **Article todo checklist** — per-article task list; readers check off items, admins add/delete tasks inline
- **AI grammar & style check** — collapsible panel below editor analyses for errors, warnings, style; Apply buttons fix inline; heuristic fallback when AI unavailable
- **Scroll position memory** — article scroll saved to localStorage; restored on return visits; capped at 50 articles
- **Bulk tag operations** — add or remove a tag from multiple articles at once via the article list batch bar
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
- **Presentation mode** — any article opens as a full-screen slideshow at `/present/[slug]`; each H2/H3 is a slide
- **Watchlist digest** — optional daily email summary of watched article changes at `/watchlist/digest`

---

## Article Page

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

- **Real-time co-editing** — simultaneous editing with cursor presence via Yjs/y-prosemirror
- **Discussions** — threaded comments on every article; `@mention` triggers notifications
- **Article reactions** — Helpful, Insightful, Outdated, Confusing via the reaction bar
- **Change requests** — propose edits without direct write access at `/change-requests`
- **Article forks** — propose a full rewrite; admins review/merge/reject at `/forks`
- **Review workflow** — assign reviewers and track inline feedback at `/reviews`
- **Knowledge bounties** — request new articles; contributors claim and fulfil them at `/bounties`
- **Expert badges** — admin-granted per category; highlighted in revision history and bylines
- **Article lock** — editor acquires a 10-min lock; others see "Being edited by X" warning; admins can force-unlock
- **Revision restore** — one-click restore to any prior revision from the history page (current state auto-saved first)
- **Article certification** — "Verified by experts" badge after review by 2+ experts
- **Contributor achievements** — First edit, 10/100 edits, streak badges, category expert; unlocked with toast notification

---

## AI Features

AI features degrade gracefully when API keys are absent.

- **Writing coach** — Flesch-Kincaid score, passive-voice count, sentence-length stats, and AI suggestions in the editor
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

- **REST API v1** — `/api/v1/` with `X-API-Key` auth. See `/api-docs`.
- **REST API v2** — pagination cursors, field selection
- **GraphQL API** — `/api/graphql` powered by graphql-yoga; includes GraphiQL playground. Queries for articles, categories, tags, revisions, search, and stats.
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
- **Content lint** — broken links, missing excerpts, orphans at `/admin/lint`
- **Stale articles** — articles not updated in 180+ days at `/admin/staleness`
- **Embeddings coverage** — semantic search index per article at `/admin/embeddings`
- **Plugins** — enable/disable wiki plugins at `/admin/plugins`
- **Webhooks** — configure HTTP callbacks at `/admin/webhooks`
- **Templates** — manage reusable article templates at `/admin/templates`
- **Theme** — site-wide colour and typography at `/admin/theme`
- **Macros** — define reusable content macros at `/admin/macros`
- **Content schedule** — schedule article publishing at `/admin/content-schedule`
- **Kanban board** — manage articles as cards in a Kanban workflow at `/admin/kanban`
- **Audit log** — complete admin action log at `/admin/audit-log`
- **Metadata schemas** — typed fields per category at `/admin/metadata-schemas`
- **Federated peers** — configure peer wikis for cross-wiki search at `/admin/federated-peers`
- **Import tools** — Confluence, Notion, Obsidian import at `/admin/import`
- **Category merge** — merge two categories at `/admin/categories`; all articles reassigned to target, source deleted
- **Word-count distribution** — histogram of article lengths at `/admin/word-count` with longest/shortest tables and average word count
- **Batch operations** — bulk-assign category, publish/unpublish, or delete from `/articles`
- **Tag management** — rename, recolor, and delete tags inline at `/admin/tags` with article count and filterable list
- **Custom branding** — name, tagline, welcome text, footer via `NEXT_PUBLIC_*` environment variables
