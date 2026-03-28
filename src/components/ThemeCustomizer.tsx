"use client";

import { useEffect, useState, useRef } from "react";

const KEY = "wiki_accent_hue";
const DEFAULT_HUE = 220; // default blue-ish

function setAccentHue(hue: number) {
  document.documentElement.style.setProperty("--accent-hue", String(hue));
}

export default function ThemeCustomizer() {
  const [hue, setHue] = useState(DEFAULT_HUE);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if (stored) {
        const h = parseInt(stored, 10);
        setHue(h);
        setAccentHue(h);
      }
    } catch {
      // ignore
    }
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function onChange(h: number) {
    setHue(h);
    setAccentHue(h);
    try { localStorage.setItem(KEY, String(h)); } catch { /* ignore */ }
  }

  function reset() {
    setHue(DEFAULT_HUE);
    document.documentElement.style.removeProperty("--accent-hue");
    try { localStorage.removeItem(KEY); } catch { /* ignore */ }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        title="Customise accent colour"
        className="h-6 w-6 rounded-full border-2 border-border hover:border-accent transition-colors"
        style={{ background: `hsl(${hue}, 65%, 50%)` }}
      />
      {open && (
        <div className="absolute right-0 top-8 z-50 bg-surface border border-border rounded shadow-lg p-3 w-52 space-y-2">
          <p className="text-[11px] text-muted font-medium">Accent colour</p>
          <input
            type="range"
            min={0}
            max={359}
            value={hue}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full accent-current"
            style={{ accentColor: `hsl(${hue}, 65%, 50%)` }}
          />
          <div
            className="h-4 rounded"
            style={{ background: `linear-gradient(to right, hsl(0,65%,50%), hsl(60,65%,50%), hsl(120,65%,50%), hsl(180,65%,50%), hsl(240,65%,50%), hsl(300,65%,50%), hsl(359,65%,50%))` }}
          />
          <button
            onClick={reset}
            className="text-[10px] text-muted hover:text-foreground"
          >
            Reset to default
          </button>
        </div>
      )}
    </div>
  );
}
