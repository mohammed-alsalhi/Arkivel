export const MODERATION_SCHEMA_VERSION = "arkivel.moderation.v1";

export const DISCUSSION_MODERATION_STATUSES = ["visible", "hidden", "reported", "removed"] as const;
export const DISCUSSION_VISIBILITIES = ["public", "reviewers"] as const;
export const SUGGESTION_QUEUE_STATUSES = ["pending", "accepted", "rejected", "commented", "assigned", "converted"] as const;
export const SUGGESTION_REVIEW_ACTIONS = ["accept", "reject", "comment", "assign", "convert-to-task"] as const;

export type DiscussionModerationStatus = (typeof DISCUSSION_MODERATION_STATUSES)[number];
export type DiscussionVisibility = (typeof DISCUSSION_VISIBILITIES)[number];
export type SuggestionQueueStatus = (typeof SUGGESTION_QUEUE_STATUSES)[number];
export type SuggestionReviewAction = (typeof SUGGESTION_REVIEW_ACTIONS)[number];

export const moderationContract = {
  schemaVersion: MODERATION_SCHEMA_VERSION,
  discussion: {
    statuses: DISCUSSION_MODERATION_STATUSES,
    visibilities: DISCUSSION_VISIBILITIES,
    reviewerOnlyNotes: true,
    reportFields: ["reportCount", "reportReason", "reportedAt", "moderationReason", "moderatedAt", "moderatedById"],
  },
  suggestions: {
    statuses: SUGGESTION_QUEUE_STATUSES,
    actions: SUGGESTION_REVIEW_ACTIONS,
    fields: ["assigneeId", "reviewerComment", "convertedTaskUrl", "sourceType", "spamScore", "moderationState", "ipAddress"],
  },
  publicContributionPlanning: {
    antiSpamSignals: ["duplicate text", "excessive links", "very short body", "blocked keywords", "rapid repeat submissions"],
    defaultRateLimit: { anonymousPerHour: 5, authenticatedPerHour: 20 },
    states: ["open", "needs_review", "blocked"],
  },
};

export function normalizeDiscussionStatus(value: unknown): DiscussionModerationStatus | null {
  return DISCUSSION_MODERATION_STATUSES.includes(value as DiscussionModerationStatus)
    ? (value as DiscussionModerationStatus)
    : null;
}

export function normalizeDiscussionVisibility(value: unknown): DiscussionVisibility | null {
  return DISCUSSION_VISIBILITIES.includes(value as DiscussionVisibility)
    ? (value as DiscussionVisibility)
    : null;
}

export function normalizeSuggestionStatus(value: unknown): SuggestionQueueStatus | null {
  return SUGGESTION_QUEUE_STATUSES.includes(value as SuggestionQueueStatus)
    ? (value as SuggestionQueueStatus)
    : null;
}

export function estimateContributionSpamScore(input: { author?: string | null; email?: string | null; content: string }) {
  const content = input.content.trim();
  let score = 0;
  if (content.length < 12) score += 25;
  if ((content.match(/https?:\/\//g) ?? []).length >= 3) score += 35;
  if (/(casino|crypto giveaway|buy now|free money)/i.test(content)) score += 35;
  if (!input.author || input.author.trim().toLowerCase() === "anonymous") score += 5;
  if (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) score += 20;
  return Math.min(score, 100);
}

export function moderationStateForSpamScore(score: number) {
  if (score >= 70) return "blocked";
  if (score >= 35) return "needs_review";
  return "open";
}
