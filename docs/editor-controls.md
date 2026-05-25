# Reusable Editor Controls

Arkivel v4.85.1 promotes the main writing controls into reusable editor primitives. The goal is to keep the first-party editor, plugin commands, slash commands, and future side panels aligned around the same contracts.

## Contract

`GET /api/customization` exposes `editorControls` with:

- `primitives` for command palettes, insert trays, review trays, outline trays, table controls, selection actions, and inspector panels
- `extensionPoints` for plugin commands, toolbar groups, slash commands, and side panels
- `blockTemplates` for callouts, metadata tables, timelines, infoboxes, decision logs, research notes, and worldbuilding entries
- `shortcuts` for global, editor, selection, table, and plugin-safe command scopes

Executable plugin UI still requires trusted local plugin manifests. The public contract is safe metadata that lets self-hosters, docs, and marketplace previews reason about which surfaces are available.

## Built-In Components

Reusable editor components live under `src/components/editor`:

- `EditorInsertTray` renders grouped block and template commands
- `EditorReviewTray` renders readiness, evidence, grammar, and writing-coach surfaces
- `EditorOutlineTray` renders the section navigator and outline-builder panel
- `EditorSelectionActions` renders selected-text commands
- `EditorTableControls` renders contextual table actions through the toolbar group primitive

The reusable UI catalog also lists these primitives so component packs and customization previews can discover their theming hooks.

## Block Templates

The shared template registry in `src/lib/editor-controls.ts` includes:

- callout
- metadata table
- timeline
- infobox
- decision log
- research note
- worldbuilding entry

The active editor insert tray uses the same registry, so future plugin-provided block templates can follow the same shape instead of duplicating tray-specific code.

## Shortcut Registry

The shortcut registry documents built-in chords such as `Cmd+K` / `Ctrl+K` for the command palette, `Cmd+H` / `Ctrl+H` for find and replace, `/` for slash commands, and scoped table/selection commands. Plugin-safe entries are marked so trusted plugin manifests can avoid claiming reserved or sensitive commands.
