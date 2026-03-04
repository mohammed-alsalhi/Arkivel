# Changelog

All notable changes to this project are documented here.

## [4.8.0] - 2026-03-03

### Navigation

- Redesigned sidebar with comprehensive section coverage — all app pages now listed
- Replaced all unicode symbols (▶ ▼ ✕ ☰) with inline SVG icons per design standards
- Added animated SVG chevrons (`transition-transform`) for section collapse/expand
- Reorganised into six logical sections: Navigation, Discover, Personal, Tools, Contribute (admin), Admin (admin)
- **Navigation**: added `/tags` page
- **Discover**: added `/activity`, `/change-requests`, `/reviews`, `/bounties`, `/forks`
- **Personal**: added `/watchlist`, `/settings`
- **Contribute** (admin): added `/import/obsidian` and `/import/notion` as indented sub-items
- **Admin** (admin): added `/admin/analytics`, `/admin/health`, `/admin/webhooks`, `/admin/templates`, `/admin/theme`, `/admin/lint`, `/admin/knowledge-gaps`, `/admin/embeddings`, `/admin/search-gaps`, `/admin/staleness`
- Admin section defaults to collapsed to keep sidebar compact
- Mobile toggle button upgraded to SVG hamburger/close icons with `aria-label` and `aria-pressed`

## [4.7.1] - 2026-03-03

### Bug Fixes

- Fixed duplicate `link` Tiptap extension warning: disabled Link from StarterKit (`link: false`) since it's registered manually with custom `parseHTML` rules
- Fixed `You should provide an instance of lowlight` Tiptap error: `MermaidBlock` (which extends `CodeBlockLowlight`) now receives the `lowlight` instance via `.configure({ lowlight })`
- Both fixes resolve editor crash and `TypeError: Cannot read properties of undefined (reading 'length')` cascade error

## [4.7.0] - 2026-03-03

### Accessibility & Internationalisation

- Added `dir` field (`"ltr"` / `"rtl"`) to Article model for per-article text direction
- Added `src/lib/translation.ts` — machine translation via DeepL or Google Translate API (env-gated)
- Added `src/lib/tts.ts` — optional ElevenLabs speech synthesis + browser TTS fallback
- Added `/api/articles/[id]/translate` — POST to create machine-translated draft ArticleTranslation
- Added `/api/articles/[id]/narrate` — GET to stream audio via ElevenLabs; returns 501 instructing client to use browser TTS when key not set
- Added `AudioNarrationPlayer` component — play/pause/stop/speed controls; uses ElevenLabs API when available, falls back to browser `speechSynthesis`
- Added `DyslexiaToggle` component — toggles `data-dyslexia` on `<html>`; persists to localStorage
- Added `RTLToggle` component — per-article toggle overriding text direction without page reload
- Added `TranslateButton` component — locale picker triggering POST to translate API with inline status
- Added dyslexia-friendly CSS: OpenDyslexic font stack, increased letter/word spacing, warm background tint
- Added RTL CSS: mirrored infobox and TOC floats, right-aligned text, `direction: rtl` on breadcrumb
- Added skip-to-content link (`<a href="#main-content">`) at top of body for keyboard navigation
- Added `id="main-content"` to `<main>` element in layout
- Added `id="article-content"` wrapper div with `dir` attribute on article content
- Updated article page action bar with DyslexiaToggle, RTLToggle, TranslateButton, AudioNarrationPlayer
- Bumped version 4.6.0 → 4.7.0

## [4.6.0] - 2026-03-03

### Analytics & Health

- Added `ScrollDepthLog` model — tracks max scroll depth per session per article
- Added `ReaderPathEvent` model — logs article-to-article navigation for path analysis
- Added `ContributorAchievement` model — automated badge awards for edit milestones and streaks
- Added `/api/analytics/scroll` — POST to log scroll depth, GET to retrieve bucketed heatmap data
- Added `/api/analytics/paths` — POST to log navigation events, GET top next-pages for a given article
- Added `/api/analytics/search-gaps` — aggregates zero-result search queries from MetricLog
- Added `/api/analytics/staleness` — lists published articles not updated in N days (default 180)
- Added `/api/achievements` — GET user's achievements, POST to trigger check for a userId
- Added `src/lib/achievements.ts` — `checkAndAwardAchievements(userId)` with SM-2 streak detection
- Added `ScrollDepthTracker` client component — IntersectionObserver-based, debounced POST
- Added `ReaderPathTracker` client component — logs article navigation via sessionStorage
- Added `/admin/analytics` page — overview: avg scroll depth, top navigation paths, search gap count
- Added `/admin/search-gaps` page — zero-result queries table with "Create article" shortcuts
- Added `/admin/staleness` page — stale articles sorted oldest first with inline Edit links
- Added `/admin/health` page — wiki health score card with grade (A–F) and metric breakdown
- Wired `checkAndAwardAchievements` into article PUT route (fire-and-forget)
- Updated search route to log zero-result queries as `MetricLog` entries
- Bumped version 4.5.0 → 4.6.0

## [4.5.0] - 2026-03-03

### Integrations & Export

- Added `IssueLink` model — attach GitHub/Jira/Linear issue URLs to articles with live status refresh via GitHub API
- Added `EmbedToken` model — generate secure tokens for embedding articles on external sites
- Added ePub export (`/api/export/epub`) — single-article ePub 3 with valid container, OPF, and nav
- Added DOCX export (`/api/export/docx`) — Word document with headings, paragraphs, and metadata
- Added category ZIP export (`/api/export/category`) — all published articles as Markdown files in a zip
- Added Obsidian vault import (`/api/import/obsidian`) — .md or .zip vault; front matter, tags, `[[wikilinks]]` converted
- Added Notion page import (`/api/import/notion`) — fetch via integration token, blocks converted to HTML
- Added Slack bot (`/api/integrations/slack`) — `/wiki <query>` slash command with signature verification
- Added Discord bot (`/api/integrations/discord`) — `/wiki` interaction command with Ed25519 signature verification
- Added embed token API (`/api/embed/token`) — create tokens, serve articles at `/embed/[token]` (minimal iframe view)
- Added `ArticleExportMenu` component — ePub, DOCX, PDF (print) export dropdown replacing export buttons
- Added `IssueLinkBadge` component — inline badges showing issue status with provider icon on article pages
- Added `/import/obsidian` page — drag-drop vault upload UI with import preview
- Added `/import/notion` page — integration token + page ID form
- Updated import index page with Obsidian and Notion import cards
- Bumped version 4.4.0 → 4.5.0

## [4.4.0] - 2026-03-03

### Build Fixes (v4.2.0 regression)

- Fixed `ssr: false` not allowed in Server Components: replaced `src/lib/renderSpecialBlocks.tsx` with `SpecialBlocksRenderer` client component
- Fixed Tiptap custom commands type errors: added `declare module "@tiptap/core"` augmentations to MermaidExtension, KaTeXExtension, DataTableExtension, DecisionTreeExtension
- Fixed `VoiceDictationButton` `SpeechRecognitionEvent` type not found: replaced with inline interface
- Fixed `DataTable` `sourceType` required prop: made optional with `"csv"` default
- Fixed digest route: removed invalid `where` clause inside relation `include`; filter applied post-query

### Collaboration 2.0

- Added `ExpertBadge` model — admins designate domain experts per category; badge highlighted on article bylines
- Added `KnowledgeBounty` model — users request articles; editors claim/fulfill; linked from fulfilled article
- Added `ArticleFork` model — branch a full article rewrite; propose merge when ready; admin accept/reject with diff
- Added `ArticleReaction` model — helpful/insightful/outdated/confusing reaction strip per article
- Added `certified` + `certifiedAt` fields to `Article` — set after ≥2 expert review approvals
- Added `GET|POST /api/expert-badges`, `DELETE /api/expert-badges/[id]` — admin grants/revokes expert badges
- Added `GET|POST /api/bounties`, `GET|PUT /api/bounties/[id]` — bounty lifecycle (open→claimed→fulfilled→closed)
- Added `GET|POST /api/articles/[id]/fork`, `GET|PUT|POST /api/forks/[id]` — fork CRUD + admin merge/reject
- Added `GET|POST /api/articles/[id]/react` — reaction counts and voting
- Added `POST /api/articles/[id]/certify` — verifies ≥2 approved reviews, sets certified flag
- Added `/bounties` page — list open/claimed/fulfilled bounties + request form
- Added `/forks` admin page — proposed forks with merge/reject buttons
- Added `ArticleReactionBar` client component — emoji reaction strip with live counts
- Added `CertifiedBadge` component — "✓ Verified" badge shown in article header
- Modified article page — added `ArticleReactionBar`, `CertifiedBadge`, "Fork this article" link
- Added `SpecialBlocksRenderer` client component to handle special block rendering safely

## [4.3.0] - 2026-03-03

### Discovery & Navigation

- Added `SmartCollection` model — live collection defined by tag/category/author/date query; auto-updates as articles change
- Added `Bookmark` model — per-user article bookmarks with optional private note
- Added `ReadingList` + `ReadingListItem` models — named, ordered article lists with public share token
- Added `TILPost` model — "Today I Learned" snippets (max 280 chars) with tag support
- Added `GET|POST /api/smart-collections`, `GET|PUT|DELETE /api/smart-collections/[id]` — CRUD + live article query execution
- Added `GET|POST|DELETE /api/bookmarks` — bookmark management with per-article notes
- Added `GET|POST /api/reading-lists`, `GET|PUT|DELETE /api/reading-lists/[id]`, `GET|POST|DELETE /api/reading-lists/[id]/items`
- Added `GET|POST /api/til`, `DELETE /api/til/[id]` — TIL feed with tag filtering and 280-char validation
- Added `/collections` and `/collections/[id]` — smart collection browse + live article list
- Added `/bookmarks` — personal bookmark list with inline search
- Added `/reading-lists` and `/reading-lists/[id]` — list browse + ordered articles with share link
- Added `/til` — community TIL board with post form, tag filter, character counter
- Added `/explore` — guided semantic-walk "take me somewhere interesting" (fallback to random)
- Added `SessionReadingTrail` — collapsible "you were here" breadcrumb in article pages (sessionStorage-backed)
- Added `BookmarkButton` — bookmark button with note popover for article action bar
- Added `AddToReadingList` — reading-list picker dropdown for article action bar
- Added Discover sidebar section with links to all new features
- Modified article page — added `SessionReadingTrail`, `BookmarkButton`, `AddToReadingList`

## [4.2.0] - 2026-03-03

### Rich Content Blocks

- Added `MermaidExtension` Tiptap extension — renders ` ```mermaid ``` ` code blocks as `data-mermaid` placeholders; client-side `MermaidBlock` calls `mermaid.render()` on mount
- Added `KaTeXExtension` — `InlineMath` Mark (`$...$`) and `BlockMath` Node (`$$...$$`) store raw LaTeX; client `KaTeXBlock` renders via `katex.render()`
- Added `DataTableExtension` — paste CSV/JSON into a block stored as base64 `data-table`; client `DataTable` provides sortable/filterable table with CSV download
- Added `DecisionTreeExtension` — branching yes/no tree stored as JSON; `DecisionTreeDisplay` renders recursive expand/collapse tree
- Added `VoiceDictationButton` — Web Speech API dictation at cursor; hidden when browser lacks support
- Added `/present/[slug]` page — Reveal.js-style slideshow splitting article by headings; keyboard nav, dot indicators, exit link
- Added `GET /api/articles/[id]/present` — parses article HTML into slide array
- Added `src/lib/renderSpecialBlocks.tsx` — replaces special block HTML with lazy-loaded React client components
- Modified `TiptapEditor` — registered MermaidBlock, InlineMath, BlockMath, DataTable, DecisionTree extensions
- Modified `EditorToolbar` — added Σ (KaTeX) button and VoiceDictationButton
- Modified `SlashCommandExtension` — added Mermaid Diagram, Math (KaTeX), Data Table, Decision Tree slash commands
- Modified article display page — renders special blocks via `renderSpecialBlocks`; added "Present" button
- Installed `mermaid`, `katex`, `reveal.js`, `@types/katex`

## [4.1.0] - 2026-03-03

### Learning & Retention

- Added `LearningPath`, `LearningPathArticle`, `LearningPathProgress`, `Flashcard`, `QuizAttempt`, `ArticleRead` Prisma models
- Added `src/lib/sm2.ts` — SM-2 spaced repetition algorithm with interval/ease-factor/repetition tracking
- Added `src/lib/readability.ts` — re-exports from writing-coach for easy import
- Added `GET|POST /api/learning-paths`, `GET|PUT|DELETE /api/learning-paths/[id]`, `GET|POST /api/learning-paths/[id]/progress`
- Added `GET|POST /api/flashcards`, `POST /api/flashcards/[id]/review` (SM-2 grade application)
- Added `GET /api/ai/quiz?articleId=` — Claude Haiku generates 5 MCQs from article
- Added `POST /api/quiz-attempts`, `GET /api/quiz-attempts` — persist and retrieve quiz attempt results
- Added `POST|GET /api/reading-progress` — mark articles as read; reading stats per category
- Added `POST /api/digest` — cron-triggerable daily digest mailer via nodemailer (gated on `SMTP_HOST`)
- Added `/learning-paths` browse page with enroll buttons
- Added `/learning-paths/[id]` path detail with progress bar
- Added `/learning-paths/new` path creation form
- Added `/flashcards` spaced-repetition review UI with SM-2 grade buttons (0–5)
- Added `ArticleComplexityBadge` component — reading time + grade level badge
- Added `ReadingProgressRing` component — SVG progress ring for category pages
- Modified `src/lib/preferences.ts` — added `digestEnabled`, `digestTime`, `digestTimezone` defaults
- Installed `nodemailer` and `@types/nodemailer`

## [4.0.0] - 2026-03-03

### AI Intelligence Layer

- Added `ArticleEmbedding` model for storing article embeddings (Float[]) with `pgvector`-compatible schema
- Added `summary` and `summaryShort` fields to `Article` for AI-generated descriptions
- Added `src/lib/embeddings.ts` — `generateEmbedding()`, `cosineSimilarity()`, `upsertArticleEmbedding()`, `semanticSearch()` via OpenAI `text-embedding-3-small` (gated on `OPENAI_API_KEY`)
- Added `src/lib/writing-coach.ts` — pure-JS Flesch-Kincaid readability, passive-voice detection, long-sentence analysis, `analyzeWriting()` and `computeReadability()`
- Added `POST /api/articles/[id]/summarize` — generate and persist `summary` + `summaryShort` via Claude Haiku
- Added `GET|POST /api/ai/embeddings` — generate article embeddings; list articles missing embeddings
- Added `GET /api/ai/semantic-search` — cosine-rank articles by query embedding
- Added `GET /api/ai/knowledge-gaps` — find wiki-link references with no backing article, sorted by reference count
- Added `POST /api/ai/check-duplicate` — compare new content against existing embeddings to detect near-duplicates
- Added `POST /api/ai/writing-coach` — readability analysis + optional Claude suggestions
- Added `GET /api/ai/category-gaps` — Claude-generated list of missing sub-topics for a category
- Added `WritingCoachPanel` component — collapsible analysis panel below editor with score meter and issue list
- Added `/admin/knowledge-gaps` page — table of missing topics with "Create article" shortcut
- Added `/admin/embeddings` page — embedding coverage dashboard with "Generate all" button
- Modified `PUT /api/articles/[id]` — background-fires summarise and embedding generation after save
- Modified `GET /api/articles/preview` — includes `summaryShort` in response
- Modified `GET /api/search` — blends semantic results when `?semantic=1` and `OPENAI_API_KEY` is set
- Modified article page metadata — uses `summaryShort` as OG/meta description when available
- Installed `pgvector` and `@ai-sdk/openai` packages

## [3.0.3] - 2026-03-03

### Fixed
- Fixed `WikiMembership` orderBy using non-existent `createdAt` field — changed to `id`
- Fixed `activity.ts` metadata JSON field type error — cast `Record<string, unknown>` to `Prisma.InputJsonValue`
- Re-ran `prisma generate` to include `ArticleEmbedding` model missing from previous client generation
- Confirmed zero TypeScript errors via `tsc --noEmit` before pushing

## [3.0.2] - 2026-03-03

### Fixed
- Fixed TypeScript build errors in `/api/saved-searches/route.ts` and `/api/search-history/route.ts` — cast `filters` to `Prisma.InputJsonValue | undefined` for Prisma JSON field compatibility

## [3.0.1] - 2026-03-03

### Fixed
- Fixed TypeScript build error in `/api/preferences/route.ts` — cast `merged` to `Prisma.InputJsonValue` to satisfy Prisma's JSON field type constraint

## [3.0.0] - 2026-03-03

Complete implementation of all roadmap features — 40 items across 10 phases.

### Phase 1: Testing Infrastructure
- Added Vitest unit test suite for `utils.ts`, `auth.ts`, `wikilinks.ts`, `config.ts`, `relations.ts`
- Added integration tests for article CRUD and auth flows in `src/app/api/__tests__/`
- Added Playwright E2E tests for homepage, navigation, and critical user journeys in `e2e/`
- Added axe-core accessibility audit tests via `@axe-core/playwright` on key pages
- Updated CI pipeline with separate `test` and `e2e` jobs in GitHub Actions
- Added `"test"`, `"test:watch"`, `"test:e2e"` scripts to `package.json`

### Phase 2: Editor Improvements
- Added slash command menu (`/` trigger) via new `SlashCommandExtension.ts` + `SlashCommandMenu.tsx` with 10+ block types
- Added inline comments and annotations via new `InlineCommentExtension.ts` Tiptap mark
- Added collapsible/toggle blocks via new `CollapsibleBlockExtension.ts` rendering `<details><summary>` HTML
- Added Markdown paste detection — pasting Markdown text auto-converts to rich text using `marked`
- Extended `TiptapEditor.tsx` to use all new extensions

### Phase 3: Content Features
- Added article templates marketplace with `ArticleTemplate` model, `/api/templates` route, and `/admin/templates` management page
- Added scheduled publishing with `publishAt` field on Article and `/api/articles/[id]/schedule` endpoint
- Added article archival with `archivedAt` field and restore capability
- Added content linting system in `src/lib/linting.ts` — checks broken links, missing excerpts, orphaned articles, short content, no tags/category
- Added `/api/articles/lint` bulk lint endpoint and `/admin/lint` report page
- Added bulk tag editing via `POST /api/tags/bulk-assign` supporting add/remove operations

### Phase 4: Search & Discovery
- Added PostgreSQL `tsvector` full-text search in `src/lib/search.ts` with `tsvectorSearch()` — GIN-indexed, trigger-updated, falls back to LIKE on failure
- Added trigram fuzzy matching via `pg_trgm` extension; migration in `prisma/migrations/add_tsvector/`
- Added saved searches with `SavedSearch` model and `/api/saved-searches` endpoints
- Added search history with `SearchHistory` model and `/api/search-history` endpoints
- Added author and status filters to search page via `/api/users/contributors` endpoint

### Phase 5: User Experience
- Added bottom mobile navigation bar (`MobileNavigation.tsx`) — 5 tabs, active state, safe area support
- Added VS Code-style command palette (`CommandPalette.tsx`) — Ctrl+K, fuzzy filtering, 18 commands, article search
- Added `src/lib/commands.ts` command registry with navigation, action, and admin command groups
- Added inline article link previews (`WikiLinkPreview.tsx`) — 300ms hover delay, cached, portal-rendered
- Added `/api/articles/preview` lightweight preview endpoint
- Added user settings page at `/settings` with editor, notifications, display, and locale sections
- Added `UserPreference` model, `/api/preferences` endpoint, `src/lib/preferences.ts`

### Phase 6: Collaboration
- Added activity feed system with `ActivityEvent` model, `src/lib/activity.ts` `logActivity()` utility, `/api/activity` paginated API, and `/activity` page
- Added article review workflow with `ReviewRequest` + `ReviewComment` models, `/api/reviews` CRUD endpoints, review comments, and `/reviews` dashboard
- Added change request (suggestion) mode with `ChangeRequest` model, `/api/change-requests` CRUD endpoints, accept-applies-content flow, and `/change-requests` page
- Added real-time collaborative editing via `server/collab-server.ts` (standalone WebSocket server) and `src/lib/collaboration/provider.ts` client
- WebSocket server uses Yjs CRDT + y-protocols for sync and awareness

### Phase 7: Infrastructure
- Added S3/R2 storage provider in `src/lib/storage.ts` — `StorageProvider` interface, `VercelBlobStorage` and `S3Storage` implementations, config via `STORAGE_PROVIDER` env var
- Added Redis caching layer in `src/lib/cache.ts` — ioredis singleton, `cacheGet`/`cacheSet`/`cacheInvalidate`/`cacheDel`, graceful degradation
- Added database read replica support in `src/lib/prisma-replica.ts` — `prismaRead` client, falls back to primary
- Added Incremental Static Regeneration to article pages — `revalidate = 300` + `revalidatePath()` calls on article update/delete

### Phase 8: API & Integrations
- Added API v2 at `/api/v2/` — cursor-based pagination, field selection, consistent `{ data, meta }` envelope
  - Endpoints: `articles`, `articles/[id]`, `search`, `categories`, `tags`
- Added OAuth2 login via NextAuth v4 — Google and GitHub providers, `src/lib/oauth.ts`, `/api/auth/[...nextauth]` route, links accounts by email
- Added `OAuthAccount` model for storing provider tokens
- Added Zapier/Make integration — subscribe/unsubscribe REST hooks at `/api/webhooks/zapier`, polling trigger at `/api/webhooks/zapier/poll`
- Added CLI tool in `cli/` — `wiki articles list|get|create`, `wiki search`, `wiki export`, `wiki import` — uses API v2, reads config from `~/.wiki-cli.json`

### Phase 9: Advanced Features
- Added fine-grained RBAC with `PermissionGrant` model and `src/lib/permissions.ts` — per-category and per-article `view`/`edit`/`admin` permissions
- Added `/api/permissions` admin endpoints for granting/revoking permissions
- Added custom theme builder at `/admin/theme` — color pickers for all CSS variables, live preview panel, save/load/export/import themes
- Added `ThemeConfig` model and `/api/themes` CRUD endpoints
- Added AI-assisted features via Vercel AI SDK + Anthropic (`claude-haiku-4-5`):
  - `src/lib/ai.ts` with `summarizeArticle()`, `suggestRelatedTopics()`, `generateContent()`
  - `/api/ai` dispatcher and `/api/ai/summarize` article summarizer
  - Gated by `AI_API_KEY` env var, returns 501 when not configured
- Added multi-wiki support with `Wiki` + `WikiMembership` models, `/api/wikis` CRUD, member management
- Added full offline mode: `public/sw.js` service worker with cache-first strategy, IndexedDB sync queue, background sync
- Added `public/offline.html` fallback page

### Schema Changes (v3.0.0)
12 new Prisma models: `SavedSearch`, `SearchHistory`, `UserPreference`, `ReviewRequest`, `ReviewComment`, `ChangeRequest`, `ActivityEvent`, `OAuthAccount`, `PermissionGrant`, `ThemeConfig`, `Wiki`, `WikiMembership`, `ArticleTemplate`
Modified: `Article` (added `publishAt`, `archivedAt`, `wikiId`), `User` (added all new relations)

### Dependencies Added
`@tiptap/suggestion`, `ioredis`, `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`, `next-auth`, `@auth/prisma-adapter`, `ai`, `@ai-sdk/anthropic`, `yjs`, `y-prosemirror`, `y-protocols`, `ws`, `diff`
Dev: `vitest`, `@vitejs/plugin-react`, `happy-dom`, `@playwright/test`, `@axe-core/playwright`

## [2.5.0] - 2026-03-03

Advanced features: fine-grained RBAC, theme builder, AI integration, multi-wiki support, offline service worker, and contributor API.

### Permissions (Fine-grained RBAC)
- Added `src/lib/permissions.ts` with `checkPermission()`, `grantPermission()`, `revokePermission()`, `getUserPermissions()`, `getResourcePermissions()`, and `checkSessionPermission()` helpers
- `checkPermission()` checks explicit `PermissionGrant` rows first, falls back to role-based defaults; admin role always passes all checks
- Added `GET/POST/DELETE /api/permissions` for listing, granting, and revoking resource permissions (admin only)

### Theme Builder
- Added `src/app/admin/theme/page.tsx` — client-side visual theme builder at `/admin/theme`
- Color pickers for six CSS variables: `--color-accent`, `--color-background`, `--color-surface`, `--color-foreground`, `--color-muted`, `--color-border`
- Live preview panel showing article card, button variants, badges, color swatches, and a form input; preview uses inline CSS variable injection
- Save theme, load from saved-themes dropdown, export as JSON, import from JSON file, and reset to defaults
- Added `GET /api/themes` listing global and user-owned themes (no auth required for global themes)
- Added `POST /api/themes` for creating/saving themes (auth required); handles `isDefault` unset logic
- Added `GET/PUT/DELETE /api/themes/[id]` for single-theme retrieval, update (own theme or admin), and delete

### AI Integration
- Added `src/lib/ai.ts` using Vercel AI SDK (`ai`) + Anthropic provider (`@ai-sdk/anthropic`)
- `summarizeArticle(content)` — strips HTML, limits to 3000 chars, prompts for 2-3 sentence summary
- `suggestRelatedTopics(title, content, existingTags)` — returns up to 5 suggested article topic titles
- `generateContent(prompt, existingContent?)` — generates or continues article content; wraps prompt differently when existing content provided
- All functions check `AI_API_KEY` env var and return null/empty gracefully when not configured
- Added `POST /api/ai` dispatcher for `action: "summarize"|"suggest"|"generate"` (auth required; 501 when AI not configured; 400 for unknown action)
- Added `POST /api/ai/summarize` that fetches an article by ID, enforces visibility, and returns AI summary (auth required)

### Multi-Wiki Support
- Added `GET /api/wikis` listing wikis the user owns or is a member of
- Added `POST /api/wikis` for creating wikis with slug format + uniqueness validation; creator auto-added as admin member via nested create
- Added `GET/PUT/DELETE /api/wikis/[id]` — single wiki with member/article counts; PUT requires wiki admin role; DELETE requires owner
- Added `GET/POST/DELETE /api/wikis/[id]/members` — list members, add (upsert with role), remove members; wiki admin required; owner removal blocked

### Offline Service Worker
- Added `public/sw.js` — vanilla JS service worker with install-time precaching, network-first strategy, and background sync
- Precaches `/`, `/help`, `/search`, and `/offline` on install; activates immediately via `skipWaiting()`
- Caches successful GET responses for `/api/articles/*` and `/articles/*` routes
- Non-GET requests queued in IndexedDB `wiki-sync` → `syncQueue` store when offline; returns 202 Accepted with `queued: true`
- Replays queued mutations on Background Sync `sync` event (`wiki-sync-mutations` tag) or explicit `REPLAY_QUEUE` message
- Shows `/offline` cached HTML page for failed HTML navigation requests
- Added `public/offline.html` — minimal offline page with "You're offline" message, cached-content notice, "Try again" reload button, and footer nav links; respects `prefers-color-scheme` for dark mode

### Contributors API
- Updated `GET /api/users/contributors` to filter only users with at least one published article, return `{ contributors: [...] }` wrapper shape, and include proper try/catch error handling

## [2.4.0] - 2026-03-03

API v2 routes with cursor pagination, OAuth/NextAuth stub, Zapier webhooks, and CLI tool.

### New API Routes — v2 (cursor-based pagination)
- Added `GET /api/v2/articles` — cursor-paginated article listing with API key or session auth, field selection via `?fields=`, filters for category/tag/status/search, admin-gated visibility for non-published articles; response shape `{ data, meta: { hasMore, nextCursor, total } }`
- Added `GET /api/v2/articles/:id` — fetch article by id or slug with field selection; includes category, tags, and revision count; non-admins blocked from non-published articles
- Added `GET /api/v2/search` — cursor-paginated, relevance-ranked full-text search; scores: exact title=100, starts-with=80, contains=60, content-only=10; response includes `highlightedExcerpt` and `totalEstimate`
- Added `GET /api/v2/categories` — public hierarchical category tree (recursive build from flat list) with article counts per node, sorted by `sortOrder` at each level
- Added `GET /api/v2/tags` — cursor-paginated tag listing sorted alphabetically with article counts; no auth required
- Cursor format for articles/search: `base64url("<createdAt ISO>|<id>")`, for tags: `base64url("<name>|<id>")`

### OAuth / NextAuth Integration (stub)
- Added `src/lib/oauth.ts` exporting `authOptions` for NextAuth v4 with Google and GitHub providers
- `signIn` callback links OAuth accounts to existing wiki users by email or creates new viewer-role users; stores `OAuthAccount` record with access/refresh tokens
- `session` callback augments the NextAuth session with wiki user `id`, `role`, `username`, and `displayName`
- Generates unique usernames from provider display name with numeric suffix on collision
- Added `src/app/api/auth/[...nextauth]/route.ts` — NextAuth catch-all handler exporting GET and POST

### Zapier / Make Webhook Integration
- Added `GET /api/webhooks/zapier` — list Zapier subscriptions (Webhook rows with `zapier:`-prefixed events) for the authenticated API key
- Added `POST /api/webhooks/zapier` — subscribe to an event (`article.created`, `article.updated`, `article.deleted`, `article.published`, `comment.created`); body `{ hookUrl, event }`; returns 409 on duplicate
- Added `DELETE /api/webhooks/zapier` — unsubscribe by `hookUrl` (body or query param); returns 404 if no matching subscription
- Added `GET /api/webhooks/zapier/poll` — Zapier polling trigger; returns array of recently created published articles (default last 15 min); returns sample object when empty so Zapier can map fields during setup

### CLI Tool (`cli/`)
- Added `cli/package.json` and `cli/index.js` — standalone ESM CLI using only Node.js 18+ built-ins (no npm dependencies)
- Config stored at `~/.wiki-cli.json` or read from `WIKI_URL` + `WIKI_API_KEY` env vars
- Commands: `config set/show`, `articles list/get/create`, `search`, `export`, `import`, `help`
- `articles list` uses v2 cursor API by default; falls back to v1 page-based when `--page` is passed
- `export` paginates through all articles and writes `.md` (with YAML frontmatter) or `.html` files
- `import` parses YAML frontmatter from Markdown files and POSTs to `/api/articles`
- Pretty-printed aligned tables with ANSI colour (disabled when stdout is not a TTY)

## [2.3.0] - 2026-03-02

Infrastructure features: storage abstraction, Redis cache, read replica, and full-text search.

### New Infrastructure
- Added `StorageProvider` interface in `src/lib/storage.ts` with `upload()`, `delete()`, and `getSignedUrl()` methods
- Implemented `VercelBlobStorage` provider using `@vercel/blob` (default)
- Implemented `S3Storage` provider using `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` for S3/R2/MinIO
- Storage provider selected via `STORAGE_PROVIDER` env var (`"vercel-blob"` or `"s3"`)
- Added Redis caching layer in `src/lib/cache.ts` with `cacheGet()`, `cacheSet()`, `cacheInvalidate()`, and `cacheDel()`
- Redis client is singleton with lazy connect, exponential back-off reconnect, and graceful degradation when `REDIS_URL` is not set
- Cache invalidation uses SCAN-based pattern matching to avoid blocking Redis on large key sets
- Added read replica support in `src/lib/prisma-replica.ts` exporting `prismaRead` PrismaClient
- Replica client uses `DATABASE_REPLICA_URL` env var; falls back to primary when not configured
- Replica client cached on `globalThis` in development to survive hot-reload

### Migrations
- Added `prisma/migrations/add_tsvector/migration.sql` for PostgreSQL full-text search
- Enables `pg_trgm` extension for fuzzy matching
- Adds `searchVector` tsvector column to Article table with GIN index
- Adds trigram GIN index on Article title for fuzzy title matching
- Creates trigger to auto-update search vector on Article insert/update
- Backfills existing articles with weighted search vectors (title A, excerpt B, content C)

### Changes
- Updated `src/app/api/upload/route.ts` to use `getStorage()` abstraction instead of direct `@vercel/blob` usage

## [2.2.0] - 2026-03-02

User experience features: mobile navigation, command palette, wiki link previews, user preferences, and settings page.

### New Features
- Added `MobileNavigation` bottom bar component with 5 icons (Home, Search, Create, Recent, Menu) visible only on mobile
- Added `CommandPalette` component (Ctrl+K / Cmd+K) with filterable commands grouped by Navigation, Actions, and Admin
- Added `WikiLinkPreview` component for inline article previews on `.wiki-link` hover with 300ms delay and caching
- Added user settings page (`/settings`) with Editor, Notifications, Display, and Locale sections
- Added preferences API route (`/api/preferences`) with GET/PUT for authenticated user preferences
- Added command registry (`src/lib/commands.ts`) with 18 commands including admin-only commands
- Added preference utilities (`src/lib/preferences.ts`) with defaults and merge function

### Styles
- Added CSS styles for command palette overlay, input, item groups, keyboard navigation, and active states
- Added CSS styles for wiki link preview floating card with image, excerpt, category, and broken-link state

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
