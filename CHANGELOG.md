# changelog

## 6.5.0

- added a course workspace starter kit with linked courses and coursework, source identity, deadlines, scores, and separate completion evidence on the existing collections engine
- added preview and repeatable import of the course scraper's metadata export; concurrent imports and edits preserve manual work, partial refreshes retain verified fields, and older snapshots cannot overwrite newer records
- implemented shared table, board, list, and calendar views with inline property editing, search, filters, sorting, and complete pagination in both folio and wiki
- improved task forms, keyboard save/cancel behavior, touch targets, and sidebar contrast
- moved local, ci, and container runtimes to node 24 lts, updated the editor dependencies, and kept dependabot with grouped weekly updates and separate security updates
- restored browser checks for the current interface and test both skins against migrated disposable databases
- fixed standalone container startup with the locked prisma migration runtime, and restricted the unauthenticated admin bypass to local development

## 6.4.0

- gave folio a notion-style editor: the edit page is the page itself — a large editable title, a label / value property list (space, tags, status, pinned, url, edit summary), and a bare body with no frame or toolbar; save and cancel live in the top bar and `⌘S` / `Ctrl+S` saves
- added a `/` block menu (text, headings, lists, quote, code, divider, table, image, page link) that opens where you type, narrows as you keep typing, and a selection toolbar with turn-into, marks, and links; both skins get them, the wiki skin keeps its framed form and toolbar
- empty blocks now hint `type '/' for blocks`, and the active skin is available to client components through `useSkin`

## 6.3.0

- introduced prisma migrations: `prisma/migrations/0_baseline` reproduces the 6.0 schema, the docker image runs `prisma migrate deploy` on start instead of `db push`, and `npm run db:migrate` / `db:deploy` / `db:status` wrap the workflow
- added per-deployment modules: graph, assets, import, export, api, feeds, and share are now modules enabled through `ARKIVEL_MODULES` or `/admin/modules`; the sidebar, command palette, help, and features pages compose from the module registry
- added collections, the generic database engine: a collection with a typed property schema, items (optionally backed by a page), and views; the first view is the shared fixed-row table with inline editing
- added the notes-and-tasks starter kit: a tasks collection (status / due / priority / assignee) with table and board views, applied from `/admin/kits`
- recorded the configurability model in `docs/modules-and-collections.md` and AGENTS.md

## 6.2.0

- gave every page the same chrome: a sticky top bar with the full `space / parent / page` trail, edited-time, and page actions, plus one footer with a back link to the parent crumb and last-edited metadata; article routes share their title and category path through a route layout so edit, history, diff, and blame get a complete trail on first paint
- rebuilt the folio sidebar on the scope admin sidebar design: 2.25rem rounded nav rows with icon slots, uppercase section labels, a collapsible 4rem icon-only mode (`⌘B` / `Ctrl+B`, persisted) with tooltips, collapsible spaces with persisted open state, search / inbox / new page rows, and a settings row in the footer
- ported the bespoke overlay scrollbar: native bars are hidden (no gutter, so nothing reflows) and hover-only floating thumbs track every scrollable container
- tables now use a fixed layout with 2.25rem single-line rows, truncated cells, and a pinned header; folio content is left-aligned instead of centered, and nothing in the flow casts a shadow or lifts on hover
- normalized interface copy to lowercase and page titles to their subject (`spaces`, `inbox`, `all pages`, `tags`, `home`) so the sidebar, trail, and heading agree
- kept the content scrollbar's width reserved while an overlay locks scrolling, and forced a cache-free build after a stale css chunk shipped without the palette and folio stylesheets

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
