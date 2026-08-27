# Design Philosophy

This document defines the visual and interaction principles for Arkivel. All UI decisions should trace back to one of these principles.

---

## Core Principles

### 1. Content First
The interface exists to serve the content, not the other way around. Chrome, toolbars, and controls should recede visually so the reader's attention stays on the article. Use muted colours and reduced weight for UI elements by default — they should only become prominent when the user interacts with them.

### 2. Encyclopaedic Aesthetic
The design is deliberately conservative and wiki-inspired: serif headings, restrained colour, high information density, and no decorative flourishes. This is not a marketing site. Familiarity lowers the cognitive load for readers who already know how wikis work.

### 3. Progressive Disclosure
Show the minimum needed. Controls that are rarely used live in dropdowns. Secondary information is collapsible. Destructive or powerful actions are never one accidental click away. Users discover depth as they need it.

### 4. Functional Consistency Over Novelty
Every interactive element that performs a similar role looks and behaves identically. Do not vary padding, font size, border radius, or hover treatment between buttons in the same context just because they were added at different times.

### Product site exception

The wiki remains content-first and encyclopaedic. The separate `ARKIVEL_SITE_MODE=product` surface is the intentional marketing/documentation exception: true white and ink-black foundations, restrained cobalt actions, Geist typography, thin neutral rules, generous whitespace, and code-native product UI previews. Keep this styling scoped to `html[data-site-mode="product"]`; never leak the marketing shell, oversized type, or product-site spacing into a working wiki deployment.

The product site uses one quiet header, one primary GitHub action, open editorial sections instead of default card grids, a black infrastructure band, and a typographic documentation index. It must not invent customer logos, testimonials, pricing, usage metrics, or unsupported product claims.

---

## Component Standards

### Reusable component contract

Product UI should start from `@/components/ui` primitives before adding route-specific markup. The shared layer is intentionally small and self-host friendly: components expose semantic slots such as `title`, `description`, `actions`, `media`, `meta`, `hint`, and `error`, while styling flows through `ui-*` and `wiki-*` CSS variables/classes in `globals.css`.

Use the catalog in `src/components/ui/catalog.ts` as the living index of supported reusable components and their theming hooks. When adding a new reusable primitive, add it to the catalog with its category, import name, description, and CSS hooks.

The public `/api/customization` endpoint publishes the component catalog and theme hook summary for self-hosters, forks, plugins, and deployment dashboards. Keep the endpoint useful whenever reusable components, theme hooks, or public customization flags change.

### Style presets, color themes, and marketplace skins

The default skin is `classic-wiki`, selected through `NEXT_PUBLIC_ARKIVEL_STYLE`. `atlas-modern` is the first alternate built-in skin and demonstrates how a self-hosted instance can change the product feel through CSS variables and the `html[data-style="..."]` hook without forking routes or components.

Color themes are selected independently through `NEXT_PUBLIC_ARKIVEL_COLOR_THEME`. `standard`, `forest`, and `ember` are built in today and use the `html[data-color-theme="..."]` hook, so self-hosters can combine layout feel and palette separately. Layout presets are selected through `NEXT_PUBLIC_ARKIVEL_LAYOUT` and exposed as metadata plus the `html[data-layout="..."]` hook.

New skins, color themes, layouts, component packs, theme packs, and plugin listings should be registered in `src/lib/marketplace.ts`, exposed through `/api/customization`, and implemented through scoped CSS variables/classes in `src/app/globals.css` when they affect visuals. Treat all of them as versioned local-registry metadata: stable `id`, clear `kind`, semantic `version`, compatibility notes, author, license, local source, explicit `status`, screenshots, checksums, and tags. Pack import previews belong in `src/lib/marketplace-import.ts` and must stay parse-only until the trusted local install flow exists.

Marketplace submissions should follow `docs/marketplace-contributions.md` and start from `examples/marketplace/`. The review standard covers security, accessibility, performance, compatibility, docs, naming, semantic versioning, screenshots, and import-preview validation before any listing is considered for the local registry.

Component packs target stable contracts from `src/lib/component-slots.ts`. Each slot declares props, a data boundary, loading and error states, permission notes, and a default fallback component name so an unavailable or incompatible pack cannot break the base shell.

Built-in component packs should remain metadata-rich even before runtime swapping is enabled. The default wiki, docs portal, team knowledge base, worldbuilding atlas, and research notebook packs declare named slot components, descriptions, and recommended layouts in the local marketplace registry.

Layout composition metadata lives in `src/lib/layout-composition.ts`. Keep layout presets tied to explicit shell-density, homepage-order, article-column, right-rail, dashboard-module, category-landing, screenshot, and `html[data-layout="..."]` hook metadata so previews and future runtime composition share the same contract.

Component-pack authoring examples live in `examples/marketplace/component-pack`, with preview-harness planning in `docs/component-pack-preview-harness.md` and typed fixtures in `src/lib/component-pack-fixtures.ts`. Keep examples preview-safe and validation-oriented until runtime loading has a trusted sandbox.

Persisted space customization uses the same design tokens and marketplace ids as global customization. Category and article overrides may choose style, color theme, layout, component pack, template pack, navigation mode, and metadata schema, but public surfaces must resolve them through the global-to-parent-to-space-to-article inheritance contract in `src/lib/space-customization.ts` and must not expose `privateDraftConfig` outside admin flows.

The space editor in `/admin/categories` should stay compact and operational: controls use familiar select/input fields, source badges identify inherited values, reset actions sit next to the selected space, and previews focus on article lists, metadata/navigation, theme/layout, warnings, and responsive QA rather than marketing-style mockups.

Space templates should read like reusable setup recipes, not opaque imports. Template previews should summarize root categories, starter article counts, sample metadata, navigation, dashboard widgets, metadata/infobox field counts, default tags, layout, and recommended packs before any future apply action is allowed.

Space governance badges should stay compact and factual. Use small chips for owner, reviewer, visibility, and review cadence on article pages, and keep admin dashboard widgets dense enough to compare spaces without turning operations data into marketing cards.

The `/admin/customization` studio and `/admin/marketplace` catalog must stay preview-safe for global env and marketplace work: they can copy env values, open catalog detail panels, copy pack JSON/plugin manifests/install notes, validate/import JSON for preview, report registry health, show token diffs, and explain compatibility, but they must not execute remote code, write files, or install packs. Plugin manifest design should remain declarative: routes stay under `/plugins`, webhook targets are environment-variable names rather than literal URLs, and schema/API compatibility is surfaced before enabling trusted local plugins. The `/admin/plugins` review surface should keep loader status, permission prompts, risk labels, health status, last load/error metadata, permissions, routes, widgets, hooks, and load errors visible before an enable action. Plugin authoring docs, starter examples, CLI output, and marketplace templates should use the same vocabulary as the admin review surface. The studio is a tabbed workbench, so brand/copy controls, browser-local drafts, named presets, active-vs-draft diffs, appearance presets, feature flags, keyboard navigation, screen-reader summaries, responsive QA checkpoints, diagnostics, preview panels, deployment output, and pack validation should remain reusable sections instead of route-specific one-offs.

Workspace UI should treat `Wiki` as the workspace boundary. Workspace selection, settings, invitations, and bootstrap flows should reuse the same calm admin primitives as customization and marketplace surfaces, show visibility/default-role/navigation/marketplace-selection consequences before saving, and keep migration affordances explicit when `includeGlobal=1` exposes legacy unscoped content.

Role-template UI should show permission matrices as dense, scannable admin tables rather than marketing cards. Invitation controls should expose role selection, expiration, resend, and revoke states clearly, and recovery guidance should remain operational copy for self-host admins rather than generic onboarding prose.

Collaboration settings and private-team guidance should be operational and workspace-first. Prefer compact tables for co-author, lock, review, comment, mention, notification, digest, and contribution-summary policies; public-surface warnings should call out RSS, Atom, sitemap, and API v1 visibility without burying the consequence in helper text.

Collaboration UX should make session state visible without taking over the editor. Presence names, connection status, reconnect/offline states, conflict warnings, last-saved copy, and sync actions should wrap on mobile, announce changes politely, and avoid relying on color alone.

Offline/PWA states should be compact and operational. Install prompts, offline banners, retry actions, stale-cache warnings, and reconnect notices should stay close to the app shell, wrap cleanly on mobile, and clearly distinguish recently cached public reading content from private admin/actions that are never cached or replayed.

Security review surfaces should be factual and release-gate oriented. Show reviewed surfaces, header status, abuse-case expectations, supply-chain checks, and threat-model assets as compact operational lists; avoid implying report-only CSP is enforcement.

Privacy control surfaces should frame consequences before toggles. For spaces, feeds, indexing, exports, analytics, AI, webhooks, and profiles, show what leaves the instance, who can see it, how long it is retained, and which deployment mode the recommendation targets.

Marketplace and plugin security surfaces should make rejection reasons plain. Unsafe hooks, blocked permissions, dangerous local capabilities, missing provenance, and checksum expectations should be visible before any future install intent can proceed.

Marketplace beta surfaces should remain catalog-first rather than promotional. Lead with local registry health, kind coverage, compatibility badges, install-intent requirements, and limitations; featured and recommended packs should be derived from metadata, not hardcoded marketing copy.

Marketplace lifecycle surfaces should show the pack state, allowed transitions, local inventory health, rollback guidance, update notes, compatibility warnings, and preview media checks before presenting any future enable, disable, update, or remove action.

Marketplace authoring surfaces should feel like QA workbenches. Keep validation, metadata previews, screenshot/license/docs checks, compatibility matrices, README output, and submission templates compact, actionable, and tied to local files rather than promotional listing copy.

Template marketplace surfaces should preview the actual space product structure first: included schema, category tree, article templates, compatibility notes, diff results, merge options, and export metadata. Avoid install-style copy until an apply flow exists.

Domain workflow surfaces should be checklist-oriented and operational. Show controls, starter template links, workflow steps, and release gates close together so self-host admins can turn starter spaces into real docs, handbook, worldbuilding, research, or personal wiki workflows.

Assistant pack surfaces must lead with consent and consequence: provider, model, privacy mode, cost, retention, prompt scope, permissions, context sources, limits, outputs, and safety notes should be visible before enabling any AI feature. Local/offline deployments should clearly show the disabled/fallback state.

Assistant governance surfaces should make review obligations unavoidable: privacy warnings, human-review requirements, citation prompts, confidence metadata, audit events, opt-out state, and optional/non-blocking release gates should be visible near every provider-backed pack.

API documentation surfaces should treat v1 as a frozen contract, not a loose route list. Show the contract endpoint, OpenAPI schema, auth header, pagination/filter/sort vocabulary, standard error shape, rate-limit headers, and pre-v5 migration guide near the endpoint examples.

SDK documentation should keep snippets short and operational: one Node example, one browser fetch, one curl command, webhook event shape, typed API-key scopes, and sample script paths for backup, import, search, content audit, and webhook testing.

Webhook admin surfaces should make reliability visible: signing headers, retry count, latest delivery status, redelivery actions, supported event families, replay-window expectations, and test sender results should be close to each configured endpoint.

Operations admin surfaces should be dense, factual, and support-oriented. Show status chips, counts, route links, and short checks for service health, queues, slow pages, alerts, and diagnostic bundle sections; avoid decorative status art or prose-heavy incident guidance in the primary dashboard.

Maintenance surfaces should make risky actions reviewable. Cleanup queues should show counts and dry-run expectations before mutation, upgrade readiness should lead with pass/warning/critical chips, and runbook links should be close to the mode toggles that operators use during incidents.

Migration readiness surfaces should read like operator checklists, not release copy. Show backup evidence, schema compatibility, data-integrity counts, restore rehearsal status, representative upgrade path, and failure recovery owner together so admins know whether an upgrade can proceed.

Backup and restore surfaces should be sober and evidence-led. Put database, assets, env vars, marketplace packs, plugin manifests, customization settings, manifest conflicts, storage target, and drill status in one scan-friendly flow before any destructive restore action.

Upgrade assistant surfaces should prioritize go/no-go clarity. Keep readiness checks, diagnostics, compatibility warnings, release-note links, and post-upgrade smoke checks grouped by upgrade phase so operators can decide whether to proceed.

Quality gate surfaces should read as release management tools. Show suite status, fixture coverage, CI matrix health, known warnings, and release blockers as compact facts with owners and next actions.

Smoke suite surfaces should be practical QA runbooks. Keep product flow coverage, responsive route coverage, fixture seed state, and failure artifacts visible without marketing language.

Release gate surfaces should make blocker status unmistakable. Show required gates, docs sync output, known issues, blocker labels, and checklist state as go/no-go evidence for release managers.

Documentation onboarding surfaces should help maintainers choose the next document quickly. Prefer clear indexes, setup-path tables, troubleshooting topics, and cross-links over long narrative pages.

In-app onboarding surfaces should be compact and dismissible. Keep first-run checklists task-oriented, contextual help collapsed by default, and demo content previews clearly separate from real import actions.

Example recipe surfaces should compare complete deployment shapes without becoming marketing pages. Use compact recipe tables, copy-ready env snippets, screenshot slots, and recommendation lists that map directly to templates, packs, and migration runbooks.

Feature-freeze surfaces should read as go/no-go operations dashboards. Put allowed change classes, rehearsal status, blocker labels, gate owners, and release-note evidence in compact lists or tables with clear status language.

Release-candidate surfaces should make evidence gaps obvious. Keep gates, deployment paths, validation areas, checklists, and feedback links in dense status tables so release managers can scan what is ready to tag.

Final release gate surfaces should be terse and auditable. Prefer status matrices that show each compatibility target, correction window, and stable gate with direct evidence links over narrative signoff prose.

Observability surfaces should keep privacy controls in the operator's direct line of sight. Event feeds should use compact tables with category/severity chips and avoid rendering raw metadata by default; metric ingestion docs should emphasize redaction and aggregate payloads.

Performance surfaces should stay comparative and scan-friendly: route budget tables, status chips, observed p95 values, bundle targets, large-wiki fixture rows, and slow-query review notes. Avoid chart decoration until there are enough samples to justify it.

Cache admin surfaces should show rules before actions. Manual invalidation buttons must sit next to the event, affected surfaces, and key patterns so operators can understand blast radius before clicking.

Editorial governance UI should surface blockers first: overdue reviews, disputed claims, stale verification stamps, and owner gaps. Review controls should expose due date, required reviewers, approval threshold, cycle count, and decision note as compact operational metadata near the review action, not as prose-only help.

Portable bundle surfaces should make privacy and compatibility explicit. Bundle manifests must show included sections, excluded sensitive sections, privacy filters, checksum coverage, source metadata, and dry-run import issue groups before any future import flow can write data.

Export report surfaces should prioritize operational clarity over decoration: show status, scope, format, warnings, omitted data, file count, byte count, checksum coverage, retry/cancellation state, and download actions in a dense admin-friendly layout.

Audit trail surfaces should stay dense and incident-friendly. Keep actor, action, target, workspace, severity, success/failure, date filters, and redacted export controls visible without turning the log into a dashboard; severity should be readable at scan speed, and sensitive metadata should never be displayed as a default full export.

Moderation and suggestion queues should read as working lists. Show status, spam score, moderation state, assignee/task metadata, and reviewer-only visibility controls near the action buttons, keep report reasons terse, and avoid burying moderation consequences in long helper text.

Editor reliability surfaces should be plain and recoverable: show draft age, offline/sync state, restore/compare/discard choices, and health diagnostics as operational controls near the editor rather than as decorative alerts. Large-document warnings should identify the expensive structure, such as tables, code blocks, footnotes, images, or wiki links.

Sync and promotion surfaces should read like operational checklists. Dry-run reports need grouped counts, blocked/manual-review conflicts, visibility warnings, checksum status, and signed snapshot state without implying that live network federation is stable.

External-reference provenance should be compact and factual: “Imported from …” and “Mirrored from …” belong near article metadata, import review, or sync review surfaces. Public index warnings must call out private omissions without revealing private titles or paths.

Archive and mirror screens should emphasize immutability and review state. Read-only archive snapshots, private mirror setup, selected-space transfer, and repeated-sync conflict choices should use clear status rows and checklists rather than free-form prose alone.

Mobile polish is release-gated by phone, tablet, laptop, and wide desktop checks. Mobile navigation, article actions, editor trays, admin panels, marketplace pages, and customization previews must keep 44px touch targets, respect safe areas, avoid horizontal overflow, keep dialogs bounded, and wrap dense controls without clipping text.

Desktop packaging research should preserve the web app’s information architecture. Any Electron or Tauri shell must feel like a local launcher around Arkivel’s existing operational surfaces, with backups, updates, filesystem import/export, and plugin safety presented as explicit setup steps.

Accessibility finish work is release-gated: keyboard traps, unnamed controls, lost focus, hidden high-contrast focus states, and ignored reduced-motion preferences block v5. Graph, atlas, dashboard, marketplace, and editor widgets must expose text summaries alongside visual presentations.

Reusable editor controls should stay contract-first. Insert trays, review trays, outline trays, selection actions, contextual table controls, command palette metadata, block templates, shortcuts, and future inspectors belong in reusable editor primitives and `src/lib/editor-controls.ts` before they become route-specific UI.

Prefer composition over one-off variants:

- Use `Page` and `PageHeader` for app routes.
- Use `Section` for unframed content groups and `SectionPanel` or `Panel` for bordered modules.
- Use `Button`, `LinkButton`, `IconButton`, `Toolbar`, and `Dropdown` for controls.
- Use `Field`, `Input`, `Select`, `Textarea`, and `ToggleSwitch` for forms.
- Use `Card`, `CardLink`, `StatCard`, `DataTable`, `List`, `FeatureItem`, and `DefinitionGrid` for reusable content/data views.
- Use `Chip`, `Notice`, `ScreenReaderOnly`, and `EmptyState` for feedback, assistive summaries, and status.

### Documentation-visible design changes

Design changes are product changes. If a commit changes reusable components, page shell behavior, article/editor layout, navigation, theme tokens, responsive behavior, or visible product copy, update the matching design/product docs and bump the package version in the same commit. At minimum, check `DESIGN.md`, `README.md`, `ROADMAP.md`, `CHANGELOG.md`, `docs/help.md`, `docs/features.md`, `src/app/help/page.tsx`, and `src/app/features/page.tsx`.

### Button anatomy

All action-bar buttons use a single shared token:

```
flex items-center gap-1 h-6 px-2 text-[11px]
border border-border rounded
text-muted hover:text-foreground hover:bg-surface-hover
transition-colors
```

Active / toggled state adds:

```
border-accent bg-accent/10 text-accent
```

**Never** mix `py-*` padding with `h-*` height on the same button — use `h-*` to enforce a fixed height uniformly.

### Icons

- All icons are inline SVG — no icon font, no emoji, no unicode arrows.
- Size: `width="11" height="11"` for inline text icons, `width="14" height="14"` for standalone icon-only buttons, `width="16" height="16"` for header-level buttons (e.g. notification bell).
- Stroke width: `2` for detail icons, `2.5` for directional indicators (chevrons).
- Always set `strokeLinecap="round" strokeLinejoin="round"` for stroke icons.
- Fill icons (play, stop, bookmark-filled) use `fill="currentColor"` with no stroke.

### Chevron / collapsible indicators

Use a single downward chevron (`<polyline points="6 9 12 15 18 9">`) rotated via Tailwind:
- Open state: default (pointing down)
- Closed state: `-rotate-90` (pointing right) or `rotate-180` (pointing up), depending on the toggle direction

Always add `transition-transform` so the rotation animates.

### Grouping and separators

Related actions are grouped visually with a hairline divider:

```jsx
<span className="w-px h-4 bg-border mx-0.5" />
```

### Editor tray standard

The Tiptap editor should feel like a writing canvas first and a power tool second:
- Header: short editor identity, word/read-time summary, Insert/Review/Outline tray toggles, and Markdown toggle. Avoid extra badges or close buttons in the default chrome.
- Toolbar: keep common actions visible (block style, undo/redo, bold, italic, links, lists, image). Move quote, table, advanced text, knowledge, AI, claim, color, voice, and shortcut controls behind More.
- Feature trays: Insert, Review, and Outline are progressive disclosures. They should be closed by default, full-width, and never force a side inspector onto the canvas.
- Reusable control metadata: plugin commands, toolbar groups, slash commands, side panels, block templates, and shortcut scopes should be exposed through `/api/customization` so self-hosters and trusted plugins can discover capabilities without scraping UI code.
- Insert tray: rich blocks are grouped by purpose instead of shown as one large wall of tiles.
- Review tray: readiness and signals appear first; grammar and writing coach tools live in nested disclosures.
- Context bars: table controls appear only while editing a table. Do not show row, column, merge, split, or delete-table controls globally.
- Selection actions: appear only when text is selected and expose selection-specific commands. They must not reserve empty space when inactive.

Article action panel group order:
1. **Navigate** — Present
2. **Workflow** — Request review / active review link
3. **Collect** — Bookmark, + List
4. **Share / Export** — Copy link, Share, Print, Export ▾ (all formats in one dropdown)
5. **Read** — font size, font preference, focus, night, contrast, text-only, dyslexia, RTL, reading mode, width, theme
6. **Tools** — audio, speed reader, quiz, tutor, spaced-repetition review, translate, copy, duplicate

Article pages should use the dedicated article shell:
- Hero header for title, category, excerpt, edit attribution, freshness, verification, reading metrics, and co-authors.
- Compact article action rail for Navigate, Workflow, Collect, and Share actions, with dense Read and Tools controls behind disclosure menus. The rail must avoid fixed tile rows, avoid empty panel space, and keep dropdown menus clamped at tablet and phone widths.
- Dedicated article tabbar styles for Article, Edit, History, Discussion, and Blame; do not reuse `.wiki-tabs`, which is reserved for in-content tabbed blocks.
- Notice stack for status, review due, pinned, disambiguation, and maintenance flags.
- Taxonomy footer with wrapping category/tag chips, not pipe-separated text.
- Backlinks and dense article adjuncts should wrap as compact chips or panels rather than long inline lists.
- Claim Review Mode should live inside the existing claims panel. Keep claim confidence, review status, reviewer attribution, note editing, and decision buttons compact so the article body remains the primary reading surface.

### Page shell standard

General app pages should use the shared page shell before introducing route-specific layout:

- `.ui-page-header` wraps the title block and right-aligned actions; it must wrap on phone widths rather than compressing controls.
- `.ui-page-kicker` names the surface category (Browse, Discovery, Reference, Personal, Main page).
- `.ui-page-title` stays serif, normal weight, and wraps long names without forcing horizontal scroll.
- `.ui-page-dek` carries the page explanation or live result summary; avoid separate floating intro cards for this copy.
- `.ui-page-actions` contains only clear commands such as Create article, Search, Tags, or API docs.
- `.wiki-portal` remains the standard bordered module for repeated page sections, with `.wiki-compact-list` for dense sidebar and dashboard lists.

The home page is the canonical front-page implementation: live stats, featured article, browse directory, recent updates, and compact sidebar modules. It should feel like a working wiki index, not a marketing landing page.

The Canon Atlas at `/atlas` is the standard for immersive wiki surfaces: it may use a strong map-like visual as the primary working surface, but the map must be built from live wiki data, direct links, and readable operational queues. Keep the visual framed by practical dossier, continuity, and action modules so the page remains a tool, not a poster.

The Canon Trails page at `/trails` is the standard for reader-facing advanced experiences: it should feel like guided reading through the wiki, not another metrics dashboard. Trail stops need large readable article titles, direct article links, compact reasons, visible route order, and enough metadata to explain the path without turning the page into a control room.

Presentation mode at `/present/[slug]` is a full-height reading workspace. It must reserve separate regions for progress, top navigation, the slide stage, and footer controls; slide content scrolls inside the stage instead of overlapping chrome. Controls, dot navigation, counters, and keyboard hints must wrap or stack before they collide, and rich article content such as tables, code blocks, images, videos, and embeds must be constrained inside the slide viewport.

The Knowledge Command Center at `/intelligence` is the standard for operational dashboard pages: dense serif score treatment, compact summary cells, a real data cockpit, prioritized action rows, and flat bordered intelligence cards. High-impact dashboards may use purposeful visual systems like the article constellation, readiness radar, and impact simulator when the visuals are fed by live product data and remain navigable on phone, tablet, laptop, and wide desktop. Avoid decorative charts, nested cards, or marketing-style explanation blocks.

### Brand and header controls

- Sidebar and mobile header branding should use the configured compact logo mark, with the full square logo reserved for metadata, app icons, and larger brand surfaces.
- The global header search should stay quiet by default: show a compact trigger in the top bar, then expand into the input only when search is active.
- Phone navigation labels should describe the destination or mode. The sidebar trigger is Browse, not Menu, because it opens the wiki navigation spine.

### Dropdowns

- Appear `top-full mt-1` below their trigger.
- `absolute right-0` aligned to the right edge of the trigger.
- `z-50`, `bg-surface`, `border border-border`, `rounded`, `shadow-lg`.
- Each item: `text-left px-3 py-1.5 text-[12px] text-muted hover:text-foreground hover:bg-surface-hover transition-colors`.
- Close on outside click via `mousedown` listener.
- The trigger chevron rotates `rotate-180` when open.

### Responsive layout and overlays

- Desktop and tablet layouts keep the sidebar as the primary navigation spine; phone layouts use the bottom navigation for Home, Search, Create, Recent, and Browse.
- Full-height workspace routes (`/ask`, `/graph`, `/split`, `/map`, `/present/*`) do not show the bottom navigation; they keep the compact top menu so composers, canvases, maps, and graph controls remain usable.
- Fixed controls must not cover other interactive elements. If two controls compete for the same small-screen corner, remove one at that breakpoint or move it into the primary navigation.
- Flex rows that can contain user content or translated labels must include `min-w-0`, wrapping, or truncation. Long words should not force page-level horizontal scroll.
- Tables and dense data panels should keep their container width stable and scroll internally on narrow screens.
- Dropdowns and popovers must clamp to the viewport on phones. Header dropdowns should become fixed, inset panels when absolute alignment would push them off-screen.
- Modal headers, footers, and button rows must wrap before they overflow. Avoid fixed-width modal internals unless there is an internal scroll region.
- Search and article-list discovery filters should use wrapping chips, stacked sidebars, or constrained internal scroll areas instead of pipe-separated text rows that become unreadable on narrow screens.
- Responsive QA is not mobile-only: new or changed global UI should be checked at phone, tablet, laptop, and wide desktop widths for horizontal overflow, clipped controls, and covered interactive targets.

---

## Colour Usage

All colours come from CSS variables defined in `globals.css` under `@theme`. Never hardcode hex values in component classes; always use a semantic token.

| Token | Purpose |
|---|---|
| `text-foreground` | Primary readable text |
| `text-muted` | De-emphasised labels, metadata |
| `text-heading` | Article titles and section headers |
| `text-accent` | Interactive accent (links, active states) |
| `bg-surface` | Page / panel background |
| `bg-surface-hover` | Hovered row or button fill |
| `border-border` | Default border |
| `border-border-light` | Subtle dividers inside panels |

Dark mode is driven by `html[data-theme="dark"]` overrides — never use `dark:` Tailwind variants for colours that should respond to the theme toggle (use CSS variable tokens instead). Reserve `dark:` only for third-party overrides that cannot use variables.

---

## Typography

- **Headings**: serif (`var(--font-serif)`, Georgia stack). `font-normal` — wiki headings are not bold.
- **Body**: system sans-serif stack via Tailwind default.
- **Article body**: serif by default (`var(--font-serif)`), with the article font preference control offering Serif, Sans, and Mono overrides.
- **UI labels**: `text-[11px]` or `text-[12px]`. Do not use `text-xs` (14px) for compact UI chrome — it is too large.
- **Code**: monospace, syntax-highlighted via lowlight.
- **Tables**: article, editor, and presentation tables use `border-collapse: collapse`, zero border spacing, and wrapped cell content so adjacent cells read as one merged grid.
- **Readability cap**: wiki article content has a max-width of `65ch` in dyslexia mode; otherwise inherits the content column width.

---

## Interaction Feedback

- **Hover**: always provide a visible hover state (`hover:bg-surface-hover` or `hover:text-foreground`). Never leave interactive elements with no hover feedback.
- **Active / selected**: `border-accent bg-accent/10 text-accent`.
- **Disabled**: `opacity-50`, `cursor-default` (via Tailwind `disabled:opacity-50`).
- **Loading**: replace label with `"Loading…"` or `"Translating…"` inline — no spinner overlay for small buttons.
- **Confirmation**: brief label swap (`"Copied!"`, `"Saved"`) that self-resets after 2 s. No toast for micro-actions.
- **Transitions**: `transition-colors` on colour changes, `transition-transform` on rotation. Duration inherits Tailwind default (150 ms). Do not add custom durations unless there is a strong reason.

---

## Accessibility

- Every interactive element has a `title` or `aria-label`.
- Toggle buttons use `aria-pressed`.
- Dropdowns use `aria-haspopup="true"` and `aria-expanded={open}`.
- Skip-to-content link is the first focusable element in the DOM (`<a href="#main-content" class="skip-to-content">`), visible on focus only.
- `id="main-content"` on the `<main>` element.
- Keyboard: all buttons and links are natively focusable. Custom interactive elements (slash command menu, wiki-link suggester) handle `Enter`/`Space`/`ArrowUp`/`ArrowDown`/`Escape`.

---

## What We Don't Do

- **No emoji in UI** — emoji render inconsistently across OS and look unprofessional in a knowledge tool. Use SVG icons.
- **No unicode arrows / symbols** (▶ ▼ ▾ ⏸ ⏹ ☆ ★) — same reason.
- **No icon libraries** — inline SVG keeps the bundle small, keeps icons under version control, and allows per-instance colour/size control without overrides.
- **No decorative gradients or shadows on content** — shadows are reserved for floating elements (dropdowns, modals).
- **No `!important`** — CSS specificity issues are resolved by fixing the selector, not overriding it.
- **No hardcoded colours in component JSX** — all colour must come from a CSS variable token.
- **No separate button styles per feature** — one shared token, applied consistently everywhere.

## Reading Mode

Reading mode is toggled via `data-reading-mode="1"` on `<html>`. All suppression rules are in `globals.css` under the `/* ── v4.18: Reading mode ──*/` block. Components that must remain visible in reading mode (e.g. the exit button) use `data-reading-mode-toggle` attribute. Reading mode state persists in `localStorage` key `readingMode`.

## Focal Point Picker

`FocalPointPicker` renders an `<img>` with `object-fit: cover` and overlays a crosshair marker at `(coverFocalX%, coverFocalY%)`. Clicks and drag-moves reposition the marker and call `onChange(x, y)`. Values are integers 0–100 passed directly to CSS `object-position`.
