import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { COMMAND_DESTINATIONS } from "@/lib/navigation";

export type Command = {
  id: string;
  label: string;
  group: string;
  keywords?: string[];
  shortcut?: string;
  action: () => void;
  adminOnly?: boolean;
};

export function getCommands(
  router: AppRouterInstance,
  toggleTheme: () => void
): Command[] {
  const navigationCommands = COMMAND_DESTINATIONS.map((destination) => ({
    id: destination.id,
    label: destination.label,
    group: destination.group,
    keywords: destination.keywords,
    shortcut: destination.shortcut,
    adminOnly: destination.adminOnly,
    action: () => router.push(destination.href),
  }));

  return [
    ...navigationCommands,

    // ── Actions ──
    {
      id: "action-new-article",
      label: "New Article",
      group: "Actions",
      keywords: ["create", "new", "article", "write", "draft"],
      shortcut: "G N",
      action: () => router.push("/articles/new"),
    },
    {
      id: "action-export",
      label: "Export",
      group: "Actions",
      keywords: ["export", "download", "backup"],
      action: () => router.push("/export"),
    },
    {
      id: "action-toggle-theme",
      label: "Toggle Theme",
      group: "Actions",
      keywords: ["theme", "dark", "light", "mode", "appearance"],
      action: toggleTheme,
    },
    {
      id: "action-settings",
      label: "Settings",
      group: "Actions",
      keywords: ["settings", "preferences", "options", "config"],
      action: () => router.push("/settings"),
    },

  ];
}
