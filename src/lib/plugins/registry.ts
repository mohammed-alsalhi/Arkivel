import prisma from "@/lib/prisma";
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

/**
 * Load plugin enabled/disabled states from the database.
 * Returns manifests with their current enabled state.
 */
export async function loadPlugins(): Promise<PluginManifest[]> {
  const registered = getRegisteredPlugins();

  // Get all plugin states from DB
  const states = await prisma.pluginState.findMany();
  const stateMap = new Map(states.map((s) => [s.id, s.enabled]));

  return registered.map((plugin) => ({
    id: plugin.id,
    name: plugin.name,
    version: plugin.version,
    description: plugin.description || "",
    enabled: stateMap.get(plugin.id) ?? false,
  }));
}

/**
 * Get only enabled plugins from the registry.
 */
export async function getEnabledPlugins(): Promise<WikiPlugin[]> {
  const states = await prisma.pluginState.findMany({
    where: { enabled: true },
  });
  const enabledIds = new Set(states.map((s) => s.id));

  return getRegisteredPlugins().filter((p) => enabledIds.has(p.id));
}

/**
 * Toggle a plugin's enabled state in the database.
 */
export async function setPluginEnabled(
  pluginId: string,
  enabled: boolean
): Promise<void> {
  await prisma.pluginState.upsert({
    where: { id: pluginId },
    create: { id: pluginId, enabled },
    update: { enabled },
  });
}

/**
 * Run onArticleRender hooks for all enabled plugins.
 */
export async function runArticleRenderHooks(html: string): Promise<string> {
  const plugins = await getEnabledPlugins();
  let result = html;

  for (const plugin of plugins) {
    if (plugin.onArticleRender) {
      result = await plugin.onArticleRender(result);
    }
  }

  return result;
}
