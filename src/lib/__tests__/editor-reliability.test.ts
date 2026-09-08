import { describe, expect, it } from "vitest";
import {
  EDITOR_RELIABILITY_SCHEMA_VERSION,
  compareSnapshotContent,
  createDraftSnapshot,
  createLargeDocumentFixture,
  diagnoseEditorHealth,
  editorReliabilityContract,
  repairDraftSnapshot,
} from "../editor-reliability";

describe("editor reliability", () => {
  it("publishes reliability checks, snapshot flows, diagnostics, and large-document fixtures", () => {
    expect(editorReliabilityContract.schemaVersion).toBe(EDITOR_RELIABILITY_SCHEMA_VERSION);
    expect(editorReliabilityContract.checks).toEqual(expect.arrayContaining([
      "collaborative-editing",
      "draft-recovery",
      "offline-warning",
      "autosave-repair",
      "paste-cleanup",
      "embed-handling",
      "large-document-performance",
    ]));
    expect(editorReliabilityContract.snapshotFlows).toEqual(["restore", "compare", "discard"]);
    expect(editorReliabilityContract.largeDocumentFixtures).toContain("wiki-links");
  });

  it("creates and repairs recoverable draft snapshots", () => {
    const draft = createDraftSnapshot({ articleId: "a1", title: "  ", content: "<p>Hello</p>", savedAt: 1 });
    expect(draft).toMatchObject({
      articleId: "a1",
      title: "Untitled draft",
      schemaVersion: EDITOR_RELIABILITY_SCHEMA_VERSION,
    });
    expect(repairDraftSnapshot({ articleId: "a1", content: "<p>Hello</p>" })).toMatchObject({
      articleId: "a1",
      content: "<p>Hello</p>",
    });
    expect(repairDraftSnapshot({ articleId: "a1" })).toBeNull();
  });

  it("diagnoses extension failures, schema conflicts, offline, storage, and large documents", () => {
    const issues = diagnoseEditorHealth({
      extensionsLoaded: ["StarterKit"],
      requiredExtensions: ["StarterKit", "WikiLink"],
      schemaNodeNames: ["paragraph", "image", "image"],
      offline: true,
      storageAvailable: false,
      documentSizeBytes: 1_500_000,
    });
    expect(issues.map((issue) => issue.code)).toEqual(expect.arrayContaining([
      "extension-load-failure",
      "schema-conflict",
      "offline",
      "storage-unavailable",
      "large-document",
    ]));
  });

  it("compares snapshots and creates large-document fixtures", () => {
    expect(compareSnapshotContent("<p>one two</p>", "<p>one</p>")).toMatchObject({
      changed: true,
      deltaWords: 1,
    });
    expect(createLargeDocumentFixture("tables", 2)).toContain("| A | B |");
    expect(createLargeDocumentFixture("wiki-links", 1)).toContain("[[Related Article]]");
  });
});
