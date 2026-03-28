"use client";

import { useEffect, useState } from "react";

const KEY = "wiki_night_mode";
const CLASS = "night-reading";

export default function NightModeToggle() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY) === "1";
      setActive(stored);
      if (stored) document.documentElement.classList.add(CLASS);
    } catch {
      // ignore
    }
  }, []);

  function toggle() {
    const next = !active;
    setActive(next);
    try { localStorage.setItem(KEY, next ? "1" : "0"); } catch { /* ignore */ }
    document.documentElement.classList.toggle(CLASS, next);
  }

  return (
    <button
      onClick={toggle}
      title={active ? "Exit night mode" : "Night reading mode (warm)"}
      className={`h-6 px-2 text-[11px] border rounded transition-colors ${
        active
          ? "border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
          : "border-border text-muted hover:text-foreground"
      }`}
    >
      {active ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/></svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 100 10A5 5 0 0012 7z"/></svg>
      )}
    </button>
  );
}
