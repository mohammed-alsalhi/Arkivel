import { describe, expect, it } from "vitest";
import {
  AUDIT_SCHEMA_VERSION,
  auditTrailContract,
  createAuditExport,
  defaultAuditSeverity,
  redactAuditMetadata,
  shouldAlertOnAuditEvent,
} from "../audit";

describe("audit trail", () => {
  it("publishes the audit trail contract for filters, redaction, alerts, and retention", () => {
    expect(auditTrailContract.schemaVersion).toBe(AUDIT_SCHEMA_VERSION);
    expect(auditTrailContract.filters).toEqual(expect.arrayContaining(["actor", "action", "target", "workspace", "severity", "date", "success"]));
    expect(auditTrailContract.redaction.exportModes).toEqual(expect.arrayContaining(["summary", "standard", "strict"]));
    expect(auditTrailContract.retention.standardDays).toBeGreaterThan(0);
  });

  it("assigns stronger severities to sensitive actions", () => {
    expect(defaultAuditSeverity("permission.grant")).toBe("critical");
    expect(defaultAuditSeverity("admin.sensitive_action")).toBe("high");
    expect(defaultAuditSeverity("article.delete")).toBe("warning");
  });

  it("redacts nested sensitive metadata", () => {
    expect(redactAuditMetadata({
      title: "Export",
      actorEmail: "admin@example.com",
      nested: { apiKey: "secret-key", kept: "visible" },
    })).toEqual({
      title: "Export",
      actorEmail: "[redacted]",
      nested: { apiKey: "[redacted]", kept: "visible" },
    });
  });

  it("formats privacy-preserving audit exports", () => {
    const exported = createAuditExport([
      {
        id: "log_1",
        userId: "user_1",
        username: "admin",
        ipAddress: "127.0.0.1",
        userAgent: "test-agent",
        metadata: { token: "secret", note: "keep" },
      },
    ], { redaction: "strict", exportedAt: "2026-05-25T00:00:00.000Z" });

    expect(exported).toMatchObject({
      schemaVersion: AUDIT_SCHEMA_VERSION,
      exportedAt: "2026-05-25T00:00:00.000Z",
      redaction: "strict",
      count: 1,
    });
    expect(exported.logs[0]).toMatchObject({
      userId: "[redacted]",
      username: "[redacted]",
      ipAddress: "[redacted]",
      userAgent: "[redacted]",
      metadata: { token: "[redacted]", note: "[redacted]" },
    });
  });

  it("flags suspicious and failed admin events for alert hooks", () => {
    expect(shouldAlertOnAuditEvent({ action: "admin.failed_operation", success: false, severity: "warning" })).toBe(true);
    expect(shouldAlertOnAuditEvent({ action: "security.suspicious_activity", success: true, severity: "critical" })).toBe(true);
    expect(shouldAlertOnAuditEvent({ action: "article.create", success: true, severity: "info" })).toBe(false);
  });
});
