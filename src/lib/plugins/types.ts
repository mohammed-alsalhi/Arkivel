export interface WikiPlugin {
  id: string;
  name: string;
  version: string;
  description?: string;
  onArticleRender?: (html: string) => string | Promise<string>;
  sidebarItems?: () => { href: string; label: string }[];
}

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  enabled: boolean;
}
