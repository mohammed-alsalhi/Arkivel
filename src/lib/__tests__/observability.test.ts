import { describe, expect, it } from "vitest";
import {
  createObservabilityMetric,
  createStructuredLogEvent,
  isObservabilityMetricType,
  normalizeAnalyticsPrivacyControls,
  observabilityContract,
} from "../observability";

describe("observability", () => {
  it("publishes structured log categories and metric types", () => {
    expect(observabilityContract.structuredLogCategories).toContain("prisma");
    expect(observabilityContract.structuredLogCategories).toContain("webhooks");
    expect(observabilityContract.metricTypes).toContain("editor_autosave");
    expect(isObservabilityMetricType("webhook_delivery")).toBe(true);
  });

  it("redacts sensitive structured log metadata", () => {
    const event = createStructuredLogEvent({
      category: "auth",
      message: "login check",
      metadata: { token: "secret", nested: { apiKey: "key", ok: true } },
      timestamp: "2026-05-25T12:00:00.000Z",
    });

    expect(event.metadata.token).toBe("[redacted]");
    expect(event.metadata.nested).toEqual({ apiKey: "[redacted]", ok: true });
  });

  it("normalizes metrics and privacy controls", () => {
    const metric = createObservabilityMetric({
      duration: 12.6,
      metadata: { authorization: "secret" },
      path: "/api/search",
      type: "search_response_time",
    });
    const controls = normalizeAnalyticsPrivacyControls({ retentionDays: 999 });

    expect(metric.duration).toBe(13);
    expect(metric.metadata.authorization).toBe("[redacted]");
    expect(controls.retentionDays).toBe(365);
  });
});
