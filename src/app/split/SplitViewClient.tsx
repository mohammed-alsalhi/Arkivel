"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getSearchResults } from "@/lib/search-response";

function ArticleFrame({ slug }: { slug: string }) {
  return (
    <iframe
      src={`/articles/${encodeURIComponent(slug)}`}
      className="w-full h-full border-none"
      title={`Article: ${slug}`}
    />
  );
}

function SlugPicker({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<{ title: string; slug: string }[]>([]);
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setQuery(value); }, [value]);

  function handleChange(v: string) {
    setQuery(v);
    if (timer.current) clearTimeout(timer.current);
    if (v.length < 2) { setResults([]); setOpen(false); return; }
    timer.current = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(v)}&limit=8`)
        .then((r) => r.ok ? r.json() : [])
        .then((data) => {
          const nextResults = getSearchResults<{ id: string; title: string; slug: string }>(data);
          setResults(nextResults);
          setOpen(nextResults.length > 0);
        })
        .catch(() => {});
    }, 250);
  }

  return (
    <div className="relative flex-1">
      <input
        type="text"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-border rounded px-2 py-1 text-sm bg-background text-heading placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent"
        onFocus={() => { if (results.length > 0) setOpen(true); }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 bg-surface border border-border rounded shadow-lg max-h-48 overflow-y-auto">
          {results.map((r) => (
            <button
              key={r.slug}
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted/30 text-heading"
              onMouseDown={() => { onChange(r.slug); setQuery(r.title); setOpen(false); }}
            >
              {r.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SplitViewClient() {
  const params = useSearchParams();
  const [leftSlug, setLeftSlug] = useState(params.get("left") || "");
  const [rightSlug, setRightSlug] = useState(params.get("right") || "");
  const [splitPos, setSplitPos] = useState(50); // percent
  const dragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const onDividerMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
  }, []);

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = Math.min(80, Math.max(20, ((e.clientX - rect.left) / rect.width) * 100));
      setSplitPos(pct);
    }
    function onUp() { dragging.current = false; }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-surface flex-shrink-0">
        <span className="text-[11px] font-semibold text-muted uppercase">Split View</span>
        <span className="w-px h-4 bg-border mx-0.5" />
        <SlugPicker value={leftSlug} onChange={setLeftSlug} placeholder="Left article slug…" />
        <span className="w-px h-4 bg-border mx-0.5" />
        <SlugPicker value={rightSlug} onChange={setRightSlug} placeholder="Right article slug…" />
      </div>

      {/* Split panes */}
      <div ref={containerRef} className="flex flex-1 overflow-hidden relative">
        {/* Left pane */}
        <div style={{ width: `${splitPos}%` }} className="overflow-auto border-r border-border">
          {leftSlug ? (
            <ArticleFrame slug={leftSlug} />
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-muted">
              Search for an article above
            </div>
          )}
        </div>

        {/* Divider */}
        <div
          className="w-1.5 bg-border hover:bg-accent/40 cursor-col-resize flex-shrink-0 transition-colors"
          onMouseDown={onDividerMouseDown}
        />

        {/* Right pane */}
        <div style={{ width: `${100 - splitPos}%` }} className="overflow-auto">
          {rightSlug ? (
            <ArticleFrame slug={rightSlug} />
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-muted">
              Search for an article above
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
