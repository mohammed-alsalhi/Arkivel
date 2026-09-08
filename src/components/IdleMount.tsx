"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Renders nothing until the browser is idle, then mounts its children.
 * Used to defer non-visual, non-critical work (analytics trackers, the chat
 * assistant, link prefetching) past the article's first paint and hydration
 * so it doesn't compete with content for main-thread time.
 *
 * Falls back to a timeout where requestIdleCallback is unavailable (Safari).
 */
export default function IdleMount({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    type IdleWindow = Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (handle: number) => void;
    };
    const w = window as IdleWindow;

    if (typeof w.requestIdleCallback === "function") {
      const handle = w.requestIdleCallback(() => setReady(true), { timeout: 2500 });
      return () => w.cancelIdleCallback?.(handle);
    }

    const timer = window.setTimeout(() => setReady(true), 2500);
    return () => window.clearTimeout(timer);
  }, []);

  if (!ready) return null;
  return <>{children}</>;
}
