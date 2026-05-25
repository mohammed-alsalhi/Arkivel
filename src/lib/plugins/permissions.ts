import type { PluginPermissionScope } from "@/lib/plugin-manifest";
import { PLUGIN_PERMISSION_SCOPES } from "@/lib/plugin-manifest";

export type PluginPermissionActor =
  | { type: "anonymous" }
  | { type: "api-key"; userId?: string }
  | { type: "user"; role: "admin" | "editor" | "viewer" | string };

export const pluginPermissionPrompts: Record<PluginPermissionScope, { label: string; prompt: string; risk: "low" | "medium" | "high" }> = {
  "article:read": {
    label: "Read articles",
    prompt: "Allows the plugin to read article titles, content, metadata, and publication status visible to the runtime.",
    risk: "medium",
  },
  "article:write": {
    label: "Write articles",
    prompt: "Allows the plugin to create or update article content and metadata through approved plugin surfaces.",
    risk: "high",
  },
  "category:read": {
    label: "Read categories",
    prompt: "Allows the plugin to inspect category names, hierarchy, and space metadata.",
    risk: "low",
  },
  "category:write": {
    label: "Write categories",
    prompt: "Allows the plugin to create or update categories and space metadata through approved plugin surfaces.",
    risk: "high",
  },
  "user:read": {
    label: "Read users",
    prompt: "Allows the plugin to read user identity and role metadata needed for attribution or assignment.",
    risk: "high",
  },
  "settings:write": {
    label: "Write settings",
    prompt: "Allows the plugin to persist its own settings and request settings changes through admin-reviewed flows.",
    risk: "high",
  },
  "webhook:send": {
    label: "Send webhooks",
    prompt: "Allows the plugin to send configured outbound webhook events using environment-provided targets.",
    risk: "medium",
  },
  "file:read": {
    label: "Read local files",
    prompt: "Allows the plugin to read files from explicitly configured local paths during trusted local operations.",
    risk: "high",
  },
  "job:execute": {
    label: "Run jobs",
    prompt: "Allows the plugin to run manual or scheduled jobs declared in the plugin manifest.",
    risk: "high",
  },
};

export function getPluginPermissionPrompts(scopes: readonly string[] = []) {
  return scopes
    .filter((scope): scope is PluginPermissionScope => PLUGIN_PERMISSION_SCOPES.includes(scope as PluginPermissionScope))
    .map((scope) => ({ scope, ...pluginPermissionPrompts[scope] }));
}

export function canGrantPluginPermission(actor: PluginPermissionActor, scope: PluginPermissionScope) {
  if (!PLUGIN_PERMISSION_SCOPES.includes(scope)) return false;
  return actor.type === "user" && actor.role === "admin";
}

export function canUsePluginPermission(actor: PluginPermissionActor, scope: PluginPermissionScope) {
  if (!PLUGIN_PERMISSION_SCOPES.includes(scope)) return false;
  if (actor.type === "user" && actor.role === "admin") return true;
  if (actor.type === "user" && actor.role === "editor") {
    return ["article:read", "article:write", "category:read", "file:read"].includes(scope);
  }
  if (actor.type === "user" && actor.role === "viewer") {
    return ["article:read", "category:read"].includes(scope);
  }
  if (actor.type === "api-key") {
    return ["article:read", "category:read", "webhook:send"].includes(scope);
  }
  return ["article:read", "category:read"].includes(scope);
}
