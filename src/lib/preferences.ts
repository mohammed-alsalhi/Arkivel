export const DEFAULT_PREFERENCES = {
  dashboardWidgets: [
    "welcome",
    "featured",
    "recentChanges",
    "categories",
    "onThisDay",
  ] as string[],
  editorMode: "rich" as "rich" | "markdown",
  notifyOnEdit: true,
  notifyOnReply: true,
  notifyOnMention: true,
  notificationDigestCadence: "daily" as "off" | "daily" | "weekly",
  locale: "en",
  timezone: "UTC",
  avatarUrl: "",
  defaultEditorPreferences: {
    mode: "rich" as "rich" | "markdown",
    spellcheck: true,
    autosave: true,
  },
  articlesPerPage: 20,
  showReadingProgress: true,
  // v4.1: Daily digest
  digestEnabled: false,
  digestTime: "08:00",
  digestTimezone: "UTC",
};

export type UserPreferences = typeof DEFAULT_PREFERENCES;

/**
 * Merge saved (partial) preferences with defaults, ensuring all keys are present.
 */
export function mergePreferences(
  saved: Partial<UserPreferences>
): UserPreferences {
  return {
    ...DEFAULT_PREFERENCES,
    ...saved,
    // Ensure dashboardWidgets is always an array even if saved value is malformed
    dashboardWidgets:
      Array.isArray(saved.dashboardWidgets) && saved.dashboardWidgets.length > 0
        ? saved.dashboardWidgets
        : DEFAULT_PREFERENCES.dashboardWidgets,
  };
}
