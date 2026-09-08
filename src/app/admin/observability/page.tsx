"use client";

import { useEffect, useState } from "react";
import {
  Button,
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
import type {
  AnalyticsPrivacyControls,
  StructuredLogEvent,
  ObservabilitySeverity,
} from "@/lib/observability";

type ObservabilityPayload = {
  controls: AnalyticsPrivacyControls;
  events: StructuredLogEvent[];
  generatedAt: string;
};

export default function ObservabilityPage() {
  const [payload, setPayload] = useState<ObservabilityPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    queueMicrotask(() => void load());
  }, []);

  async function load() {
    try {
      const res = await fetch("/api/admin/observability");
      if (!res.ok) throw new Error("Observability feed request failed");
      setPayload(await res.json());
      setError("");
    } catch {
      setError("Could not load observability feed.");
    } finally {
      setLoading(false);
    }
  }

  async function updateControls(next: Partial<AnalyticsPrivacyControls>) {
    if (!payload) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/observability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload.controls, ...next }),
      });
      if (!res.ok) throw new Error("Observability controls update failed");
      await load();
    } catch {
      setError("Could not update observability controls.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="p-4 text-[13px] text-muted">Loading observability...</p>;

  return (
    <Page width="wide">
      <PageHeader
        title="Observability"
        description="Structured operational events, metric ingestion, and privacy-aware analytics controls."
        actions={
          <>
            <LinkButton href="/admin/operations">Operations</LinkButton>
            <LinkButton href="/admin/metrics">Metrics</LinkButton>
          </>
        }
      />

      {error && <Notice className="mb-4 border-danger-border bg-danger-soft text-danger">{error}</Notice>}

      {payload && (
        <>
          <SectionPanel title="Privacy controls" bodyClassName="grid gap-3 md:grid-cols-2">
            <ControlToggle
              checked={payload.controls.analyticsEnabled}
              disabled={saving}
              label="Analytics ingestion"
              onClick={() => updateControls({ analyticsEnabled: !payload.controls.analyticsEnabled })}
            />
            <ControlToggle
              checked={payload.controls.eventFeedEnabled}
              disabled={saving}
              label="Admin event feed"
              onClick={() => updateControls({ eventFeedEnabled: !payload.controls.eventFeedEnabled })}
            />
            <ControlToggle
              checked={payload.controls.ipAnonymization}
              disabled={saving}
              label="IP anonymization"
              onClick={() => updateControls({ ipAnonymization: !payload.controls.ipAnonymization })}
            />
            <ControlToggle
              checked={payload.controls.queryLoggingEnabled}
              disabled={saving}
              label="Search query logging"
              onClick={() => updateControls({ queryLoggingEnabled: !payload.controls.queryLoggingEnabled })}
            />
            <div className="md:col-span-2 flex items-center gap-3">
              <span className="text-[13px] text-muted">Retention days</span>
              {[30, 90, 180, 365].map((days) => (
                <Button
                  key={days}
                  disabled={saving}
                  onClick={() => updateControls({ retentionDays: days })}
                  variant={payload.controls.retentionDays === days ? "primary" : "default"}
                >
                  {days}
                </Button>
              ))}
            </div>
          </SectionPanel>

          <Section title={`Operational event feed (${payload.events.length})`}>
            {payload.events.length === 0 ? (
              <Notice>No events are available with the current privacy controls.</Notice>
            ) : (
              <DataTable>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Category</th>
                    <th>Severity</th>
                    <th>Message</th>
                  </tr>
                </thead>
                <tbody>
                  {payload.events.map((event) => (
                    <tr key={`${event.timestamp}-${event.message}`}>
                      <td className="text-muted">{new Date(event.timestamp).toLocaleString()}</td>
                      <td>{event.category}</td>
                      <td><SeverityChip severity={event.severity} /></td>
                      <td className="font-mono text-[12px]">{event.message}</td>
                    </tr>
                  ))}
                </tbody>
              </DataTable>
            )}
          </Section>
        </>
      )}
    </Page>
  );
}

function ControlToggle({
  checked,
  disabled,
  label,
  onClick,
}: {
  checked: boolean;
  disabled: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border border-border-light p-3">
      <span className="text-[13px] font-medium text-heading">{label}</span>
      <ToggleSwitch checked={checked} disabled={disabled} onClick={onClick} />
    </div>
  );
}

function SeverityChip({ severity }: { severity: ObservabilitySeverity }) {
  const tone = severity === "error" ? "danger" : severity === "warning" ? "warning" : severity === "debug" ? "info" : "success";
  return <Chip tone={tone}>{severity}</Chip>;
}
