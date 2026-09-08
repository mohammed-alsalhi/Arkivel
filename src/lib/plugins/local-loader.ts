import { promises as fs } from "fs";
import path from "path";
import type { ArkivelPluginManifest } from "@/lib/plugin-manifest";
import { validateArkivelPluginManifest } from "@/lib/plugin-manifest";
import type { WikiPlugin } from "./types";

export const TRUSTED_PLUGIN_LOADER_ENV = "ARKIVEL_ENABLE_TRUSTED_PLUGINS";
export const TRUSTED_PLUGIN_DIR_ENV = "ARKIVEL_TRUSTED_PLUGIN_DIR";

export const trustedPluginLoaderContract = {
  defaultState: "disabled",
  directoryEnv: TRUSTED_PLUGIN_DIR_ENV,
  enableEnv: TRUSTED_PLUGIN_LOADER_ENV,
  executionBoundary: "The v4.80.1 loader reads and validates plugin.json manifests only; it does not import or execute plugin code.",
  requiredDirectory: "Absolute path to a trusted local plugin directory containing one subdirectory per plugin.",
  surfaces: ["routes", "widgets", "settings", "hooks", "jobs", "permissions"],
};

export type TrustedPluginLoadError = {
  id?: string;
  message: string;
  path?: string;
};

export type TrustedPluginLoadResult = {
  enabled: boolean;
  errors: TrustedPluginLoadError[];
  plugins: WikiPlugin[];
  root?: string;
};

export async function loadTrustedLocalPlugins(env: Record<string, string | undefined> = process.env): Promise<TrustedPluginLoadResult> {
  if (env[TRUSTED_PLUGIN_LOADER_ENV] !== "true") {
    return { enabled: false, errors: [], plugins: [] };
  }

  const root = env[TRUSTED_PLUGIN_DIR_ENV];
  if (!root) {
    return {
      enabled: true,
      errors: [{ message: `${TRUSTED_PLUGIN_DIR_ENV} is required when ${TRUSTED_PLUGIN_LOADER_ENV}=true.` }],
      plugins: [],
    };
  }

  if (!path.isAbsolute(root)) {
    return {
      enabled: true,
      errors: [{ message: `${TRUSTED_PLUGIN_DIR_ENV} must be an absolute path.`, path: root }],
      plugins: [],
      root,
    };
  }

  let entries: string[];
  try {
    entries = await fs.readdir(root);
  } catch (error) {
    return {
      enabled: true,
      errors: [{ message: `Unable to read trusted plugin directory: ${errorMessage(error)}`, path: root }],
      plugins: [],
      root,
    };
  }

  const plugins: WikiPlugin[] = [];
  const errors: TrustedPluginLoadError[] = [];

  for (const entry of entries) {
    if (entry.startsWith(".")) continue;
    const pluginPath = path.join(root, entry);
    const manifestPath = path.join(pluginPath, "plugin.json");
    try {
      const stat = await fs.stat(pluginPath);
      if (!stat.isDirectory()) continue;
      const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8")) as ArkivelPluginManifest;
      const validation = validateArkivelPluginManifest(manifest);
      if (!validation.valid) {
        errors.push({
          id: manifest.id,
          message: validation.issues.map((issue) => `${issue.field}: ${issue.message}`).join(" "),
          path: manifestPath,
        });
        continue;
      }
      plugins.push(toWikiPlugin(manifest));
    } catch (error) {
      errors.push({
        id: entry,
        message: `Unable to load plugin.json: ${errorMessage(error)}`,
        path: manifestPath,
      });
    }
  }

  return { enabled: true, errors, plugins, root };
}

function toWikiPlugin(manifest: ArkivelPluginManifest): WikiPlugin {
  return {
    description: manifest.description,
    id: manifest.id,
    manifest,
    name: manifest.identity.name,
    source: "trusted-local",
    version: manifest.version,
  };
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
