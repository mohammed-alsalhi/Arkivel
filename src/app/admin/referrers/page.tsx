"use client";

import { useState, useEffect } from "react";

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
    <div>
      <h1
        className="text-[1.7rem] font-normal text-heading border-b border-border pb-1 mb-3"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Top Referrers
      </h1>

      <div className="flex items-center gap-3 mb-4">
        <p className="text-[13px] text-muted">
          Where visitors are coming from in the last{" "}
          <strong>{days}</strong> days.
          {data && <span className="ml-1">({data.total.toLocaleString()} total referrals)</span>}
        </p>
        <div className="flex gap-1 ml-auto">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDays(d)}
              className={`h-6 px-2 text-[11px] border border-border rounded transition-colors ${
                days === d ? "bg-accent text-accent-foreground" : "hover:bg-surface-hover"
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-[13px] text-muted italic">Loading…</p>
      ) : !data || data.referrers.length === 0 ? (
        <p className="text-[13px] text-muted italic">No referrer data for this period.</p>
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
    </div>
  );
}
