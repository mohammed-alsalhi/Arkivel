"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { getSearchResults } from "@/lib/search-response";

type SearchResult = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: { name: string } | null;
};

type Props = {
  active: boolean;
  query: string;
  position: { top: number; left: number };
  onSelect: (title: string) => void;
  onDismiss: () => void;
};

export default function WikiLinkSuggester({
  active,
  query,
  position,
  onSelect,
  onDismiss,
}: Props) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (!active) {
      setResults([]);
      setSelectedIndex(0);
      return;
    }

    const trimmed = query.trim();
    if (trimmed.length < 1) {
      setResults([]);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(trimmed)}&limit=8`
        );
        if (res.ok) {
          const data = await res.json();
          setResults(getSearchResults<SearchResult>(data));
          setSelectedIndex(0);
        }
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, active]);

  // Keyboard navigation
  const onSelectStable = useCallback(onSelect, [onSelect]);
  const onDismissStable = useCallback(onDismiss, [onDismiss]);

  useEffect(() => {
    if (!active) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && results.length > 0) {
        e.preventDefault();
        e.stopPropagation();
        onSelectStable(results[selectedIndex]?.title);
      } else if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onDismissStable();
      }
    }

    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [active, results, selectedIndex, onSelectStable, onDismissStable]);

  // Click outside
  useEffect(() => {
    if (!active) return;
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        onDismiss();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [active, onDismiss]);

  if (!active) return null;

  const dropdown = (
    <div
      ref={containerRef}
      className="wiki-link-suggester"
      style={{
        position: "fixed",
        top: position.top + 4,
        left: position.left,
        zIndex: 9999,
      }}
    >
      {results.length === 0 && query.trim().length > 0 && !loading && (
        <div className="wiki-link-suggester-hint">
          No articles found. Type ]] to create link anyway.
        </div>
      )}
      {results.length === 0 && query.trim().length === 0 && (
        <div className="wiki-link-suggester-hint">Type an article name...</div>
      )}
      {loading && results.length === 0 && (
        <div className="wiki-link-suggester-hint">Searching...</div>
      )}
      {results.map((result, i) => (
        <button
          key={result.id}
          type="button"
          className={`wiki-link-suggester-item ${
            i === selectedIndex ? "wiki-link-suggester-item-active" : ""
          }`}
          onMouseEnter={() => setSelectedIndex(i)}
          onMouseDown={(e) => {
            e.preventDefault();
            onSelect(result.title);
          }}
        >
          <span className="wiki-link-suggester-title">{result.title}</span>
          {result.category && (
            <span className="wiki-link-suggester-category">
              {result.category.name}
            </span>
          )}
        </button>
      ))}
    </div>
  );

  return createPortal(dropdown, document.body);
}
