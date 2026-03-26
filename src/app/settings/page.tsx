"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/Toast";
import { DEFAULT_PREFERENCES, type UserPreferences } from "@/lib/preferences";

const LOCALES = [
  { value: "en", label: "English" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "es", label: "Spanish" },
  { value: "ar", label: "Arabic" },
  { value: "zh", label: "Chinese" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "pt", label: "Portuguese" },
  { value: "ru", label: "Russian" },
];

export default function SettingsPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [authenticated, setAuthenticated] = useState(true);

  useEffect(() => {
    async function fetchPrefs() {
      try {
        const res = await fetch("/api/preferences");
        if (res.status === 401) {
          setAuthenticated(false);
          router.push("/admin");
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setPrefs(data);
        }
      } catch {
        addToast("Failed to load preferences", "error");
      } finally {
        setLoading(false);
      }
    }

    fetchPrefs();
  }, [router, addToast]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });

      if (res.ok) {
        const updated = await res.json();
        setPrefs(updated);
        addToast("Settings saved successfully", "success");
      } else {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        addToast(err.error || "Failed to save settings", "error");
      }
    } catch {
      addToast("Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  }

  if (!authenticated) {
    return null;
  }

  if (loading) {
    return (
      <div>
        <h1
          className="text-xl font-normal text-heading mb-4 pb-1 border-b border-border"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Settings
        </h1>
        <div className="space-y-4">
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-text w-3/4" />
          <div className="skeleton skeleton-text w-1/2" />
          <div className="skeleton skeleton-text w-2/3" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1
        className="text-xl font-normal text-heading mb-4 pb-1 border-b border-border"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Settings
      </h1>

      <div className="max-w-xl space-y-6">
        {/* ── Editor Section ── */}
        <section className="border border-border bg-surface">
          <div className="bg-infobox-header px-4 py-2 text-[13px] font-bold text-foreground border-b border-border">
            Editor
          </div>
          <div className="px-4 py-3 space-y-3">
            <div>
              <label className="block text-[13px] font-medium text-heading mb-1.5">
                Default editor mode
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 text-[13px] cursor-pointer">
                  <input
                    type="radio"
                    name="editorMode"
                    value="rich"
                    checked={prefs.editorMode === "rich"}
                    onChange={() =>
                      setPrefs((p) => ({ ...p, editorMode: "rich" }))
                    }
                    className="accent-accent"
                  />
                  Rich text
                </label>
                <label className="flex items-center gap-1.5 text-[13px] cursor-pointer">
                  <input
                    type="radio"
                    name="editorMode"
                    value="markdown"
                    checked={prefs.editorMode === "markdown"}
                    onChange={() =>
                      setPrefs((p) => ({ ...p, editorMode: "markdown" }))
                    }
                    className="accent-accent"
                  />
                  Markdown
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* ── Notifications Section ── */}
        <section className="border border-border bg-surface">
          <div className="bg-infobox-header px-4 py-2 text-[13px] font-bold text-foreground border-b border-border">
            Notifications
          </div>
          <div className="px-4 py-3 space-y-2.5">
            <label className="flex items-center gap-2 text-[13px] cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.notifyOnEdit}
                onChange={(e) =>
                  setPrefs((p) => ({ ...p, notifyOnEdit: e.target.checked }))
                }
                className="accent-accent"
              />
              Notify me when a watched article is edited
            </label>
            <label className="flex items-center gap-2 text-[13px] cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.notifyOnReply}
                onChange={(e) =>
                  setPrefs((p) => ({ ...p, notifyOnReply: e.target.checked }))
                }
                className="accent-accent"
              />
              Notify me when someone replies to my discussion
            </label>
            <label className="flex items-center gap-2 text-[13px] cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.notifyOnMention}
                onChange={(e) =>
                  setPrefs((p) => ({
                    ...p,
                    notifyOnMention: e.target.checked,
                  }))
                }
                className="accent-accent"
              />
              Notify me when I am mentioned
            </label>
          </div>
        </section>

        {/* ── Display Section ── */}
        <section className="border border-border bg-surface">
          <div className="bg-infobox-header px-4 py-2 text-[13px] font-bold text-foreground border-b border-border">
            Display
          </div>
          <div className="px-4 py-3 space-y-3">
            <div>
              <label
                htmlFor="articlesPerPage"
                className="block text-[13px] font-medium text-heading mb-1"
              >
                Articles per page
              </label>
              <input
                id="articlesPerPage"
                type="number"
                min={5}
                max={100}
                step={5}
                value={prefs.articlesPerPage}
                onChange={(e) =>
                  setPrefs((p) => ({
                    ...p,
                    articlesPerPage: Math.max(
                      5,
                      Math.min(100, parseInt(e.target.value) || 20)
                    ),
                  }))
                }
                className="w-20 px-2 py-1 text-[13px] border border-border bg-background text-foreground"
              />
            </div>
            <label className="flex items-center gap-2 text-[13px] cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.showReadingProgress}
                onChange={(e) =>
                  setPrefs((p) => ({
                    ...p,
                    showReadingProgress: e.target.checked,
                  }))
                }
                className="accent-accent"
              />
              Show reading progress bar on articles
            </label>
          </div>
        </section>

        {/* ── Locale Section ── */}
        <section className="border border-border bg-surface">
          <div className="bg-infobox-header px-4 py-2 text-[13px] font-bold text-foreground border-b border-border">
            Locale
          </div>
          <div className="px-4 py-3">
            <div>
              <label
                htmlFor="locale"
                className="block text-[13px] font-medium text-heading mb-1"
              >
                Language
              </label>
              <select
                id="locale"
                value={prefs.locale}
                onChange={(e) =>
                  setPrefs((p) => ({ ...p, locale: e.target.value }))
                }
                className="w-48 px-2 py-1 text-[13px] border border-border bg-background text-foreground"
              >
                {LOCALES.map((loc) => (
                  <option key={loc.value} value={loc.value}>
                    {loc.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Editor Snippets link */}
        <section className="border border-border bg-surface">
          <div className="bg-infobox-header px-4 py-2 text-[13px] font-bold text-foreground border-b border-border">
            Editor Snippets
          </div>
          <div className="px-4 py-3 text-[13px]">
            <p className="text-muted mb-2">Create reusable content blocks that can be inserted via the <code className="bg-surface-hover px-1">/snippet</code> slash command.</p>
            <Link href="/settings/snippets" className="text-accent hover:underline text-[13px]">
              Manage snippets →
            </Link>
          </div>
        </section>

        {/* Save button */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="home-action-btn home-action-btn-primary disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save settings"}
          </button>
          <button
            onClick={() => setPrefs(DEFAULT_PREFERENCES)}
            className="home-action-btn"
            type="button"
          >
            Reset to defaults
          </button>
        </div>
      </div>
    </div>
  );
}
