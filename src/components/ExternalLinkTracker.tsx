"use client";

import { useEffect } from "react";

/**
 * Intercepts clicks on external links within #article-content and logs them
 * to /api/analytics/external-link (fire-and-forget).
 */
export default function ExternalLinkTracker({ articleId }: { articleId: string }) {
  useEffect(() => {
    const container = document.getElementById("article-content");
    if (!container) return;

    function handleClick(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (!href) return;

      // Only track external links (starting with http/https and not the current origin)
      let isExternal = false;
      try {
        const url = new URL(href, window.location.href);
        isExternal = url.origin !== window.location.origin;
      } catch {
        return;
      }

      if (isExternal) {
        navigator.sendBeacon(
          "/api/analytics/external-link",
          JSON.stringify({ articleId, url: href })
        );
      }
    }

    container.addEventListener("click", handleClick);
    return () => container.removeEventListener("click", handleClick);
  }, [articleId]);

  return null;
}
