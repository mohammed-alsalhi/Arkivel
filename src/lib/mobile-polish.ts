export const MOBILE_POLISH_SCHEMA_VERSION = "arkivel.mobile-polish.v1";

export const MOBILE_QA_VIEWPORTS = [
  { id: "phone", label: "Phone", size: "390x844" },
  { id: "tablet", label: "Tablet", size: "768x1024" },
  { id: "laptop", label: "Laptop", size: "1366x768" },
  { id: "wide", label: "Wide desktop", size: "1440x1100" },
] as const;

export const MOBILE_POLISH_SURFACES = [
  "mobile-navigation",
  "article-actions",
  "editor-trays",
  "admin-panels",
  "marketplace-pages",
  "customization-previews",
] as const;

export const MOBILE_REGRESSION_CHECKS = [
  "No horizontal overflow at any QA viewport.",
  "No clipped button, tab, chip, badge, or table header text.",
  "Touch targets are at least 44px tall on phone and tablet.",
  "Safe-area padding protects bottom navigation, drawers, and sticky actions.",
  "Dialogs and popovers remain inside the viewport and can be dismissed.",
  "Editor trays, admin filters, marketplace detail panels, and customization previews wrap without overlapping.",
] as const;

export type MobilePolishSurface = (typeof MOBILE_POLISH_SURFACES)[number];

export type MobileQaCheckpoint = {
  checks: readonly string[];
  route: string;
  surface: MobilePolishSurface;
  viewports: typeof MOBILE_QA_VIEWPORTS;
};

export const mobilePolishContract = {
  apiRoute: "/api/mobile-polish",
  docs: "docs/mobile-polish.md",
  regressionChecks: MOBILE_REGRESSION_CHECKS,
  schemaVersion: MOBILE_POLISH_SCHEMA_VERSION,
  surfaces: MOBILE_POLISH_SURFACES,
  viewports: MOBILE_QA_VIEWPORTS,
} as const;

export const mobileQaCheckpoints: MobileQaCheckpoint[] = [
  {
    checks: ["Bottom nav labels fit", "Browse/sidebar controls remain reachable", "Focused workspace routes do not show bottom nav"],
    route: "/",
    surface: "mobile-navigation",
    viewports: MOBILE_QA_VIEWPORTS,
  },
  {
    checks: ["Action rail wraps", "Share/export menus stay in viewport", "Sticky controls do not cover content"],
    route: "/articles/example",
    surface: "article-actions",
    viewports: MOBILE_QA_VIEWPORTS,
  },
  {
    checks: ["Insert/Review/Outline trays stack", "Toolbar controls keep 44px targets", "Keyboard focus remains visible"],
    route: "/articles/example/edit",
    surface: "editor-trays",
    viewports: MOBILE_QA_VIEWPORTS,
  },
  {
    checks: ["Filters wrap", "Tables scroll horizontally inside their own container", "Bulk actions stay reachable"],
    route: "/admin",
    surface: "admin-panels",
    viewports: MOBILE_QA_VIEWPORTS,
  },
  {
    checks: ["Marketplace cards wrap", "Detail panels fit", "Import preview errors do not overflow"],
    route: "/admin/marketplace",
    surface: "marketplace-pages",
    viewports: MOBILE_QA_VIEWPORTS,
  },
  {
    checks: ["Preview frames fit", "Token diff rows wrap", "Env output remains scrollable"],
    route: "/admin/customization",
    surface: "customization-previews",
    viewports: MOBILE_QA_VIEWPORTS,
  },
];

export const mobileHelpScreenshots = [
  { alt: "Mobile home with safe-area bottom navigation", path: "docs/screenshots/mobile-home.png", route: "/" },
  { alt: "Mobile article actions wrapped below article metadata", path: "docs/screenshots/mobile-article-actions.png", route: "/articles/example" },
  { alt: "Mobile editor trays stacked under the toolbar", path: "docs/screenshots/mobile-editor-trays.png", route: "/articles/example/edit" },
] as const;

export function getMobileQaCheckpoint(surface: MobilePolishSurface) {
  return mobileQaCheckpoints.find((checkpoint) => checkpoint.surface === surface);
}

export function createMobileRegressionChecklist() {
  return mobileQaCheckpoints.map((checkpoint) => ({
    checks: [...MOBILE_REGRESSION_CHECKS, ...checkpoint.checks],
    route: checkpoint.route,
    surface: checkpoint.surface,
    viewports: checkpoint.viewports.map((viewport) => viewport.size),
  }));
}

export function createMobilePolishReport() {
  return {
    contract: mobilePolishContract,
    helpScreenshots: mobileHelpScreenshots,
    regressionChecklist: createMobileRegressionChecklist(),
    responsiveQa: mobileQaCheckpoints,
  };
}
