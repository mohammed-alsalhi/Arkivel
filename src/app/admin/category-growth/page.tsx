"use client";

import { useEffect, useState } from "react";
import { EmptyState, Page, PageHeader } from "@/components/ui";

const COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16",
];

type Category = { name: string; total: number; months: number[] };
type Data = { months: string[]; categories: Category[] };

function monthLabel(m: string) {
  const [y, mo] = m.split("-");
  return new Date(Number(y), Number(mo) - 1, 1).toLocaleDateString(undefined, { month: "short", year: "2-digit" });
}

export default function CategoryGrowthPage() {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/category-growth")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); });
  }, []);

  if (loading) return <p className="text-[13px] text-muted">Loading…</p>;
  if (!data || data.categories.length === 0) {
    return (
      <Page>
        <PageHeader title="Category Growth" />
        <EmptyState title="No articles created in the last 12 months." />
      </Page>
    );
  }

  const maxVal = Math.max(...data.categories.flatMap((c) => c.months), 1);

  return (
    <Page>
      <PageHeader
        title="Category Growth"
        description="New articles per category, by month (last 12 months). Top 8 categories shown."
      />

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4">
        {data.categories.map((cat, i) => (
          <span key={cat.name} className="flex items-center gap-1 text-[12px] text-foreground">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ background: COLORS[i % COLORS.length] }} />
            {cat.name}
            <span className="text-muted">({cat.total})</span>
          </span>
        ))}
      </div>

      {/* Stacked bar chart */}
      <div className="border border-border rounded p-4 bg-surface overflow-x-auto">
        <div className="flex items-end gap-1.5 h-40 min-w-[500px]">
          {data.months.map((month, mi) => {
            const total = data.categories.reduce((s, c) => s + c.months[mi], 0);
            return (
              <div key={month} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col justify-end" style={{ height: "120px" }} title={`${monthLabel(month)}: ${total} articles`}>
                  {data.categories.map((cat, ci) => {
                    const count = cat.months[mi];
                    if (count === 0) return null;
                    const pct = (count / maxVal) * 100;
                    return (
                      <div
                        key={cat.name}
                        style={{ height: `${pct}%`, background: COLORS[ci % COLORS.length], minHeight: count > 0 ? "3px" : "0" }}
                        title={`${cat.name}: ${count}`}
                        className="w-full transition-all"
                      />
                    );
                  })}
                </div>
                <span className="text-[9px] text-muted whitespace-nowrap">{monthLabel(month)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </Page>
  );
}
