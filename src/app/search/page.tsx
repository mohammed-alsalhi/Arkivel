"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";

type SearchResult = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  highlightedExcerpt: string;
  updatedAt: string;
  category: { id: string; name: string; icon: string | null; slug: string } | null;
  tags: { tag: { id: string; name: string; slug: string } }[];
};

type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
};

type Tag = {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  parentId: string | null;
};

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q")?.trim() || "";

  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Filter state
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Fetch categories and tags on mount
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch(() => {});

    fetch("/api/tags")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setTags(data);
      })
      .catch(() => {});
  }, []);

  const doSearch = useCallback(async () => {
    if (!q || q.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    const params = new URLSearchParams({ q });
    if (selectedCategory) params.set("category", selectedCategory);
    if (selectedTags.length > 0) params.set("tags", selectedTags.join(","));
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);

    try {
      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();
      if (Array.isArray(data)) setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [q, selectedCategory, selectedTags, dateFrom, dateTo]);

  // Search when query or filters change
  useEffect(() => {
    doSearch();
  }, [doSearch]);

  function toggleTag(slug: string) {
    setSelectedTags((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }

  function clearFilters() {
    setSelectedCategory("");
    setSelectedTags([]);
    setDateFrom("");
    setDateTo("");
  }

  const hasFilters = selectedCategory || selectedTags.length > 0 || dateFrom || dateTo;

  if (!q || q.length < 2) {
    return (
      <div>
        <h1
          className="text-[1.7rem] font-normal text-heading border-b border-border pb-1 mb-3"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Search
        </h1>
        <p className="text-[13px] text-muted italic">
          Enter a search query (at least 2 characters) to search the encyclopedia.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1
        className="text-[1.7rem] font-normal text-heading border-b border-border pb-1 mb-1"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Search results
      </h1>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[12px] text-muted">
          {loading
            ? "Searching..."
            : `${results.length} result${results.length !== 1 ? "s" : ""} for \u201C${q}\u201D`}
          {hasFilters && " (filtered)"}
        </p>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-[12px] text-accent hover:underline"
        >
          {showAdvanced ? "Hide" : "Advanced search"}
        </button>
      </div>

      <div className="flex gap-4">
        {/* Filter sidebar */}
        {showAdvanced && (
          <aside className="w-56 flex-shrink-0">
            <div className="wiki-portal">
              <div className="wiki-portal-header">Filters</div>
              <div className="wiki-portal-body space-y-3">
                {/* Category filter */}
                <div>
                  <label className="block text-[11px] text-muted font-bold mb-0.5">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full border border-border bg-surface px-2 py-1 text-[12px] text-foreground focus:border-accent focus:outline-none"
                  >
                    <option value="">All categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tag multi-select */}
                <div>
                  <label className="block text-[11px] text-muted font-bold mb-0.5">
                    Tags
                  </label>
                  <div className="max-h-32 overflow-y-auto border border-border bg-surface p-1">
                    {tags.length === 0 && (
                      <p className="text-[11px] text-muted italic px-1">No tags</p>
                    )}
                    {tags.filter((t) => !t.parentId).map((tag) => (
                      <label
                        key={tag.id}
                        className="flex items-center gap-1.5 px-1 py-0.5 hover:bg-surface-hover cursor-pointer text-[12px]"
                      >
                        <input
                          type="checkbox"
                          checked={selectedTags.includes(tag.slug)}
                          onChange={() => toggleTag(tag.slug)}
                          className="rounded"
                        />
                        {tag.color && (
                          <span
                            className="inline-block w-2 h-2 rounded-full"
                            style={{ backgroundColor: tag.color }}
                          />
                        )}
                        {tag.name}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Date range */}
                <div>
                  <label className="block text-[11px] text-muted font-bold mb-0.5">
                    Date range
                  </label>
                  <div className="space-y-1">
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full border border-border bg-surface px-2 py-1 text-[12px] text-foreground focus:border-accent focus:outline-none"
                      placeholder="From"
                    />
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full border border-border bg-surface px-2 py-1 text-[12px] text-foreground focus:border-accent focus:outline-none"
                      placeholder="To"
                    />
                  </div>
                </div>

                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-[11px] text-wiki-link-broken hover:underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          </aside>
        )}

        {/* Results */}
        <div className="flex-1 min-w-0">
          {results.length === 0 && !loading ? (
            <div className="wiki-notice">
              There were no results matching the query.{" "}
              {hasFilters && (
                <>
                  Try{" "}
                  <button onClick={clearFilters} className="text-accent hover:underline">
                    clearing filters
                  </button>
                  , or{" "}
                </>
              )}
              You can <Link href="/articles/new">create an article</Link> with this title.
            </div>
          ) : (
            <ul className="text-[13px] space-y-2">
              {results.map((article) => (
                <li key={article.id} className="border-b border-border pb-2">
                  <div>
                    <Link
                      href={`/articles/${article.slug}`}
                      className="font-bold text-[15px]"
                      style={{ fontFamily: "var(--font-serif)" }}
                    >
                      {article.title}
                    </Link>
                    {article.category && (
                      <span className="text-muted text-[12px] ml-2">
                        ({article.category.name})
                      </span>
                    )}
                  </div>
                  {article.highlightedExcerpt && (
                    <p
                      className="text-muted mt-0.5 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: article.highlightedExcerpt }}
                    />
                  )}
                  <p className="text-muted text-[11px] mt-0.5">
                    Last edited{" "}
                    {new Date(article.updatedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                    {article.tags.length > 0 && (
                      <>
                        {" "}
                        &mdash; Tags: {article.tags.map(({ tag }) => tag.name).join(", ")}
                      </>
                    )}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="py-8 text-center text-muted italic text-[13px]">Loading...</div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
