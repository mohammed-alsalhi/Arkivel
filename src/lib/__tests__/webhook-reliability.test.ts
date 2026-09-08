import { describe, expect, it } from "vitest";
import {
  WEBHOOK_REPLAY_TOLERANCE_SECONDS,
  createWebhookBody,
  createWebhookSignature,
  isSupportedWebhookEvent,
  isWebhookTimestampFresh,
  shouldRetryWebhook,
  verifyWebhookSignature,
  webhookReliabilityContract,
} from "../webhook-reliability";

describe("webhook reliability", () => {
  it("signs and verifies timestamped payloads", () => {
    const timestamp = "2026-05-25T12:00:00.000Z";
    const body = createWebhookBody("article.updated", { slug: "example" }, timestamp);
    const signature = createWebhookSignature({ body, secret: "secret", timestamp });

    expect(signature).toMatch(/^sha256=/);
    expect(verifyWebhookSignature({
      body,
      secret: "secret",
      signature,
      timestamp,
      now: new Date("2026-05-25T12:00:10.000Z"),
    })).toBe(true);
  });

  it("rejects stale timestamps and decides retries", () => {
    expect(isWebhookTimestampFresh("2026-05-25T12:00:00.000Z", new Date("2026-05-25T12:10:01.000Z"))).toBe(false);
    expect(WEBHOOK_REPLAY_TOLERANCE_SECONDS).toBe(300);
    expect(shouldRetryWebhook(500, 1)).toBe(true);
    expect(shouldRetryWebhook(400, 1)).toBe(false);
    expect(shouldRetryWebhook(null, 1)).toBe(true);
  });

  it("publishes event schemas and reliability endpoints", () => {
    expect(isSupportedWebhookEvent("claim.reviewed")).toBe(true);
    expect(isSupportedWebhookEvent("unknown.event")).toBe(false);
    expect(webhookReliabilityContract.deliveryLogs.redeliveryEndpoint).toContain("redeliver");
    expect(webhookReliabilityContract.eventSchemas).toHaveProperty("customization");
  });
});
