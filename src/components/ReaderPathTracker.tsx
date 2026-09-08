"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

interface Props {
  currentSlug: string;
}

function getSessionId(): string {
  let id = sessionStorage.getItem("wikiSessionId");
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem("wikiSessionId", id);
  }
  return id;
}

export default function ReaderPathTracker({ currentSlug }: Props) {
  const pathname = usePathname();

  useEffect(() => {
    const prev = sessionStorage.getItem("wikiLastSlug");
    if (prev && prev !== currentSlug) {
      const sessionId = getSessionId();
      fetch("/api/analytics/paths", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromSlug: prev, toSlug: currentSlug, sessionId }),
      }).catch(() => {});
    }
    sessionStorage.setItem("wikiLastSlug", currentSlug);
  }, [currentSlug, pathname]);

  return null;
}
