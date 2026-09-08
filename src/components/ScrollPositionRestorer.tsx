"use client";

import { useEffect, useRef } from "react";

const STORAGE_KEY = "wiki_scroll_positions";
const MAX_ENTRIES = 50;

type PositionMap = Record<string, number>; // slug → scrollY

function getPositions(): PositionMap {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function savePosition(slug: string, y: number) {
  try {
    const map = getPositions();
    map[slug] = y;
    // Trim to MAX_ENTRIES (keep most-recently-saved)
    const keys = Object.keys(map);
    if (keys.length > MAX_ENTRIES) {
      const toRemove = keys.slice(0, keys.length - MAX_ENTRIES);
      toRemove.forEach((k) => delete map[k]);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // localStorage may be unavailable
  }
}

/**
 * Restores the last scroll position for this article slug on mount,
 * and saves the current scroll position periodically as the user reads.
 */
export default function ScrollPositionRestorer({ slug }: { slug: string }) {
  const restoredRef = useRef(false);

  // Restore scroll on mount (after a brief delay to let content paint)
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;

    const positions = getPositions();
    const saved = positions[slug];
    if (!saved || saved < 100) return;

    // Small delay ensures the page has rendered its full height
    const t = setTimeout(() => {
      window.scrollTo({ top: saved, behavior: "instant" });
    }, 120);
    return () => clearTimeout(t);
  }, [slug]);

  // Save position on scroll (throttled)
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    function onScroll() {
      if (timer) return;
      timer = setTimeout(() => {
        savePosition(slug, window.scrollY);
        timer = null;
      }, 500);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (timer) clearTimeout(timer);
    };
  }, [slug]);

  return null;
}
