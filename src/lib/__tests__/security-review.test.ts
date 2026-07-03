import { describe, expect, it } from "vitest";
import { buildSecurityHeaders } from "../security-review";

describe("security review", () => {
  it("builds conservative browser security headers without enforcing CSP yet", () => {
    const headers = buildSecurityHeaders();
    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(headers["X-Frame-Options"]).toBe("DENY");
    expect(headers["Cross-Origin-Opener-Policy"]).toBe("same-origin");
    expect(headers["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["Content-Security-Policy-Report-Only"]).toContain("frame-ancestors 'none'");
  });
});
