import { describe, expect, it } from "vitest";
import {
  apiKeyScopes,
  generatedClientExamples,
  sampleSdkScripts,
  sdkTypesContract,
} from "../sdk-types";

describe("sdk types contract", () => {
  it("publishes sdk-ready type names and client examples", () => {
    expect(sdkTypesContract.types).toContain("ArkivelArticlesResponse");
    expect(sdkTypesContract.types).toContain("ArkivelWebhookEvent");
    expect(generatedClientExamples.node).toContain("ArkivelClient");
    expect(generatedClientExamples.curl).toContain("X-API-Key");
  });

  it("documents typed api key scopes", () => {
    expect(apiKeyScopes["articles:read"].surfaces).toContain("/api/v1/articles");
    expect(apiKeyScopes["webhooks:write"].write).toBe(true);
    expect(Object.keys(apiKeyScopes)).toContain("health:read");
  });

  it("lists sample scripts for common api work", () => {
    expect(sampleSdkScripts.map((script) => script.id)).toEqual([
      "backup",
      "import",
      "search",
      "content-audit",
      "webhook-test",
    ]);
    expect(sampleSdkScripts.find((script) => script.id === "backup")?.scopes).toContain("articles:read");
  });
});
