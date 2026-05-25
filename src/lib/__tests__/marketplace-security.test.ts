import { describe, expect, it } from "vitest";
import {
  getDangerousCapabilityWarnings,
  hasExcessiveMarketplacePermissions,
  isBlockedMarketplacePermission,
  isUnsafeMarketplaceHook,
  marketplaceSecurityContract,
  packProvenancePlan,
} from "../marketplace-security";

describe("marketplace security", () => {
  it("publishes blocked permissions, dangerous capabilities, and provenance requirements", () => {
    expect(marketplaceSecurityContract.blockedPermissions).toContain("system:*");
    expect(marketplaceSecurityContract.dangerousCapabilities).toEqual(
      expect.arrayContaining(["file:read", "job:execute", "settings:write", "webhook:send"]),
    );
    expect(packProvenancePlan.required).toContain("checksums.manifest");
  });

  it("blocks unsafe permissions and hooks", () => {
    expect(isBlockedMarketplacePermission("system:execute")).toBe(true);
    expect(isBlockedMarketplacePermission("article:read")).toBe(false);
    expect(isUnsafeMarketplaceHook("shell.afterInstall")).toBe(true);
    expect(isUnsafeMarketplaceHook("article.render")).toBe(false);
  });

  it("flags excessive and dangerous permission requests", () => {
    expect(hasExcessiveMarketplacePermissions(["a:b", "c:d", "e:f", "g:h", "i:j", "k:l"])).toBe(true);
    expect(getDangerousCapabilityWarnings(["article:read", "file:read"]).join(" ")).toContain("local files");
  });
});
