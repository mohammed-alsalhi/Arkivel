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
        [id]/                  # Single article + backlinks, discussions, export, links, rating, related, revisions, status, translations, views, word-count
      auth/                   # Login, logout, register, check
      categories/             # Category CRUD + tree view
        [id]/
      tags/                   # Tag CRUD + popular
        [id]/
      search/                 # Full-text search
      graph/                  # Knowledge graph (BFS subgraph support)
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
      watchlist/              # Article watch subscriptions
      webhooks/               # Webhook management
      plugins/                # Plugin management
      sitemap/                # Dynamic sitemap data
    articles/
      [slug]/                 # Article display, edit, history, diff, discussion
      new/                    # Create article page
    categories/               # Category listing and individual pages
    tags/                     # Tag-based article listing
    graph/                    # Interactive D3 knowledge graph
    map/                      # Interactive map pages
      [mapId]/
    search/                   # Search results page
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
      TiptapEditor.tsx        # Main rich text editor component
      EditorToolbar.tsx       # Formatting toolbar
      WikiLinkExtension.ts    # [[Article Name]] node extension
      WikiLinkSuggester.tsx   # Autocomplete dropdown for wiki links
      useWikiLinkSuggester.ts # Hook for wiki link suggestions
      FootnoteExtension.ts    # Footnote/citation support
      PotentialLinkExtension.ts # Detected link mark extension
      LinkBubble.tsx          # Floating edit/remove tooltip for links
    layout/                   # Sidebar, search bar
      Sidebar.tsx
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
    (37 root-level components)  # Badge, Breadcrumb, Toast, Pagination, ThemeToggle,
                                # KeyboardShortcuts, NotificationBell, UserAvatar,
                                # CategoryManager, TagManager, TagPicker, etc.
  lib/
    prisma.ts                 # Prisma client singleton (globalThis caching for dev)
    auth.ts                   # Auth helpers: getSession, isAdmin, requireAdmin, requireRole
    api-auth.ts               # API key validation for public REST API
    config.ts                 # Environment-driven branding config
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
  schema.prisma               # Database schema (79 models — includes GlossaryTerm, ArticlePoll, PollVote; Article +contentWarnings/isAbandoned)
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

## Database Models

### Core Content
- **Article** — Central content model. Stores HTML from Tiptap, optional raw Markdown, excerpt, cover image, infobox data (JSON), status (draft/review/published), sortOrder, isPinned. Supports redirects and disambiguation pages.
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

### System
- **PluginState** — Plugin enable/disable configuration.
- **MetricLog** — Performance metric logging.
- **CollaborationSession** — Real-time collaborative editing (Yjs document storage).

## Key Patterns

### Configuration
All branding is driven by `NEXT_PUBLIC_*` environment variables read through `src/lib/config.ts`. Defaults produce a generic wiki; personal branding is set via environment variables.

### Authentication
Dual auth system. **Legacy:** single admin password via `ADMIN_SECRET` env var with cookie-based `admin_token`. **Multi-user:** bcrypt-hashed passwords in `User` table with session tokens. `getSession()` returns the current user, `isAdmin()` checks both paths, `requireRole(user, role)` for granular permissions. Roles: admin, editor, viewer.

### Wiki Links
Articles cross-reference using `[[Article Name]]` syntax. The custom Tiptap `WikiLink` extension renders these as `<a data-wiki-link="Title">` in the editor. At display time, `resolveWikiLinks()` queries the database to verify targets exist and marks broken links with a CSS class. `getBacklinks()` finds articles that reference a given slug.

### Content Storage
Articles store `content` (HTML from Tiptap) and optionally `contentRaw` (Markdown for export). HTML is the canonical format displayed to users.

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

### Search
Relevance-ranked full-text search. Multi-word queries use AND logic. Results scored by: exact title match (100) > starts with (80) > title contains (60) > content only (0). Search covers titles, content, and excerpts.

### Map
Disabled by default (`NEXT_PUBLIC_MAP_ENABLED=true` to enable). Uses Leaflet with `CRS.Simple` for pixel coordinates on a custom image. Dynamically imported to avoid SSR issues. Supports multiple maps, layers, and zoom-dependent detail levels.

### Semantic Links
`ArticleLink` model with typed relations (related-to, is-part-of, see-also, etc.). Defined in `src/lib/relations.ts`. Displayed via `SemanticRelations` component. Visualized in the article graph.

### Graph
D3 force-directed graph at `/graph`. API at `/api/graph` returns nodes/edges from wiki links and `ArticleLink` table. Supports BFS subgraph via `?center=slug&depth=N`.

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
| `/api/stats` | GET | Wiki statistics |
| `/api/metrics` | GET, POST | Performance metrics |
| `/api/health` | GET | Health check |
| `/api/notifications` | GET, PATCH | User notifications |
| `/api/watchlist` | GET, POST, DELETE | Article watch subscriptions |
| `/api/webhooks` | GET, POST, PUT, DELETE | Webhook management |
| `/api/plugins` | GET, PUT | Plugin management |
| `/api/v1/*` | GET | Public REST API (articles, categories, search, tags) |
