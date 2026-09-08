import { mkdtemp, mkdir, rm, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import { describe, expect, it } from "vitest";
import { plannedPluginExamples } from "@/lib/plugin-manifest";
import {
  TRUSTED_PLUGIN_DIR_ENV,
  TRUSTED_PLUGIN_LOADER_ENV,
  loadTrustedLocalPlugins,
} from "../local-loader";

describe("trusted local plugin loader", () => {
  it("stays disabled unless explicitly enabled", async () => {
    await expect(loadTrustedLocalPlugins({})).resolves.toEqual({
      enabled: false,
      errors: [],
      plugins: [],
    });
  });

  it("requires an absolute trusted plugin directory", async () => {
    const result = await loadTrustedLocalPlugins({
      [TRUSTED_PLUGIN_DIR_ENV]: "plugins",
      [TRUSTED_PLUGIN_LOADER_ENV]: "true",
    });

    expect(result).toMatchObject({
      enabled: true,
      plugins: [],
    });
    expect(result.errors[0].message).toContain("absolute path");
  });

  it("loads valid plugin manifests without executing plugin code", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "arkivel-plugins-"));
    try {
      const pluginDir = path.join(root, "web-clipper");
      await mkdir(pluginDir);
      await writeFile(path.join(pluginDir, "plugin.json"), JSON.stringify(plannedPluginExamples[0]));
      await writeFile(path.join(pluginDir, "index.js"), "throw new Error('must not execute');");

      const result = await loadTrustedLocalPlugins({
        [TRUSTED_PLUGIN_DIR_ENV]: root,
        [TRUSTED_PLUGIN_LOADER_ENV]: "true",
      });

      expect(result.errors).toEqual([]);
      expect(result.plugins).toHaveLength(1);
      expect(result.plugins[0]).toMatchObject({
        id: "web-clipper",
        manifest: expect.objectContaining({ schemaVersion: "arkivel.plugin.v1" }),
        source: "trusted-local",
      });
    } finally {
      await rm(root, { force: true, recursive: true });
    }
  });

  it("reports invalid manifests without crashing discovery", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "arkivel-plugins-"));
    try {
      const pluginDir = path.join(root, "broken");
      await mkdir(pluginDir);
      await writeFile(path.join(pluginDir, "plugin.json"), JSON.stringify({
        ...plannedPluginExamples[0],
        permissions: ["remote:execute"],
      }));

      const result = await loadTrustedLocalPlugins({
        [TRUSTED_PLUGIN_DIR_ENV]: root,
        [TRUSTED_PLUGIN_LOADER_ENV]: "true",
      });

      expect(result.plugins).toEqual([]);
      expect(result.errors[0]).toMatchObject({
        id: "web-clipper",
      });
      expect(result.errors[0].message).toContain("Unsupported permission");
    } finally {
      await rm(root, { force: true, recursive: true });
    }
  });
});
