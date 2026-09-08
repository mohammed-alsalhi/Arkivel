export interface WikiPlugin {
  id: string;
  name: string;
  version: string;
  description?: string;
  manifest?: import("@/lib/plugin-manifest").ArkivelPluginManifest;
  source?: "registered" | "trusted-local";
  onArticleRender?: (html: string) => string | Promise<string>;
  sidebarItems?: () => { href: string; label: string }[];
}

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  enabled: boolean;
  compatibility?: import("@/lib/plugin-manifest").PluginManifestCompatibility;
  hooks?: string[];
  health?: {
    lastError: string | null;
    lastLoad: string;
    status: "available" | "error";
  };
  loadError?: string;
  permissions?: string[];
  permissionPrompts?: {
    label: string;
    prompt: string;
    risk: "low" | "medium" | "high";
    scope: string;
  }[];
  routes?: string[];
  settings?: string[];
  source?: "registered" | "trusted-local";
  widgets?: string[];
}
