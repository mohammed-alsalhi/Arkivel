import { describe, expect, it } from "vitest";
import {
  COMPONENT_SLOT_IDS,
  componentSlotContracts,
  validateComponentPackSlots,
} from "../component-slots";
import { componentPacks, validateMarketplaceCatalog, type MarketplaceItem } from "../marketplace";

describe("component slots", () => {
  it("declares stable slot contracts with fallbacks", () => {
    expect(COMPONENT_SLOT_IDS).toEqual([
      "article-card",
      "article-header",
      "metadata-panel",
      "infobox-layout",
      "dashboard-widget",
      "homepage-section",
      "search-result",
      "editor-panel",
      "space-navigation",
      "admin-summary",
    ]);
    expect(componentSlotContracts).toHaveLength(COMPONENT_SLOT_IDS.length);
    expect(componentSlotContracts.every((slot) => slot.fallbackComponent.startsWith("Default"))).toBe(true);
    expect(componentSlotContracts.every((slot) => Object.keys(slot.props).length > 0)).toBe(true);
  });

  it("validates component pack slot ids", () => {
    expect(validateComponentPackSlots(["article-card", "admin-summary"]).valid).toBe(true);
    expect(validateComponentPackSlots(["article-card", "unknown-slot"])).toEqual({
      incompatibleSlots: ["unknown-slot"],
      valid: false,
    });
  });

  it("rejects incompatible component-pack slots in the marketplace catalog", () => {
    const invalidPack = {
      ...componentPacks[0],
      id: "bad-component-pack",
      slots: ["article-card", "unknown-slot"],
    } as unknown as MarketplaceItem;
    const result = validateMarketplaceCatalog([invalidPack]);

    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.includes("unsupported component slot"))).toBe(true);
  });
});
