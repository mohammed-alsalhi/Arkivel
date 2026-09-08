"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useScrollLock } from "@/lib/useScrollLock";

type Props = {
  categoryId: string;
  categoryName: string;
  articleCount: number;
};

export default function SynthesizeButton({ categoryId, categoryName, articleCount }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ title: string; html: string; articleTitles: string[] } | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const handleSynthesize = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    setOpen(true);
    try {
      const res = await fetch("/api/ai/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "Synthesis failed");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setResult(data);
    } catch {
      setError("Network error");
    }
    setLoading(false);
  };

  const handleCreateArticle = () => {
    if (!result) return;
    try {
      sessionStorage.setItem(
        "wiki_synthesize_draft",
        JSON.stringify({ title: result.title, html: result.html })
      );
    } catch { /* noop */ }
    router.push("/articles/new?from=synthesize");
  };

  if (articleCount < 2) return null;

  return (
    <>
      <button
        onClick={handleSynthesize}
        className="ui-button"
        title={`AI synthesizes all ${articleCount} articles in this category into a new overview article`}
      >
        Synthesize
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 px-4" onClick={() => setOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Knowledge Synthesis"
            className="bg-surface border border-border rounded shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-3 border-b border-border shrink-0">
              <div className="min-w-0">
                <h2 className="text-[15px] font-semibold text-heading">Knowledge Synthesis</h2>
                <p className="mt-0.5 break-words text-[11px] text-muted">
                  AI is synthesising {articleCount} articles in &ldquo;{categoryName}&rdquo;
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="ui-icon-button"
                title="Close synthesis"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {loading && (
                <div className="flex flex-col items-center justify-center h-48 gap-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                  <p className="text-[13px] text-muted">Reading and synthesising articles…</p>
                </div>
              )}

              {error && (
                <div className="text-danger text-[13px] p-4 bg-danger-soft border border-danger-border">
                  {error}
                </div>
              )}

              {result && (
                <div className="space-y-4">
                  <div>
                    <p className="text-[11px] text-muted uppercase font-medium mb-1">
                      Sources used ({result.articleTitles.length} articles)
                    </p>
                    <p className="break-words text-[12px] text-muted">
                      {result.articleTitles.join(" · ")}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted uppercase font-medium mb-2 break-words">
                      Generated article: {result.title}
                    </p>
                    <div
                      className="prose prose-sm max-w-none border border-border p-4 bg-background text-[13px] leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: result.html }}
                    />
                  </div>
                </div>
              )}
            </div>

            {result && (
              <div className="shrink-0 px-5 py-3 border-t border-border flex flex-wrap items-center gap-2">
                <button
                  onClick={handleCreateArticle}
                  className="ui-button ui-button-primary"
                >
                  Create as new article
                </button>
                <button
                  onClick={handleSynthesize}
                  className="ui-button"
                >
                  Regenerate
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="ui-button sm:ml-auto"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
