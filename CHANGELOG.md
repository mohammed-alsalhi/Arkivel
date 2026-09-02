# changelog

## 6.1.0

- added a command palette (`⌘K` / `Ctrl+K`) that searches pages, jumps to sections, and runs theme and skin actions; the sidebar search field opens it
- made the skin a per-user choice: settings offers site default, `folio`, or `wiki`, resolved from a cookie, then the saved preference, then `NEXT_PUBLIC_ARKIVEL_SKIN`
- redesigned `folio` as a flat, document-first skin — hairline dividers instead of boxed panels and bordered tables, soft hover fills, a centered document column, and compact icon navigation — while `wiki` keeps the classic framed palette on the same components
- fixed folio-dark contrast bugs (skip link, primary buttons, toggle thumb), unified the drawer z-tiers, made drawers proper dialogs with focus traps, and extended coarse-pointer sizing across the editor, graph, and context rail
- routed hand-rolled inputs, tables, menus, and banners through the shared ui primitives and removed unused primitives and orphaned pre-6.0 css
- added `npm run seed:demo`, an idempotent demo dataset with resolving wiki links and semantic relations

## 6.0.0

- consolidated Arkivel and WorldWiki source into one public repository with independent deployments
- replaced the wiki shell with a focused three-pane document interface
- removed AI, collaboration, marketplace, plugin, workspace, social, gamification, dashboard, and experimental surfaces
- reduced the editor, API contract, dependencies, documentation, and application schema to the supported core
- preserved production data behind a verified database backup and an application-only schema cutover
- reset repository history to a clean root release after creating an offline Git bundle
- made the three-pane `folio` skin full viewport while retaining `wiki` as the classic framed skin
- aligned local, CI, Docker, and Vercel builds on Node.js 20 and added the docs-sync gate to CI
