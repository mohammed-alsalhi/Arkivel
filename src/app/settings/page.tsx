"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Button,
  Field,
  InlineCode,
  Input,
  Page,
  PageHeader,
  SectionPanel,
  Select,
} from "@/components/ui";
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
      <Page>
        <PageHeader title="Settings" />
        <div className="space-y-4">
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-text w-3/4" />
          <div className="skeleton skeleton-text w-1/2" />
          <div className="skeleton skeleton-text w-2/3" />
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader title="Settings" />

      <div className="max-w-xl space-y-6">
        <SectionPanel title="Editor" bodyClassName="space-y-3">
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
        </SectionPanel>

        <SectionPanel title="Notifications" bodyClassName="space-y-2.5">
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
        </SectionPanel>

        <SectionPanel title="Display" bodyClassName="space-y-3">
          <Field htmlFor="articlesPerPage" label="Articles per page">
            <Input
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
              className="w-20"
            />
          </Field>
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
        </SectionPanel>

        <SectionPanel title="Locale">
          <Field htmlFor="locale" label="Language">
            <Select
              id="locale"
              value={prefs.locale}
              onChange={(e) =>
                setPrefs((p) => ({ ...p, locale: e.target.value }))
              }
              className="w-48"
            >
              {LOCALES.map((loc) => (
                <option key={loc.value} value={loc.value}>
                  {loc.label}
                </option>
              ))}
            </Select>
          </Field>
        </SectionPanel>

        <SectionPanel title="Keyboard Shortcuts" bodyClassName="text-[13px]">
          <p className="text-muted mb-2">
            Customise the two-key navigation chords (e.g. <InlineCode>gh</InlineCode> for home).
          </p>
          <Link href="/settings/shortcuts" className="text-accent hover:underline text-[13px]">
            Customise shortcuts →
          </Link>
        </SectionPanel>

        <SectionPanel title="Editor Snippets" bodyClassName="text-[13px]">
          <p className="text-muted mb-2">
            Create reusable content blocks that can be inserted via the{" "}
            <InlineCode>/snippet</InlineCode> slash command.
          </p>
          <Link href="/settings/snippets" className="text-accent hover:underline text-[13px]">
            Manage snippets →
          </Link>
        </SectionPanel>

        <SectionPanel title="Saved Searches" bodyClassName="text-[13px]">
          <p className="text-muted mb-2">
            Revisit and manage the searches you have saved from the search page.
          </p>
          <Link href="/settings/saved-searches" className="text-accent hover:underline text-[13px]">
            Manage saved searches →
          </Link>
        </SectionPanel>

        <SectionPanel title="Sessions" bodyClassName="text-[13px]">
          <p className="text-muted mb-2">
            Review devices signed in to your account and revoke old sessions.
          </p>
          <Link href="/settings/sessions" className="text-accent hover:underline text-[13px]">
            Manage sessions →
          </Link>
        </SectionPanel>

        <div className="flex items-center gap-3 pt-2">
          <Button
            onClick={handleSave}
            disabled={saving}
            variant="primary"
            className="disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save settings"}
          </Button>
          <Button onClick={() => setPrefs(DEFAULT_PREFERENCES)} type="button">
            Reset to defaults
          </Button>
        </div>
      </div>
    </Page>
  );
}
