"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * Prefetches article pages when the user hovers over internal article links.
 * Works on all <a> elements pointing to /articles/* within the page.
 */
export default function PrefetchArticleLinks() {
  const router = useRouter();
  const prefetched = useRef<Set<string>>(new Set());

  useEffect(() => {
    function handleMouseEnter(e: MouseEvent) {
      const a = (e.target as HTMLElement).closest("a");
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href) return;
      // Only prefetch internal /articles/ routes
      if (!href.startsWith("/articles/")) return;
      // Avoid duplicate prefetches
      if (prefetched.current.has(href)) return;
      prefetched.current.add(href);
      router.prefetch(href);
    }

    document.addEventListener("mouseover", handleMouseEnter, { passive: true });
    return () => document.removeEventListener("mouseover", handleMouseEnter);
  }, [router]);

  return null;
}
