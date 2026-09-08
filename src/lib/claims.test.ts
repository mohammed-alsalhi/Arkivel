import { describe, expect, it } from "vitest";
import { extractClaims, getClaimHash } from "./claims";

describe("claim helpers", () => {
  it("extracts editor-marked claims with stable hashes", () => {
    const html = `
      <p>
        <span data-claim="certain"><strong>Alpha</strong> claim&nbsp;text</span>
        <span data-claim="probable">Beta &amp; gamma</span>
      </p>
    `;

    const claims = extractClaims(html);

    expect(claims).toEqual([
      {
        text: "Alpha claim text",
        level: "certain",
        hash: getClaimHash("certain", "Alpha claim text"),
      },
      {
        text: "Beta & gamma",
        level: "probable",
        hash: getClaimHash("probable", "Beta & gamma"),
      },
    ]);
  });

  it("normalizes whitespace and case when hashing", () => {
    expect(getClaimHash("disputed", "A  Mixed Claim")).toBe(
      getClaimHash("disputed", "a mixed claim")
    );
  });
});
