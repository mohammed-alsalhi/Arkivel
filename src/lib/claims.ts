export const CLAIM_LEVELS = ["certain", "probable", "disputed"] as const;
export type ClaimLevel = (typeof CLAIM_LEVELS)[number];

export const CLAIM_REVIEW_STATUSES = [
  "unreviewed",
  "approved",
  "needs_source",
  "disputed",
  "rejected",
] as const;
export type ClaimReviewStatus = (typeof CLAIM_REVIEW_STATUSES)[number];

export type ExtractedClaim = {
  text: string;
  level: ClaimLevel;
  hash: string;
};

export const CLAIM_REVIEW_STATUS_LABELS: Record<ClaimReviewStatus, string> = {
  unreviewed: "Unreviewed",
  approved: "Approved",
  needs_source: "Needs source",
  disputed: "Disputed",
  rejected: "Rejected",
};

export function isClaimReviewStatus(value: unknown): value is ClaimReviewStatus {
  return (
    typeof value === "string" &&
    CLAIM_REVIEW_STATUSES.includes(value as ClaimReviewStatus)
  );
}

function decodeEntities(value: string): string {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

export function normalizeClaimText(text: string): string {
  return decodeEntities(text.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

export function getClaimHash(level: ClaimLevel, text: string): string {
  const input = `${level}:${normalizeClaimText(text).toLowerCase()}`;
  let hash = 0x811c9dc5;

  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }

  return (hash >>> 0).toString(36);
}

export function extractClaims(html: string): ExtractedClaim[] {
  const regex =
    /<span[^>]*data-claim="(certain|probable|disputed)"[^>]*>([\s\S]*?)<\/span>/g;
  const claims: ExtractedClaim[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(html)) !== null) {
    const level = match[1] as ClaimLevel;
    const text = normalizeClaimText(match[2]);

    if (text) {
      claims.push({
        text,
        level,
        hash: getClaimHash(level, text),
      });
    }
  }

  return claims;
}
