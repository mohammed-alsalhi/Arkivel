import prisma from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { loadTrustedLocalPlugins } from "./local-loader";
import { getPluginPermissionPrompts } from "./permissions";
import type { WikiPlugin, PluginManifest } from "./types";

// In-memory plugin registry
const pluginRegistry: Map<string, WikiPlugin> = new Map();

/**
 * Register a plugin in the in-memory registry.
 * Plugins can be registered at startup by importing them.
 */
export function registerPlugin(plugin: WikiPlugin): void {
  pluginRegistry.set(plugin.id, plugin);
}

/**
 * Get all registered plugins with their manifests.
 */
export function getRegisteredPlugins(): WikiPlugin[] {
  return Array.from(pluginRegistry.values());
}

export async function getAvailablePlugins() {
  const local = await loadTrustedLocalPlugins();
  return {
    errors: local.errors,
    loader: {
      enabled: local.enabled,
      root: local.root,
    },
    plugins: [
      ...getRegisteredPlugins().map((plugin) => ({ ...plugin, source: plugin.source ?? "registered" as const })),
      ...local.plugins,
    ],
  };
}

/**
 * Load plugin enabled/disabled states from the database.
 * Returns manifests with their current enabled state.
 */
export async function loadPlugins(): Promise<{ errors: Awaited<ReturnType<typeof loadTrustedLocalPlugins>>["errors"]; loader: { enabled: boolean; root?: string }; plugins: PluginManifest[] }> {
  const available = await getAvailablePlugins();

  // Get all plugin states from DB
  const errors = [...available.errors];
  const lastLoad = new Date().toISOString();
  const states = await prisma.pluginState.findMany().catch((error) => {
    errors.push({ message: `Unable to read plugin enablement state: ${errorMessage(error)}` });
    return [];
  });
  const stateMap = new Map(states.map((s) => [s.id, s.enabled]));

  return {
    errors,
    loader: available.loader,
    plugins: available.plugins.map((plugin) => ({
    id: plugin.id,
    name: plugin.name,
    version: plugin.version,
    description: plugin.description || "",
    enabled: stateMap.get(plugin.id) ?? false,
    compatibility: plugin.manifest?.compatibility,
    hooks: plugin.manifest?.hooks,
    health: {
      lastError: available.errors.find((item) => item.id === plugin.id)?.message ?? null,
      lastLoad,
      status: available.errors.some((item) => item.id === plugin.id) ? "error" : "available",
    },
    permissions: plugin.manifest?.permissions,
    permissionPrompts: getPluginPermissionPrompts(plugin.manifest?.permissions),
    routes: plugin.manifest?.routes.map((route) => route.path),
    settings: plugin.manifest?.settings.map((setting) => setting.key),
    source: plugin.source ?? "registered",
    widgets: plugin.manifest?.widgets.map((widget) => widget.id),
  })),
  };
}

/**
 * Get only enabled plugins from the registry.
 */
export async function getEnabledPlugins(): Promise<WikiPlugin[]> {
  const states = await prisma.pluginState.findMany({
    where: { enabled: true },
  });
  const enabledIds = new Set(states.map((s) => s.id));

  const available = await getAvailablePlugins();
  return available.plugins.filter((p) => enabledIds.has(p.id));
}

/**
 * Toggle a plugin's enabled state in the database.
 */
export async function setPluginEnabled(
  pluginId: string,
  enabled: boolean
): Promise<{ error?: string; plugin?: PluginManifest }> {
  const available = await loadPlugins();
  const plugin = available.plugins.find((item) => item.id === pluginId);

  if (!plugin) {
    return { error: `Plugin ${pluginId} is not registered or is not a valid trusted local manifest.` };
  }

  await prisma.pluginState.upsert({
    where: { id: pluginId },
    create: { id: pluginId, enabled },
    update: { enabled },
  }).catch((error) => {
    throw new Error(`Unable to update plugin enablement state: ${errorMessage(error)}`);
  });

  return { plugin: { ...plugin, enabled } };
}

/**
 * Run onArticleRender hooks for all enabled plugins.
 */
export async function runArticleRenderHooks(html: string): Promise<string> {
  const plugins = await getEnabledPlugins();
  let result = html;

  for (const plugin of plugins) {
    if (plugin.onArticleRender) {
      try {
        result = await plugin.onArticleRender(result);
      } catch (error) {
        await logAudit("plugin.hook_failure", { type: "plugin", id: plugin.id, label: plugin.name }, {
          hook: "article.render",
          message: errorMessage(error),
        });
      }
    }
  }

  return result;
}

export async function logPluginRouteAccess(pluginId: string, route: string) {
  await logAudit("plugin.route_access", { type: "plugin", id: pluginId }, { route });
}

export async function logPluginJobRun(pluginId: string, jobId: string) {
  await logAudit("plugin.job_run", { type: "plugin", id: pluginId }, { jobId });
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
