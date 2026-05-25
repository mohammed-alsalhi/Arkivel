export const ACCESSIBILITY_FINISH_SCHEMA_VERSION = "arkivel.accessibility-finish.v1";

export const ACCESSIBILITY_AUDIT_SURFACES = [
  "keyboard-access",
  "focus-management",
  "dialogs",
  "dropdowns",
  "table-controls",
  "editor-controls",
  "admin-forms",
  "marketplace-filters",
  "customization-previews",
] as const;

export const ACCESSIBILITY_WIDGET_SUMMARIES = [
  {
    widget: "graph",
    label: "Article graph",
    summary: "Interactive graph of article and relation links; provide keyboard-accessible node lists and text summaries for graph clusters.",
  },
  {
    widget: "atlas",
    label: "Atlas",
    summary: "Visual map of categories and signals; expose selected territory, signal counts, and thread summaries as text.",
  },
  {
    widget: "dashboard",
    label: "Dashboard",
    summary: "Widget dashboard with recent activity, queues, health, and shortcuts; each widget needs a heading and status summary.",
  },
  {
    widget: "marketplace",
    label: "Marketplace",
    summary: "Filterable marketplace registry; expose active filters, result counts, compatibility warnings, and import-preview errors.",
  },
  {
    widget: "editor",
    label: "Editor",
    summary: "Rich text editor with toolbar, trays, table controls, suggestions, and status; expose current mode, selection actions, and tray state.",
  },
] as const;

export const ACCESSIBILITY_RELEASE_BLOCKERS = [
  "Keyboard trap in dialog, dropdown, editor tray, graph, marketplace filter, or customization preview.",
  "Missing accessible name for icon-only action, form control, graph node, atlas signal, dashboard widget, marketplace filter, or editor command.",
  "Focus is lost after closing a modal, applying a toolbar action, changing tabs, or submitting an admin form.",
  "High-contrast mode hides focus rings, link affordances, status badges, or destructive action warnings.",
  "Reduced-motion preference is ignored by animated navigation, graph/atlas transitions, editor popovers, or loading states.",
] as const;

export const accessibilityFinishContract = {
  apiRoute: "/api/accessibility",
  auditSurfaces: ACCESSIBILITY_AUDIT_SURFACES,
  docs: "docs/accessibility.md",
  releaseGate: {
    blockers: ACCESSIBILITY_RELEASE_BLOCKERS,
    required: true,
    status: "required-before-v5",
  },
  schemaVersion: ACCESSIBILITY_FINISH_SCHEMA_VERSION,
  widgetSummaries: ACCESSIBILITY_WIDGET_SUMMARIES.map((item) => item.widget),
} as const;

export const highContrastAndMotionChecks = [
  {
    id: "high-contrast-focus",
    checks: ["focus rings visible", "links distinguishable", "badges readable", "destructive actions still warned"],
  },
  {
    id: "reduced-motion",
    checks: ["animated transitions disable", "loading states remain understandable", "graph/atlas motion has static fallback", "editor popovers do not rely on animation"],
  },
] as const;

export const accessibilityContributionChecklist = [
  "Use semantic buttons, links, headings, labels, fieldsets, and table headers before adding ARIA.",
  "Icon-only actions must include an accessible name and visible focus state.",
  "Dropdowns and dialogs must expose expanded/open state, return focus on close, and close with Escape.",
  "Custom keyboard interactions must support Enter, Space, arrow keys where relevant, and Escape.",
  "Graph, atlas, dashboard, marketplace, and editor widgets need screen-reader-visible summaries.",
  "Test high-contrast and reduced-motion preferences before marking a release candidate ready.",
] as const;

export function createAccessibilityAuditMatrix() {
  return ACCESSIBILITY_AUDIT_SURFACES.map((surface) => ({
    checks: ["keyboard", "focus", "name", "state", "escape", "summary"],
    releaseBlocking: true,
    surface,
  }));
}

export function createAccessibilityFinishReport() {
  return {
    auditMatrix: createAccessibilityAuditMatrix(),
    contributionChecklist: accessibilityContributionChecklist,
    contract: accessibilityFinishContract,
    highContrastAndMotionChecks,
    releaseGate: accessibilityFinishContract.releaseGate,
    widgetSummaries: ACCESSIBILITY_WIDGET_SUMMARIES,
  };
}

export function hasAccessibilityBlocker(labels: string[]) {
  const normalized = labels.map((label) => label.toLowerCase());
  return ACCESSIBILITY_RELEASE_BLOCKERS.some((blocker) => normalized.some((label) => blocker.toLowerCase().includes(label)));
}
