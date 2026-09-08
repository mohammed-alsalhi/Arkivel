"use client";

import { useEffect } from "react";

interface Props {
  articleId: string;
}

/**
 * Silently records the current page's referrer for analytics.
 * Fires one POST to /api/analytics/referrer on mount.
 */
export default function ReferrerTracker({ articleId }: Props) {
  useEffect(() => {
    const referrer = typeof document !== "undefined" ? document.referrer : "";
    fetch("/api/analytics/referrer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleId, referrer }),
    }).catch(() => {});
  }, [articleId]);

  return null;
}
