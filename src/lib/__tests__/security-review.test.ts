import { describe, expect, it } from "vitest";
import {
  abuseCaseTestMatrix,
  buildSecurityHeaders,
  classifySecurityPath,
  dependencySupplyChainChecklist,
  isCsrfSensitiveRequest,
  securityReviewChecklist,
  securityReviewContract,
} from "../security-review";

describe("security review", () => {
  it("publishes review coverage for the required v4.89.0 surfaces", () => {
    expect(securityReviewChecklist.map((item) => item.surface)).toEqual(
      expect.arrayContaining([
        "auth",
        "sessions",
        "api-keys",
        "csrf",
        "webhooks",
        "imports",
        "uploads",
        "plugin-manifests",
        "marketplace-packs",
        "admin-routes",
        "exports",
      ]),
    );
    expect(securityReviewContract.apiRoute).toBe("/api/security/review");
  });

  it("builds conservative browser security headers without enforcing CSP yet", () => {
    const headers = buildSecurityHeaders();
    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(headers["X-Frame-Options"]).toBe("DENY");
    expect(headers["Content-Security-Policy-Report-Only"]).toContain("frame-ancestors 'none'");
  });

  it("classifies sensitive paths and CSRF-sensitive writes", () => {
    expect(classifySecurityPath("/api/admin/cache")).toBe("admin-routes");
    expect(classifySecurityPath("/api/v1/articles")).toBe("api-keys");
    expect(classifySecurityPath("/api/export/json")).toBe("exports");
    expect(classifySecurityPath("/articles/example")).toBe("public");
    expect(isCsrfSensitiveRequest("/api/admin/cache", "POST")).toBe(true);
    expect(isCsrfSensitiveRequest("/api/admin/cache", "GET")).toBe(false);
    expect(isCsrfSensitiveRequest("/api/articles", "POST")).toBe(false);
  });

  it("includes abuse-case and supply-chain review gates", () => {
    expect(abuseCaseTestMatrix.map((item) => item.id)).toEqual(
      expect.arrayContaining(["admin-route-access", "draft-visibility", "api-key-required", "plugin-permission-grant"]),
    );
    expect(dependencySupplyChainChecklist.join(" ")).toContain("package-lock.json");
  });
});
