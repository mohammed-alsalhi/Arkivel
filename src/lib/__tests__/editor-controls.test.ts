import { describe, expect, it } from "vitest";
import {
  editorBlockTemplates,
  editorControlsContract,
  editorExtensionPoints,
  editorPrimitiveCatalog,
  getEditorBlockTemplate,
  getEditorShortcutsForScope,
  groupEditorBlockTemplates,
} from "../editor-controls";

describe("editor controls contract", () => {
  it("declares reusable editor primitives and extension points", () => {
    expect(editorPrimitiveCatalog["insert-tray"].component).toBe("EditorInsertTray");
    expect(editorPrimitiveCatalog["review-tray"].theming).toContain("editor-review-strip");
    expect(editorPrimitiveCatalog["selection-actions"].description).toContain("selected-text");
    expect(editorExtensionPoints.map((point) => point.kind)).toEqual([
      "plugin-command",
      "toolbar-group",
      "slash-command",
      "side-panel",
    ]);
  });

  it("ships the required block templates", () => {
    expect(editorBlockTemplates.map((template) => template.kind)).toEqual(expect.arrayContaining([
      "callout",
      "metadata-table",
      "timeline",
      "infobox",
      "decision-log",
      "research-note",
      "worldbuilding-entry",
    ]));
    expect(getEditorBlockTemplate("research-note")?.html).toContain("Question");
    expect(getEditorBlockTemplate("missing")).toBeNull();
  });

  it("groups templates and exposes keyboard shortcuts", () => {
    expect(groupEditorBlockTemplates().research.map((template) => template.id)).toContain("decision-log");
    expect(getEditorShortcutsForScope("global")[0].commandId).toBe("command-palette.open");
    expect(editorControlsContract.blockTemplates[0]).not.toHaveProperty("html");
    expect(editorControlsContract.shortcuts.some((shortcut) => shortcut.pluginSafe)).toBe(true);
  });
});
