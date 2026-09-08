import { createHmac, timingSafeEqual } from "crypto";

export const WEBHOOK_RELIABILITY_SCHEMA_VERSION = "2026-05-25.v4.86.2";
export const WEBHOOK_SIGNATURE_HEADER = "X-Arkivel-Signature";
export const WEBHOOK_TIMESTAMP_HEADER = "X-Arkivel-Timestamp";
export const WEBHOOK_DELIVERY_HEADER = "X-Arkivel-Delivery";
export const WEBHOOK_REPLAY_TOLERANCE_SECONDS = 300;
export const WEBHOOK_RETRY_DELAYS_MS = [0, 2_000, 10_000] as const;

export const webhookEventSchemas = {
  article: ["article.created", "article.updated", "article.deleted", "article.published"],
  category: ["category.created", "category.updated", "category.deleted"],
  review: ["review.requested", "review.assigned", "review.completed", "review.reopened"],
  claim: ["claim.reviewed", "claim.expired", "claim.disputed"],
  export: ["export.started", "export.completed", "export.failed"],
  import: ["import.rehearsed", "import.completed", "import.failed"],
  plugin: ["plugin.enabled", "plugin.disabled", "plugin.failed"],
  customization: ["customization.updated", "theme-pack.previewed"],
  user: ["user.invited", "user.joined", "user.role_changed"],
} as const;

export type WebhookEventFamily = keyof typeof webhookEventSchemas;
export type WebhookReliabilityStatus = "success" | "failed" | "retrying" | "skipped";

export const webhookReliabilityContract = {
  schemaVersion: WEBHOOK_RELIABILITY_SCHEMA_VERSION,
  signing: {
    algorithm: "HMAC-SHA256",
    signatureHeader: WEBHOOK_SIGNATURE_HEADER,
    timestampHeader: WEBHOOK_TIMESTAMP_HEADER,
    deliveryHeader: WEBHOOK_DELIVERY_HEADER,
    signedPayload: "timestamp + '.' + rawBody",
  },
  retries: {
    delaysMs: WEBHOOK_RETRY_DELAYS_MS,
    maxAttempts: WEBHOOK_RETRY_DELAYS_MS.length,
    retryStatuses: [408, 425, 429, 500, 502, 503, 504],
  },
  deliveryLogs: {
    statuses: ["success", "failed", "retrying", "skipped"],
    redeliveryEndpoint: "/api/webhooks/deliveries/:id/redeliver",
    testEndpoint: "/api/webhooks/test",
  },
  replayProtection: {
    toleranceSeconds: WEBHOOK_REPLAY_TOLERANCE_SECONDS,
    requiredHeaders: [WEBHOOK_SIGNATURE_HEADER, WEBHOOK_TIMESTAMP_HEADER, WEBHOOK_DELIVERY_HEADER],
  },
  eventSchemas: webhookEventSchemas,
  failureAlerts: {
    afterConsecutiveFailures: 3,
    alertSeverity: "warning",
    adminSurface: "/admin/webhooks",
  },
};

export function createWebhookBody(event: string, payload: Record<string, unknown>, timestamp = new Date().toISOString()) {
  return JSON.stringify({ event, payload, timestamp });
}

export function createWebhookSignature(input: {
  body: string;
  secret: string;
  timestamp: string;
}) {
  return `sha256=${createHmac("sha256", input.secret).update(`${input.timestamp}.${input.body}`).digest("hex")}`;
}

export function verifyWebhookSignature(input: {
  body: string;
  secret: string;
  signature: string;
  timestamp: string;
  now?: Date;
}) {
  if (!isWebhookTimestampFresh(input.timestamp, input.now)) return false;
  const expected = createWebhookSignature(input);
  const left = Buffer.from(expected);
  const right = Buffer.from(input.signature);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function isWebhookTimestampFresh(timestamp: string, now = new Date()) {
  const time = new Date(timestamp).getTime();
  if (Number.isNaN(time)) return false;
  return Math.abs(now.getTime() - time) <= WEBHOOK_REPLAY_TOLERANCE_SECONDS * 1000;
}

export function shouldRetryWebhook(statusCode: number | null, attempt: number) {
  if (attempt >= WEBHOOK_RETRY_DELAYS_MS.length) return false;
  if (statusCode === null) return true;
  return webhookReliabilityContract.retries.retryStatuses.includes(statusCode);
}

export function isSupportedWebhookEvent(event: string) {
  return Object.values(webhookEventSchemas).some((events) => (events as readonly string[]).includes(event));
}
