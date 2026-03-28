# Help & Features Guide

This guide covers all features available in the wiki. Use the sections below to learn how to create, edit, organize, and get the most from your articles.
For a feature overview see `/features`.

---

## Getting Started

To create a new article, click **Create new article** in the sidebar or navigate to `/articles/new`.

Each article has:

- **Title** — the article name, used to generate the URL slug
- **Content** — rich text body written in the Tiptap editor
- **Category** — optional, for organizing articles into groups
- **Tags** — optional labels for cross-cutting topics
- **Excerpt** — short summary shown in search results and article lists
- **Status** — Draft (admin-only), Review, or Published (visible to all)

---

## The Editor

The rich text editor provides a toolbar with formatting options:

| Button | Action |
|--------|--------|
| **B / I / S** | Bold, Italic, Strikethrough |
| **H1 / H2 / H3** | Heading levels |
| **• / 1.** | Bullet and ordered lists |
| **"** | Blockquote |
| **<>** | Code block with syntax highlighting |
| **—** | Horizontal rule |
| Link icon | Insert a URL link |
| Image icon | Upload an image |
| **[[]]** | Insert a wiki link |
| **Table** | Insert a table |
| **Detect Links** | Scan text for potential wiki links |
| **fn** | Insert a footnote / citation |
| **Mermaid** | Insert a diagram (via `/mermaid` slash command) |
| **Σ** | Insert a math expression (KaTeX) |
| **Microphone** | Voice dictation (browser speech recognition) |

**Slash commands:** Type `/` anywhere in the editor to open the command palette. Commands include: Mermaid diagram, Math block, Excalidraw drawing, Data table, Decision tree, all heading/list types, accordion/FAQ block, two-column layout, YouTube/Vimeo embed, GitHub Gist embed, and your saved snippets via `/snippet`.

**Grammar & style checker:** A collapsible "Grammar & style" panel below the editor checks your text for errors, warnings, and style issues. Click "Check now" to analyse; each issue shows a severity badge and an Apply button to fix it inline.

**TOC generator:** Click the `TOC` toolbar button to extract all headings and insert a nested linked table of contents at the cursor position.

**Editor snippets:** Create reusable HTML blocks at `/settings/snippets`. Insert them in any article via the slash-command menu (type `/snippet name`).

**Markdown mode:** Click `Markdown` to switch to raw markdown editing. Click `Rich Text` to switch back.

**Templates:** When creating a new article, choose from predefined templates (Person, Place, Event, Thing, Group) that provide a starting structure with an infobox and sections.

---

## Rich Content Blocks

Beyond standard text, the editor supports specialized content blocks inserted via slash commands:

- **Mermaid diagrams** — write `graph TD; A-->B` syntax; renders as a flowchart, sequence diagram, Gantt chart, etc. on the article page
- **Math (KaTeX)** — inline math with `$...$` and block math with `$$...$$`
- **Excalidraw** — embed an interactive whiteboard drawing; stored as JSON and rendered read-only on the article page
- **Data table** — paste CSV or JSON data to create a sortable, filterable table with a CSV download button
- **Decision tree** — define a yes/no tree as JSON; renders as an interactive SVG with expand/collapse

**Voice dictation:** Click the microphone button in the toolbar to speak — your words are inserted at the cursor using the browser's speech recognition.

---

## Presentation Mode

Click **Present** in the article action bar to open the article as a slideshow. Each H2 / H3 heading becomes a new slide. Use arrow keys or click to advance. Press Esc to exit.

---

## Article Action Bar

The toolbar below the article title provides quick actions grouped into four sections:

| Action | Description |
|--------|-------------|
| **Present** | Open as a slideshow |
| **Bookmark** | Save to your personal bookmarks with an optional note |
| **+ List** | Add to one of your reading lists |
| **Copy link** | Copy the article URL to the clipboard |
| **Share** | Native share sheet (or clipboard fallback) |
| **Print** | Clean print layout (hides navigation UI) |
| **Export ▾** | Download as PDF, Markdown, ePub, or Word (.docx) |
| **Aa** | Toggle dyslexia-friendly font and spacing |
| **RTL** | Toggle right-to-left reading direction for the article |
| **Translate ▾** | Machine-translate to another language (requires API key) |
| **S/M/L/XL** | Font size selector; persisted between sessions |
| **Focus** | Dims non-hovered paragraphs for distraction-free reading; persisted |
| **Night mode** | Warm sepia dark theme for late-night reading; persisted |
| **High contrast (A)** | Pure black/white/yellow theme for maximum readability; persisted |
| **Text only (T)** | Hides images and media from article content; persisted |
| **Speed read** | RSVP modal; 150/250/400/600 WPM; ORP pivot character highlighted |
| **Font preference** | Dropdown to switch article body font (Default/Serif/Sans/Mono); persisted |
| **Accent color** | HSL hue slider to customize the wiki accent color; persisted |
| **Quick note** | Collapsible private note per article stored in browser localStorage |
| **Copy plain text** | Copies article body as plain text (HTML stripped) to clipboard |

---

## Wiki Links

### Typing syntax

- Type `[[Article Name]]` — auto-converts to a wiki link
- Type `[[Article Name|Display Text]]` — link with custom display text

### Link suggester

Type `[[` to open the autocomplete dropdown. Use arrow keys to navigate, Enter to select, Escape to dismiss.

### Link status

- Links to existing articles appear in **blue**
- Links to missing articles appear in **red** — a cue to create that article

### Keyboard shortcut

Press `Ctrl+Shift+L` (Cmd on Mac) to insert a wiki link.

---

## Search

- The search bar provides instant results as you type; press **Enter** for the full search page
- Multi-word queries use **AND** logic — every word must appear somewhere in the article
- Results are ranked: exact title match > starts with > title contains > content-only
- **Semantic search:** set `OPENAI_API_KEY` to blend AI-ranked results based on meaning, not just keywords
- **Federated search:** when peer wikis are configured, results from other wikis appear in a separate section on the search page automatically
- **Search history:** your last 20 successful searches are stored in browser memory and shown as chips on the search page when idle; use Clear to wipe

---

## AI Features

AI features are gated on environment variables and degrade gracefully when keys are absent.

- **Writing Coach** — collapsible panel at the bottom of the editor. Shows Flesch-Kincaid readability score, passive-voice count, sentence length stats, and AI suggestions.
- **Article summaries** — auto-generated on save; used as the page meta description.
- **Semantic search** — vector embeddings via OpenAI. Requires `OPENAI_API_KEY`.
- **Knowledge gaps** — `/admin/knowledge-gaps` lists referenced but uncreated article titles, sorted by incoming-link count.
- **Duplicate detection** — checks for semantically similar existing articles when creating a new one.
- **Category suggestions** — Claude suggests topics missing from a category.
- **Quiz generation** — Claude generates 5 multiple-choice questions from any article for self-testing.

---

## Learning & Retention

- **Learning Paths** — curated sequences of articles. Browse at `/learning-paths` or create your own. Progress is tracked per path.
- **Flashcards** — create flashcards from any article. Review due cards at `/flashcards` using the SM-2 spaced repetition algorithm (grade 0–5 after each card).
- **Quizzes** — AI-generated multiple choice questions per article. Results saved to your quiz history.
- **Reading progress** — mark articles as read. Track completion by category via the progress ring on category pages.
- **Email digest** — opt in under Settings → Digest to receive a scheduled summary email of watchlist changes.

---

## Discovery & Navigation

- **Bookmarks** — save articles with optional notes at `/bookmarks`.
- **Reading Lists** — organize articles into ordered lists at `/reading-lists`. Lists can be made public and shared via a link.
- **Smart Collections** — saved searches with filters (tags, category, author, date range) at `/collections`.
- **TIL (Today I Learned)** — post short (280-char) notes at `/til`. Tag them for discovery.
- **Explore mode** — guided walk through articles using semantic similarity at `/explore`.
- **Session reading trail** — collapsible breadcrumb at the bottom of each article showing your navigation history for the current session.
- **Reading history** — browser-local list of the last 50 articles you visited, with relative timestamps, at `/history`. No server data stored.
- **Last-visit badge** — on return visits, articles show "You read this X ago" in the article header.
- **Sticky article header** — a slim floating bar with the article title, Edit and Top links appears after scrolling past the article's heading.
- **Article Q&A** — "Ask a question" panel at the bottom of every article; answers are grounded in wiki content and cite source articles.
- **Suggest edit** — a "Suggest edit" link at the bottom of every article opens an inline form; admins review at `/admin/suggestions`.
- **Popularity leaderboard** — `/popular` ranks published articles by combined read and reaction activity.
- **Article comparison** — view two articles side by side at `/compare?a=slug1&b=slug2`.
- **Contributor leaderboard** — `/leaderboard` shows top editors ranked by revision count.
- **Discussion index** — `/discussions` lists all open discussion threads across every article, filterable by article slug and author.
- **Activity heat map** — `/activity` shows a GitHub-style contribution calendar of daily edit counts over the past 52 weeks.
- **Wiki stats** — `/stats` displays total articles, word count, categories, tags, contributors, revisions, weekly active users, and a top-contributors leaderboard.
- **Mentions feed** — `/mentions` lists every discussion thread that mentions your `@username` (requires login).

---

## Article Page Features

- **Reading time** — every article shows "~X min read" in the byline, estimated at 200 words per minute.
- **Reading mode** — click "Reading mode" in the toolbar or press `R` to enter a distraction-free view. Press again or `R` to exit.
- **Draft share links** — admins generate a secret URL (`POST /api/articles/[id]/share-token`) so anyone with the link can preview a draft at `/share/[token]` without needing to log in.
- **Expiry warning banner** — a yellow notice appears when an article's *Review due* date is within 30 days, prompting editors to verify its accuracy.
- **Mark as verified** — admins see a "Mark as verified" button at the bottom of each article. Clicking it stamps the current date as *lastVerifiedAt*, shown as a "✓ Verified" badge in the byline.
- **"You might also like"** — up to 5 related articles sharing the same tags are suggested at the bottom of each article.
- **Floating table of contents** — on wide screens (≥1280 px) a fixed sidebar TOC highlights the section currently in view.
- **Article stats panel** — collapsible panel showing read count, reaction count, word count, quality score, article age, and a 30-day view sparkline.
- **Article flags** — admins assign short labels (e.g. "Needs images", "Outdated") that appear as orange badges near the article title.
- **Article co-authors** — admins link additional contributors; their names appear in the byline after the primary author.
- **Named snapshots** — save a labeled manual snapshot of the current article state via `POST /api/articles/[id]/snapshots`.
- **Cover image focal point** — in the edit form, click/drag on the cover image preview to set a focal point; stored as `coverFocalX`/`coverFocalY` and applied as CSS `object-position`.

---

## Personal Dashboard

A personalizable homepage at `/dashboard` with a draggable widget grid.

- **Available widgets:** Recent articles, Watchlist, Recent edits, Random article, Scratchpad preview, Wiki stats, Notifications
- Click **Customize** to show/hide widgets and drag cards to reorder them
- Layout is saved to your user preferences and restored on every visit

---

## Collaboration

- **Article reactions** — mark articles as Helpful, Insightful, Outdated, or Confusing via the reaction bar at the bottom.
- **Star rating** — rate any article 1–5 stars; your rating is saved per session and the average with count is shown live.
- **Article checklist** — per-article todo list; readers check off tasks, admins add and delete tasks inline.
- **Article polls** — admins create polls on any article; readers vote once per session; vote counts and bars revealed after voting or when closed; admins can close, reopen, or delete polls.
- **Blame view** — the *Blame* tab on any article shows each paragraph colour-coded by the revision that introduced it; sidebar displays editor, date, and edit summary.
- **Article forks** — propose a complete rewrite of any article. Admins review, merge, or reject forks at `/forks`.
- **Knowledge bounties** — request articles on specific topics at `/bounties`. Contributors can claim and fulfil them.
- **Expert badges** — admins grant expert badges per category. Expert contributors are highlighted in revision history and bylines.
- **Article certification** — admins can certify articles reviewed by at least two experts. Certified articles show a "Verified by experts" badge.
- **Discussions** — every article has a Discussion tab. Mention `@username` to notify a contributor.
- **Article lock** — opening the editor acquires a 10-minute lock. Other users see a "Being edited by X" warning banner; admins can force-unlock.
- **Revision restore** — on the history page, click "restore" next to any revision to revert to it (current content is auto-saved as a new revision first).

---

## Accessibility & Reading Comfort

- **Dyslexia mode (Aa)** — click *Aa* in the action bar to switch to OpenDyslexic font with increased spacing and a warm background tint. Persists across sessions.
- **RTL toggle** — click *RTL* to switch article content to right-to-left reading direction.
- **Audio narration** — click *Listen* on any article to hear it read aloud. Uses ElevenLabs if `ELEVENLABS_API_KEY` is configured; otherwise browser speech synthesis. Includes speed control.
- **Machine translation** — click *Translate ▾* and select a language. Creates a draft translation via DeepL or Google Translate (requires API key).
- **Skip-to-content link** — first focusable element on every page, visible on keyboard focus.

---

## Categories & Tags

**Categories** are hierarchical groups shown in the sidebar. Each article belongs to one category. Browse all at `/categories`.

**Tags** are hierarchical labels; an article can have multiple tags. Browse all at `/tags`, which shows a size-scaled tag cloud.

---

## Revision History

- Every save auto-snapshots the current state as a revision
- Click the **History** tab on any article to see all past revisions
- Select two revisions and click **Compare** for a side-by-side diff
- Added text shown in green, removed in red

---

## Import & Export

### Import

- **File upload:** drag-and-drop `.md`, `.txt`, `.html`, or `.json` at `/import`
- **Obsidian vault:** upload a `.zip` at `/import/obsidian`. Front matter and `[[wikilinks]]` are resolved automatically.
- **Notion:** connect your Notion integration token and import a page tree at `/import/notion`.
- **Confluence:** upload a Confluence HTML export or paste HTML at `/admin/import`. Title extracted, macros stripped, saved as draft.

### Export

All formats are in the **Export ▾** dropdown on every article page.

- **PDF** — print-ready window using your browser's print dialog
- **Markdown** — downloads as a `.md` file
- **ePub** — downloads as a valid ePub 3 e-book
- **Word (.docx)** — downloads as a Microsoft Word document
- **Category export** — export an entire category as a multi-chapter ePub or zip from the admin area
- **Bulk ZIP export** — download the entire wiki (or one category) as a `.zip` of Markdown files from the [Export](/export) page — one `.md` per article with YAML front-matter, organised in category subfolders

---

## Web Clipping

Save content from the web directly into the wiki without leaving your browser.

### Browser extension

Install the Manifest V3 browser extension (Chrome, Edge, Brave) from `/clipper-extension`. Click the extension popup on any page: the title and selected text are pre-filled; choose a category and click **Save to Wiki**. The article is created as a draft and the popup offers "Open editor" to refine it.

### Bookmarklet

Go to `/bookmarklet` and drag the button to your bookmarks bar (or copy the code). Click the bookmarklet on any page to clip the URL, title, and selected text as a draft article. Selected text is wrapped in a blockquote with a source link; full-page HTML has nav/headers/scripts stripped.

---

## Whiteboards

Create standalone Excalidraw canvases at `/whiteboards` — separate from the Excalidraw blocks you can embed inside articles.

- Create unlimited named canvases; the canvas auto-saves 2 seconds after each change
- Edit the title inline at the top of the editor
- Full Excalidraw toolkit: shapes, text, arrows, images, freehand drawing

---

## Analytics & Wiki Health

- **Analytics dashboard** — scroll depth heatmap, reader navigation paths, search gap tracking
- **Search analytics** — `/admin/search-analytics` shows daily search volume, top queries with average result counts, and zero-result queries to surface content gaps
- **Search gaps** — `/admin/search-gaps` shows top zero-result queries
- **Stale articles** — `/admin/staleness` lists articles not updated in 180+ days
- **Wiki health score** — `/admin/health` gives an A–F grade: link coverage, freshness, stub %, search gap %, certification %
- **Embeddings coverage** — `/admin/embeddings` shows AI embedding status per article
- **Maintenance mode** — `/admin/maintenance` toggle shows a site-wide yellow banner when the wiki is under maintenance

---

## Contributor Achievements

Achievements are awarded automatically:

- **First edit, 10 edits, 100 edits** — contribution milestones
- **7-day streak / 30-day streak** — editing on consecutive days
- **Category expert** — significant contributions to a single category

Unlock notifications appear as a toast after saving.

---

## Integrations

- **Slack:** `/wiki <query>` slash command to search articles from Slack. Requires `SLACK_SIGNING_SECRET`.
- **Discord:** `/wiki` slash command in Discord. Requires `DISCORD_PUBLIC_KEY`.
- **Issue links:** link GitHub, Jira, or Linear issues to articles. Status badges appear inline on the article page.
- **Embeds:** generate an embed token for any article. The view at `/embed/[token]` is iframe-safe with no navigation.

---

## Interactive Map

Optional feature, disabled by default. Enable with `NEXT_PUBLIC_MAP_ENABLED=true`.

- Multiple maps with background images and layers
- Clickable polygon areas linked to articles with hover tooltips
- Zoomable with different detail levels per zoom
- Edit mode: draw, reshape, recolor, link to articles (admin only)

---

## Navigation & Organization

The sidebar is divided into collapsible sections — click any section header to collapse or expand it.

**Navigation section:**
- **Main Page** — `/`, the wiki home
- **All articles** — `/articles`, full article list with count
- **Recent changes** — `/recent-changes`, timeline of all edits grouped by date
- **Random article** — `/random`, jump to a random published article
- **Search** — `/search`, full-text search with relevance ranking
- **Tags** — `/tags`, browse all tags and their articles
- **Article graph** — `/graph`, D3 force-directed graph of wiki link connections
- **Help** — this page

**Discover section:**
- **Explore** — `/explore`, curated entry points into the wiki
- **Activity** — `/activity`, a feed of recent contributions
- **Collections** — `/collections`, curated article sets
- **Change requests** — `/change-requests`, pending edits awaiting review
- **Reviews** — `/reviews`, articles flagged for quality review
- **Bounties** — `/bounties`, open writing/improvement tasks
- **Forks** — `/forks`, divergent article versions

**Personal section:**
- **Dashboard** — `/dashboard`, personalizable widget homepage
- **Reading lists** — `/reading-lists`, saved ordered reading sequences
- **Bookmarks** — `/bookmarks`, articles you have starred
- **Watchlist** — `/watchlist`, articles you are watching for changes
- **Flashcards** — `/flashcards`, spaced-repetition study from article content
- **Learning paths** — `/learning-paths`, structured sequences of articles
- **Today I Learned** — `/til`, short TIL notes
- **Scratchpad** — `/scratchpad`, persistent personal scratch space
- **Settings** — `/settings`, personal preferences

**Tools section:**
- **Whiteboards** — `/whiteboards`, standalone Excalidraw canvases
- **Timeline** — `/timeline`, chronological article view
- **Bookmarklet** — `/bookmarklet`, web clipper bookmarklet
- **Clipper extension** — `/clipper-extension`, browser extension install guide

**Article structure:**
- **Backlinks** — "What links here" at the bottom of every article
- **Table of contents** — auto-generated for articles with multiple headings
- **Breadcrumb** — category hierarchy shown above the article title
- **Disambiguation** — articles with ambiguous titles get a notice
- **Redirects** — set a "Redirect to" slug in the editor to forward the old URL automatically

---

## Administration

- **Roles:** Viewer (read only), Editor (create/edit), Admin (full access)
- **Legacy admin login:** enter `ADMIN_SECRET` at `/admin`; works alongside user accounts
- **Admin dashboard** — `/admin`, review queue, statistics, embed tokens
- **Analytics** — `/admin/analytics`, page views and usage trends
- **Metrics** — `/admin/metrics`, performance and system metrics
- **Health** — `/admin/health`, service health checks and A–F grade
- **Plugins** — `/admin/plugins`, enable/disable wiki plugins
- **Webhooks** — `/admin/webhooks`, HTTP callbacks for article events
- **Templates** — `/admin/templates`, reusable article templates
- **Theme** — `/admin/theme`, site-wide colour and typography settings
- **Content lint** — `/admin/lint`, automated quality checks across all articles
- **Knowledge gaps** — `/admin/knowledge-gaps`, topics referenced but not yet written
- **Embeddings** — `/admin/embeddings`, semantic search index management
- **Search gaps** — `/admin/search-gaps`, common searches returning no results
- **Staleness** — `/admin/staleness`, articles not updated in a long time
- **Macros** — `/admin/macros`, define reusable content macros
- **Content schedule** — `/admin/content-schedule`, schedule article publishing
- **Kanban board** — `/admin/kanban`, manage articles in a Kanban workflow
- **Audit log** — `/admin/audit-log`, complete log of admin actions
- **Metadata schemas** — `/admin/metadata-schemas`, typed fields per category
- **Federated peers** — `/admin/federated-peers`, configure peer wikis for cross-wiki search
- **Import tools** — `/admin/import`, Confluence/Notion/Obsidian import in one place
- **Batch operations:** on `/articles`, bulk-assign category, publish/unpublish, or delete
- **Customization:** name, tagline, welcome text, footer set via `NEXT_PUBLIC_*` environment variables

---

## User Accounts

- Register at `/register` with username, email, and password
- User profiles at `/users/username` show contribution history and achievements
- Manage display name, password, notifications, digest schedule, and accessibility defaults at `/settings`

---

## Watchlist & Notifications

- Watch articles to get notified when they're edited. Manage your watchlist at `/watchlist`.
- The bell icon in the header shows unread notification count
- `@username` mentions in discussions trigger a notification
- Enable the daily digest under Settings → Digest for a scheduled summary email

---

## RSS Feeds & APIs

- **RSS:** `/feed.xml`
- **Atom:** `/feed/atom`
- **Public REST API v1:** `/api/v1/` with `X-API-Key` authentication. See `/api-docs` for documentation.
- **GraphQL API:** `/api/graphql` — interactive GraphiQL playground at the same URL (GET). Supports queries for articles, categories, tags, revisions, search, and wiki stats.
- **Webhooks:** configure HTTP callbacks for article events at `/admin/webhooks`; delivery log included.

---

## Keyboard Shortcuts

### Global

| Shortcut | Action |
|----------|--------|
| `?` | Show keyboard shortcuts overlay (categorized modal) |
| `/` | Focus search bar |
| `R` | Toggle reading mode on article pages |
| `g` then `h` | Go to home page |
| `g` then `a` | All articles |
| `g` then `n` | New article |
| `g` then `s` | Search page |
| `g` then `r` | Recent changes |
| `g` then `g` | Article graph |
| `Esc` | Close dialog / blur input |

### In the editor (Ctrl = Cmd on Mac)

| Shortcut | Action |
|----------|--------|
| `Ctrl+B` | Bold |
| `Ctrl+I` | Italic |
| `Ctrl+Shift+X` | Strikethrough |
| `Ctrl+Shift+L` | Insert wiki link |
| `Ctrl+Shift+F` | Insert footnote |
| `Ctrl+Shift+7` | Ordered list |
| `Ctrl+Shift+8` | Bullet list |
| `Ctrl+Shift+B` | Blockquote |
| `Ctrl+Shift+E` | Code block |
| `Ctrl+Z` / `Ctrl+Shift+Z` | Undo / Redo |

---

> **Tip:** Type `[[` anywhere in the editor to search and link to existing articles. Type `/` to open the slash command menu for rich content blocks.
