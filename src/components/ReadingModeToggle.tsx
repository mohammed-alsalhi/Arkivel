"use client";

import { useEffect, useState } from "react";

export default function ReadingModeToggle() {
  const [active, setActive] = useState(false);

  // Restore from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("readingMode");
    if (stored === "1") {
      setActive(true);
      document.documentElement.setAttribute("data-reading-mode", "1");
    }
  }, []);

  // Keyboard shortcut: R (when not in input/editor)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      const isInput = tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement).isContentEditable;
      if (e.key === "r" && !isInput && !e.ctrlKey && !e.metaKey) {
        toggle();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  function toggle() {
    const next = !active;
    setActive(next);
    if (next) {
      document.documentElement.setAttribute("data-reading-mode", "1");
      localStorage.setItem("readingMode", "1");
    } else {
      document.documentElement.removeAttribute("data-reading-mode");
      localStorage.removeItem("readingMode");
    }
  }

  return (
    <button
      onClick={toggle}
      title={active ? "Exit reading mode (R)" : "Enter reading mode (R)"}
      aria-pressed={active}
      className="ui-button"
    >
      {active ? "Exit reading mode" : "Reading mode"}
    </button>
  );
}
