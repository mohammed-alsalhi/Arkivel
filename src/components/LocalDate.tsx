"use client";

import { useEffect, useState } from "react";

interface Props {
  date: string | Date;
  format?: "short" | "long" | "relative";
}

function formatRelative(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 30) return `${diffD}d ago`;
  const diffMo = Math.floor(diffD / 30);
  if (diffMo < 12) return `${diffMo}mo ago`;
  return `${Math.floor(diffMo / 12)}y ago`;
}

export default function LocalDate({ date, format = "short" }: Props) {
  const [formatted, setFormatted] = useState<string | null>(null);
  const d = typeof date === "string" ? new Date(date) : date;

  useEffect(() => {
    if (format === "relative") {
      setFormatted(formatRelative(d));
      return;
    }
    setFormatted(
      d.toLocaleDateString(undefined, {
        year: "numeric",
        month: format === "long" ? "long" : "short",
        day: "numeric",
      })
    );
  }, [d, format]);

  if (!formatted) {
    // SSR placeholder — same format as server-rendered dates
    return <span suppressHydrationWarning>{d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>;
  }

  return <span title={d.toISOString()}>{formatted}</span>;
}
