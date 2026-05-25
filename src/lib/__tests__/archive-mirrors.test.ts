import { describe, expect, it } from "vitest";
import {
  createArchiveMirrorReport,
  createReadOnlyArchiveSnapshotPlan,
  createRepeatedSyncConflictNotes,
  createSelectedSpaceTransferWorkflow,
} from "../archive-mirrors";

describe("archive mirror workflows", () => {
  it("plans read-only archive snapshots with preserved revision, asset, category, and metadata sections", () => {
    const plan = createReadOnlyArchiveSnapshotPlan();

    expect(plan.readOnly).toBe(true);
    expect(plan.immutable).toBe(true);
    expect(plan.preserved).toEqual(["revisions", "assets", "categories", "metadata"]);
    expect(plan.sections).toContain("comments");
  });

  it("defines selected-space export and import workflow dependencies", () => {
    const workflow = createSelectedSpaceTransferWorkflow(["docs"]);

    expect(workflow.id).toBe("selected-space-transfer");
    expect(workflow.steps.join(" ")).toContain("Run import dry-run");
    expect(workflow.uses.syncManifest).toBe("arkivel.sync-manifest.v1");
    expect(workflow.uses.externalReferences).toBe("arkivel.external-reference.v1");
  });

  it("recommends manual merge notes for repeated sync conflicts", () => {
    const notes = createRepeatedSyncConflictNotes("manual-merge");

    expect(notes.recommended).toBe(true);
    expect(notes.notes.join(" ")).toContain("divergent revisions");
  });

  it("publishes private mirror setup docs and release decision checkpoint", () => {
    const report = createArchiveMirrorReport();

    expect(report.contract.apiRoute).toBe("/api/archive-mirrors");
    expect(report.privateMirrorSetupDocs.map((doc) => doc.audience)).toEqual(["teams", "personal wikis"]);
    expect(report.releaseDecision.question).toBe("Does federation graduate before v5?");
    expect(report.releaseDecision.status).toBe("defer-live-federation-until-proven");
  });
});
