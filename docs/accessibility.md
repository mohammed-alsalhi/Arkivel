# Accessibility Finish

Arkivel v4.94.2 publishes the final pre-v5 accessibility audit contract.

## Contract

`GET /api/accessibility` returns the audit matrix, widget summaries, high-contrast and reduced-motion checks, contribution checklist, and release gate for known accessibility blockers.

## Audit Surfaces

The release audit covers keyboard access, focus management, dialogs, dropdowns, table controls, editor controls, admin forms, marketplace filters, and customization previews.

Each surface is checked for keyboard operation, visible focus, accessible names, state exposure, Escape/close behavior, and screen-reader summary coverage.

## Widget Summaries

Graph, Atlas, dashboard, marketplace, and editor widgets need screen-reader-visible summaries. Visual-only graph or map states must have text equivalents for selected nodes, territories, counts, warnings, and current filters.

## Contrast And Motion

High-contrast mode must preserve focus rings, link affordances, status badges, and destructive-action warnings. Reduced-motion mode must disable decorative transitions while preserving understandable loading, graph, atlas, and editor-popover states.

## Contribution Checklist

- Use semantic HTML before ARIA.
- Give icon-only actions accessible names and visible focus states.
- Return focus after dialogs, dropdowns, tabs, and admin form submissions.
- Support Escape and expected keyboard navigation in custom controls.
- Add screen-reader-visible summaries for visual widgets.
- Test high contrast and reduced motion before release candidates.

## Release Gate

Known keyboard traps, unnamed controls, lost focus, hidden high-contrast focus states, or ignored reduced-motion preferences block the v5 release candidate.
