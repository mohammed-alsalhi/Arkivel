import { describe, expect, it } from "vitest";
import {
  applyAcknowledgements,
  buildOperationsAlert,
  createDiagnosticBundle,
  createOperationsDashboardReport,
  operationsDashboardContract,
  summarizeOperationsStatus,
} from "../operations-dashboard";

describe("operations dashboard", () => {
  it("summarizes service status conservatively", () => {
    expect(summarizeOperationsStatus(["healthy", "degraded"])).toBe("degraded");
    expect(summarizeOperationsStatus(["healthy", "critical"])).toBe("critical");
    expect(summarizeOperationsStatus(["healthy"])).toBe("healthy");
  });

  it("builds acknowledgeable alerts only when thresholds are met", () => {
    expect(buildOperationsAlert({
      count: 0,
      generatedAt: "2026-05-25T12:00:00.000Z",
      id: "webhook-failures",
      message: "No failures",
      source: "webhooks",
      title: "Webhook failures",
    })).toBeNull();

    const alert = buildOperationsAlert({
      count: 2,
      generatedAt: "2026-05-25T12:00:00.000Z",
      id: "webhook-failures",
      message: "2 failed deliveries need attention.",
      severity: "critical",
      source: "webhooks",
      title: "Webhook failures",
    });

    expect(alert?.acknowledgeKey).toContain("webhook-failures");
    expect(alert?.severity).toBe("critical");
    expect(applyAcknowledgements(alert ? [alert] : [], [alert?.acknowledgeKey ?? ""])[0]?.status).toBe("acknowledged");
  });

  it("publishes a redacted support bundle contract", () => {
    const bundle = createDiagnosticBundle("2026-05-25T12:00:00.000Z");

    expect(bundle.redactions).toContain("webhook secrets");
    expect(bundle.redactions).toContain("full article content");
    expect(bundle.sections.find((section) => section.id === "plugins")?.included).toBe(true);
  });

  it("creates a versioned report contract for customization exposure", () => {
    const report = createOperationsDashboardReport({
      generatedAt: "2026-05-25T12:00:00.000Z",
      metrics: [],
      queues: [],
      services: [],
      slowPages: [],
    });

    expect(report.schemaVersion).toBe(operationsDashboardContract.schemaVersion);
    expect(operationsDashboardContract.adminRoute).toBe("/admin/operations");
    expect(operationsDashboardContract.serviceCards).toContain("database");
  });
});
