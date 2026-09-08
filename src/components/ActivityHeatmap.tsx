"use client";

import { useEffect, useState } from "react";

type HeatmapData = { counts: Record<string, number> };

function getIntensity(count: number, max: number): number {
  if (count === 0 || max === 0) return 0;
  return Math.ceil((count / max) * 4); // 1–4
}

function intensityColor(level: number): string {
  if (level === 0) return "var(--color-border)";
  const strength = [30, 55, 78, 100][level - 1] ?? 100;
  return `color-mix(in srgb, var(--color-success) ${strength}%, var(--color-surface))`;
}

export default function ActivityHeatmap() {
  const [data, setData] = useState<HeatmapData | null>(null);

  useEffect(() => {
    fetch("/api/activity/heatmap")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data) return null;

  const { counts } = data;
  const max = Math.max(1, ...Object.values(counts));

  // Build 52 weeks × 7 days grid
  const today = new Date();
  const cells: { date: string; count: number }[] = [];
  for (let i = 363; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    cells.push({ date: key, count: counts[key] ?? 0 });
  }

  // Group into weeks (columns of 7)
  const weeks: { date: string; count: number }[][] = [];
  for (let w = 0; w < 52; w++) {
    weeks.push(cells.slice(w * 7, w * 7 + 7));
  }

  const totalEdits = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="mb-5 p-4 border border-border bg-surface rounded">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold uppercase text-muted">
          Contribution Activity — last 52 weeks
        </span>
        <span className="text-[11px] text-muted">{totalEdits} edits</span>
      </div>
      <div className="overflow-x-auto">
        <div className="flex gap-[3px]" style={{ minWidth: 672 }}>
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((cell, di) => {
                const level = getIntensity(cell.count, max);
                const bg = intensityColor(level);
                return (
                  <div
                    key={di}
                    title={`${cell.date}: ${cell.count} edit${cell.count !== 1 ? "s" : ""}`}
                    style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: bg, flexShrink: 0 }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1 mt-2 text-[10px] text-muted">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((l) => (
          <div
            key={l}
            style={{
              width: 10, height: 10, borderRadius: 2, flexShrink: 0,
              backgroundColor: intensityColor(l),
            }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
