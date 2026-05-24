import type { CustomizationDiagnosticsReport } from "./customization-diagnostics";
import type { CustomizationDraft } from "./customization-drafts";

export type CustomizationStudioTabId =
  | "brand"
  | "drafts"
  | "appearance"
  | "features"
  | "diagnostics"
  | "preview"
  | "output"
  | "packs";

export type CustomizationStudioTab = {
  description: string;
  id: CustomizationStudioTabId;
  label: string;
};

export type CustomizationStudioViewport = {
  checks: string[];
  description: string;
  id: string;
  label: string;
  width: string;
};

export const CUSTOMIZATION_STUDIO_TABS: CustomizationStudioTab[] = [
  {
    id: "brand",
    label: "Brand",
    description: "Edit site identity, copy, logos, and app icon preview fields.",
  },
  {
    id: "drafts",
    label: "Drafts",
    description: "Save browser-local drafts, apply starters, and compare draft changes.",
  },
  {
    id: "appearance",
    label: "Appearance",
    description: "Choose style, color theme, and layout preview values.",
  },
  {
    id: "features",
    label: "Features",
    description: "Preview public feature flags and canonical integration basics.",
  },
  {
    id: "diagnostics",
    label: "Diagnostics",
    description: "Review deployment, accessibility, palette, and asset readiness checks.",
  },
  {
    id: "preview",
    label: "Preview",
    description: "Inspect representative homepage, article, editor, dashboard, marketplace, and mobile surfaces.",
  },
  {
    id: "output",
    label: "Output",
    description: "Copy deployment-ready environment values in common hosting formats.",
  },
  {
    id: "packs",
    label: "Packs",
    description: "Validate theme pack JSON and inspect the supported pack schema.",
  },
];

export const CUSTOMIZATION_STUDIO_VIEWPORTS: CustomizationStudioViewport[] = [
  {
    id: "mobile",
    label: "Mobile",
    width: "360px",
    description: "Single-column panels with touch-friendly controls and no clipped labels.",
    checks: ["tab bar wraps cleanly", "actions remain reachable", "preview text does not overlap"],
  },
  {
    id: "tablet",
    label: "Tablet",
    width: "768px",
    description: "Two-column editing where supporting panels stack after the primary form.",
    checks: ["cards keep stable width", "tables scroll or wrap", "draft controls remain grouped"],
  },
  {
    id: "laptop",
    label: "Laptop",
    width: "1280px",
    description: "Balanced admin workspace with side panels and preview grids visible together.",
    checks: ["right rails fit", "diagnostics stay scannable", "output code remains readable"],
  },
  {
    id: "wide",
    label: "Wide desktop",
    width: "1536px+",
    description: "Wide review mode where panels use constrained content instead of stretching awkwardly.",
    checks: ["preview grid stays dense", "line length remains comfortable", "actions stay near context"],
  },
];

const tabIndex = new Map(CUSTOMIZATION_STUDIO_TABS.map((tab, index) => [tab.id, index]));

export function getCustomizationStudioTabById(tabId: CustomizationStudioTabId) {
  return CUSTOMIZATION_STUDIO_TABS[tabIndex.get(tabId) ?? 0];
}

export function getNextCustomizationStudioTab(
  currentTab: CustomizationStudioTabId,
  key: string,
): CustomizationStudioTabId {
  const currentIndex = tabIndex.get(currentTab) ?? 0;
  const lastIndex = CUSTOMIZATION_STUDIO_TABS.length - 1;

  if (key === "ArrowRight" || key === "ArrowDown") {
    return CUSTOMIZATION_STUDIO_TABS[currentIndex === lastIndex ? 0 : currentIndex + 1].id;
  }

  if (key === "ArrowLeft" || key === "ArrowUp") {
    return CUSTOMIZATION_STUDIO_TABS[currentIndex === 0 ? lastIndex : currentIndex - 1].id;
  }

  if (key === "Home") return CUSTOMIZATION_STUDIO_TABS[0].id;
  if (key === "End") return CUSTOMIZATION_STUDIO_TABS[lastIndex].id;

  return currentTab;
}

export function createCustomizationStudioSummary({
  activeTab,
  changedCount,
  diagnostics,
  draft,
  themePackValid,
  version,
}: {
  activeTab: CustomizationStudioTabId;
  changedCount: number;
  diagnostics: CustomizationDiagnosticsReport | null;
  draft: CustomizationDraft;
  themePackValid: boolean;
  version: string;
}) {
  const tab = getCustomizationStudioTabById(activeTab);
  const changeText = changedCount === 1 ? "1 draft change" : `${changedCount} draft changes`;
  const diagnosticText = diagnostics
    ? `${diagnostics.counts.error} errors, ${diagnostics.counts.warning} warnings, and ${diagnostics.counts.pass} passes`
    : "diagnostics still loading";
  const packText = themePackValid ? "theme pack JSON is valid" : "theme pack JSON needs review";

  return [
    `Customization Studio version ${version}.`,
    `Current tab: ${tab.label}.`,
    tab.description,
    `${changeText}.`,
    `Diagnostics show ${diagnosticText}.`,
    `Selected style ${draft.styleId}, color theme ${draft.colorThemeId}, and layout ${draft.layoutId}.`,
    packText,
  ].join(" ");
}
