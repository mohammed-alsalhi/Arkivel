# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (Next.js 16 + Turbopack)
npm run build        # prisma db push && next build
npm run lint         # ESLint
npx prisma generate  # Regenerate Prisma client after schema changes
npx prisma db push   # Push schema changes to database
node prisma/seed.mjs # Seed default categories
```

After changing `prisma/schema.prisma`, always run `npx prisma generate` and delete `.next/` to avoid stale client errors.

## Documentation and Versioning Discipline

Every commit must keep product docs, in-app docs, and version metadata synchronized with the code change. This is a standing repo rule for all agents and contributors.

Before finishing any change, check whether the change affects behavior, UI, configuration, API shape, data model, workflow, feature availability, or contributor guidance. If it does, update the relevant docs in the same commit:

- Root references: `README.md`, `CHANGELOG.md`, `ROADMAP.md`, `DESIGN.md`, `ARCHITECTURE.md`, `CONTRIBUTING.md`, `AGENTS.md`, and other root docs that describe the touched area.
- Markdown product docs: `docs/help.md`, `docs/features.md`, and any relevant files under `docs/archive/`.
- In-app product pages: `src/app/help/page.tsx`, `src/app/features/page.tsx`, `src/app/api-docs/page.tsx`, and any route-specific documentation or settings copy affected by the change.
- Version metadata: bump `package.json` and `package-lock.json` for every user-visible, docs-visible, or release-note-worthy change. Use a patch bump for documentation/process/UI copy changes, minor for new product capabilities, and major only for breaking changes.

If a doc does not need changes, leave it untouched. Do not make a code-only change for a user-visible feature unless the matching documentation and version updates are included.

## Customization and Marketplace Discipline

Arkivel is an open-source, self-hostable knowledge platform. Prefer reusable, configurable surfaces over route-specific one-offs whenever a change could reasonably be customized by another instance.

- Public customization belongs in `src/lib/customization.ts`, with defaults and env metadata exposed through `/api/customization`.
- Style presets, color themes, component packs, and plugin-like extension listings belong in `src/lib/marketplace.ts` with stable ids, clear `kind`, `status`, compatibility notes, and tags.
- UI primitives should be built from `src/components/ui` and registered in `src/components/ui/catalog.ts` when they are reusable.
- Theme changes should flow through CSS variables, shared `ui-*` / `wiki-*` classes, and scoped hooks such as `html[data-style="..."]`.
- When adding or changing customization, marketplace, style, color theme, or reusable component contracts, update `DESIGN.md`, `ARCHITECTURE.md`, `README.md`, `docs/help.md`, `docs/features.md`, in-app Help/Features/API docs, changelog, roadmap, tests, and version metadata as relevant.

## Commit Message Standard

Follow the existing repository history when writing commit messages.

- Release/version commits must use `vX.Y.Z: imperative summary`, matching the version in `package.json`. Examples: `v4.74.4: document release discipline`, `v4.71.2: collapse article and presentation tables`.
- The summary after the colon should be short, lower-case unless it contains a proper noun, and written as an imperative verb phrase: `add`, `fix`, `harden`, `simplify`, `document`, `refactor`, `polish`, `bump`.
- Non-version commits may use the same imperative style without a version prefix, e.g. `Fix build: wrap useSearchParams in Suspense` or `Polish theme-aware Arkivel logo`.
- Dependency automation keeps Conventional Commit style from Dependabot, e.g. `build(deps): bump ...` or `build(deps-dev): bump ...`.
- Merge commits may keep GitHub/Git defaults.
- Keep the subject focused on the shipped outcome, not implementation trivia. If a body is needed, use brief bullets for docs updated, tests run, and notable risks.

## Architecture

**Stack:** Next.js 16 (App Router) + React 19 + TypeScript + Prisma 7 + PostgreSQL (Neon) + Tailwind CSS 4 + Tiptap editor

**Two remotes:** `origin` (private personal wiki) and `public` (public product repo). The public repo has clean history without personal data.

### Key Patterns

**Configuration:** Public self-host customization is centralized in `src/lib/customization.ts` and exposed through `/api/customization`. `src/lib/config.ts` keeps backward-compatible aliases for runtime callers. Defaults produce a generic wiki; branding, style presets, and color themes are selected through `NEXT_PUBLIC_*` env vars such as `NEXT_PUBLIC_ARKIVEL_STYLE` and `NEXT_PUBLIC_ARKIVEL_COLOR_THEME`.

**Marketplace metadata:** Built-in and planned style presets, color themes, component packs, and plugin listings live in `src/lib/marketplace.ts`. Treat these records as the seed of the future marketplace contract.

**Auth:** Dual auth system. Legacy: single admin password via `ADMIN_SECRET` env var with cookie-based `admin_token`. Multi-user: bcrypt-hashed passwords in `User` table with session tokens. `getSession()` returns current user, `isAdmin()` checks both paths, `requireRole(user, role)` for granular permissions. Roles: admin, editor, viewer.

**Prisma:** Uses `@prisma/adapter-pg` with raw `pg` pool (required for Neon). Singleton in `src/lib/prisma.ts` with `globalThis` caching for dev hot-reload.

**Wiki Links:** Articles cross-reference via `[[Article Name]]` syntax. Custom Tiptap extension (`src/components/editor/WikiLinkExtension.ts`) renders them as `data-wiki-link` anchors. At display time, `resolveWikiLinks()` in `src/lib/wikilinks.ts` checks the DB and marks broken links with CSS class. `getBacklinks()` finds reverse references.

**Revisions:** Every article PUT auto-snapshots the current state into `ArticleRevision` before applying changes. History page shows timeline; diff page compares two revisions.

**Content Storage:** Articles store `content` (HTML from Tiptap) and `contentRaw` (optional Markdown). The HTML is what gets displayed; Markdown is for export.

**Theming:** CSS variables defined in `src/app/globals.css` under `@theme` block. Dark mode via `html[data-theme="dark"]` overrides; style presets use `html[data-style="..."]` overrides; color themes use `html[data-color-theme="..."]` overrides. Important: use `@theme` not `@theme inline` — the latter inlines hex values into Tailwind utilities, breaking CSS variable overrides.

**Map:** Disabled by default (`NEXT_PUBLIC_MAP_ENABLED`). Uses Leaflet with `CRS.Simple` (pixel coords, not geographic). Dynamically imported (no SSR). Markers stored in `MapMarker` table and optionally linked to articles.

### Data Flow for Articles

1. Create/edit via Tiptap editor → HTML + optional Markdown
2. POST/PUT to `/api/articles/[id]` → Prisma creates/updates + auto-revision
3. Display: server component fetches article → `resolveWikiLinks(content)` → render HTML
4. Backlinks computed via `getBacklinks(slug)` querying other articles' content

### Search

`/api/search` and `/app/search/page.tsx` both implement relevance-ranked search. Multi-word queries use AND logic (every word must appear in title/content/excerpt). Results sorted by: exact title match (100) > starts with (80) > title contains (60) > content only (0).

**Footnotes:** Custom Tiptap `FootnoteRef` node extension. Stored as `<sup data-footnote="text">` in HTML. Auto-numbered via CSS counters. Footnote section appended at display time by `appendFootnoteSection()`.

**Syntax Highlighting:** Code blocks use `@tiptap/extension-code-block-lowlight` with lowlight (highlight.js). Language selection on insert, theme-aware CSS.

**Article Status:** Articles have `status` field ("draft", "review", "published"). Non-published articles hidden from non-admins. `isPinned` boolean for featuring at top of category pages.

**Semantic Links:** `ArticleLink` model with relation types (related-to, is-part-of, etc.). Defined in `src/lib/relations.ts`. Displayed via `SemanticRelations` component.

**Graph:** D3 force-directed graph at `/graph`. API at `/api/graph` returns nodes/edges from wiki links and ArticleLink table. Supports BFS subgraph via `?center=slug&depth=N`.

**Feeds & API:** RSS at `/feed.xml`, Atom at `/feed/atom`. Public REST API at `/api/v1/` with API key auth (`X-API-Key` header). Webhooks dispatched on article events.

**Plugins:** Lightweight plugin system. Interface in `src/lib/plugins/types.ts`, registry in `src/lib/plugins/registry.ts`. Plugin state in `PluginState` table.

## Database Models

- **Article** — main content with slug, HTML content, category, tags, revisions, status, sortOrder, isPinned
- **Category** — hierarchical (self-referential `parentId`), ordered by `sortOrder`
- **Tag** — hierarchical (self-referential `parentId`), many-to-many with articles via `ArticleTag`
- **ArticleRevision** — immutable snapshots created on every edit, with userId attribution
- **ArticleTranslation** — multi-language article content (locale, title, content)
- **User** — multi-user accounts (username, email, passwordHash, role)
- **Session** — auth sessions with token and expiry
- **Watchlist** — user-article watch pairs for notifications
- **Notification** — edit/reply/mention notifications per user
- **ApiKey** — public API authentication keys per user
- **Webhook** / **WebhookDelivery** — event webhooks with delivery logging
- **ArticleLink** — semantic wiki links with relation types
- **MapMarker** — coordinates + optional article link, grouped by `mapId`, with zoom levels
- **MapConfig** / **MapLayer** / **MapDetailLevel** — multi-map system with layers
- **PluginState** — plugin enable/disable config
- **MetricLog** — performance metric logging
- **CollaborationSession** — real-time collab Yjs document storage
- **Discussion** — article discussion comments with optional userId
