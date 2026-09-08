export const EDITOR_CONTROLS_SCHEMA_VERSION = "2026-05-25.v4.85.1";

export type EditorPrimitiveKind =
  | "command-palette"
  | "insert-tray"
  | "review-tray"
  | "outline-tray"
  | "table-controls"
  | "selection-actions"
  | "inspector-panel";

export type EditorExtensionPointKind =
  | "plugin-command"
  | "toolbar-group"
  | "slash-command"
  | "side-panel";

export type EditorShortcutScope = "global" | "editor" | "selection" | "table" | "plugin";

export type EditorBlockTemplateKind =
  | "callout"
  | "metadata-table"
  | "timeline"
  | "infobox"
  | "decision-log"
  | "research-note"
  | "worldbuilding-entry";

export type EditorBlockTemplate = {
  id: string;
  kind: EditorBlockTemplateKind;
  label: string;
  description: string;
  group: "writing" | "reference" | "research" | "worldbuilding";
  slashCommand: string;
  requiredExtensions: string[];
  html: string;
};

export type EditorShortcut = {
  id: string;
  label: string;
  scope: EditorShortcutScope;
  keys: string[];
  commandId: string;
  pluginSafe: boolean;
};

export type EditorExtensionPoint = {
  id: string;
  kind: EditorExtensionPointKind;
  label: string;
  description: string;
  accepts: string[];
  ordering: "append" | "before-built-ins" | "after-built-ins";
};

export const editorPrimitiveCatalog: Record<EditorPrimitiveKind, {
  label: string;
  description: string;
  component: string;
  theming: string[];
}> = {
  "command-palette": {
    label: "Command palette",
    description: "Reusable searchable command surface for navigation, editor commands, and plugin actions.",
    component: "EditorCommandPalette",
    theming: ["editor-command-palette", "editor-command-section", "editor-command-item"],
  },
  "insert-tray": {
    label: "Insert tray",
    description: "Grouped block insertion panel shared by editor toolbar buttons, slash commands, and plugin blocks.",
    component: "EditorInsertTray",
    theming: ["editor-tray", "editor-command-section", "editor-command-item"],
  },
  "review-tray": {
    label: "Review tray",
    description: "Readiness, evidence, grammar, and coaching panel for writing review workflows.",
    component: "EditorReviewTray",
    theming: ["editor-tray", "editor-review-strip", "editor-check-list"],
  },
  "outline-tray": {
    label: "Outline tray",
    description: "Section navigator and outline builder host for long-form editing.",
    component: "EditorOutlineTray",
    theming: ["editor-tray", "editor-outline-list", "editor-side-panel"],
  },
  "table-controls": {
    label: "Table controls",
    description: "Contextual table command group for rows, columns, headers, merge, split, and delete actions.",
    component: "EditorTableControls",
    theming: ["editor-toolbar-group", "editor-tool-button"],
  },
  "selection-actions": {
    label: "Selection actions",
    description: "Reusable selected-text action bar for rewrite, expand, link, wiki-link, footnote, and plugin actions.",
    component: "EditorSelectionActions",
    theming: ["editor-selection-bar", "editor-selection-action"],
  },
  "inspector-panel": {
    label: "Inspector panel",
    description: "Side-panel host for block metadata, document health, plugins, and future schema-aware inspectors.",
    component: "EditorInspectorPanel",
    theming: ["editor-side-panel", "editor-inspector-section"],
  },
};

export const editorExtensionPoints: EditorExtensionPoint[] = [
  {
    id: "editor.commands.plugin",
    kind: "plugin-command",
    label: "Plugin commands",
    description: "Adds plugin-owned commands to the command palette, slash menu, toolbar, or contextual surfaces.",
    accepts: ["id", "label", "description", "run", "shortcut", "permissions"],
    ordering: "after-built-ins",
  },
  {
    id: "editor.toolbar.groups",
    kind: "toolbar-group",
    label: "Toolbar groups",
    description: "Adds grouped toolbar buttons without replacing Arkivel's built-in editing groups.",
    accepts: ["id", "label", "actions", "priority", "requiredSelection"],
    ordering: "append",
  },
  {
    id: "editor.slash.commands",
    kind: "slash-command",
    label: "Slash commands",
    description: "Adds slash-command items that resolve into editor commands or block templates.",
    accepts: ["title", "description", "keywords", "command", "templateId"],
    ordering: "after-built-ins",
  },
  {
    id: "editor.side.panels",
    kind: "side-panel",
    label: "Side panels",
    description: "Adds document-aware side panels for inspections, references, workflows, and plugin UI.",
    accepts: ["id", "label", "component", "requiredRole", "articleContext"],
    ordering: "append",
  },
];

export const editorBlockTemplates: EditorBlockTemplate[] = [
  {
    id: "callout-note",
    kind: "callout",
    label: "Note callout",
    description: "Short contextual callout for notes, cautions, tips, and evidence reminders.",
    group: "writing",
    slashCommand: "/callout",
    requiredExtensions: ["calloutBlock"],
    html: `<blockquote data-callout="note"><p><strong>Note:</strong> Add the key context here.</p></blockquote><p></p>`,
  },
  {
    id: "metadata-table",
    kind: "metadata-table",
    label: "Metadata table",
    description: "Compact article facts table for owners, dates, status, sources, and related pages.",
    group: "reference",
    slashCommand: "/metadata",
    requiredExtensions: ["table"],
    html: `<table><tbody><tr><th>Field</th><th>Value</th></tr><tr><td>Status</td><td>Draft</td></tr><tr><td>Owner</td><td></td></tr><tr><td>Sources</td><td></td></tr></tbody></table><p></p>`,
  },
  {
    id: "timeline",
    kind: "timeline",
    label: "Timeline",
    description: "Chronological event structure with date and narrative fields.",
    group: "reference",
    slashCommand: "/timeline",
    requiredExtensions: ["html-block"],
    html: `<div class="wiki-timeline"><div class="wiki-timeline-entry"><div class="wiki-timeline-date">Date</div><div class="wiki-timeline-body"><p>Event description</p></div></div><div class="wiki-timeline-entry"><div class="wiki-timeline-date">Date</div><div class="wiki-timeline-body"><p>Event description</p></div></div></div><p></p>`,
  },
  {
    id: "infobox",
    kind: "infobox",
    label: "Infobox",
    description: "Right-sized summary block for canonical facts and quick scanning.",
    group: "reference",
    slashCommand: "/infobox",
    requiredExtensions: ["table"],
    html: `<table><tbody><tr><th colspan="2">Infobox</th></tr><tr><td>Type</td><td></td></tr><tr><td>Known for</td><td></td></tr><tr><td>Related</td><td>[[Related article]]</td></tr></tbody></table><p></p>`,
  },
  {
    id: "decision-log",
    kind: "decision-log",
    label: "Decision log",
    description: "Decision record with context, options, outcome, and follow-up owner.",
    group: "research",
    slashCommand: "/decision-log",
    requiredExtensions: ["heading", "list"],
    html: `<h2>Decision</h2><p>State the decision.</p><h3>Context</h3><p>Why this came up.</p><h3>Options considered</h3><ul><li>Option A</li><li>Option B</li></ul><h3>Outcome</h3><p>Chosen path and owner.</p>`,
  },
  {
    id: "research-note",
    kind: "research-note",
    label: "Research note",
    description: "Reusable note with question, evidence, interpretation, and next steps.",
    group: "research",
    slashCommand: "/research",
    requiredExtensions: ["heading", "footnoteRef"],
    html: `<h2>Question</h2><p>What are we trying to learn?</p><h2>Evidence</h2><p>Add sources and footnotes.</p><h2>Interpretation</h2><p>What this evidence suggests.</p><h2>Next steps</h2><ul><li>Follow-up task</li></ul>`,
  },
  {
    id: "worldbuilding-entry",
    kind: "worldbuilding-entry",
    label: "Worldbuilding entry",
    description: "Lore-friendly page skeleton with canon status, traits, history, and links.",
    group: "worldbuilding",
    slashCommand: "/worldbuilding",
    requiredExtensions: ["wikiLink", "calloutBlock"],
    html: `<h2>Canon status</h2><p>Draft, review, or canonical.</p><h2>Traits</h2><ul><li>Trait</li></ul><h2>History</h2><p>Origin and major changes.</p><h2>Connections</h2><ul><li>[[Related article]]</li></ul>`,
  },
];

export const editorShortcutRegistry: EditorShortcut[] = [
  { id: "global.command-palette", label: "Open command palette", scope: "global", keys: ["Meta+K", "Ctrl+K"], commandId: "command-palette.open", pluginSafe: true },
  { id: "editor.find-replace", label: "Find and replace", scope: "editor", keys: ["Meta+H", "Ctrl+H"], commandId: "editor.findReplace.toggle", pluginSafe: true },
  { id: "editor.slash-menu", label: "Open slash commands", scope: "editor", keys: ["/"], commandId: "editor.slashCommands.open", pluginSafe: true },
  { id: "selection.rewrite", label: "Rewrite selection", scope: "selection", keys: ["Meta+Shift+R", "Ctrl+Shift+R"], commandId: "editor.selection.rewrite", pluginSafe: false },
  { id: "selection.wiki-link", label: "Create wiki link from selection", scope: "selection", keys: ["Meta+Shift+W", "Ctrl+Shift+W"], commandId: "editor.selection.wikiLink", pluginSafe: true },
  { id: "table.add-row", label: "Add table row below", scope: "table", keys: ["Meta+Alt+ArrowDown", "Ctrl+Alt+ArrowDown"], commandId: "editor.table.addRowAfter", pluginSafe: true },
  { id: "table.add-column", label: "Add table column after", scope: "table", keys: ["Meta+Alt+ArrowRight", "Ctrl+Alt+ArrowRight"], commandId: "editor.table.addColumnAfter", pluginSafe: true },
];

export const editorControlsContract = {
  schemaVersion: EDITOR_CONTROLS_SCHEMA_VERSION,
  primitives: editorPrimitiveCatalog,
  extensionPoints: editorExtensionPoints,
  blockTemplates: editorBlockTemplates.map((template) => ({
    id: template.id,
    kind: template.kind,
    label: template.label,
    description: template.description,
    group: template.group,
    slashCommand: template.slashCommand,
    requiredExtensions: template.requiredExtensions,
  })),
  shortcuts: editorShortcutRegistry,
  compatibility: {
    editor: "Tiptap",
    pluginSurface: "preview-safe metadata now; executable plugin hooks require trusted local plugin manifests",
    theming: ["CSS variables", "editor-* hooks", "ui-* hooks"],
  },
};

export function getEditorBlockTemplate(id: string): EditorBlockTemplate | null {
  return editorBlockTemplates.find((template) => template.id === id) ?? null;
}

export function getEditorShortcutsForScope(scope: EditorShortcutScope): EditorShortcut[] {
  return editorShortcutRegistry.filter((shortcut) => shortcut.scope === scope);
}

export function groupEditorBlockTemplates() {
  return editorBlockTemplates.reduce<Record<EditorBlockTemplate["group"], EditorBlockTemplate[]>>(
    (groups, template) => {
      groups[template.group].push(template);
      return groups;
    },
    { writing: [], reference: [], research: [], worldbuilding: [] }
  );
}
