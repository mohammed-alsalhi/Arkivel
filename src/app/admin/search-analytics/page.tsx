"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type TopQuery = { query: string; count: number; avgResults: number };
type ZeroQuery = { query: string; count: number };
type DayVolume = { date: string; count: number };

type Analytics = {
  topQueries: TopQuery[];
  zeroResultQueries: ZeroQuery[];
  dailyVolume: DayVolume[];
  totalCount: number;
  days: number;
};

export default function SearchAnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/search-analytics?days=${days}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [days]);

  const maxVolume = data ? Math.max(...data.dailyVolume.map((d) => d.count), 1) : 1;

  return (
    <div>
      <h1 className="text-[1.4rem] font-normal text-heading border-b border-border pb-1 mb-4"
        style={{ fontFamily: "var(--font-serif)" }}>
        Search Analytics
      </h1>

      {/* Period selector */}
      <div className="flex items-center gap-3 mb-5 text-[13px]">
        <span className="text-muted">Period:</span>
        {[7, 14, 30, 90].map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`h-6 px-2 text-[11px] border rounded transition-colors ${
              days === d
                ? "border-accent bg-accent/10 text-accent"
                : "border-border text-muted hover:text-foreground hover:bg-surface-hover"
            }`}
          >
            {d}d
          </button>
        ))}
        {data && !loading && (
          <span className="text-muted ml-2">{data.totalCount.toLocaleString()} total searches</span>
        )}
      </div>

      {loading && <div className="text-muted text-[13px] italic">Loading…</div>}

      {data && !loading && (
        <div className="space-y-6">
          {/* Daily volume bar chart */}
          <div className="wiki-portal">
            <div className="wiki-portal-header">Search volume — last {days} days</div>
            <div className="wiki-portal-body">
              {data.dailyVolume.length === 0 ? (
                <p className="text-[13px] text-muted italic">No data yet.</p>
              ) : (
                <div className="flex items-end gap-0.5 h-24 w-full">
                  {data.dailyVolume.map((d) => {
                    const height = Math.round((d.count / maxVolume) * 96);
                    return (
                      <div
                        key={d.date}
                        title={`${d.date}: ${d.count} searches`}
                        style={{ height: `${Math.max(height, 2)}px`, flex: 1 }}
                        className="bg-accent/60 hover:bg-accent rounded-t-sm transition-colors"
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Top queries */}
            <div className="wiki-portal">
              <div className="wiki-portal-header">Top queries</div>
              <div className="wiki-portal-body">
                {data.topQueries.length === 0 ? (
                  <p className="text-[13px] text-muted italic">No data yet.</p>
                ) : (
                  <table className="w-full text-[13px] border-collapse">
                    <thead>
                      <tr className="text-[11px] text-muted text-left">
                        <th className="pb-1 pr-3">Query</th>
                        <th className="pb-1 pr-3 text-right">Searches</th>
                        <th className="pb-1 text-right">Avg results</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.topQueries.map((q) => (
                        <tr key={q.query} className="border-t border-border-light hover:bg-surface-hover">
                          <td className="py-1 pr-3 font-mono text-[12px]">{q.query}</td>
                          <td className="py-1 pr-3 text-right text-muted">{q.count}</td>
                          <td className={`py-1 text-right ${q.avgResults === 0 ? "text-wiki-link-broken" : "text-muted"}`}>
                            {q.avgResults}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Zero-result queries */}
            <div className="wiki-portal">
              <div className="wiki-portal-header">Zero-result queries</div>
              <div className="wiki-portal-body">
                {data.zeroResultQueries.length === 0 ? (
                  <p className="text-[13px] text-muted italic">No zero-result searches in this period.</p>
                ) : (
                  <>
                    <p className="text-[12px] text-muted mb-2">
                      These searches returned no results — consider creating articles for them.
                    </p>
                    <table className="w-full text-[13px] border-collapse">
                      <thead>
                        <tr className="text-[11px] text-muted text-left">
                          <th className="pb-1 pr-3">Query</th>
                          <th className="pb-1 text-right">Searches</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.zeroResultQueries.map((q) => (
                          <tr key={q.query} className="border-t border-border-light hover:bg-surface-hover">
                            <td className="py-1 pr-3">
                              <span className="font-mono text-[12px] text-wiki-link-broken">{q.query}</span>
                            </td>
                            <td className="py-1 text-right text-muted">{q.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="mt-2 text-[12px]">
                      <Link href="/admin/knowledge-gaps" className="text-muted hover:text-foreground">
                        Also see Knowledge Gaps →
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
