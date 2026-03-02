# Changelog

All notable changes to this project are documented here.

## [2.1.1] - 2026-03-02

Directory cleanup and documentation overhaul.

### Cleanup
- Removed 5 unused Next.js scaffold SVGs from `public/` (file.svg, globe.svg, next.svg, vercel.svg, window.svg)
- Moved `help.md` to `docs/help.md` to separate reference docs from project root
- Fixed `package.json` prisma seed command referencing nonexistent `prisma/seed.ts` (now correctly points to `prisma/seed.mjs`)

### Documentation
- Rewrote `ARCHITECTURE.md` to reflect current state: dual auth system, all 20 API route groups, 22 database models, complete directory structure, and all key patterns (semantic links, graph, feeds, plugins, footnotes)
- Refreshed `ROADMAP.md` with new forward-looking goals (testing, slash commands, search filters, mobile UX, OAuth, AI features) and archived completed items in a collapsible section
- Updated `CONTRIBUTING.md` with `requireRole()` auth pattern and CI pipeline mention
- Added 5 missing environment variables to `README.md` (locale, articles per page, upload size, registration, discussions)
- Updated help page and `docs/help.md` with: hierarchical tags, multi-user auth in admin section, multiple maps with layers, semantic links/relations section, multi-language translations section, breadcrumbs, reading progress bar

## [2.1.0] - 2026-03-02

Improvements across utilities, config, CSS, components, API routes, pages, sidebar, editor, and SEO.

### Utility Functions
- Added `formatRelativeDate()` for human-readable relative timestamps ("5 minutes ago", "2 days ago")
- Added `truncateText()` for safe text truncation at word boundaries
- Added `wordCount()` and `readingTime()` for content statistics
- Added `stripHtml()` to remove HTML tags and decode entities
- Added `debounce()` and `throttle()` utility functions
- Added `copyToClipboard()` async clipboard utility
- Added `formatFileSize()` for human-readable byte sizes (KB, MB, GB)
- Added `formatNumber()` for comma-formatted numbers
- Added `isExternalUrl()` to detect external links
- Added `generateExcerpt()` for smart excerpt generation at sentence boundaries
- Added `getInitials()` for user avatar initials
- Added `pluralize()` for count-aware singular/plural text
- Added `classNames()` for conditional CSS class joining

### Configuration
- Added `NEXT_PUBLIC_DEFAULT_LOCALE` config (default: "en")
- Added `NEXT_PUBLIC_ARTICLES_PER_PAGE` config (default: 20)
- Added `NEXT_PUBLIC_MAX_UPLOAD_SIZE` config (default: 5MB)
- Added `NEXT_PUBLIC_ENABLE_REGISTRATION` config (default: true)
- Added `NEXT_PUBLIC_ENABLE_DISCUSSIONS` config (default: true)

### CSS & Theme
- Added print styles hiding navigation/UI, expanding content, and showing link URLs
- Added `:focus-visible` styles for keyboard accessibility
- Added skeleton loading animations with text, title, and avatar variants
- Added toast notification styles with slide-up animation and success/error/warning/info variants
- Added badge/pill styles with semantic color variants and dark mode support
- Added breadcrumb navigation styles
- Added tooltip styles with pure CSS hover reveal
- Added modal/dialog styles with overlay and fade-in animation
- Added empty state layout styles
- Added progress bar and reading progress bar styles
- Added alert/banner styles (info, success, warning, error)
- Added card hover effect with shadow transition
- Added `<kbd>` styles for keyboard shortcut display
- Added tag cloud styles with size variants (lg, md, sm)
- Added back-to-top button styles with visibility animation

### New Components 
- Created `Breadcrumb` component with Home link and configurable crumb items
- Created `Pagination` component with ellipsis, prev/next, and URL builder
- Created `Toast` notification system with React context provider and auto-dismiss
- Created `LoadingSkeleton` components: `SkeletonText`, `SkeletonArticleCard`, `SkeletonTable`
- Created `EmptyState` component with icon, title, description, and action link
- Created `ConfirmDialog` modal with Escape key, focus management, and danger mode
- Created `Badge` component with 5 color variants and 2 sizes
- Created `Tooltip` component with top/bottom positioning
- Created `ReadingProgress` scroll-based progress bar
- Created `BackToTop` button appearing after 400px scroll
- Created `CopyButton` with clipboard API and fallback
- Created `WordCount` displaying word count and reading time
- Created `TimeAgo` live-updating relative timestamp component
- Created `ArticleStatusBadge` mapping status to colored badges
- Created `UserAvatar` with deterministic color from name hash
- Created `ShareButton` with Web Share API and clipboard fallback
- Created `PrintButton` for triggering browser print
- Created `ScrollSpy` fixed sidebar ToC with IntersectionObserver
- Created `Collapsible` expandable/collapsible section
- Created `KeyboardShortcuts` overlay with `?` toggle, `g+*` navigation, `/` search focus

### API Routes
- Added `GET /api/articles/[id]/word-count` for article word/character/reading time stats
- Added `GET /api/stats` public endpoint for wiki-wide statistics
- Added `GET /api/articles/[id]/backlinks` for article backlink queries
- Added `GET /api/sitemap` generating XML sitemap
- Added `GET /api/articles/recent` with configurable limit
- Added `GET /api/categories/tree` returning full nested hierarchy
- Added `GET /api/tags/popular` sorted by article count
- Added `GET /api/articles/[id]/related` finding related articles by category/tag overlap
- Added `GET /api/users` (admin only) for user listing with contribution counts
- Added `POST/GET /api/articles/[id]/views` for view count tracking via MetricLog
- Added `PATCH /api/articles/[id]/status` for quick status changes
- Added `GET /api/articles/orphans` (admin) for articles with no incoming links
- Added `GET /api/articles/dead-links` (admin) for broken wiki link detection
- Added `GET /api/articles/[id]/rating` for article rating aggregation
- Added `GET /api/articles/[id]/export` for single-article Markdown/HTML export

### Page & UX Improvements
- Added keyboard shortcuts overlay (press `?` anywhere) with navigation and search shortcuts
- Added word count and reading time display on article pages
- Added "last edited by" user attribution with link to user profile
- Added breadcrumb navigation on article pages showing category hierarchy
- Added Copy Link, Share, and Print buttons on article pages
- Added back-to-top floating button globally
- Added reading progress bar at top of article pages
- Added ArticleStatusBadge inline on article listing page
- Added OnThisDay section on homepage showing articles created on this date in past years
- Added keyboard shortcut hint in homepage tip section
- Updated category description display on category detail pages
- Created tag cloud page at `/tags` with size-scaled tags
- Added "Articles needing review" queue on admin page with status badges
- Integrated ToastProvider in root layout for app-wide toast notifications

### Sidebar & Navigation
- Made sidebar section headers collapsible with toggle arrows and saved state
- Added total published article count next to "All articles" in sidebar
- Added RSS Feed link in sidebar Tools section
- Added footer links section (API Docs, RSS Feed) at bottom of sidebar
- Moved version label below footer links with border separator

### Editor Improvements
- Added word count, character count, and paragraph count status bar below editor
- Added unsaved changes indicator ("Unsaved changes" / "No changes") in editor status bar
- Added keyboard shortcuts help button (`?`) to editor toolbar
- Added "Insert date" button to editor toolbar inserting current date in long format

### SEO & Meta
- Added Open Graph meta tags for article pages (title, description, image, URL)
- Added Twitter card meta tags (summary card) for social sharing
- Added canonical URL meta tags via `alternates.canonical`
- Added JSON-LD structured data (`schema.org/Article`) with headline, dates, category
- Created `robots.ts` generating `robots.txt` with crawl rules
- Created `sitemap.ts` generating dynamic `sitemap.xml` with articles and categories

## [2.0.0] - 2026-03-02

Complete roadmap implementation — 39 features across 8 phases.

### Editor Improvements (Phase 1)
- Added undo/redo buttons to editor toolbar with keyboard shortcut indicators
- Added code block syntax highlighting via lowlight + highlight.js with dark mode support
- Added drag-and-drop and paste image upload directly into editor
- Added footnotes and citations via custom Tiptap extension (Ctrl+Shift+F) with auto-numbered superscripts and footnote section
- Added merge/split cells, toggle header row/column buttons to table editor
- Added auto-generated table of contents from headings on article pages (hidden if <3 headings)
- Added word-level inline diff view with toggle between line-diff and inline modes
- Added related articles section below content, ranked by shared category/tag overlap

### Organization & Content (Phase 2)
- Article templates auto-apply based on category selection (person, place, event, thing, group)
- Added article status workflow: draft → review → published with status selector in edit page
- Added pinned/featured articles per category, shown at top with pin icon
- Added custom sort order for articles within categories
- Added multi-language support with ArticleTranslation model, translations API, and LanguageSwitcher component
- Random article link in sidebar navigation

### Tag Hierarchy & Management
- Updated Tags API (`/api/tags`) to return nested hierarchy with parent/children relations
- Added PUT and DELETE endpoints at `/api/tags/[id]` for editing and deleting tags
- Created TagManager client component with create, edit, delete, parent assignment, and color picker
- TagManager added to the `/categories` page below CategoryManager

### Article Reorder API
- Improved `/api/articles/reorder` POST endpoint to use Prisma transactions for atomic sort order updates

### Translations API
- New `GET/POST /api/articles/[id]/translations` for listing and creating article translations
- New `GET/PUT/DELETE /api/articles/[id]/translations/[locale]` for per-locale translation management
- Created LanguageSwitcher client component with locale dropdown and `?locale=xx` URL switching

### Advanced Search
- Added category, tag, date range filters to `/api/search` endpoint
- Added search result highlighting with `<mark>` tags around matching terms
- Redesigned search page as client component with "Advanced search" toggle
- Filter sidebar includes category dropdown, tag multi-select with checkboxes, and date range inputs
- Highlighted excerpts rendered with `dangerouslySetInnerHTML`

### Multi-user Authentication
- Added `POST /api/auth/register` with bcryptjs password hashing and validation
- Extended `POST /api/auth/login` to support both legacy admin password and username/password session auth
- Added `getSession()` and `requireRole()` to `src/lib/auth.ts` with backward-compatible `isAdmin()`
- Session-based auth with 30-day expiry stored in `Session` table
- Updated `/api/auth/check` to return session user info alongside admin status
- Updated `/api/auth/logout` to clear both admin and session cookies
- Created `/register` page with account creation form and auto-login
- Created `/login` page with username/password form
- Created `/users/[username]` user profile page showing articles created, edit history, and discussions

### Watchlist & Notifications
- New `GET/POST/DELETE /api/watchlist` for managing watched articles (session-authenticated)
- New `GET/PUT /api/notifications` for listing and marking notifications as read
- Created `/watchlist` page showing watched articles with unwatch controls
- Created NotificationBell component with unread count badge, dropdown list, and mark-all-read
- NotificationBell added to site header next to theme toggle
- Article PUT now notifies all watchers (except the editor) when an article is edited
- Article revisions now record the editing user's ID for attribution

### RSS/Atom Feeds
- Added RSS 2.0 feed at `/feed.xml` with last 50 published articles
- Added Atom feed at `/feed/atom` with matching content
- Added `<link rel="alternate">` tags in HTML head for RSS and Atom autodiscovery

### Public REST API v1
- Added API key authentication via `X-API-Key` header validated against `ApiKey` table
- New `GET /api/v1/articles` endpoint with pagination, category/tag filters
- New `GET /api/v1/categories` endpoint listing all categories with counts
- New `GET /api/v1/tags` endpoint listing all tags with counts
- New `GET /api/v1/search` endpoint with relevance-ranked search
- Added API documentation page at `/api-docs` with endpoint reference and curl examples

### Webhooks
- Added `dispatchWebhook()` fire-and-forget function with HMAC-SHA256 signing
- New `GET/POST /api/webhooks` for listing and creating webhooks (admin only)
- New `PUT/DELETE /api/webhooks/[id]` for updating and deleting webhooks
- Added admin webhook management UI at `/admin/webhooks` with delivery log
- Webhook deliveries logged in `WebhookDelivery` table with status and response code

### MediaWiki Import
- Added `parseMediaWikiXml()` function parsing MediaWiki XML export format
- Converts basic wikitext to HTML (headings, bold, italic, wiki links, lists)
- Import page and API now accept `.xml` files alongside existing formats
- Installed `fast-xml-parser` dependency

### Semantic Wiki Links
- Added relation types system with labeled, invertible semantic link types
- New `SemanticRelations` server component displaying grouped outgoing/incoming links
- New `GET/POST /api/articles/[id]/links` endpoint for managing semantic links
- Seven relation types: related-to, is-part-of, contains, preceded-by, followed-by, see-also, derived-from

### Article Graph Visualization
- Added `GET /api/graph` endpoint returning nodes and edges from wiki links and semantic links
- Supports `?center=slug&depth=N` for local subgraph extraction via BFS
- New full-page graph page at `/graph` with D3 force-directed layout
- Nodes colored by category, with drag, zoom/pan, hover tooltips, and click navigation
- Graph controls panel with category filter, depth slider, and node/edge stats
- Added "Article graph" link to sidebar navigation
- Installed `d3` and `@types/d3` dependencies

### Export System
- Added wiki export page at `/export` with scope (entire wiki or by category) and format (Markdown or HTML) selection
- New `/api/export/markdown` endpoint generates downloadable `.md` file with table of contents
- New `/api/export/html` endpoint generates styled HTML document with TOC and wiki-style CSS
- Uses `contentRaw` (Markdown) when available, falls back to HTML-to-text stripping
- Added "Export" link in sidebar under Tools section

### CI/CD Pipeline
- Added GitHub Actions CI workflow (`.github/workflows/ci.yml`) with lint, type-check, and build jobs
- Lint and type-check job runs ESLint and `tsc --noEmit` after Prisma generate
- Build job depends on lint passing, uses fake DATABASE_URL for static build validation
- Added Dependabot configuration for weekly npm and GitHub Actions dependency updates
- Minor/patch updates grouped into single PRs to reduce noise

### Docker Setup
- Added multi-stage Dockerfile: deps, builder, and runner stages for optimized production images
- Added `docker-compose.yml` with PostgreSQL 16 and app services with health checks
- Added `.dockerignore` to exclude node_modules, .next, .git, and other dev files
- Docker CMD runs `prisma db push` before starting the app server

### Performance Monitoring
- Added `/api/health` endpoint returning status, uptime, DB connectivity, version, and article count
- Added `/api/metrics` endpoint (admin only) with comprehensive dashboard data
- New `src/lib/metrics.ts` with `getMetricsSummary()` aggregating articles, categories, tags, revisions, discussions, and recent activity
- Added admin metrics dashboard at `/admin/metrics` with stat cards, bar charts for top categories and articles by month
- Added "Metrics" link in sidebar Tools section (admin only)

### Map Enhancements
- Added multiple maps support with `MapConfig` management via `/api/maps` endpoints (GET, POST)
- Per-map CRUD at `/api/maps/[mapId]` (PUT, DELETE) with cascading cleanup of layers, detail levels, and markers
- Map layer system via `/api/maps/[mapId]/layers` with create/list and per-layer update/delete
- Map detail levels via `/api/maps/[mapId]/detail-levels` for zoom-dependent imagery
- New `MapSelector` component showing tabs/links for switching between maps
- New `MapManager` admin component for creating, editing, and deleting map configurations
- New `LayerControl` overlay with visibility toggles and opacity sliders per layer
- New `MapSearch` overlay for filtering markers by label or linked article name
- Added `/map/[mapId]` dynamic route page with map selector, layers, and search integration

### Plugin System
- Defined `WikiPlugin` and `PluginManifest` interfaces in `src/lib/plugins/types.ts`
- Created plugin registry with `registerPlugin()`, `loadPlugins()`, `getEnabledPlugins()`, and `runArticleRenderHooks()`
- Plugin state persisted in `PluginState` database table with enable/disable toggle
- Added `/api/plugins` endpoint (admin only) for listing plugins (GET) and toggling state (PUT)
- Added admin plugin management page at `/admin/plugins` with enable/disable controls per plugin
- Added "Plugins" link in sidebar Tools section (admin only)

## [1.9.0] - 2026-02-25

- Added category edit and delete functionality for admin users
- New API route `/api/categories/[id]` with PUT (rename, reparent, update description) and DELETE
- Delete is blocked if category has articles or subcategories (must reassign first)
- CategoryManager redesigned with inline edit/delete controls per category
- Category list shows article count, description, and nested hierarchy

## [1.8.0] - 2026-02-25

- Added subcategory-specific infobox schemas modeled after Wikipedia infobox templates
- Leaders: reign, predecessor, successor, dynasty, coronation
- Artists: medium, style, notable works, influences, patron
- Scientists: fields, institutions, alma mater, doctoral advisor
- Warriors: allegiance, rank, unit, commands, battles fought
- Merchants: guild, trade goods, trade routes, wealth
- Cities: country, region, demonym, elevation, landmarks
- Regions: capital, borders, terrain, resources, major cities
- Landmarks: elevation, span, significance
- Buildings: architect, style, floors, purpose
- Governments: head of state, legislature, ideology, currency
- Military: branch, strength, equipment, engagements, motto
- Religious orgs: deity, scripture, holy sites, practices
- Guilds: trade, ranks, services, rivals
- Battles: belligerents, commanders, strength, casualties per side
- Ceremonies: frequency, traditions, significance
- Discoveries: discoverer, field, method
- Disasters: deaths, injuries, damage, aftermath
- Weapons: smith, length, weight, wielders, battles
- Artifacts: powers, age, previous owners
- Documents: author, language, pages, copies, significance
- Tools: used for, used by
- Magic: source, requirements, limitations, applications
- Religions: deities, holy text, clergy, core beliefs
- Laws: jurisdiction, penalties, enforced by, supersedes
- Languages: family, writing system, ancestor language, speakers
- Seed script now updates icons on re-run instead of skipping existing records

## [1.7.1](https://github.com/mohammed-alsalhi/wiki-app/commit/b31dd22) - 2026-02-25

- Added ARCHITECTURE.md documenting stack, directory structure, database models, key patterns, and API routes
- Added CONTRIBUTING.md with setup guide, development workflow, code style, and contribution guidelines
- Added ROADMAP.md with planned features organized by near-term, medium-term, and long-term goals

## [1.7.0](https://github.com/mohammed-alsalhi/wiki-app/commit/eb6f0a8) - 2026-02-25

- Added category-specific infobox fields: each root category (People, Places, Organizations, Events, Things, Concepts) has its own field schema
- Infobox fields include text, textarea, number, wikilink, and list types with placeholders
- Subcategories inherit their parent's infobox schema via parent chain walk
- InfoboxEditor component shows relevant fields when a category is selected on new/edit pages
- InfoboxDisplay component renders filled fields above standard rows (Category, Tags, Created, Updated)
- Wikilink fields render as clickable article links; list fields display as comma-separated items
- Added `infobox` JSON field to Article and ArticleRevision models in Prisma schema
- API routes (POST/PUT) now accept and store infobox data; revisions snapshot infobox state
- CategorySelect now accepts optional external `categories` prop to avoid duplicate fetches
- Added 24 subcategories across all 6 root categories in seed file (Leaders, Cities, Guilds, Battles, Weapons, Magic, etc.)
- Fixed "Detect Links" potential link marks persisting in saved content and showing to viewers
- Existing articles without infobox data continue to display correctly (backward compatible)

## [1.6.0](https://github.com/mohammed-alsalhi/wiki-app/commit/3890f0f) - 2026-02-25

- Redesigned home page with improved layout and visual hierarchy
- Added stat badges showing article/category/tag counts with links
- Added styled action buttons (Create, Browse, Search, Map)
- Added "Featured article" section highlighting the longest published article with excerpt
- Recent changes list now shows excerpts, category badges, and better spacing
- Replaced plain Statistics table and Getting started notice with "Explore" quick-links grid
- Added "View all" links in portal headers for Recent changes and Categories
- Home page now only counts published articles in stats
- Added CSS for `.home-stat-badge` and `.home-action-btn` components

## [1.5.0](https://github.com/mohammed-alsalhi/wiki-app/commit/33312e4) - 2026-02-25

- Added full map area editing: select existing areas, edit label/article/color, and save changes
- Added draggable polygon vertex handles for reshaping areas in real-time
- Added color picker with 8 preset colors and custom color input for map areas
- New area form also supports color selection
- Hover tint on map areas in view mode uses stored area color
- Click-to-select areas in edit mode replaces popups with a side panel form
- Click empty map space to deselect current area
- Fixed link editing bubble: now appears on hover instead of requiring a click
- Added NodeSelection detection for wiki link atoms in the editor
- Prevented accidental navigation when clicking links inside the editor
- Dismiss timer with 200ms delay allows moving mouse from link to bubble
- Updated help page and help.md with map editing and link hover documentation

## [1.4.0](https://github.com/mohammed-alsalhi/wiki-app/commit/4308e71) - 2026-02-25

- Added link editing bubble: floating Edit/Remove tooltip appears when cursor is on a link
- Edit mode for regular links (change URL) and wiki links (change target article title)
- Remove option keeps text in place but strips the link
- Updated help page and help.md with documentation for tables, link editing, redirects, discussions, and batch operations
- Added Table button to editor toolbar documentation

## [1.3.0](https://github.com/mohammed-alsalhi/wiki-app/commit/ba616cd) - 2026-02-25

- Added batch operations on articles list page (admin only)
- Checkbox column for selecting articles, with select-all toggle
- Batch action bar with Set Category, Publish, Unpublish, and Delete actions
- Category dropdown appears when "Set Category" is selected
- Delete requires confirmation dialog before proceeding
- Converted articles page from server component to client component
- New `/api/articles/batch` endpoint for bulk PUT (category/publish) and DELETE
- Wrapped page in Suspense boundary for `useSearchParams` compatibility

## [1.2.0](https://github.com/mohammed-alsalhi/wiki-app/commit/f507fdf) - 2026-02-25

- Added table support in Tiptap editor using TableKit extension
- Toolbar shows Insert Table button, plus row/col add/delete when cursor is inside a table
- Added table CSS styles for both editor and article display (borders, header highlighting, selected cell)
- Added redirect pages: articles can redirect to another article via `redirectTo` field
- Redirect field in article edit page with slug input and preview
- Server-side redirect in article display page when `redirectTo` is set
- Added per-article discussion/talk pages with comment threads
- Discussion tab added to all article sub-pages (article, edit, history, diff)
- Anyone can post comments with optional author name; admin can delete comments
- New Discussion model in Prisma schema with article relation
- New API endpoint `/api/articles/[id]/discussions` (GET, POST, DELETE)

## [1.1.3](https://github.com/mohammed-alsalhi/wiki-app/commit/d6938e5) - 2026-02-25

- Fixed self-referencing commit link for 1.1.2 in CHANGELOG.md

## [1.1.2](https://github.com/mohammed-alsalhi/wiki-app/commit/a529355) - 2026-02-25

- Added commit links to every version heading in CHANGELOG.md
- Version headers now link to the corresponding commit on GitHub

## [1.1.1](https://github.com/mohammed-alsalhi/wiki-app/commit/d8de900) - 2026-02-25

- Added in-app Help page (`/help`) documenting all features, editor tricks, and keyboard shortcuts
- Added `help.md` for GitHub with the same content in markdown format
- Added "Help" link to sidebar navigation

## [1.1.0](https://github.com/mohammed-alsalhi/wiki-app/commit/5d47196) - 2026-02-25

- Added wiki link suggester: typing `[[` in the editor opens an autocomplete dropdown
- Dropdown searches existing articles with debounced queries, keyboard navigation, and click selection
- Added "Detect Links" toolbar button that scans text for phrases matching existing article titles
- Detected links shown with dashed underline; clicking converts them to wiki links
- Count badge on toolbar button shows number of detected potential links
- Created PotentialLink Tiptap mark extension for detected link highlighting
- Created `/api/articles/titles` lightweight endpoint for fetching all article titles
- Longer title matches take priority; word boundary checking prevents partial matches

## [1.0.4](https://github.com/mohammed-alsalhi/wiki-app/commit/2d62cd6) - 2026-02-25

- Widened content area max-width from 1024px to 1152px
- Redesigned theme toggle as clean sun/moon icon button in header
- Added global transition class so all elements change theme at the same rate
- Cleaned up search bar: replaced label/Go button with search icon and placeholder
- Removed rounded corners from search bar to match wiki style
- Aligned header right edge with content area padding

## [1.0.3](https://github.com/mohammed-alsalhi/wiki-app/commit/e557aa8) - 2026-02-25

- Fixed bold and italic lost when switching from markdown mode back to rich text
- Added `**bold**` → `<strong>` and `*italic*` → `<em>` conversion in basicMarkdownToHtml
- Inline formatting now applied to both paragraph and heading content

## [1.0.2](https://github.com/mohammed-alsalhi/wiki-app/commit/8d4753c) - 2026-02-25

- Fixed markdown-to-rich-text conversion eating paragraphs into headings
- Headings now always produce separate blocks (double newline after headings in markdown output)
- Rewrote basicMarkdownToHtml to parse line-by-line instead of splitting by double newlines
- Single newline after a heading no longer merges the following paragraph into the heading

## [1.0.1](https://github.com/mohammed-alsalhi/wiki-app/commit/e84d1d6) - 2026-02-23

- Added delete button with confirmation dialog on article edit page
- Added editable slug field with live URL path preview
- API now validates slug uniqueness on update and returns error if taken

## [1.0.0](https://github.com/mohammed-alsalhi/wiki-app/commit/bf95767) - 2026-02-23

- Added article import feature with CLI and UI
- Drag-and-drop multi-file import page at /import (admin only)
- CLI bulk import script with --draft, --category, --dry-run flags
- Supports Markdown (.md), Text (.txt), HTML (.html), JSON (.json)
- Markdown frontmatter support for title extraction
- JSON supports single objects or arrays for multi-article import
- Added `marked` dependency for Markdown-to-HTML conversion
- Added `npm run import` convenience script

## [0.9.0](https://github.com/mohammed-alsalhi/wiki-app/commit/8617d86) - 2026-02-23

- Added version label at bottom of sidebar, reading from package.json at build time
- Exposed `NEXT_PUBLIC_APP_VERSION` via next.config.ts

## [0.8.0](https://github.com/mohammed-alsalhi/wiki-app/commit/ac6de47) - 2026-02-23

- Added custom display text for wiki links (`[[Title|Display Text]]` syntax)
- Added InputRules for auto-converting `[[Title]]` and `[[Title|Label]]` while typing
- Fixed wiki link round-trip between rich text and markdown modes
- Fixed Link extension conflict by excluding `a[data-wiki-link]` from parseHTML
- Added text selection support for wiki link toolbar button and keyboard shortcut
- Changed wiki link keyboard shortcut to Ctrl+Shift+L

## [0.7.2](https://github.com/mohammed-alsalhi/wiki-app/commit/92faed0) - 2026-02-23

- Fixed wiki link typing: `[[Article Name]]` now auto-creates wiki link nodes via InputRule
- Fixed markdown mode: wiki links preserved when switching between rich text and markdown

## [0.7.1](https://github.com/mohammed-alsalhi/wiki-app/commit/ec5bc04) - 2026-02-23

- Added Vercel Web Analytics integration

## [0.7.0](https://github.com/mohammed-alsalhi/wiki-app/commit/f6d63ad) - 2026-02-23

- Replaced map pin markers with clickable polygon areas
- Areas are invisible overlays; tooltip appears on hover, click navigates to linked article
- Edit mode: draw polygon vertices on map, finish with double-click or button
- Existing areas shown with dashed outlines in edit mode with delete option
- Removed emoji icon system (map image provides visual symbols)

## [0.6.3](https://github.com/mohammed-alsalhi/wiki-app/commit/019a861) - 2026-02-23

- Updated favicon

## [0.6.2](https://github.com/mohammed-alsalhi/wiki-app/commit/c35a2cd) - 2026-02-23

- Updated world map image

## [0.6.1](https://github.com/mohammed-alsalhi/wiki-app/commit/c000fa1) - 2026-02-23

- Added MIT License
- Added README with deploy instructions
- Added CLAUDE.md with architecture documentation

## [0.6.0](https://github.com/mohammed-alsalhi/wiki-app/commit/acc5709) - 2026-02-23

- Productized wiki with environment variable configuration
- All branding driven by `NEXT_PUBLIC_*` env vars with sensible defaults
- Made article templates generic (Person, Place, Event, Thing, Group)
- Made seed categories generic (People, Places, Organizations, Events, Things, Concepts)
- Added empty-state onboarding page for fresh deployments
- Map feature hidden by default, enabled via `NEXT_PUBLIC_MAP_ENABLED`
- Created .env.example documenting all environment variables

## [0.5.0](https://github.com/mohammed-alsalhi/wiki-app/commit/196a80a) - 2026-02-23

- Added sub-category management with parent assignment
- Category tree display with indented subcategories
- Admin-only category creation with parent selector

## [0.4.0](https://github.com/mohammed-alsalhi/wiki-app/commit/2205b82) - 2026-02-23

- Improved search with relevance-based ranking (exact title > starts with > contains > content-only)
- Multi-word queries use AND logic (each word must appear somewhere)
- Trimmed whitespace from search queries
- Clear search input on navigation and result clicks

## [0.3.2](https://github.com/mohammed-alsalhi/wiki-app/commit/10ac684) - 2026-02-23

- Fixed dark mode: changed `@theme inline` to `@theme` so CSS variable overrides work

## [0.3.1](https://github.com/mohammed-alsalhi/wiki-app/commit/7aafdbb) - 2026-02-23

- Fixed dark mode by replacing ~13 hardcoded `bg-white` instances with `bg-surface`
- Replaced hardcoded colors in SearchBar and admin page with theme variables

## [0.3.0](https://github.com/mohammed-alsalhi/wiki-app/commit/a9bd57b) - 2026-02-23

- Added article revision history with content snapshots and diff viewer
- Added nested sub-categories with collapsible sidebar tree
- Added dark mode with CSS variable theming and localStorage persistence
- Added Recent Changes page with timeline grouped by date
- Added disambiguation pages with similar title detection
- Added 6 article templates (Character, Location, Event, Item, Faction, Blank)
- Added Export to PDF (browser print) and Export to Markdown (file download)

## [0.2.0](https://github.com/mohammed-alsalhi/wiki-app/commit/b7eaf40) - 2026-02-23

- Added cookie-based admin authentication with `ADMIN_SECRET` env var
- Protected all write API routes with admin check
- Created login/logout/check API endpoints and /admin page
- Hidden edit UI for non-admin users
- No auth required in local dev when `ADMIN_SECRET` is unset

## [0.1.1](https://github.com/mohammed-alsalhi/wiki-app/commit/b3d87be) - 2026-02-23

- Switched image uploads from local filesystem to @vercel/blob cloud storage
- Added postinstall script for Prisma generate during Vercel build
- Updated build script to run prisma db push before next build

## [0.1.0](https://github.com/mohammed-alsalhi/wiki-app/commit/e6bfb5b) - 2026-02-23

- Initial release
- Next.js 16 App Router with React 19, TypeScript, Prisma 7, PostgreSQL
- Tiptap rich text editor with wiki link support (`[[Article Name]]`)
- Article CRUD with slug-based routing
- Category system for organizing articles
- Full-text search
- Interactive world map with Leaflet (CRS.Simple pixel coordinates)
- Map markers linked to articles
