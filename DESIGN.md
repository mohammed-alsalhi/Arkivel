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

---

## Component Standards

### Reusable component contract

Product UI should start from `@/components/ui` primitives before adding route-specific markup. The shared layer is intentionally small and self-host friendly: components expose semantic slots such as `title`, `description`, `actions`, `media`, `meta`, `hint`, and `error`, while styling flows through `ui-*` and `wiki-*` CSS variables/classes in `globals.css`.

Use the catalog in `src/components/ui/catalog.ts` as the living index of supported reusable components and their theming hooks. When adding a new reusable primitive, add it to the catalog with its category, import name, description, and CSS hooks.

The public `/api/customization` endpoint publishes the component catalog and theme hook summary for self-hosters, forks, plugins, and deployment dashboards. Keep the endpoint useful whenever reusable components, theme hooks, or public customization flags change.

### Style presets, color themes, and marketplace skins

The default skin is `classic-wiki`, selected through `NEXT_PUBLIC_ARKIVEL_STYLE`. `atlas-modern` is the first alternate built-in skin and demonstrates how a self-hosted instance can change the product feel through CSS variables and the `html[data-style="..."]` hook without forking routes or components.

Color themes are selected independently through `NEXT_PUBLIC_ARKIVEL_COLOR_THEME`. `standard`, `forest`, and `ember` are built in today and use the `html[data-color-theme="..."]` hook, so self-hosters can combine layout feel and palette separately. Layout presets are selected through `NEXT_PUBLIC_ARKIVEL_LAYOUT` and exposed as metadata plus the `html[data-layout="..."]` hook.

New skins, color themes, layouts, component packs, theme packs, and plugin listings should be registered in `src/lib/marketplace.ts`, exposed through `/api/customization`, and implemented through scoped CSS variables/classes in `src/app/globals.css` when they affect visuals. Treat all of them as marketplace-ready metadata: stable `id`, clear `kind`, explicit `status`, compatibility notes, and tags.

The `/admin/customization` studio and `/admin/marketplace` catalog must stay preview-safe in v1: they can copy env values, validate/import JSON for preview, and explain compatibility, but they must not execute remote code or persist customization overrides. The studio is a tabbed workbench, so brand/copy controls, appearance presets, feature flags, diagnostics, preview panels, deployment output, and pack validation should remain reusable sections instead of route-specific one-offs.

Prefer composition over one-off variants:

- Use `Page` and `PageHeader` for app routes.
- Use `Section` for unframed content groups and `SectionPanel` or `Panel` for bordered modules.
- Use `Button`, `LinkButton`, `IconButton`, `Toolbar`, and `Dropdown` for controls.
- Use `Field`, `Input`, `Select`, `Textarea`, and `ToggleSwitch` for forms.
- Use `Card`, `CardLink`, `StatCard`, `DataTable`, `List`, `FeatureItem`, and `DefinitionGrid` for reusable content/data views.
- Use `Chip`, `Notice`, and `EmptyState` for feedback and status.

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
