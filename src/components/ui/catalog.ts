export type ComponentCategory =
  | "layout"
  | "navigation"
  | "input"
  | "feedback"
  | "data"
  | "content";

export type ComponentRecipe = {
  category: ComponentCategory;
  description: string;
  importName: string;
  theming: string[];
};

export const componentCatalog = {
  Page: {
    category: "layout",
    description: "Responsive page wrapper with width variants for app, narrow, wide, and full layouts.",
    importName: "Page",
    theming: ["ui-page", "ui-page-narrow", "ui-page-wide", "ui-page-full"],
  },
  PageHeader: {
    category: "layout",
    description: "Shared page title, kicker, description, and action row.",
    importName: "PageHeader",
    theming: ["ui-page-header", "ui-page-title", "ui-page-kicker", "ui-page-dek"],
  },
  SectionPanel: {
    category: "layout",
    description: "Framed wiki panel with optional header actions and reusable body spacing.",
    importName: "SectionPanel",
    theming: ["wiki-portal", "wiki-portal-header", "wiki-portal-body"],
  },
  Button: {
    category: "input",
    description: "Themeable button with default, primary, and danger variants.",
    importName: "Button",
    theming: ["ui-button", "ui-button-primary", "ui-button-danger"],
  },
  LinkButton: {
    category: "navigation",
    description: "Next.js link styled with the shared button contract.",
    importName: "LinkButton",
    theming: ["ui-button", "ui-button-primary", "ui-button-danger"],
  },
  IconButton: {
    category: "input",
    description: "Accessible icon-only button with required label and tooltip title.",
    importName: "IconButton",
    theming: ["ui-icon-button"],
  },
  Field: {
    category: "input",
    description: "Label, hint, error, and control wrapper for consistent forms.",
    importName: "Field",
    theming: ["ui-field", "ui-label", "ui-muted", "ui-field-error"],
  },
  Input: {
    category: "input",
    description: "Text input primitive using shared focus, border, and theme colors.",
    importName: "Input",
    theming: ["ui-input"],
  },
  Select: {
    category: "input",
    description: "Select primitive using shared focus, border, and theme colors.",
    importName: "Select",
    theming: ["ui-select"],
  },
  Textarea: {
    category: "input",
    description: "Textarea primitive using shared focus, border, and theme colors.",
    importName: "Textarea",
    theming: ["ui-textarea"],
  },
  CardLink: {
    category: "navigation",
    description: "Reusable linked card with optional media, description, and metadata slots.",
    importName: "CardLink",
    theming: ["ui-card-link", "ui-card-media", "ui-card-body", "ui-card-title"],
  },
  DataTable: {
    category: "data",
    description: "Table primitive for dense admin, docs, and article metadata tables.",
    importName: "DataTable",
    theming: ["ui-table"],
  },
  EmptyState: {
    category: "feedback",
    description: "Reusable blank-state message with optional icon, description, and actions.",
    importName: "EmptyState",
    theming: ["ui-empty-state", "ui-empty-state-title", "ui-empty-state-actions"],
  },
  Chip: {
    category: "feedback",
    description: "Compact status or taxonomy chip with success, warning, danger, and info tones.",
    importName: "Chip",
    theming: ["ui-chip", "ui-chip-success", "ui-chip-warning", "ui-chip-danger", "ui-chip-info"],
  },
  Notice: {
    category: "feedback",
    description: "Inline notice/callout block for warnings, guidance, and contextual help.",
    importName: "Notice",
    theming: ["wiki-notice"],
  },
  InlineCode: {
    category: "content",
    description: "Inline code token with theme-aware surface color.",
    importName: "InlineCode",
    theming: ["ui-inline-code"],
  },
  CodeBlock: {
    category: "content",
    description: "Preformatted code block for docs, examples, exports, and API responses.",
    importName: "CodeBlock",
    theming: ["ui-code-block"],
  },
} satisfies Record<string, ComponentRecipe>;

export type ComponentCatalogKey = keyof typeof componentCatalog;
