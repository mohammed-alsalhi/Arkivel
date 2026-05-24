"use client";

import { useEffect, useState } from "react";
import { Notice, Page, PageHeader, SectionPanel, ToggleSwitch } from "@/components/ui";

export default function ReadOnlyPage() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadStatus() {
      try {
        const res = await fetch("/api/admin/read-only");
        if (!res.ok) throw new Error("Read-only status request failed");
        const data = await res.json();
        if (!cancelled) {
          setEnabled(Boolean(data.enabled));
          setError("");
        }
      } catch {
        if (!cancelled) {
          setError("Could not load read-only mode status.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadStatus();
    return () => {
      cancelled = true;
    };
  }, []);

  async function toggle() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/read-only", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !enabled }),
      });
      if (!res.ok) throw new Error("Read-only status update failed");
      const data = await res.json();
      setEnabled(Boolean(data.enabled));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError("Could not update read-only mode.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Page width="narrow">
      <PageHeader title="Read-Only Mode" />
      <SectionPanel title="Editing controls" bodyClassName="space-y-3">
        <p className="text-[13px] text-muted">
          When read-only mode is enabled, non-admin users cannot create, edit, or delete articles.
          A blue banner is shown at the top of every page. Admins are not affected.
        </p>

        <div className="flex items-center gap-3">
          <ToggleSwitch
            aria-label="Toggle read-only mode"
            checked={enabled}
            onClick={toggle}
            disabled={loading || saving}
          />
          <span className="text-[13px] text-foreground">
            {loading
              ? "Checking read-only mode status…"
              : enabled
                ? "Read-only mode is ON"
                : "Read-only mode is OFF"}
          </span>
          {saved && <span className="text-[11px] text-accent">Saved</span>}
        </div>

        {error && (
          <Notice className="border-danger-border bg-danger-soft text-danger">{error}</Notice>
        )}

        {enabled && (
          <Notice className="border-info-border bg-info-soft text-info">
            Visitors cannot edit articles. Only admins can make changes.
          </Notice>
        )}
      </SectionPanel>
    </Page>
  );
}

export const dynamic = "force-dynamic";
