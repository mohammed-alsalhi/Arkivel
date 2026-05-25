export const ASSISTANT_GOVERNANCE_SCHEMA_VERSION = "2026-05-25.v4.92.2";

export const aiAuditActions = [
  "ai.generate_content",
  "ai.rewrite",
  "ai.summarize",
  "ai.taxonomy_change",
] as const;

export type AiAuditAction = (typeof aiAuditActions)[number];

export const assistantGovernanceContract = {
  apiRoute: "/api/assistant-packs/governance",
  docs: "docs/assistant-governance.md",
  releaseGate: "AI must be optional, disabled by default for provider-backed packs, and non-blocking for core wiki workflows.",
  schemaVersion: ASSISTANT_GOVERNANCE_SCHEMA_VERSION,
} as const;

export const aiPrivacyWarnings = [
  "Provider-backed assistants may send selected article, search, import, or review context outside the instance.",
  "Private spaces and sensitive articles should opt out unless an admin explicitly enables the pack.",
  "Prompt previews must show context sources, redactions, provider, model, retention, and estimated cost.",
  "Never include secrets, API keys, private user profile fields, or unrelated workspace content in prompts.",
] as const;

export const aiOutputRequirements = {
  humanReviewRequiredFor: ["generated content", "rewrites", "summaries", "taxonomy changes", "claim extraction"],
  citationPromptsFor: ["ask-wiki answers", "summaries", "claim extraction", "review notes"],
  confidenceMetadataFor: ["claim extraction", "taxonomy suggestions", "review notes", "search answers"],
} as const;

export const aiOptOutControls = {
  privateSpacesDefault: "opt-out",
  sensitiveArticleFlag: "assistantDisabled",
  spacePolicyField: "assistantAvailability",
  userVisibleCopy: "AI assistants are disabled for this space or article.",
} as const;

export function createAssistantGovernanceReport() {
  return {
    auditActions: aiAuditActions,
    contract: assistantGovernanceContract,
    outputRequirements: aiOutputRequirements,
    optOutControls: aiOptOutControls,
    privacyWarnings: aiPrivacyWarnings,
    releaseGate: {
      required: true,
      checks: ["provider packs disabled by default", "core editing works without AI", "fallback copy exists", "private opt-out exists"],
      status: "required-before-v5",
    },
  };
}

export function requiresHumanReview(outputType: string) {
  return (aiOutputRequirements.humanReviewRequiredFor as readonly string[]).includes(outputType);
}

export function shouldDisableAssistantForScope(input: { privateSpace?: boolean; sensitiveArticle?: boolean; explicitEnabled?: boolean }) {
  if (input.explicitEnabled) return false;
  return input.privateSpace === true || input.sensitiveArticle === true;
}
