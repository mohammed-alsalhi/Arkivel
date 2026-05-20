"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

type SearchResult = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: { name: string } | null;
};

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);

  // Clear search on navigation
  useEffect(() => {
    setQuery("");
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}&limit=5`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
        setOpen(true);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
      setQuery("");
      setOpen(false);
    }
  }

  return (
    <div ref={ref} className="relative min-w-0">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <svg
            className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" strokeWidth="2" />
            <path d="m21 21-4.3-4.3" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles"
            className="ui-input wiki-header-search pl-7 pr-2"
          />
        </div>
      </form>

      {open && results.length > 0 && (
        <div className="ui-dropdown wiki-search-dropdown">
          {results.map((result) => (
            <Link
              key={result.id}
              href={`/articles/${result.slug}`}
              onClick={() => { setOpen(false); setQuery(""); }}
              className="flex flex-col border-b border-border-light px-3 py-1.5 last:border-0 hover:bg-surface-hover hover:no-underline"
            >
              <span className="text-[13px] text-wiki-link">
                {result.title}
              </span>
              {result.excerpt && (
                <span className="mt-0.5 line-clamp-1 text-[11px] text-muted">
                  {result.excerpt}
                </span>
              )}
            </Link>
          ))}
          <Link
            href={`/search?q=${encodeURIComponent(query.trim())}`}
            onClick={() => { setOpen(false); setQuery(""); }}
            className="ui-dropdown-item border-t border-border text-center text-wiki-link"
          >
            See all results
          </Link>
        </div>
      )}
    </div>
  );
}
