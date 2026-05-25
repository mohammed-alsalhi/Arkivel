export const ASSISTANT_PACK_SCHEMA_VERSION = "arkivel.assistant-pack.v1";

export type AssistantPack = {
  contextSources: string[];
  cost: "none" | "low" | "variable";
  dataRetention: string;
  enabledByDefault: boolean;
  id: string;
  label?: string;
  limits: Record<string, string | number>;
  model: string;
  outputTypes: string[];
  permissions: string[];
  privacy: "local-only" | "provider-processed" | "external-api";
  promptScope: string;
  prompts: string[];
  provider: "none" | "openai" | "anthropic" | "deepl" | "google" | "browser";
  safetyNotes: string[];
  tools: string[];
};

export type AssistantSpaceAvailability = {
  allowedPackIds: string[];
  dataAccess: "none" | "selected-content" | "published-space" | "workspace-private";
  defaultEnabled: boolean;
  sensitiveArticleOptOut: boolean;
  spaceType: "personal" | "team" | "public-docs" | "research" | "worldbuilding";
};

export type AssistantUsageLogRule = {
  costEstimate: string;
  event: string;
  fields: string[];
  retention: string;
};

export const assistantPackContract = {
  adminRoute: "/admin/assistants",
  apiRoute: "/api/assistant-packs",
  docs: "docs/assistant-packs.md",
  gracefulDegradation: "AI features remain disabled or use heuristic/browser-local fallbacks when providers are not configured.",
  previewFields: ["packId", "prompt", "contextSources", "redactions", "estimatedCost"],
  requiredFields: [
    "id",
    "provider",
    "model",
    "privacy",
    "cost",
    "dataRetention",
    "promptScope",
    "permissions",
    "tools",
    "prompts",
    "contextSources",
    "outputTypes",
    "limits",
    "safetyNotes",
  ],
  schemaVersion: ASSISTANT_PACK_SCHEMA_VERSION,
} as const;

export const disabledAssistantPack: AssistantPack = {
  id: "ai-disabled",
  label: "AI Disabled",
  contextSources: [],
  cost: "none",
  dataRetention: "No prompt data leaves the instance.",
  enabledByDefault: true,
  limits: { maxPromptCharacters: 0, maxRequestsPerMinute: 0 },
  model: "none",
  outputTypes: ["heuristic-status"],
  permissions: [],
  privacy: "local-only",
  promptScope: "No AI prompts are sent.",
  prompts: [],
  provider: "none",
  safetyNotes: ["Use this pack for offline-friendly and privacy-first deployments."],
  tools: [],
};

export const builtInAssistantPacks: AssistantPack[] = [
  {
    id: "drafting-assistant",
    label: "Drafting Assistant",
    contextSources: ["selected text", "current article outline", "template fields"],
    cost: "variable",
    dataRetention: "Provider processed; retain only usage metadata locally.",
    enabledByDefault: false,
    limits: { maxPromptCharacters: 10000, maxRequestsPerMinute: 12 },
    model: "env-configured",
    outputTypes: ["draft", "rewrite", "outline"],
    permissions: ["article:read", "article:suggest"],
    privacy: "provider-processed",
    promptScope: "Selected editor content and explicit article outline only.",
    prompts: ["rewrite", "expand-section", "generate-from-outline"],
    provider: "openai",
    safetyNotes: ["Generated drafts require human review before publishing."],
    tools: ["editor-actions", "article-context"],
  },
  {
    id: "summarization-assistant",
    label: "Summarization Assistant",
    contextSources: ["current article", "revision diff", "category article list"],
    cost: "variable",
    dataRetention: "Provider processed; store summary usage events without prompt bodies.",
    enabledByDefault: false,
    limits: { maxContextArticles: 12, maxPromptCharacters: 14000, maxRequestsPerMinute: 20 },
    model: "env-configured",
    outputTypes: ["summary", "revision-summary", "category-overview"],
    permissions: ["article:read", "revision:read", "article:suggest"],
    privacy: "provider-processed",
    promptScope: "Current article, selected revisions, or explicit category scope.",
    prompts: ["summarize-article", "summarize-revision", "synthesize-category"],
    provider: "openai",
    safetyNotes: ["Summaries must preserve source links and should not replace source review."],
    tools: ["article-context", "revision-context", "category-context"],
  },
  {
    id: "search-assistant",
    label: "Search Assistant",
    contextSources: ["search query", "top search results", "public article excerpts"],
    cost: "low",
    dataRetention: "Provider processed; local query analytics follow privacy controls.",
    enabledByDefault: false,
    limits: { maxContextArticles: 8, maxPromptCharacters: 9000, maxRequestsPerMinute: 30 },
    model: "env-configured",
    outputTypes: ["answer", "source-list", "search-explanation"],
    permissions: ["search:read", "article:read"],
    privacy: "provider-processed",
    promptScope: "Search query and selected retrieved excerpts.",
    prompts: ["ask-wiki", "semantic-answer", "explain-results"],
    provider: "openai",
    safetyNotes: ["Answers must cite retrieved sources and say when the wiki lacks an answer."],
    tools: ["semantic-search", "article-context"],
  },
  {
    id: "claim-extraction-assistant",
    label: "Claim Extraction Assistant",
    contextSources: ["current article", "selected text"],
    cost: "variable",
    dataRetention: "Provider processed; extracted claim metadata may be stored after admin confirmation.",
    enabledByDefault: false,
    limits: { maxClaimsPerRun: 12, maxPromptCharacters: 10000, maxRequestsPerMinute: 10 },
    model: "env-configured",
    outputTypes: ["claims", "confidence", "review-queue"],
    permissions: ["article:read", "claim:suggest"],
    privacy: "provider-processed",
    promptScope: "Selected article content for factual claim extraction only.",
    prompts: ["extract-claims", "rate-confidence"],
    provider: "openai",
    safetyNotes: ["Claim extraction creates suggestions only; reviewers approve factual status."],
    tools: ["article-context", "claim-review"],
  },
  {
    id: "taxonomy-assistant",
    label: "Taxonomy Assistant",
    contextSources: ["article title", "article excerpt", "existing categories", "existing tags"],
    cost: "low",
    dataRetention: "Provider processed; accepted tag/category changes are audited.",
    enabledByDefault: false,
    limits: { maxSuggestions: 10, maxPromptCharacters: 7000, maxRequestsPerMinute: 20 },
    model: "env-configured",
    outputTypes: ["tags", "category", "taxonomy-gaps"],
    permissions: ["article:read", "tag:suggest", "category:suggest"],
    privacy: "provider-processed",
    promptScope: "Article metadata plus existing taxonomy vocabulary.",
    prompts: ["suggest-tags", "suggest-category", "find-taxonomy-gaps"],
    provider: "openai",
    safetyNotes: ["Taxonomy changes should be previewed and audited before applying."],
    tools: ["taxonomy-context", "article-context"],
  },
  {
    id: "alt-text-assistant",
    label: "Alt Text Assistant",
    contextSources: ["image filename", "caption field", "surrounding article text"],
    cost: "low",
    dataRetention: "Prefer local filename heuristics; provider processing depends on configured image/text model.",
    enabledByDefault: false,
    limits: { maxPromptCharacters: 3000, maxRequestsPerMinute: 30 },
    model: "env-configured",
    outputTypes: ["alt-text", "caption-suggestion"],
    permissions: ["asset:read", "article:read", "metadata:suggest"],
    privacy: "provider-processed",
    promptScope: "Image metadata and nearby article context only.",
    prompts: ["suggest-alt-text", "caption-image"],
    provider: "openai",
    safetyNotes: ["Alt text suggestions need human review for accuracy and accessibility."],
    tools: ["asset-context", "article-context"],
  },
  {
    id: "import-cleanup-assistant",
    label: "Import Cleanup Assistant",
    contextSources: ["import rehearsal report", "article excerpt", "formatting warnings"],
    cost: "variable",
    dataRetention: "Provider processed; import cleanup suggestions are stored only in dry-run reports.",
    enabledByDefault: false,
    limits: { maxImportItems: 25, maxPromptCharacters: 16000, maxRequestsPerMinute: 8 },
    model: "env-configured",
    outputTypes: ["cleanup-suggestions", "mapping-suggestions", "format-fixes"],
    permissions: ["import:read", "article:suggest", "metadata:suggest"],
    privacy: "provider-processed",
    promptScope: "Dry-run import report and selected imported excerpts.",
    prompts: ["clean-import-html", "map-import-categories", "repair-formatting"],
    provider: "openai",
    safetyNotes: ["Import cleanup remains preview-only until an admin applies changes."],
    tools: ["import-rehearsal", "article-context"],
  },
  {
    id: "review-assistant",
    label: "Review Assistant",
    contextSources: ["current article", "review checklist", "claims", "discussion summary"],
    cost: "variable",
    dataRetention: "Provider processed; review recommendations are logged without full prompt bodies.",
    enabledByDefault: false,
    limits: { maxPromptCharacters: 12000, maxRequestsPerMinute: 12 },
    model: "env-configured",
    outputTypes: ["review-notes", "risk-flags", "next-actions"],
    permissions: ["article:read", "review:suggest", "claim:read"],
    privacy: "provider-processed",
    promptScope: "Article review context selected by reviewer.",
    prompts: ["review-article", "flag-risks", "suggest-next-actions"],
    provider: "openai",
    safetyNotes: ["Review assistant recommendations cannot approve content automatically."],
    tools: ["article-context", "review-queue", "claim-review"],
  },
];

export const assistantPackDefaults: AssistantPack[] = [
  disabledAssistantPack,
  ...builtInAssistantPacks,
];

export const assistantSpaceAvailability: AssistantSpaceAvailability[] = [
  { allowedPackIds: ["drafting-assistant", "summarization-assistant", "taxonomy-assistant"], dataAccess: "selected-content", defaultEnabled: false, sensitiveArticleOptOut: true, spaceType: "personal" },
  { allowedPackIds: ["summarization-assistant", "taxonomy-assistant", "review-assistant"], dataAccess: "workspace-private", defaultEnabled: false, sensitiveArticleOptOut: true, spaceType: "team" },
  { allowedPackIds: ["search-assistant", "summarization-assistant", "alt-text-assistant"], dataAccess: "published-space", defaultEnabled: false, sensitiveArticleOptOut: true, spaceType: "public-docs" },
  { allowedPackIds: ["summarization-assistant", "claim-extraction-assistant", "taxonomy-assistant", "review-assistant"], dataAccess: "selected-content", defaultEnabled: false, sensitiveArticleOptOut: true, spaceType: "research" },
  { allowedPackIds: ["drafting-assistant", "summarization-assistant", "taxonomy-assistant"], dataAccess: "selected-content", defaultEnabled: false, sensitiveArticleOptOut: true, spaceType: "worldbuilding" },
];

export const assistantUsageLogRules: AssistantUsageLogRule[] = [
  {
    costEstimate: "pack.cost plus provider token estimate when available",
    event: "assistant.preview",
    fields: ["packId", "spaceType", "contextSourceCount", "estimatedPromptCharacters", "estimatedCost"],
    retention: "activity retention window",
  },
  {
    costEstimate: "provider token estimate",
    event: "assistant.run",
    fields: ["packId", "spaceType", "status", "durationMs", "estimatedCost", "permissionScope"],
    retention: "audit retention window without prompt body",
  },
];

export function createAssistantPackReport(packs: AssistantPack[] = assistantPackDefaults) {
  return {
    contract: assistantPackContract,
    degradation: {
      providerConfigured: false,
      fallbackMode: "heuristic-or-disabled",
      message: assistantPackContract.gracefulDegradation,
    },
    packs,
    perSpaceAvailability: assistantSpaceAvailability,
    promptPreviews: packs.map(createAssistantPromptPreview),
    usageLogging: assistantUsageLogRules,
    privacyFirstRecommendations: [
      "Keep ai-disabled active for local/offline deployments.",
      "Enable provider-processed packs per space only after reviewing data retention.",
      "Avoid sending private drafts, secrets, or user profile data to external providers.",
    ],
  };
}

export function createAssistantPromptPreview(pack: AssistantPack) {
  return {
    packId: pack.id,
    contextSources: pack.contextSources,
    estimatedCost: pack.cost,
    prompt: pack.prompts[0] ? `Preview ${pack.prompts[0]} with ${pack.promptScope}` : "No prompt is sent.",
    redactions: pack.privacy === "local-only" ? [] : ["secrets", "private user profile fields", "unselected articles"],
  };
}

export function canAssistantAccessSpace(packId: string, spaceType: AssistantSpaceAvailability["spaceType"]) {
  const availability = assistantSpaceAvailability.find((item) => item.spaceType === spaceType);
  return availability?.allowedPackIds.includes(packId) ?? false;
}

export function validateAssistantPack(pack: AssistantPack) {
  const missing = assistantPackContract.requiredFields.filter((field) => !(field in pack));
  const warnings: string[] = [];
  if (pack.provider !== "none" && pack.permissions.length === 0) warnings.push(`${pack.id} should declare permissions`);
  if (pack.privacy !== "local-only" && pack.dataRetention.toLowerCase().includes("unknown")) {
    warnings.push(`${pack.id} must clarify provider retention`);
  }

  return { missing, valid: missing.length === 0, warnings };
}
