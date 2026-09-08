"use client";

import { useEffect, useRef } from "react";

interface Props {
  articleId: string;
}

function getSessionId(): string {
  let id = sessionStorage.getItem("wikiSessionId");
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem("wikiSessionId", id);
  }
  return id;
}

export default function ScrollDepthTracker({ articleId }: Props) {
  const maxDepthRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const sessionId = getSessionId();

    function onScroll() {
      const scrolled = window.scrollY + window.innerHeight;
      const total = document.documentElement.scrollHeight;
      const depth = Math.round((scrolled / total) * 100);

      if (depth > maxDepthRef.current) {
        maxDepthRef.current = depth;

        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          fetch("/api/analytics/scroll", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ articleId, depth: maxDepthRef.current, sessionId }),
          }).catch(() => {});
        }, 2000);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [articleId]);

  return null;
}
