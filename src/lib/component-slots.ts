export const COMPONENT_SLOT_IDS = [
  "article-card",
  "article-header",
  "metadata-panel",
  "infobox-layout",
  "dashboard-widget",
  "homepage-section",
  "search-result",
  "editor-panel",
  "space-navigation",
  "admin-summary",
] as const;

export type ComponentSlotId = (typeof COMPONENT_SLOT_IDS)[number];

export type ComponentSlotContract = {
  dataBoundary: "public" | "admin" | "editor" | "workspace";
  description: string;
  errorState: string;
  fallbackComponent: string;
  id: ComponentSlotId;
  loadingState: string;
  permissionNotes: string;
  props: Record<string, string>;
};

export type ComponentSlotValidationResult = {
  incompatibleSlots: string[];
  valid: boolean;
};

export const componentSlotContracts = [
  {
    id: "article-card",
    description: "Compact repeated article summary used in lists, category pages, and dashboards.",
    dataBoundary: "public",
    fallbackComponent: "DefaultArticleCard",
    loadingState: "Skeleton title, excerpt, tags, and metadata line.",
    errorState: "Render title, unavailable excerpt notice, and safe link fallback.",
    permissionNotes: "Only published article data is visible to anonymous users.",
    props: { article: "Published article summary", viewerRole: "Current viewer role", density: "compact | comfortable" },
  },
  {
    id: "article-header",
    description: "Article title, status, category, timestamps, owners, and primary actions.",
    dataBoundary: "public",
    fallbackComponent: "DefaultArticleHeader",
    loadingState: "Skeleton title and metadata rows.",
    errorState: "Render title with metadata unavailable notice.",
    permissionNotes: "Draft/review controls require editor or admin access.",
    props: { article: "Article header model", actions: "Available commands", viewerRole: "Current viewer role" },
  },
  {
    id: "metadata-panel",
    description: "Right-rail or inline article metadata, tags, relations, and review context.",
    dataBoundary: "public",
    fallbackComponent: "DefaultMetadataPanel",
    loadingState: "Skeleton metadata definition list.",
    errorState: "Render minimal tags/category panel.",
    permissionNotes: "Private governance fields require editor or admin access.",
    props: { article: "Article metadata model", relations: "Semantic relations", governance: "Optional governance summary" },
  },
  {
    id: "infobox-layout",
    description: "Structured article facts and category-specific infobox fields.",
    dataBoundary: "public",
    fallbackComponent: "DefaultInfoboxLayout",
    loadingState: "Skeleton definition rows.",
    errorState: "Render plain field list without custom chrome.",
    permissionNotes: "Only fields available to the viewer may be rendered.",
    props: { fields: "Resolved infobox fields", category: "Category summary", articleSlug: "Article slug" },
  },
  {
    id: "dashboard-widget",
    description: "Dashboard module for operational summaries, review queues, and activity cards.",
    dataBoundary: "admin",
    fallbackComponent: "DefaultDashboardWidget",
    loadingState: "Skeleton widget title, stat, and action rows.",
    errorState: "Render widget error state without blocking the dashboard.",
    permissionNotes: "Admin dashboards require admin access; future workspace dashboards may scope to members.",
    props: { widget: "Widget metadata", metrics: "Metric values", viewerRole: "Current viewer role" },
  },
  {
    id: "homepage-section",
    description: "Homepage module for featured content, categories, calls to action, and recent updates.",
    dataBoundary: "public",
    fallbackComponent: "DefaultHomepageSection",
    loadingState: "Skeleton heading and card grid.",
    errorState: "Hide failed optional module and keep core homepage content visible.",
    permissionNotes: "Anonymous users see only public/published summaries.",
    props: { section: "Homepage section metadata", articles: "Published article summaries", categories: "Category summaries" },
  },
  {
    id: "search-result",
    description: "Search result row/card with title, excerpt, match context, status, and metadata.",
    dataBoundary: "public",
    fallbackComponent: "DefaultSearchResult",
    loadingState: "Skeleton result rows.",
    errorState: "Render title-only result when excerpt highlighting fails.",
    permissionNotes: "Search result visibility follows article status and viewer role.",
    props: { result: "Search result model", query: "Search query", viewerRole: "Current viewer role" },
  },
  {
    id: "editor-panel",
    description: "Editor-adjacent tool panel for outline, review, insert, coach, and pack-specific helpers.",
    dataBoundary: "editor",
    fallbackComponent: "DefaultEditorPanel",
    loadingState: "Skeleton panel controls.",
    errorState: "Render recoverable panel error and keep editor usable.",
    permissionNotes: "Requires editor/admin access to article edit surfaces.",
    props: { article: "Editable article model", editorState: "Editor state summary", commands: "Allowed editor commands" },
  },
  {
    id: "space-navigation",
    description: "Category or workspace navigation module for space landing pages and sidebars.",
    dataBoundary: "workspace",
    fallbackComponent: "DefaultSpaceNavigation",
    loadingState: "Skeleton navigation tree.",
    errorState: "Render root category links only.",
    permissionNotes: "Private spaces require membership; public spaces expose published navigation only.",
    props: { space: "Category or workspace summary", tree: "Navigation tree", viewerRole: "Current viewer role" },
  },
  {
    id: "admin-summary",
    description: "Admin overview module for system health, registry state, and governance summaries.",
    dataBoundary: "admin",
    fallbackComponent: "DefaultAdminSummary",
    loadingState: "Skeleton admin stats.",
    errorState: "Render scoped admin error without crashing the shell.",
    permissionNotes: "Requires admin access.",
    props: { summary: "Admin summary model", alerts: "Admin alerts", actions: "Available admin actions" },
  },
] satisfies ComponentSlotContract[];

const supportedSlotIds = new Set<ComponentSlotId>(COMPONENT_SLOT_IDS);

export function isComponentSlotId(value: string): value is ComponentSlotId {
  return supportedSlotIds.has(value as ComponentSlotId);
}

export function validateComponentPackSlots(slots: string[]): ComponentSlotValidationResult {
  const incompatibleSlots = slots.filter((slot) => !isComponentSlotId(slot));
  return {
    incompatibleSlots,
    valid: incompatibleSlots.length === 0,
  };
}
