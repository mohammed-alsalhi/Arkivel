"use client";

import { useEffect, useState } from "react";

const KEY = "wiki_text_only";
const STYLE_ID = "wiki-text-only-style";

export default function TextOnlyToggle() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY) === "1";
      setActive(stored);
      if (stored) inject();
    } catch {
      // ignore
    }
  }, []);

  function inject() {
    if (!document.getElementById(STYLE_ID)) {
      const s = document.createElement("style");
      s.id = STYLE_ID;
      s.textContent = "#article-content img, #article-content figure, #article-content video, #article-content iframe { display: none !important; }";
      document.head.appendChild(s);
    }
  }

  function remove() {
    document.getElementById(STYLE_ID)?.remove();
  }

  function toggle() {
    const next = !active;
    setActive(next);
    try { localStorage.setItem(KEY, next ? "1" : "0"); } catch { /* ignore */ }
    if (next) inject(); else remove();
  }

  return (
    <button
      onClick={toggle}
      title={active ? "Show images" : "Text-only mode (hide images)"}
      aria-pressed={active}
      className="ui-button w-6 px-0"
    >
      T
    </button>
  );
}
