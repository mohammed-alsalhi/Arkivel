# Architecture

This document describes the technical architecture of Arkivel for contributors and maintainers.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, TypeScript |
| Styling | Tailwind CSS 4 with CSS variable theming |
| Editor | Tiptap 3 (ProseMirror-based) |
| Database | PostgreSQL via Prisma 7 ORM |
| Auth | Dual: legacy admin password + multi-user with roles (admin, editor, viewer) |
| Hosting | Vercel (recommended), Docker, or any Node.js host |
| Image Storage | Vercel Blob |

## Directory Structure

```
src/
  app/                        # Next.js App Router pages and API routes
    api/
      articles/               # CRUD, batch, import, reorder, titles, similar, recent, orphans, dead-links
        [id]/                  # Single article + backlinks, claim reviews, discussions, export, links, rating, related, revisions, status, translations, views, word-count
      auth/                   # Login, logout, register, check
      categories/             # Category CRUD + tree view
        [id]/
      tags/                   # Tag CRUD + popular
        [id]/
      search/                 # Full-text search
      graph/                  # Knowledge graph (BFS subgraph support)
      studio/                 # Arkivel Studio command board report and JSON Canvas export
      atlas/                  # Canon Atlas report
      trails/                 # Canon Trails guided route report
      intelligence/           # Knowledge Command Center cockpit report
      customization/          # Public self-host customization manifest
      map-markers/            # Marker CRUD
        [id]/
      maps/                   # Multi-map management
        [mapId]/
      users/                  # User accounts
      v1/                     # Public REST API (articles, categories, search, tags)
      export/                 # Batch HTML/Markdown export
      upload/                 # Image upload to Vercel Blob
      stats/                  # Wiki statistics
      metrics/                # Performance metrics
      health/                 # Health check
      notifications/          # User notifications
      reviewers/              # Editor/admin reviewer lookup
      reviews/                # Review request queue, detail, decisions, and comments
      watchlist/              # Article watch subscriptions
      webhooks/               # Webhook management
      plugins/                # Plugin management
      sitemap/                # Dynamic sitemap data
    articles/
      [slug]/                 # Article display, edit, history, diff, discussion
      new/                    # Create article page
    categories/               # Category listing and individual pages
    tags/                     # Tag-based article listing
    studio/                   # Arkivel Studio live board, base views, and Studio moves
    atlas/                    # Canon Atlas world-map surface
    trails/                   # Canon Trails reader routes
    graph/                    # Interactive D3 knowledge graph
    intelligence/             # Cockpit-style Knowledge Command Center
    map/                      # Interactive map pages
      [mapId]/
    search/                   # Search results page
    reviews/                  # Review dashboard and request detail workspace
    page.tsx                  # Main Page front page with stats, featured article, browse directory, and recent updates
    login/                    # Login page
    register/                 # Registration page
    admin/                    # Admin dashboard
      metrics/                # Performance metrics page
      plugins/                # Plugin management page
      webhooks/               # Webhook management page
    recent-changes/           # Timeline of all edits
    random/                   # Random article redirect
    watchlist/                # User's watched articles
    import/                   # Bulk article import (admin)
    export/                   # Bulk export page
    api-docs/                 # Public API documentation
    help/                     # In-app feature guide
    users/
      [username]/             # User profile page
    feed.xml/                 # RSS 2.0 feed
    feed/atom/                # Atom feed
  components/
    editor/                   # Tiptap editor and extensions
      TiptapEditor.tsx        # Main rich text editor shell, feature trays, telemetry, and writing tools
      EditorToolbar.tsx       # Ribbon toolbar and contextual table lab
      WikiLinkExtension.ts    # [[Article Name]] node extension
      WikiLinkSuggester.tsx   # Autocomplete dropdown for wiki links
      useWikiLinkSuggester.ts # Hook for wiki link suggestions
      FootnoteExtension.ts    # Footnote/citation support
      PotentialLinkExtension.ts # Detected link mark extension
      LinkBubble.tsx          # Floating edit/remove tooltip for links
    layout/                   # App shell navigation and header controls
      Sidebar.tsx
      MobileNavigation.tsx
      LayoutShell.tsx
      SearchBar.tsx
    graph/                    # D3 force-directed graph
      ArticleGraph.tsx
      GraphControls.tsx
    map/                      # Leaflet map components (dynamically imported)
      WorldMap.tsx
      MapManager.tsx
      MapSelector.tsx
      LayerControl.tsx
      MapSearch.tsx
    articles/                 # Article display components
      ArticleCard.tsx
    article/
      ArticleActionPanel.tsx   # Slim article action rail with Read/Tools disclosures
      ArticlePageHeader.tsx    # Article hero metadata and badges
      ArticleTaxonomyFooter.tsx # Category/tag chip footer
      ClaimsPanel.tsx          # Claim confidence summary and persistent claim review controls
      ReviewRequestButton.tsx  # Article-level review request modal and active-review link
    intelligence/
      IntelligenceCockpit.tsx  # Client graph constellation, radar, and readiness simulator
    (37 root-level components)  # Badge, Breadcrumb, Toast, Pagination, ThemeToggle,
                                # KeyboardShortcuts, NotificationBell, UserAvatar,
                                # CategoryManager, TagManager, TagPicker, etc.
  lib/
    prisma.ts                 # Prisma client singleton (globalThis caching for dev)
    navigation.ts             # Shared command destinations and focused workspace route detection
    canon-atlas.ts            # Territory, dossier, story-thread, and continuity report
    canon-trails.ts           # Reader-route engine for canon, fresh, deep, repair, and starter trails
    intelligence.ts           # Command-center score, graph, radar, sections, and next-best-work report
    studio.ts                 # Studio board, database-style lanes, action queue, and JSON Canvas export
    search-response.ts        # Client-safe normalizer for internal search API response shapes
    auth.ts                   # Auth helpers: getSession, isAdmin, requireAdmin, requireRole
    api-auth.ts               # API key validation for public REST API
    config.ts                 # Environment-driven branding config
    customization.ts          # Typed self-host customization groups, env metadata, and defaults
    claims.ts                 # Claim extraction, hashing, and review status helpers
    wikilinks.ts              # Wiki link resolution and backlink queries
    infobox-schema.ts         # Category-specific infobox field definitions
    templates.ts              # Article starter templates
    category-templates.ts     # Category-specific templates
    relations.ts              # Semantic link relation types
    utils.ts                  # Slug generation, date formatting, text utilities
    import.ts                 # Article import parsing utilities
    metrics.ts                # Performance metric logging
    webhooks.ts               # Event webhook dispatch
    plugins/
      types.ts                # Plugin interface definition
      registry.ts             # Plugin registry
prisma/
  schema.prisma               # Database schema (90 models — includes GlossaryTerm, ArticlePoll, PollVote, ClaimReview; Article +contentWarnings/isAbandoned/cleanupTags)
  seed.mjs                    # Category and subcategory seeder
  migrations/                 # Versioned migration history
scripts/
  import-articles.ts          # CLI for bulk article import
public/
  maps/world.webp             # Default map background image
  uploads/                    # User-uploaded files
docs/
  help.md                     # Feature guide reference
```

## Documentation Surfaces

Documentation is part of the release surface. Changes that affect behavior, UI, configuration, APIs, schema, workflows, product positioning, or contributor guidance must update the matching docs and version metadata in the same commit.

- Agent and contributor rules live in `AGENTS.md` and `CONTRIBUTING.md`.
- Product reference docs live in `README.md`, `docs/help.md`, and `docs/features.md`.
- In-app product docs live in `src/app/help/page.tsx`, `src/app/features/page.tsx`, and route-specific reference pages such as `src/app/api-docs/page.tsx`.
- Release history and planning live in `CHANGELOG.md` and `ROADMAP.md`.
- Version metadata lives in `package.json` and `package-lock.json`.

## Customization Surface

Arkivel's self-host customization contract lives in `src/lib/customization.ts`. It groups public configuration into `brand`, `style`, `features`, `limits`, `map`, and `integrations`, while `src/lib/config.ts` keeps backward-compatible flat aliases such as `config.name` and `config.mapEnabled`.

Reusable extension metadata lives in `src/lib/marketplace.ts`. Built-in style presets such as `classic-wiki` and `atlas-modern`, color themes such as `standard`, `forest`, and `ember`, layout presets, component packs, theme packs, and plugin manifests share the same id/status/compatibility contract.

The public `/api/customization` endpoint exposes:

- Current grouped customization values.
- Supported `NEXT_PUBLIC_*` environment variables with defaults and descriptions.
- Reusable UI component catalog metadata from `src/components/ui/catalog.ts`.
- Built-in style presets, color themes, layout presets, component packs, plugin manifests, theme pack schemas, per-space customization metadata, and marketplace items.
- Theme hook locations for CSS-variable and shared-class customization.

Use this contract before adding new self-host flags, public branding controls, style presets, color themes, layouts, plugin-facing metadata, marketplace entries, per-space customization metadata, or theme hooks. `/admin/customization` is env-first and preview-only in v1; it does not create database overrides.

## Database Models

### Core Content
- **Article** — Central content model. Stores HTML from Tiptap, optional raw Markdown, excerpt, cover image, infobox data (JSON), status (draft/review/published), sortOrder, isPinned, isFeatured. Supports redirects and disambiguation pages.
- **ArticleRevision** — Immutable snapshots created automatically on every edit. Stores content, title, and infobox state before changes. Powers history timeline and diff viewer. Tracks userId for attribution.
- **Category** — Hierarchical with self-referencing `parentId`. Six root categories with subcategories. Drives infobox field schemas. Ordered by `sortOrder`.
- **Tag** — Hierarchical with self-referencing `parentId`. Many-to-many with articles via `ArticleTag` join table.
- **ArticleTranslation** — Multi-language article content (locale, title, content).
- **Discussion** — Per-article comment threads with optional user attribution.

### Users & Auth
- **User** — Multi-user accounts (username, email, passwordHash, role: admin/editor/viewer).
- **Session** — Auth sessions with token and expiry, linked to User.

### Relationships & Links
- **ArticleLink** — Semantic wiki links with typed relations (related-to, is-part-of, etc.). Defined in `src/lib/relations.ts`.

### Maps
- **MapMarker** — Coordinates + optional article link, grouped by `mapId`, with zoom levels. Supports polygon areas (JSON).
- **MapConfig** — Multi-map system configuration.
- **MapLayer** — Map layer definitions for toggling.
- **MapDetailLevel** — Zoom-dependent detail levels.

### API & Integration
- **ApiKey** — Public API authentication keys, linked to User.
- **Webhook** — Event webhook endpoints for article create/update/delete.
- **WebhookDelivery** — Webhook delivery logging with status tracking.

### Polls
- **ArticlePoll** — Poll attached to an article with a question and string[] options. Can be closed to prevent further voting.
- **PollVote** — One vote per session per poll (unique on `pollId + sessionId`). Stores `optionIndex`.

### User Features
- **Watchlist** — User-article watch pairs for change notifications.
- **Notification** — Edit/reply/mention notifications per user.
- **ReviewRequest** — Article review workflow record with author, optional reviewer, status (`pending`, `in_review`, `approved`, `changes_requested`, `rejected`), request message, and comments.
- **ReviewComment** — Comment thread on a review request, with optional selector data for future inline review anchors.
- **ClaimReview** — Persistent review decision for an editor-marked claim, keyed by article and claim hash. Stores claim text, status (`unreviewed`, `approved`, `needs_source`, `disputed`, `rejected`), reviewer note, and reviewer attribution.

### System
- **PluginState** — Plugin enable/disable configuration.
- **MetricLog** — Performance metric logging.
- **CollaborationSession** — Real-time collaborative editing (Yjs document storage).

## Key Patterns

### Configuration
All branding is driven by `NEXT_PUBLIC_*` environment variables read through `src/lib/config.ts`. Defaults produce a generic wiki; personal branding is set via environment variables. Brand image paths are configurable through `NEXT_PUBLIC_ARKIVEL_LOGO`, `NEXT_PUBLIC_ARKIVEL_LOGO_MARK`, and `NEXT_PUBLIC_ARKIVEL_APP_ICON`; defaults live in `public/brand/`. The default SVG mark is rendered inline by `BrandMark` so theme variables can recolor it, while custom `NEXT_PUBLIC_ARKIVEL_LOGO_MARK` paths still render as image assets. Metadata resolves relative image paths against `NEXT_PUBLIC_BASE_URL`. The visible app version is read from `package.json` and exposed at build time through `next.config.ts` so sidebar and health-check version text follow release bumps.

### Authentication
Dual auth system. **Legacy:** single admin password via `ADMIN_SECRET` env var with cookie-based `admin_token`. **Multi-user:** bcrypt-hashed passwords in `User` table with session tokens. `getSession()` returns the current user, `isAdmin()` checks both paths, `requireRole(user, role)` for granular permissions. Roles: admin, editor, viewer.

### Review Requests
Editors can request review from the article action rail. The request can be left in the shared queue or assigned to an editor/admin reviewer. Active requests are deduplicated per article, drafts move into `review`, approvals publish the article, and change requests or rejections return reviewed articles to `draft`. `/reviews` lists queues, `/reviews/[id]` hosts the draft preview, comments, assignment, approval, change-request, rejection, and resubmission actions. Review API mutations create notifications for reviewers/authors and activity events for auditability.

### Claim Review Mode
Claims marked in the editor as `certain`, `probable`, or `disputed` are extracted from article HTML by `extractClaims()` in `src/lib/claims.ts`. The shared helper normalizes text and creates a deterministic claim hash so the article claims panel and `/api/articles/[id]/claim-reviews` address the same claim without embedding database IDs in article HTML. Editors and admins can approve, mark as needing a source, dispute, reject, or annotate each claim. Mutations upsert `ClaimReview`, attribute the reviewer, notify the article author, log `claim_reviewed` activity, and revalidate the article page.

### Wiki Links
Articles cross-reference using `[[Article Name]]` syntax. The custom Tiptap `WikiLink` extension renders these as `<a data-wiki-link="Title">` in the editor. At display time, `resolveWikiLinks()` queries the database to verify targets exist and marks broken links with a CSS class. `getBacklinks()` finds articles that reference a given slug.

### Editor Experience
`TiptapEditor` owns the ProseMirror extension stack, Markdown conversion, paste/drop handling, wiki-link suggestions, link bubble, feature trays, selection actions, status bar, and live document telemetry. Insert, Review, and Outline trays expose grouped rich blocks, readiness signals, outline navigation, grammar checks, and writing coach analysis only when requested. `EditorToolbar` keeps core formatting visible, moves quote/table and advanced text/knowledge/AI/claim tools behind a More disclosure, and renders contextual table controls only while the selection is inside a table. `CollaborativeEditor` wraps the same editor and forwards every update to the article edit form so local draft autosave and optional Yjs sync stay in step.

### Content Storage
Articles store `content` (HTML from Tiptap) and optionally `contentRaw` (Markdown for export). HTML is the canonical format displayed to users.
Standard HTML tables remain native table markup from editor through display; global content styles collapse borders, zero spacing, and wrap cell content so article and presentation views preserve a single merged grid.

### Revision System
Every PUT to an article endpoint first snapshots the current state into `ArticleRevision`, then applies the update. Revisions track the editing user for attribution.

### Footnotes
Custom Tiptap `FootnoteRef` node extension. Stored as `<sup data-footnote="text">` in HTML. Auto-numbered via CSS counters. Footnote section appended at display time by `appendFootnoteSection()`.

### Glossary
`GlossaryTerm` model stores terms, definitions, and aliases. `resolveGlossaryTerms()` in `src/lib/glossary.ts` injects `data-glossary-term` / `data-glossary-def` attributes into article HTML server-side. `GlossaryTooltipLayer` client component uses document-level event delegation to show hover cards. Admin CRUD at `/admin/glossary`, public browse at `/glossary`.

### Category-Specific Infoboxes
Each root category defines a field schema in `src/lib/infobox-schema.ts`. Subcategories inherit their parent's schema via a parent chain walk. Fields support types: text, textarea, number, wikilink, and list. Infobox data is stored as JSON on the Article model.

### Theming
CSS variables in `src/app/globals.css` under a `@theme` block. Dark mode applies overrides via `html[data-theme="dark"]`. Uses `@theme` (not `@theme inline`) so CSS variable overrides work correctly with Tailwind.

### Responsive App Shell
`src/app/layout.tsx` composes the global header, `LayoutShell`, `Sidebar`, `DocumentTitle`, and `MobileNavigation`. Desktop and tablet layouts keep a persistent top-left three-line main-menu button that collapses or expands the simplified dockable sidebar, with `LayoutShell` applying the persisted open/closed state, left/right side preference, and matching content borders. The main content shell is full-width by default so operational pages, Studio, and dense grids do not inherit an artificial right-side gutter; individual page components own any narrower reading width they need. Phone layouts use the same top-left button to open the sidebar overlay and a safe-area-aware bottom navigation for Home, Search, Create, and Recent.

Browser titles use the `Arkivel - Page Name` pattern. Root metadata provides the server-side title template, while `DocumentTitle` watches the current page heading on the client and applies the same format to routes that do not export metadata yet.

Focused workspace routes (`/ask`, `/graph`, `/split`, `/map`, and `/present/*`) hide the bottom navigation so full-height canvases and chat/workspace composers are not covered. They keep the same top-left mobile menu button. Closed mobile sidebars are translated, hidden, and pointer-inert so off-canvas links cannot be hit-tested or reported as covered controls.

Responsive shell changes should be verified across phone, tablet, laptop, and wide desktop widths. At minimum, check for document horizontal overflow, clipped labels/controls, and fixed elements covering interactive targets.

### Search
Relevance-ranked full-text search. Multi-word queries use AND logic. Results scored by: exact title match (100) > starts with (80) > title contains (60) > content only (0). Search covers titles, content, and excerpts.

`/api/search` returns an object response containing `results`, optional `semanticResults`, and optional `suggestions`. Client surfaces must consume it through `src/lib/search-response.ts` so header instant search, the search page, command palette article lookup, wiki-link autocomplete, split view pickers, and edit fallbacks stay aligned if the API shape evolves. Semantic search results are displayed as a distinct group on the search page when enabled.

### Map
Disabled by default (`NEXT_PUBLIC_MAP_ENABLED=true` to enable). Uses Leaflet with `CRS.Simple` for pixel coordinates on a custom image. Dynamically imported to avoid SSR issues. Supports multiple maps, layers, and zoom-dependent detail levels.

### Semantic Links
`ArticleLink` model with typed relations (related-to, is-part-of, see-also, etc.). Defined in `src/lib/relations.ts`. Displayed via `SemanticRelations` component. Visualized in the article graph.

### Graph
D3 force-directed graph at `/graph`. API at `/api/graph` returns nodes/edges from wiki links and `ArticleLink` table. Supports BFS subgraph via `?center=slug&depth=N`.

### Arkivel Studio
`src/lib/studio.ts` builds `/studio`, `/api/studio`, and `/api/studio/canvas` from live article content, wiki links, semantic relations, revision counts, review pressure, taxonomy coverage, engagement signals, and freshness. It emits a fixed-coordinate command board, database-style lanes for review/stubs/orphans/taxonomy/stale work, next Studio moves, and a JSON Canvas export compatible with visual knowledge workflows. Empty or unavailable local databases fall back to a starter board that points users toward creating articles, categories, links, and canvases.

### Canon Atlas
`src/lib/canon-atlas.ts` builds `/atlas` and `/api/atlas` from live article, category, tag, revision, engagement, excerpt, infobox, and wiki-link metadata. It projects categories into atlas territories, scores top articles as map signals, derives story threads from real wiki links, selects a flagship dossier, and exposes continuity pressure around stubs, uncategorized pages, missing tags, missing outgoing links, excerpts, and infoboxes. Empty local databases fall back to starter territories and starter signal routes so the page remains visually complete without pretending published article data exists.

### Canon Trails
`src/lib/canon-trails.ts` builds `/trails` and `/api/trails` as a reader-facing route engine rather than an operations dashboard. It scores published articles from outgoing wiki links, backlinks, categories, word depth, update recency, revision count, discussions, reads, page views, reactions, bookmarks, pinned state, and featured state. The report emits canon, fresh, deep, and repair routes with direct article links, reading estimates, stop reasons, and summary counts. Empty local databases fall back to a starter route that points users toward creating the first article, category, and wiki link.

### Knowledge Command Center
`src/lib/intelligence.ts` builds the `/intelligence` page and `/api/intelligence` feed from live article, category, tag, revision, read, view, discussion, translation, and cleanup metadata. It derives 20 operational engines covering readiness, velocity, editorial pressure, stale content, graph health, broken links, stubs, longform candidates, taxonomy gaps, featured canon, infobox coverage, translation reach, conversation, reader demand, verification debt, and cleanup flags. It also emits a top-article constellation from real wiki-link edges, a readiness radar across graph/structure/freshness/trust/audience/momentum axes, and pressure counts used by the client-side impact simulator. Database failures fall back to an empty report so local shell verification remains usable without a seeded database.

### Feeds & API
RSS at `/feed.xml`, Atom at `/feed/atom`. Public REST API at `/api/v1/` with API key auth (`X-API-Key` header). Webhooks dispatched on article events. API docs at `/api-docs`.

### Plugins
Lightweight plugin system. Interface in `src/lib/plugins/types.ts`, registry in `src/lib/plugins/registry.ts`. Plugin state stored in `PluginState` table. Managed via `/admin/plugins`.

## API Routes

### Articles
| Route | Methods | Description |
|-------|---------|-------------|
| `/api/articles` | GET, POST | List/create articles |
| `/api/articles/[id]` | GET, PUT, DELETE | Single article CRUD |
| `/api/articles/[id]/backlinks` | GET | Articles linking to this one |
| `/api/articles/[id]/discussions` | GET, POST, DELETE | Article comments |
| `/api/articles/[id]/export` | GET | Export article as Markdown/HTML |
| `/api/articles/[id]/links` | GET, POST, DELETE | Semantic article links |
| `/api/articles/[id]/rating` | GET, POST | Article star ratings (avg, count, own) |
| `/api/articles/[id]/todos` | GET, POST | Article todo checklist items |
| `/api/articles/[id]/todos/[todoId]` | PATCH, DELETE | Update/delete a single todo |
| `/api/articles/hot` | GET | Hot articles by page views in last N days |
| `/api/articles/[id]/related` | GET | Related articles by category/tags |
| `/api/articles/[id]/revisions` | GET | Revision history |
| `/api/articles/[id]/status` | PATCH | Update article status |
| `/api/articles/[id]/translations` | GET, POST, PUT | Article translations |
| `/api/articles/[id]/views` | POST | Track article views |
| `/api/articles/[id]/word-count` | GET | Word count and reading time |
| `/api/articles/[id]/share-token` | POST, DELETE | Generate/revoke draft share token |
| `/api/articles/[id]/verify` | POST | Stamp lastVerifiedAt on an article |
| `/api/articles/[id]/snapshots` | GET, POST, DELETE | Named manual article snapshots |
| `/api/articles/[id]/co-authors` | GET, POST, DELETE | Article co-author management |
| `/api/articles/[id]/flags` | GET, PUT | Article flag labels |
| `/api/articles/[id]/revisions/export` | GET | Download revision history as CSV |
| `/api/articles/[id]/revisions/[revId]/restore` | POST | Restore article to a prior revision |
| `/api/articles/[id]/lock` | GET, POST, DELETE | Acquire/refresh/release editor lock |
| `/api/activity/heatmap` | GET | Daily edit counts for past 52 weeks |
| `/api/stats` | GET | Aggregate wiki statistics |
| `/api/tags/[id]/synonyms` | GET, POST, DELETE | Tag alias management |
| `/api/articles/batch` | PUT, DELETE | Bulk operations |
| `/api/articles/dead-links` | GET | Articles with broken wiki links |
| `/api/articles/import` | POST | Import articles from files |
| `/api/articles/orphans` | GET | Articles with no incoming links |
| `/api/articles/recent` | GET | Recently modified articles |
| `/api/articles/reorder` | PUT | Reorder articles within category |
| `/api/articles/similar` | GET | Find similar titles |
| `/api/articles/titles` | GET | Lightweight title list |

### Other Resources
| Route | Methods | Description |
|-------|---------|-------------|
| `/api/studio` | GET | Arkivel Studio summary, board nodes, graph edges, base views, and action queue |
| `/api/studio/canvas` | GET | JSON Canvas export of the generated Studio board |
| `/api/atlas` | GET | Canon Atlas territories, article signals, story threads, dossier, continuity pressure, and next moves |
| `/api/trails` | GET | Canon Trails guided routes, stop reasons, reading estimates, word totals, and link totals |
| `/api/intelligence` | GET | Knowledge Command Center score, graph constellation, radar axes, pressure model, 20 engines, and action queue |
| `/api/auth/*` | POST | Login, logout, register, check |
| `/api/categories` | GET, POST | List/create categories |
| `/api/categories/[id]` | GET, PUT, DELETE | Category CRUD |
| `/api/categories/tree` | GET | Full category tree |
| `/api/tags` | GET, POST | List/create tags |
| `/api/tags/[id]` | GET, PUT, DELETE | Tag CRUD |
| `/api/tags/popular` | GET | Most-used tags |
| `/api/search` | GET | Full-text search |
| `/api/graph` | GET | Knowledge graph nodes/edges |
| `/api/map-markers` | GET, POST | List/create map markers |
| `/api/map-markers/[id]` | PUT, DELETE | Update/delete markers |
| `/api/maps/[mapId]` | GET, PUT, DELETE | Map configuration |
| `/api/users` | GET | User list |
| `/api/articles/[id]/claim-reviews` | GET, PATCH | Claim review status list and editor/admin claim decisions |
| `/api/reviewers` | GET | Editor/admin reviewer candidates |
| `/api/reviews` | GET, POST | List or create review requests |
| `/api/reviews/[id]` | GET, PUT, DELETE | Review detail, assignment, decisions, and deletion |
| `/api/reviews/[id]/comments` | GET, POST | Review request comments |
| `/api/upload` | POST | Upload images to Vercel Blob |
| `/api/export` | GET | Batch wiki export |
| `/api/export/zip` | GET | Bulk ZIP export — all articles as Markdown files in category subfolders |
| `/api/admin/search-analytics` | GET | Search query analytics (top queries, zero-result, daily volume) |
| `/api/admin/announcements` | GET, POST | Site-wide announcement management |
| `/api/admin/announcements/[id]` | PATCH, DELETE | Update/delete announcements |
| `/api/announcements` | GET | Active non-expired announcements (public) |
| `/api/snippets` | GET, POST | User editor snippets |
| `/api/snippets/[id]` | PUT, DELETE | Update/delete snippets |
| `/api/articles/[id]/views/sparkline` | GET | 30-day daily view series |
| `/api/reading-streak` | GET, POST | Reading streak tracker |
| `/api/category-watch` | GET, POST | Category watch toggle |
| `/api/ai/rewrite` | POST | AI text rewrite via OpenAI |
| `/api/admin/categories/merge` | POST | Merge source category into target, reassign articles |
| `/api/admin/word-count` | GET | Word-count distribution across published articles |
| `/api/admin/maintenance` | GET, POST | Get/set maintenance mode flag (stored in PluginState) |
| `/api/admin/read-only` | GET, POST | Get/set read-only mode flag (stored in PluginState) |
| `/api/admin/prune-revisions` | GET, POST | Preview/execute revision pruning (keep latest N per article) |
| `/api/admin/user-activity` | GET | User list with edit counts; `?userId=X` returns revision history |
| `/api/admin/writing-velocity` | GET | Weekly word counts added (from revisions) for last 12 weeks |
| `/api/sessions` | GET | Current user's active sessions |
| `/api/sessions/[id]` | DELETE | Revoke a session (own or admin) |
| `/api/ai/suggest-tags` | POST | Suggest existing tags for an article (AI or keyword fallback) |
| `/api/ai/suggest-category` | POST | Suggest best-fit category for an article (AI) |
| `/api/ai/suggest-title` | POST | Suggest 5 alternative encyclopedic titles for an article (AI) |
| `/tags/cloud` | GET | Tag cloud — all tags sized by article count |
| `/api/admin/category-growth` | GET | New articles grouped by category × month (last 12 months) |
| `/api/ai/expand` | POST | Expand selected text into more detailed prose (AI) |
| `/api/ai/chat` | POST | Conversational wiki assistant — multi-turn Q&A over article + related content |
| `/api/ai/generate-article` | POST | Generate full article HTML body from a title + headings array |
| `/api/ai/revision-summary` | POST | Generate a one-sentence edit summary by comparing old vs. new article content |
| `/api/ask` | POST | Streaming AI oracle — SSE endpoint; semantic search + `streamText`; emits sources then token events |
| `/api/ai/synthesize` | POST | AI synthesises all articles in a category (or an article ID list) into a new overview article |
| `/api/export/json` | GET | Download all articles as JSON (admin only) |
| `/articles/[slug]/analytics` | GET | Per-article analytics: 30-day views, reads, reactions, revisions (admin only) |
| `/api/admin/import` | POST | Bulk import up to 500 articles from a JSON array; auto-creates tags, resolves categories |
| `/admin/dead-ends` | GET | Lists published articles with no outgoing wiki links |
| `/admin/duplicate-content` | GET | Jaccard similarity scan for near-duplicate published articles |
| `/admin/orphans` | GET | Lists published articles with no incoming links from any other article |
| `/admin/long-articles` | GET | Lists published articles exceeding a word threshold (default 5,000), sorted by length |
| `/api/random` | GET | Redirects to a random published article; optional `?category=slug` filter |
| `/api/export/analytics` | GET | Admin-only CSV download of all published articles with read/reaction/revision counts |
| `/api/stats` | GET | Wiki statistics |
| `/api/metrics` | GET, POST | Performance metrics |
| `/api/health` | GET | Health check |
| `/api/notifications` | GET, PATCH | User notifications |
| `/api/watchlist` | GET, POST, DELETE | Article watch subscriptions |
| `/api/webhooks` | GET, POST, PUT, DELETE | Webhook management |
| `/api/plugins` | GET, PUT | Plugin management |
| `/api/v1/*` | GET | Public REST API (articles, categories, search, tags) |
