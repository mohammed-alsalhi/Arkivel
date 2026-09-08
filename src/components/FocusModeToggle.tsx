"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "wiki_focus_mode";
const STYLE_ID = "wiki-focus-mode-style";

const FOCUS_CSS = `
#article-content > * { transition: opacity 0.15s; }
#article-content:focus-within > *,
#article-content:hover > * { opacity: 0.3; }
#article-content > *:hover,
#article-content > *:focus-within { opacity: 1 !important; }
`;

export default function FocusModeToggle() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) === "1";
    setActive(saved);
    if (saved) injectStyle();
  }, []);

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = FOCUS_CSS;
    document.head.appendChild(style);
  }

  function removeStyle() {
    document.getElementById(STYLE_ID)?.remove();
  }

  function toggle() {
    const next = !active;
    setActive(next);
    localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    if (next) injectStyle();
    else removeStyle();
  }

  return (
    <button
      onClick={toggle}
      title={active ? "Disable focus mode" : "Enable focus mode (dim non-active paragraphs)"}
      aria-pressed={active}
      className="ui-button"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
      Focus
    </button>
  );
}
