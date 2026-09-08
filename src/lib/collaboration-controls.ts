export const COLLABORATION_CONTROLS_SCHEMA_VERSION = "arkivel.collaboration-controls.v1";

export const COLLABORATION_SURFACES = [
  "co-authors",
  "edit-locks",
  "review-assignments",
  "comments",
  "mentions",
  "notifications",
  "activity-digest",
  "contribution-summary",
] as const;

export type CollaborationSurface = (typeof COLLABORATION_SURFACES)[number];
export type CollaborationPermission = "none" | "read" | "comment" | "write" | "admin";
export type CollaborationRole = "admin" | "editor" | "viewer" | "public-reader";

export type CollaborationPolicy = Record<CollaborationSurface, Record<CollaborationRole, CollaborationPermission>>;

export const collaborationPolicy: CollaborationPolicy = {
  "co-authors": { admin: "admin", editor: "read", viewer: "read", "public-reader": "read" },
  "edit-locks": { admin: "admin", editor: "write", viewer: "none", "public-reader": "none" },
  "review-assignments": { admin: "admin", editor: "write", viewer: "none", "public-reader": "none" },
  comments: { admin: "admin", editor: "write", viewer: "comment", "public-reader": "comment" },
  mentions: { admin: "admin", editor: "write", viewer: "comment", "public-reader": "none" },
  notifications: { admin: "admin", editor: "read", viewer: "read", "public-reader": "none" },
  "activity-digest": { admin: "admin", editor: "read", viewer: "read", "public-reader": "none" },
  "contribution-summary": { admin: "admin", editor: "read", viewer: "read", "public-reader": "none" },
};

export const notificationRoutingRules = [
  "Review requests route to the assigned reviewer; unassigned workspace reviews route to active workspace admins/editors.",
  "Mentions route only to active workspace members who allow mention notifications.",
  "Article edit notifications route to watchers in the same workspace, excluding the editor.",
  "Public readers never receive in-app notifications.",
];

export const workspaceActivityDigestContract = {
  cadence: ["daily", "weekly"],
  groups: ["edits", "reviews", "comments", "mentions", "new-members", "exports"],
  filters: ["workspaceId", "userId", "role", "since", "until"],
  privacy: "Private workspace digests are member-only; public digests include published content only.",
};

export const contributionSummaryContract = {
  metrics: ["articlesCreated", "articlesEdited", "reviewsCompleted", "commentsAdded", "mentionsReceived"],
  scope: ["workspace", "user", "date-range"],
  privacy: "Viewer summaries expose aggregate counts only; admin summaries may include article titles and review links.",
};

export const collaborationControlsContract = {
  schemaVersion: COLLABORATION_CONTROLS_SCHEMA_VERSION,
  surfaces: COLLABORATION_SURFACES,
  policy: collaborationPolicy,
  notificationRoutingRules,
  workspaceActivityDigest: workspaceActivityDigestContract,
  contributionSummary: contributionSummaryContract,
  visibilityChecks: {
    publicSurfaces: ["feed.xml", "feed/atom", "sitemap.xml", "api/sitemap"],
    rule: "Only unscoped legacy articles and articles in public workspaces can appear in anonymous feeds or sitemaps.",
    apiV1: "API-key callers can read unscoped articles plus public, owned, or actively-membered workspaces.",
  },
};

export function canUseCollaborationSurface(
  role: CollaborationRole,
  surface: CollaborationSurface,
  required: CollaborationPermission
): boolean {
  return level(collaborationPolicy[surface][role]) >= level(required);
}

export function shouldRouteMentionNotification(input: {
  authorId?: string | null;
  mentionedUserId: string;
  mentionedUserIsWorkspaceMember: boolean;
  notifyOnMention?: boolean;
}): boolean {
  if (input.authorId && input.authorId === input.mentionedUserId) return false;
  return input.mentionedUserIsWorkspaceMember && input.notifyOnMention !== false;
}

function level(permission: CollaborationPermission): number {
  return { none: 0, read: 1, comment: 2, write: 3, admin: 4 }[permission];
}

