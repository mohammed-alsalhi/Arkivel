"use client";

import { useState, useEffect, useMemo } from "react";

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  if (months < 12) return `${months}mo ago`;
  return `${years}y ago`;
}

export default function TimeAgo({ date }: { date: Date | string }) {
  const d = useMemo(() => new Date(date), [date]);
  const [text, setText] = useState(getRelativeTime(d));

  useEffect(() => {
    const interval = setInterval(() => setText(getRelativeTime(d)), 60000);
    return () => clearInterval(interval);
  }, [d]);

  return (
    <time
      dateTime={d.toISOString()}
      title={d.toLocaleString()}
      className="text-muted"
    >
      {text}
    </time>
  );
}
