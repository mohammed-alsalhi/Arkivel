export const REVIEW_STATUSES = [
  "pending",
  "in_review",
  "approved",
  "changes_requested",
  "rejected",
] as const;

export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export const ACTIVE_REVIEW_STATUSES: ReviewStatus[] = [
  "pending",
  "in_review",
  "changes_requested",
];

export function isReviewStatus(value: unknown): value is ReviewStatus {
  return typeof value === "string" && REVIEW_STATUSES.includes(value as ReviewStatus);
}

export function isReviewerRole(role: string | null | undefined) {
  return role === "admin" || role === "editor";
}

export function reviewStatusLabel(status: string) {
  switch (status) {
    case "pending":
      return "Pending";
    case "in_review":
      return "In Review";
    case "approved":
      return "Approved";
    case "changes_requested":
      return "Changes Requested";
    case "rejected":
      return "Rejected";
    default:
      return status;
  }
}

export function userDisplayName(user: {
  username: string;
  displayName?: string | null;
}) {
  return user.displayName || user.username;
}
