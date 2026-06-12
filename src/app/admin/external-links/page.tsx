"use client";

import { useEffect, useState } from "react";
import { DataTable, EmptyState, Page, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

type LinkStat = { url: string; clicks: number };

export default function ExternalLinksPage() {
  const [stats, setStats] = useState<LinkStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/external-links")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setStats(d); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Page>
      <PageHeader
        title="External link clicks"
        description="Top outbound links clicked by readers on article pages."
      />

      {loading ? (
        <p className="text-[13px] text-muted italic">Loading…</p>
      ) : stats.length === 0 ? (
        <EmptyState title="No external link clicks recorded yet." />
      ) : (
        <DataTable>
          <thead>
            <tr>
              <th>URL</th>
              <th className="w-24 text-right">Clicks</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((s) => (
              <tr key={s.url}>
                <td className="font-mono text-[12px] text-muted">{s.url}</td>
                <td className="text-right font-semibold">{s.clicks.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      )}
    </Page>
  );
}
