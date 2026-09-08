"use client";

import { useState, useEffect } from "react";
import { Button, EmptyState, Page, PageHeader } from "@/components/ui";

type ReferrerRow = {
  referrer: string;
  count: number;
  pct: number;
};

type Data = {
  total: number;
  referrers: ReferrerRow[];
  days: number;
};

export default function TopReferrersPage() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/referrers?days=${days}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { setData(d); setLoading(false); });
  }, [days]);

  return (
    <Page>
      <PageHeader
        title="Top Referrers"
        description={
          <>
            Where visitors are coming from in the last{" "}
            <strong>{days}</strong> days.
            {data && <span className="ml-1">({data.total.toLocaleString()} total referrals)</span>}
          </>
        }
        actions={
          <>
            {[7, 30, 90].map((d) => (
              <Button
                key={d}
                onClick={() => setDays(d)}
                variant={days === d ? "primary" : "default"}
              >
                {d}d
              </Button>
            ))}
          </>
        }
      />

      {loading ? (
        <p className="text-[13px] text-muted italic">Loading…</p>
      ) : !data || data.referrers.length === 0 ? (
        <EmptyState title="No referrer data for this period." />
      ) : (
        <div className="border border-border divide-y divide-border">
          {data.referrers.map((row, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2 hover:bg-surface-hover">
              <span className="text-[11px] text-muted w-5 text-right shrink-0">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <span className="text-[13px] font-medium truncate block">{row.referrer}</span>
                <div className="mt-1 h-1 bg-surface-hover rounded-full overflow-hidden w-full">
                  <div
                    className="h-full bg-accent rounded-full"
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[13px] font-mono">{row.count.toLocaleString()}</div>
                <div className="text-[10px] text-muted">{row.pct}%</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Page>
  );
}
