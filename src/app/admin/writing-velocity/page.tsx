"use client";

import { useEffect, useState } from "react";
import { Page, PageHeader, StatCard, StatGrid } from "@/components/ui";

type Week = { week: string; words: number };

export default function WritingVelocityPage() {
  const [data, setData] = useState<Week[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/writing-velocity")
      .then((r) => r.json())
      .then((d) => { setData(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  if (loading) return <p className="text-[13px] text-muted">Loading…</p>;

  const maxWords = Math.max(...data.map((w) => w.words), 1);
  const totalWords = data.reduce((sum, w) => sum + w.words, 0);
  const avgWords = Math.round(totalWords / (data.length || 1));

  return (
    <Page>
      <PageHeader
        title="Writing Velocity"
        description="Words added to the wiki per week (last 12 weeks, from revision history)."
      />

      <StatGrid className="mb-4">
        <StatCard label="Total (12 weeks)" value={totalWords.toLocaleString()} />
        <StatCard label="Weekly average" value={avgWords.toLocaleString()} />
      </StatGrid>

      <div className="border border-border rounded p-4 bg-surface">
        <div className="flex items-end gap-1.5 h-32">
          {data.map((w) => {
            const pct = maxWords > 0 ? (w.words / maxWords) * 100 : 0;
            const label = new Date(w.week + "T00:00:00Z").toLocaleDateString(undefined, { month: "short", day: "numeric" });
            return (
              <div key={w.week} className="flex-1 flex flex-col items-center gap-1" title={`${label}: ${w.words.toLocaleString()} words`}>
                <div
                  className="w-full rounded-t bg-accent/70 hover:bg-accent transition-colors"
                  style={{ height: `${Math.max(pct, 2)}%` }}
                />
                <span className="text-[9px] text-muted rotate-45 origin-left hidden sm:block">{label}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-2 text-[11px] text-muted text-center">Each bar = one week</div>
      </div>
    </Page>
  );
}

export const dynamic = "force-dynamic";
