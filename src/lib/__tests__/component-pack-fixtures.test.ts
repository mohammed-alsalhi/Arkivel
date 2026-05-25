import { describe, expect, it } from "vitest";
import { isComponentSlotId } from "../component-slots";
import { componentPackFixtures } from "../component-pack-fixtures";

describe("component pack fixtures", () => {
  it("publishes typed fixtures for core author preview surfaces", () => {
    expect(componentPackFixtures.map((fixture) => fixture.slot)).toEqual([
      "article-card",
      "metadata-panel",
      "dashboard-widget",
      "homepage-section",
      "space-navigation",
      "admin-summary",
      "editor-panel",
    ]);
    expect(componentPackFixtures.every((fixture) => isComponentSlotId(fixture.slot))).toBe(true);
    expect(componentPackFixtures.every((fixture) => Object.keys(fixture.data).length > 0)).toBe(true);
  });
});
