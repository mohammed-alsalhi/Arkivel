import { describe, expect, it } from "vitest";
import {
  canEditSpaceGovernance,
  defaultGlobalSpaceGovernance,
  resolveSpaceGovernanceInheritance,
  spaceGovernanceContract,
  validateSpaceGovernanceInput,
} from "../space-governance";

describe("space governance", () => {
  it("validates governance preferences", () => {
    const result = validateSpaceGovernanceInput({
      defaultVisibility: "authenticated",
      healthRequiredSignals: ["stale-pages", "broken-links"],
      healthStaleDays: 45,
      ownerLabel: "Docs team",
      reviewCadenceDays: 30,
      reviewerLabel: "Support editors",
    });

    expect(result.valid).toBe(true);
    expect(result.values).toMatchObject({
      defaultVisibility: "authenticated",
      healthRequiredSignals: ["stale-pages", "broken-links"],
      healthStaleDays: 45,
      ownerLabel: "Docs team",
      reviewCadenceDays: 30,
      reviewerLabel: "Support editors",
    });
  });

  it("rejects invalid visibility, health signals, and cadence values", () => {
    const result = validateSpaceGovernanceInput({
      defaultVisibility: "secret",
      healthRequiredSignals: ["unknown"],
      healthStaleDays: 0,
      reviewCadenceDays: "soon",
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        "unsupported defaultVisibility: secret",
        "unsupported health signals: unknown",
        "healthStaleDays must be a positive integer",
        "reviewCadenceDays must be a positive integer",
      ]),
    );
  });

  it("resolves inherited governance and widgets", () => {
    const resolved = resolveSpaceGovernanceInheritance({
      categoryChain: [
        { id: "parent", ownerLabel: "Platform", reviewCadenceDays: 60 },
        { defaultVisibility: "private", healthRequiredSignals: ["unreviewed-claims"], id: "child" },
      ],
      globalDefaults: defaultGlobalSpaceGovernance(),
    });

    expect(resolved.effective).toMatchObject({
      defaultVisibility: "private",
      ownerLabel: "Platform",
      reviewCadenceDays: 60,
      source: "space",
    });
    expect(resolved.sources.ownerLabel).toBe("parent-space");
    expect(resolved.sources.defaultVisibility).toBe("space");
    expect(resolved.badges).toContain("Owner: Platform");
    expect(resolved.widgets.map((widget) => widget.id)).toEqual(["unreviewed-claims"]);
  });

  it("checks admin/editor/viewer and legacy admin-secret edit permissions", () => {
    expect(canEditSpaceGovernance({ adminSecretConfigured: false, session: null })).toBe(true);
    expect(canEditSpaceGovernance({ adminSecretConfigured: true, session: { role: "admin" } })).toBe(true);
    expect(canEditSpaceGovernance({ adminSecretConfigured: true, session: { role: "editor" } })).toBe(false);
    expect(canEditSpaceGovernance({ adminSecretConfigured: true, session: { role: "viewer" } })).toBe(false);
  });

  it("publishes the governance contract", () => {
    expect(spaceGovernanceContract.healthSignals).toContain("stale-pages");
    expect(spaceGovernanceContract.widgets).toEqual([
      "stale-pages",
      "unreviewed-claims",
      "orphaned-content",
      "broken-links",
    ]);
  });
});
