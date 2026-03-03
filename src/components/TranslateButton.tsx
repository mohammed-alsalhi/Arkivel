"use client";

import { useState } from "react";

const LOCALES = [
  { code: "ar", label: "Arabic" },
  { code: "zh", label: "Chinese" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "he", label: "Hebrew" },
  { code: "ja", label: "Japanese" },
  { code: "pt", label: "Portuguese" },
  { code: "ru", label: "Russian" },
  { code: "es", label: "Spanish" },
];

interface Props {
  articleId: string;
}

export default function TranslateButton({ articleId }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ id?: string; error?: string } | null>(null);

  async function translate(locale: string) {
    setOpen(false);
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/articles/${articleId}/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetLocale: locale }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ error: "Network error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={loading}
        className="text-xs px-2 py-0.5 border border-border rounded hover:bg-surface-hover disabled:opacity-50"
        aria-haspopup="true"
        aria-expanded={open}
      >
        {loading ? "Translating…" : "Translate ▾"}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 bg-surface border border-border rounded shadow-lg min-w-[140px]">
          {LOCALES.map(({ code, label }) => (
            <button
              key={code}
              onClick={() => translate(code)}
              className="block w-full text-left px-3 py-1.5 text-xs hover:bg-surface-hover"
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {result?.id && (
        <span className="ml-2 text-xs text-green-600">Translation created as draft</span>
      )}
      {result?.error && (
        <span className="ml-2 text-xs text-red-500">{result.error}</span>
      )}
    </div>
  );
}
