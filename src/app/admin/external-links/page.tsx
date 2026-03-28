"use client";

import { useEffect, useState } from "react";

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
    <div>
      <h1
        className="text-[1.7rem] font-normal text-heading border-b border-border pb-1 mb-4"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        External link clicks
      </h1>
      <p className="text-[12px] text-muted mb-4">
        Top outbound links clicked by readers on article pages.
      </p>

      {loading ? (
        <p className="text-[13px] text-muted italic">Loading…</p>
      ) : stats.length === 0 ? (
        <p className="text-[13px] text-muted italic">No external link clicks recorded yet.</p>
      ) : (
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border text-left text-muted text-[11px] uppercase tracking-wide">
              <th className="py-2 pr-4">URL</th>
              <th className="py-2 w-24 text-right">Clicks</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((s) => (
              <tr key={s.url} className="border-b border-border hover:bg-surface-hover">
                <td className="py-1.5 pr-4 font-mono text-[12px] text-muted">{s.url}</td>
                <td className="py-1.5 text-right font-semibold">{s.clicks.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
