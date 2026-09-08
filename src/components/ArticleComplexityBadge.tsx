"use client";

import { computeReadability } from "@/lib/writing-coach";

interface Props {
  html: string;
}

export default function ArticleComplexityBadge({ html }: Props) {
  const r = computeReadability(html);
  const color =
    r.fleschScore >= 70 ? "text-green-600" : r.fleschScore >= 50 ? "text-yellow-600" : "text-red-600";

  return (
    <span className={`text-[10px] ${color} border border-current rounded px-1.5 py-0.5 font-mono`} title={`Readability: ${r.fleschScore}/100 · ${r.grade}`}>
      {r.readingTimeMinutes} min · {r.grade}
    </span>
  );
}
