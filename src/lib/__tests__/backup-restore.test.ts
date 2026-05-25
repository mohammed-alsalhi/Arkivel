import { describe, expect, it } from "vitest";
import {
  BACKUP_WIZARD_SECTIONS,
  createBackupRestoreReport,
  createRestoreRehearsalReport,
  validateRestoreManifest,
} from "../backup-restore";

describe("backup and restore", () => {
  it("publishes an admin backup wizard for every required section", () => {
    const report = createBackupRestoreReport();

    expect(report.contract.apiRoute).toBe("/api/backup-restore");
    expect(report.wizardPlan.map((section) => section.id)).toEqual(BACKUP_WIZARD_SECTIONS.map((section) => section.id));
    expect(report.wizardPlan.every((section) => section.required)).toBe(true);
  });

  it("validates complete restore manifests", () => {
    const manifest = {
      schemaVersion: "arkivel.backup-restore.v1",
      sections: BACKUP_WIZARD_SECTIONS.map((section) => ({
        checksum: `sha256:${section.id}`,
        id: section.id,
      })),
    };

    expect(validateRestoreManifest(manifest).valid).toBe(true);
  });

  it("reports missing sections and checksum conflicts in rehearsal mode", () => {
    const rehearsal = createRestoreRehearsalReport({
      schemaVersion: "arkivel.backup-restore.v1",
      sections: [{ checksum: "", id: "database" }],
    });

    expect(rehearsal.mode).toBe("rehearsal");
    expect(rehearsal.writesAllowed).toBe(false);
    expect(rehearsal.conflictReport.map((conflict) => conflict.type)).toContain("missing-section");
    expect(rehearsal.conflictReport.map((conflict) => conflict.type)).toContain("checksum-mismatch");
  });

  it("includes scheduled backup and disaster recovery guidance", () => {
    const report = createBackupRestoreReport();

    expect(report.scheduledBackupPlan.cadenceOptions).toContain("before-upgrade");
    expect(report.scheduledBackupPlan.storageTargets.map((target) => target.id)).toEqual(["local-disk", "s3-compatible", "offsite-drive"]);
    expect(report.disasterRecoveryDrill.join(" ")).toContain("scratch database");
  });
});
