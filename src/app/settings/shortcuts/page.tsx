"use client";

import { useState, useEffect } from "react";
import {
  loadShortcuts,
  saveShortcuts,
  resetShortcuts,
  DEFAULT_SHORTCUTS,
  SHORTCUT_LABELS,
  type ShortcutMap,
} from "@/lib/shortcuts";
import {
  Button,
  InlineCode,
  Input,
  Notice,
  Page,
  PageHeader,
  SectionPanel,
} from "@/components/ui";

export default function ShortcutsPage() {
  const [shortcuts, setShortcuts] = useState<ShortcutMap>(DEFAULT_SHORTCUTS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setShortcuts(loadShortcuts());
  }, []);

  function handleChange(key: keyof ShortcutMap, value: string) {
    setShortcuts((prev) => ({ ...prev, [key]: value.toLowerCase().replace(/\s/g, "") }));
    setSaved(false);
  }

  function handleSave() {
    saveShortcuts(shortcuts);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleReset() {
    resetShortcuts();
    setShortcuts(DEFAULT_SHORTCUTS);
    setSaved(false);
  }

  return (
    <Page>
      <PageHeader title="Keyboard Shortcuts" />
      <div className="max-w-xl">
        <Notice className="mb-4 text-[13px]">
          Customise the two-key navigation chords. Type the desired keys (e.g.{" "}
          <InlineCode>gh</InlineCode> means press{" "}
          <kbd>g</kbd> then <kbd>h</kbd>). Changes are saved to your browser.
        </Notice>

        <SectionPanel className="mb-4" title="Navigation chords" bodyClassName="space-y-3">
          {(Object.keys(shortcuts) as (keyof ShortcutMap)[]).map((key) => (
            <div key={key} className="flex items-center gap-3">
              <label className="w-44 text-[13px] text-foreground shrink-0">
                {SHORTCUT_LABELS[key]}
              </label>
              <Input
                type="text"
                value={shortcuts[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                maxLength={4}
                className="w-20 font-mono"
              />
              {shortcuts[key] !== DEFAULT_SHORTCUTS[key] && (
                <span className="text-[11px] text-muted">
                  default: <InlineCode>{DEFAULT_SHORTCUTS[key]}</InlineCode>
                </span>
              )}
            </div>
          ))}
        </SectionPanel>

        <div className="flex items-center gap-3">
          <Button onClick={handleSave} variant="primary">
            {saved ? "Saved!" : "Save shortcuts"}
          </Button>
          <Button onClick={handleReset} type="button">
            Reset to defaults
          </Button>
        </div>
      </div>
    </Page>
  );
}
