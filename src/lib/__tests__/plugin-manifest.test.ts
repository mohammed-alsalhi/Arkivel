import { describe, expect, it } from "vitest";
import {
  PLUGIN_API_VERSION,
  PLUGIN_MANIFEST_SCHEMA_VERSION,
  plannedPluginExamples,
  pluginCompatibilityMatrix,
  pluginManifestRegistry,
  pluginManifestSchema,
  validateArkivelPluginManifest,
} from "../plugin-manifest";

describe("plugin manifest schema", () => {
  it("documents the full v1 manifest surface", () => {
    expect(pluginManifestSchema.fields).toEqual(expect.arrayContaining([
      "schemaVersion",
      "kind",
      "id",
      "identity",
      "version",
      "compatibility",
      "permissions",
      "routes",
      "settings",
      "widgets",
      "hooks",
      "jobs",
      "storage",
      "apiScopes",
      "webhooks",
    ]));
    expect(pluginManifestSchema.schemaVersion).toBe(PLUGIN_MANIFEST_SCHEMA_VERSION);
    expect(pluginManifestSchema.pluginApiVersion).toBe(PLUGIN_API_VERSION);
    expect(pluginManifestSchema.webhookBoundary).toContain("environment-variable");
  });

  it("keeps the planned plugin examples valid and complete", () => {
    expect(plannedPluginExamples.map((example) => example.id)).toEqual([
      "web-clipper",
      "import-adapter",
      "export-adapter",
      "dashboard-widget",
      "editor-command",
      "notification-bridge",
    ]);

    for (const example of plannedPluginExamples) {
      expect(validateArkivelPluginManifest(example), example.id).toMatchObject({ valid: true });
      expect(example.compatibility.pluginApi).toBe(PLUGIN_API_VERSION);
      expect(example.storage.schemaVersion).toBe("1.0.0");
    }
  });

  it("publishes a v4.80 beta compatibility matrix", () => {
    expect(pluginCompatibilityMatrix).toEqual(expect.arrayContaining([
      expect.objectContaining({
        arkivel: ">=4.80.0 <5.0.0",
        pluginApi: PLUGIN_API_VERSION,
        status: "beta",
      }),
    ]));
    expect(pluginManifestRegistry.validation.valid).toBe(true);
  });

  it("returns actionable fielded validation errors", () => {
    const broken = {
      ...plannedPluginExamples[0],
      compatibility: { arkivel: "4.x", pluginApi: "old" },
      hooks: ["article.unknown"],
      permissions: ["remote:execute"],
      routes: [{ id: "bad-route", label: "Bad", path: "/api/plugins/bad", title: "Bad" }],
      schemaVersion: "old",
      webhooks: [{ events: ["unknown.event"], id: "bad-webhook", urlEnvVar: "https://example.com" }],
    };

    const result = validateArkivelPluginManifest(broken);

    expect(result.valid).toBe(false);
    expect(result.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "unsupported-schema", field: "schemaVersion" }),
      expect.objectContaining({ code: "unsupported-permission", field: "permissions" }),
      expect.objectContaining({ code: "invalid-route-path", field: "routes.path" }),
      expect.objectContaining({ code: "unsupported-hook", field: "hooks" }),
      expect.objectContaining({ code: "invalid-webhook-url-env", field: "webhooks.urlEnvVar" }),
      expect.objectContaining({ code: "unsupported-api-version", field: "compatibility.pluginApi" }),
    ]));
    expect(result.issues.every((issue) => issue.message.length > 10)).toBe(true);
  });
});
