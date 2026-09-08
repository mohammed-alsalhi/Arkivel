"use client";

import { useState, useEffect } from "react";

type Day = { date: string; count: number };

export default function ViewSparkline({ articleId }: { articleId: string }) {
  const [data, setData] = useState<Day[]>([]);

  useEffect(() => {
    fetch(`/api/articles/${articleId}/views/sparkline`)
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setData(d); })
      .catch(() => {});
  }, [articleId]);

  if (data.length === 0) return null;

  const max = Math.max(...data.map((d) => d.count), 1);
  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <div className="flex items-center gap-2">
      <div
        className="flex items-end gap-px h-5"
        title={`${total} views in the last 30 days`}
      >
        {data.map((d) => {
          const h = Math.max(Math.round((d.count / max) * 20), d.count > 0 ? 2 : 1);
          return (
            <div
              key={d.date}
              style={{ height: `${h}px`, width: "2px" }}
              className={d.count > 0 ? "bg-accent/70" : "bg-border"}
              title={`${d.date}: ${d.count}`}
            />
          );
        })}
      </div>
      <span className="text-[11px] text-muted">{total} views/30d</span>
    </div>
  );
}
