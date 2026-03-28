"use client";

import { useEffect, useState } from "react";

export default function MaintenancePage() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/maintenance")
      .then((r) => r.json())
      .then((d) => { setEnabled(d.enabled); setLoading(false); });
  }, []);

  async function toggle() {
    setSaving(true);
    const res = await fetch("/api/admin/maintenance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !enabled }),
    });
    const d = await res.json();
    setEnabled(d.enabled);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) return <p className="text-[13px] text-muted p-4">Loading…</p>;

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-semibold text-heading mb-4">Maintenance Mode</h1>

      <div className="border border-border rounded p-4 bg-surface space-y-3">
        <p className="text-[13px] text-muted">
          When maintenance mode is enabled, a yellow banner is shown at the top of every page
          informing visitors that the wiki is undergoing maintenance.
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            disabled={saving}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              enabled ? "bg-accent" : "bg-muted/40 border border-border"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                enabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <span className="text-[13px] text-foreground">
            {enabled ? "Maintenance mode is ON" : "Maintenance mode is OFF"}
          </span>
          {saved && <span className="text-[11px] text-accent">Saved</span>}
        </div>

        {enabled && (
          <div className="rounded bg-yellow-500/10 border border-yellow-500/30 px-3 py-2 text-[12px] text-yellow-700 dark:text-yellow-400">
            Visitors are currently seeing the maintenance banner.
          </div>
        )}
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
