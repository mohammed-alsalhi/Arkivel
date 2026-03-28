"use client";

import { useEffect, useState } from "react";

const KEY = "wiki_font_pref";
const fonts: { label: string; value: string; css: string }[] = [
  { label: "Default", value: "default", css: "" },
  { label: "Serif", value: "serif", css: "Georgia, 'Times New Roman', serif" },
  { label: "Sans", value: "sans", css: "'Segoe UI', Arial, sans-serif" },
  { label: "Mono", value: "mono", css: "'Courier New', Courier, monospace" },
];
const STYLE_ID = "wiki-font-pref-style";

function applyFont(css: string) {
  document.getElementById(STYLE_ID)?.remove();
  if (!css) return;
  const s = document.createElement("style");
  s.id = STYLE_ID;
  s.textContent = `#article-content { font-family: ${css} !important; }`;
  document.head.appendChild(s);
}

export default function FontPreference() {
  const [value, setValue] = useState("default");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY) || "default";
      setValue(stored);
      const font = fonts.find((f) => f.value === stored);
      if (font) applyFont(font.css);
    } catch {
      // ignore
    }
  }, []);

  function onChange(v: string) {
    setValue(v);
    const font = fonts.find((f) => f.value === v);
    applyFont(font?.css || "");
    try { localStorage.setItem(KEY, v); } catch { /* ignore */ }
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      title="Article font preference"
      className="h-6 px-1 text-[11px] border border-border rounded bg-surface text-foreground"
    >
      {fonts.map((f) => (
        <option key={f.value} value={f.value}>{f.label}</option>
      ))}
    </select>
  );
}
