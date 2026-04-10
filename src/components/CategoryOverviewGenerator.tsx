"use client";

import { useState } from "react";

type Props = { categoryId: string };

export default function CategoryOverviewGenerator({ categoryId }: Props) {
  const [overview, setOverview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function generate() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/category-overview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId }),
      });
      if (res.ok) {
        const { overview: text } = await res.json();
        setOverview(text);
        setOpen(true);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }

  return (
    <div>
      <button
        onClick={open ? () => setOpen(false) : overview ? () => setOpen(true) : generate}
        disabled={loading}
        className="h-6 px-2 text-[11px] border border-border rounded text-muted hover:text-foreground hover:bg-surface-hover transition-colors flex items-center gap-1 disabled:opacity-50"
        title="Generate an AI overview of this category"
      >
        {loading ? (
          <>
            <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:300ms]" />
          </>
        ) : (
          <>
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            {open ? "Hide overview" : overview ? "Show overview" : "Generate overview"}
          </>
        )}
      </button>

      {open && overview && (
        <div className="mt-3 p-3 bg-surface border border-border rounded text-[13px] text-foreground leading-relaxed whitespace-pre-wrap">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-accent">AI-generated overview</p>
            <button
              onClick={generate}
              disabled={loading}
              className="text-[10px] text-muted hover:text-foreground disabled:opacity-50"
            >
              Regenerate
            </button>
          </div>
          {overview}
        </div>
      )}
    </div>
  );
}
