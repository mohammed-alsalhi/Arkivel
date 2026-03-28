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

Article action bar group order:
1. **Navigate** — Present
2. **Collect** — Bookmark, + List
3. **Share / Export** — Copy link, Share, Print, Export ▾ (all formats in one dropdown)
4. **Reading tools** — Aa (dyslexia), RTL, Translate ▾

### Dropdowns

- Appear `top-full mt-1` below their trigger.
- `absolute right-0` aligned to the right edge of the trigger.
- `z-50`, `bg-surface`, `border border-border`, `rounded`, `shadow-lg`.
- Each item: `text-left px-3 py-1.5 text-[12px] text-muted hover:text-foreground hover:bg-surface-hover transition-colors`.
- Close on outside click via `mousedown` listener.
- The trigger chevron rotates `rotate-180` when open.

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
- **UI labels**: `text-[11px]` or `text-[12px]`. Do not use `text-xs` (14px) for compact UI chrome — it is too large.
- **Code**: monospace, syntax-highlighted via lowlight.
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
