"use client";

import { useEffect, useState } from "react";

type QualityResult = {
  score: number;
  label: "Poor" | "Fair" | "Good" | "Excellent";
  breakdown: { wordCount: number; links: number; images: number; freshness: number; excerpt: number };
};

const colorMap = {
  Poor: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  Fair: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400",
  Good: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  Excellent: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
};

export default function ArticleQualityBadge({ articleId }: { articleId: string }) {
  const [quality, setQuality] = useState<QualityResult | null>(null);

  useEffect(() => {
    fetch(`/api/articles/${articleId}/quality-score`)
      .then((r) => r.json())
      .then((d) => { if (d.score !== undefined) setQuality(d); })
      .catch(() => {});
  }, [articleId]);

  if (!quality) return null;

  const tooltipText =
    `Word count: ${quality.breakdown.wordCount}/20 · ` +
    `Links: ${quality.breakdown.links}/20 · ` +
    `Images: ${quality.breakdown.images}/20 · ` +
    `Freshness: ${quality.breakdown.freshness}/20 · ` +
    `Excerpt: ${quality.breakdown.excerpt}/20`;

  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium ${colorMap[quality.label]}`}
      title={tooltipText}
    >
      {quality.score} · {quality.label}
    </span>
  );
}
