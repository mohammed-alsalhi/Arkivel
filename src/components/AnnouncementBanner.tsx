"use client";

import { useState, useEffect } from "react";

type Announcement = { id: string; message: string; type: string };

const TYPE_STYLES: Record<string, string> = {
  info:    "bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-200",
  warning: "bg-yellow-50 border-yellow-300 text-yellow-900 dark:bg-yellow-950/40 dark:border-yellow-700 dark:text-yellow-200",
  success: "bg-green-50 border-green-200 text-green-900 dark:bg-green-950/40 dark:border-green-800 dark:text-green-200",
  error:   "bg-red-50 border-red-200 text-red-900 dark:bg-red-950/40 dark:border-red-800 dark:text-red-200",
};

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    const stored = JSON.parse(
      sessionStorage.getItem("dismissed_announcements") ?? "[]"
    ) as string[];
    setDismissed(new Set(stored));

    fetch("/api/announcements")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setAnnouncements(data);
      })
      .catch(() => {});
  }, []);

  function dismiss(id: string) {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(id);
      sessionStorage.setItem(
        "dismissed_announcements",
        JSON.stringify([...next])
      );
      return next;
    });
  }

  const visible = announcements.filter((a) => !dismissed.has(a.id));
  if (visible.length === 0) return null;

  return (
    <div className="space-y-0">
      {visible.map((a) => (
        <div
          key={a.id}
          className={`flex items-start gap-2 border-b px-4 py-2 text-[13px] ${TYPE_STYLES[a.type] ?? TYPE_STYLES.info}`}
        >
          <span className="flex-1">{a.message}</span>
          <button
            onClick={() => dismiss(a.id)}
            aria-label="Dismiss"
            className="ml-2 opacity-60 hover:opacity-100 text-[16px] leading-none"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
