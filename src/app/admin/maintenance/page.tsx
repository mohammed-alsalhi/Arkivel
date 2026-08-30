"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Chip,
  DataTable,
  LinkButton,
  Notice,
  Page,
  PageHeader,
  Section,
  SectionPanel,
  ToggleSwitch,
} from "@/components/ui";
import type { MaintenanceReport, MaintenanceSeverity } from "@/lib/maintenance-tooling";

export default function MaintenancePage() {
  const [enabled, setEnabled] = useState(false);
  const [report, setReport] = useState<MaintenanceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [modeRes, reportRes] = await Promise.all([
          fetch("/api/admin/maintenance"),
          fetch("/api/admin/maintenance/report"),
        ]);
        if (!modeRes.ok || !reportRes.ok) throw new Error("Maintenance status request failed");
        const modeData = await modeRes.json();
        const reportData = await reportRes.json();
        if (!cancelled) {
          setEnabled(Boolean(modeData.enabled));
          setReport(reportData);
          setError("");
        }
      } catch {
        if (!cancelled) setError("Could not load maintenance readiness.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function refreshReport() {
    const res = await fetch("/api/admin/maintenance/report");
    if (res.ok) setReport(await res.json());
  }

  async function toggle() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !enabled }),
      });
      if (!res.ok) throw new Error("Maintenance update failed");
      const data = await res.json();
      setEnabled(Boolean(data.enabled));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      await refreshReport();
    } catch {
      setError("Could not update maintenance mode.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleBackgroundTasks() {
    if (!report) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/maintenance/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled: !report.modes.backgroundTasksPaused,
          task: "background-tasks-paused",
        }),
      });
      if (!res.ok) throw new Error("Background task update failed");
      await refreshReport();
    } catch {
      setError("Could not update background task pause state.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-[13px] text-muted p-4">Loading...</p>;

  return (
    <Page width="wide">
      <PageHeader
        title="Maintenance"
        description="Prepare upgrades, constrain write traffic, pause background work, and review cleanup queues."
        actions={
          <LinkButton href="/api/export/history">Export history</LinkButton>
        }
      />

      {error && <Notice className="mb-4 border-danger-border bg-danger-soft text-danger">{error}</Notice>}

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionPanel title="Maintenance mode" bodyClassName="space-y-3">
          <p className="text-[13px] text-muted">
            Shows a site-wide maintenance banner while operators investigate, upgrade, or move infrastructure.
          </p>
          <div className="flex items-center gap-3">
            <ToggleSwitch
              aria-label="Toggle maintenance mode"
              checked={enabled}
              disabled={saving}
              onClick={toggle}
            />
            <span className="text-[13px] text-foreground">
              {enabled ? "Maintenance mode is ON" : "Maintenance mode is OFF"}
            </span>
            {saved && <span className="text-[11px] text-accent">Saved</span>}
          </div>
          {enabled && (
            <Notice className="border-warning-border bg-warning-soft text-warning">
              Visitors are currently seeing the maintenance banner.
            </Notice>
          )}
        </SectionPanel>

        <SectionPanel title="Background tasks" bodyClassName="space-y-3">
          <p className="text-[13px] text-muted">
            Pause non-critical background activity during high-risk upgrades or database maintenance windows.
          </p>
          <div className="flex items-center gap-3">
            <ToggleSwitch
              aria-label="Toggle background task pause"
              checked={Boolean(report?.modes.backgroundTasksPaused)}
              disabled={saving || !report}
              onClick={toggleBackgroundTasks}
            />
            <span className="text-[13px] text-foreground">
              {report?.modes.backgroundTasksPaused ? "Background tasks are paused" : "Background tasks are active"}
            </span>
          </div>
          <p className="text-[12px] text-muted">
            The pause flag is exposed for background workers to honor before running scheduled jobs.
          </p>
        </SectionPanel>
      </div>

      {report && (
        <>
          <Section title="Upgrade readiness">
            <DataTable>
              <thead>
                <tr>
                  <th>Check</th>
                  <th>Status</th>
                  <th>Detail</th>
                </tr>
              </thead>
              <tbody>
                {report.checks.map((check) => (
                  <tr key={check.id}>
                    <td className="font-medium text-heading">{check.label}</td>
                    <td><SeverityChip severity={check.severity} /></td>
                    <td className="text-muted">{check.detail}</td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
          </Section>

          <Section title="Cleanup queues">
            <DataTable>
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Records</th>
                  <th>Safe</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {report.cleanupTasks.map((task) => (
                  <tr key={task.id}>
                    <td className="font-medium text-heading">{task.label}</td>
                    <td>{task.count}</td>
                    <td>{task.safeToRun ? "Yes" : "Review"}</td>
                    <td className="text-muted">{task.description}</td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
            <Notice className="mt-3">
              Cleanup execution is available through <code className="bg-background px-1">POST /api/admin/maintenance/report</code> with a task id and explicit <code className="bg-background px-1">dryRun: false</code>.
            </Notice>
          </Section>

          <Section title="Runbooks">
            <div className="flex flex-wrap gap-2">
              {report.runbooks.map((runbook) => (
                <Link key={runbook.id} href={runbook.href} className="ui-button">
                  {runbook.label}
                </Link>
              ))}
            </div>
          </Section>
        </>
      )}
    </Page>
  );
}

function SeverityChip({ severity }: { severity: MaintenanceSeverity }) {
  const tone = severity === "pass" ? "success" : severity === "critical" ? "danger" : severity === "warning" ? "warning" : "info";
  return <Chip tone={tone}>{severity}</Chip>;
}

export const dynamic = "force-dynamic";
