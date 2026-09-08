import { describe, expect, it } from "vitest";
import { componentCatalog } from "../catalog";

describe("ui component catalog", () => {
  it("documents reusable studio accessibility primitives", () => {
    expect(componentCatalog.TabButton.description).toContain("roving focus");
    expect(componentCatalog.ScreenReaderOnly.theming).toContain("ui-sr-only");
    expect(componentCatalog.StatCard.importName).toBe("StatCard");
    expect(componentCatalog.ToggleSwitch.category).toBe("input");
    expect(componentCatalog.EditorInsertTray.category).toBe("editor");
    expect(componentCatalog.EditorTableControls.theming).toContain("editor-tool-button");
  });
});
