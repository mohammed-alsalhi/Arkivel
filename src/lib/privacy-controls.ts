export const PRIVACY_CONTROLS_SCHEMA_VERSION = "2026-05-25.v4.89.1";

export type PrivacySurface =
  | "spaces"
  | "indexing"
  | "feeds"
  | "exports"
  | "analytics"
  | "ai-features"
  | "webhooks"
  | "user-profiles";

export type DeploymentPrivacyMode = "personal" | "team" | "public";

export type PrivacyControl = {
  defaultMode: "private" | "public" | "admin-only" | "opt-in";
  description: string;
  recommendedModes: Record<DeploymentPrivacyMode, string>;
  surface: PrivacySurface;
};

export type RetentionSetting = {
  defaultDays: number;
  description: string;
  key: string;
  maxDays: number;
  minDays: number;
};

export const privacyControls: PrivacyControl[] = [
  {
    defaultMode: "private",
    description: "Workspace visibility controls article, search, category, tag, feed, sitemap, and API exposure.",
    recommendedModes: {
      personal: "Keep workspaces private unless intentionally publishing selected spaces.",
      team: "Use private/team visibility and explicit membership for internal knowledge.",
      public: "Publish only reviewed workspaces and keep drafts/review states hidden.",
    },
    surface: "spaces",
  },
  {
    defaultMode: "opt-in",
    description: "Indexing controls should cover sitemap, robots guidance, public search, and future external indexing hooks.",
    recommendedModes: {
      personal: "Disable public indexing unless the instance is intentionally public.",
      team: "Disable public indexing for private workspaces and internal deployments.",
      public: "Allow indexing only for published public workspaces.",
    },
    surface: "indexing",
  },
  {
    defaultMode: "public",
    description: "RSS and Atom feeds expose published public content and must stay aligned with workspace visibility.",
    recommendedModes: {
      personal: "Disable or keep feeds local unless public publishing is desired.",
      team: "Restrict feeds to public workspaces only.",
      public: "Publish feeds for reviewed, published content.",
    },
    surface: "feeds",
  },
  {
    defaultMode: "admin-only",
    description: "Exports may contain large content slices and should include manifest warnings and omitted private-data notes.",
    recommendedModes: {
      personal: "Keep exports admin-only and store downloads locally.",
      team: "Review export scope before sharing outside the team.",
      public: "Export only reviewed public data unless doing an admin backup.",
    },
    surface: "exports",
  },
  {
    defaultMode: "opt-in",
    description: "Analytics and metric ingestion should prefer aggregate data, IP anonymization, and retention limits.",
    recommendedModes: {
      personal: "Disable analytics unless needed for operations.",
      team: "Use aggregate analytics with IP anonymization.",
      public: "Publish analytics policy and keep raw query/event retention short.",
    },
    surface: "analytics",
  },
  {
    defaultMode: "opt-in",
    description: "AI features can send article text, prompts, filenames, or search context to configured providers.",
    recommendedModes: {
      personal: "Use AI only with providers you trust for personal notes.",
      team: "Document approved AI providers and avoid sensitive drafts unless policy allows it.",
      public: "Warn editors before sending unpublished content to external AI providers.",
    },
    surface: "ai-features",
  },
  {
    defaultMode: "admin-only",
    description: "Webhook payloads can expose article metadata, titles, slugs, and event timing to external receivers.",
    recommendedModes: {
      personal: "Keep webhooks off unless a local automation needs them.",
      team: "Route webhooks only to approved internal receivers.",
      public: "Sign payloads and avoid sending private workspace data.",
    },
    surface: "webhooks",
  },
  {
    defaultMode: "private",
    description: "Profiles can expose display names, contribution history, achievements, and preferences.",
    recommendedModes: {
      personal: "Keep profile details minimal.",
      team: "Show profile details only to signed-in members.",
      public: "Expose only intentional public contribution details.",
    },
    surface: "user-profiles",
  },
];

export const retentionSettings: RetentionSetting[] = [
  { defaultDays: 180, description: "Activity feed contribution events.", key: "activity", maxDays: 1095, minDays: 7 },
  { defaultDays: 365, description: "Security and admin audit events.", key: "auditLogs", maxDays: 2555, minDays: 30 },
  { defaultDays: 90, description: "Search query analytics and zero-result reports.", key: "queryAnalytics", maxDays: 365, minDays: 1 },
  { defaultDays: 90, description: "In-app notifications and read states.", key: "notifications", maxDays: 365, minDays: 1 },
  { defaultDays: 30, description: "Login sessions and stale session cleanup.", key: "sessions", maxDays: 365, minDays: 1 },
  { defaultDays: 90, description: "Webhook delivery logs, retry state, and redelivery diagnostics.", key: "webhookDeliveries", maxDays: 365, minDays: 7 },
] as const;

export const userDataLifecyclePlan = {
  exportScope: ["profile", "preferences", "authored articles", "comments", "suggestions", "watchlist", "notifications"],
  deletionModes: ["deactivate account", "anonymize contributions", "delete private preferences", "reassign owned workspaces"],
  adminChecklist: [
    "Confirm the requester's identity before export or deletion.",
    "Preview affected authored content and workspace ownership before deletion.",
    "Prefer anonymization for public contribution history when full deletion would damage shared knowledge.",
    "Record the export/deletion action in the audit trail.",
  ],
} as const;

export const privacyWarnings = [
  {
    id: "ai-external-provider",
    message: "AI features may send selected content, prompts, filenames, or search context to configured external providers.",
    surface: "ai-features",
  },
  {
    id: "webhook-external-receiver",
    message: "Webhook receivers are external systems; payloads should be scoped, signed, and reviewed for private workspace data.",
    surface: "webhooks",
  },
  {
    id: "export-download",
    message: "Exports can outlive Arkivel access controls once downloaded; review scope and storage location before sharing.",
    surface: "exports",
  },
  {
    id: "public-feed-indexing",
    message: "Feeds, sitemaps, and indexing can make published public content discoverable outside the instance.",
    surface: "feeds",
  },
] as const;

export const privacyControlsContract = {
  apiRoute: "/api/privacy/controls",
  docs: "docs/privacy-controls.md",
  retentionKeys: retentionSettings.map((setting) => setting.key),
  schemaVersion: PRIVACY_CONTROLS_SCHEMA_VERSION,
  surfaces: privacyControls.map((control) => control.surface),
  userDataLifecycle: userDataLifecyclePlan.exportScope,
  warnings: privacyWarnings.map((warning) => warning.id),
} as const;

export function getPrivacyControl(surface: PrivacySurface) {
  return privacyControls.find((control) => control.surface === surface) ?? null;
}

export function normalizeRetentionDays(key: string, value: number | null | undefined) {
  const setting = retentionSettings.find((item) => item.key === key);
  if (!setting) return null;
  if (!Number.isFinite(value)) return setting.defaultDays;
  return Math.min(setting.maxDays, Math.max(setting.minDays, Math.round(Number(value))));
}

export function getPrivacyWarningsForSurface(surface: PrivacySurface) {
  return privacyWarnings.filter((warning) => warning.surface === surface);
}
