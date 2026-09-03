# roadmap

Arkivel 6.0.0 is the focused baseline; 6.1.0 added the command palette and per-user skin choice, 6.2.0 unified the page chrome and the folio sidebar, and 6.3.0 introduced migrations, per-deployment modules, the collections engine, and starter kits — the configurability model described in `docs/modules-and-collections.md`. 6.4.0 made folio editing notion-like: the page is the editor, with a `/` block menu and a selection toolbar.

Next on the engine: board, list, and calendar views; relations across collections; more starter kits.

Near-term work is maintenance, not feature expansion:

- keep article editing, search, links, revisions, imports, exports, and authentication reliable
- verify backup/restore and explicit database migrations on disposable clones
- keep both Vercel projects on the same reviewed `main` SHA
- improve accessibility and performance when measured regressions appear

AI assistants, collaboration, marketplaces, plugins, workspaces, gamification, and social features are outside the product boundary.
