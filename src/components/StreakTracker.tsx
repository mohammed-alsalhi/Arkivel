"use client";

import { useEffect } from "react";

/**
 * StreakTracker — fires a fire-and-forget POST to /api/reading-streak on mount
 * to record that the current user read an article today.
 */
export default function StreakTracker() {
  useEffect(() => {
    fetch("/api/reading-streak", { method: "POST" }).catch(() => {});
  }, []);
  return null;
}
