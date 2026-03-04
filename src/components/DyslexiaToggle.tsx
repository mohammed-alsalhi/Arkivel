"use client";

import { useEffect, useState } from "react";

export default function DyslexiaToggle() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("dyslexia-mode") === "1";
    setEnabled(saved);
    if (saved) document.documentElement.setAttribute("data-dyslexia", "1");
  }, []);

  function toggle() {
    const next = !enabled;
    setEnabled(next);
    if (next) {
      document.documentElement.setAttribute("data-dyslexia", "1");
      localStorage.setItem("dyslexia-mode", "1");
    } else {
      document.documentElement.removeAttribute("data-dyslexia");
      localStorage.removeItem("dyslexia-mode");
    }
  }

  return (
    <button
      onClick={toggle}
      title={enabled ? "Disable dyslexia-friendly mode" : "Enable dyslexia-friendly mode"}
      aria-pressed={enabled}
      className={`flex items-center h-6 px-2 text-[11px] border rounded transition-colors ${
        enabled
          ? "border-accent bg-accent/10 text-accent"
          : "border-border text-muted hover:text-foreground hover:bg-surface-hover"
      }`}
    >
      Aa
    </button>
  );
}
