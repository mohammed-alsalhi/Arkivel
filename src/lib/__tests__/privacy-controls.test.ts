import { describe, expect, it } from "vitest";
import {
  getPrivacyControl,
  getPrivacyWarningsForSurface,
  normalizeRetentionDays,
  privacyControls,
  privacyControlsContract,
  retentionSettings,
  userDataLifecyclePlan,
} from "../privacy-controls";

describe("privacy controls", () => {
  it("publishes controls for all v4.89.1 privacy surfaces", () => {
    expect(privacyControls.map((control) => control.surface)).toEqual(
      expect.arrayContaining(["spaces", "indexing", "feeds", "exports", "analytics", "ai-features", "webhooks", "user-profiles"]),
    );
    expect(privacyControlsContract.apiRoute).toBe("/api/privacy/controls");
    expect(getPrivacyControl("ai-features")?.defaultMode).toBe("opt-in");
  });

  it("defines retention settings for operational data", () => {
    expect(retentionSettings.map((setting) => setting.key)).toEqual(
      expect.arrayContaining(["activity", "auditLogs", "queryAnalytics", "notifications", "sessions", "webhookDeliveries"]),
    );
    expect(normalizeRetentionDays("queryAnalytics", 999)).toBe(365);
    expect(normalizeRetentionDays("sessions", 0)).toBe(1);
    expect(normalizeRetentionDays("missing", 10)).toBeNull();
  });

  it("plans user data export and deletion workflows", () => {
    expect(userDataLifecyclePlan.exportScope).toEqual(expect.arrayContaining(["profile", "preferences", "authored articles"]));
    expect(userDataLifecyclePlan.deletionModes).toContain("anonymize contributions");
    expect(userDataLifecyclePlan.adminChecklist.join(" ")).toContain("audit trail");
  });

  it("warns on AI and external integration surfaces", () => {
    expect(getPrivacyWarningsForSurface("ai-features").map((warning) => warning.id)).toContain("ai-external-provider");
    expect(getPrivacyWarningsForSurface("webhooks").map((warning) => warning.id)).toContain("webhook-external-receiver");
    expect(privacyControlsContract.warnings).toContain("export-download");
  });
});
