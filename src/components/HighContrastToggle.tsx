"use client";

import { useEffect, useState } from "react";

const KEY = "wiki_high_contrast";
const CLASS = "high-contrast";

export default function HighContrastToggle() {
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
      title={active ? "Exit high-contrast mode" : "High-contrast accessibility mode"}
      aria-pressed={active}
      className="ui-button w-6 px-0 font-bold"
    >
      A
    </button>
  );
}
