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
  category: { id: string; name: string; slug: string } | null;
  tags: { tag: { id: string; name: string; slug: string } }[];
};

type Category = {
  id: string;
  name: string;
  slug: string;
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
  const [qaAnswer, setQaAnswer] = useState<{ answer: string; sources: { id: string; title: string; slug: string }[] } | null>(null);
  const [qaLoading, setQaLoading] = useState(false);
  const [federatedResults, setFederatedResults] = useState<{ peerName: string; peerUrl: string; id: string; title: string; slug: string; excerpt: string | null; url: string }[]>([]);
  const [federatedLoading, setFederatedLoading] = useState(false);

  // Filter state
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [wordCountMin, setWordCountMin] = useState("");
  const [wordCountMax, setWordCountMax] = useState("");

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
    if (wordCountMin) params.set("wordCountMin", wordCountMin);
    if (wordCountMax) params.set("wordCountMax", wordCountMax);

    try {
      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();
      if (Array.isArray(data)) setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [q, selectedCategory, selectedTags, dateFrom, dateTo, wordCountMin, wordCountMax]);

  // Search when query or filters change
  useEffect(() => {
    doSearch();
  }, [doSearch]);

  // Federated search
  useEffect(() => {
    if (!q || q.length < 2) { setFederatedResults([]); return; }
    setFederatedLoading(true);
    fetch(`/api/federated-search?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setFederatedResults(data); })
      .catch(() => {})
      .finally(() => setFederatedLoading(false));
  }, [q]);

  // Q&A: trigger when query looks like a question
  useEffect(() => {
    if (!q || q.length < 5) { setQaAnswer(null); return; }
    const isQuestion = /^(what|who|when|where|why|how|is|are|can|does|did|was|were)\b/i.test(q) || q.endsWith("?");
    if (!isQuestion) { setQaAnswer(null); return; }

    setQaLoading(true);
    setQaAnswer(null);
    fetch("/api/ai/qa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: q }),
    })
      .then((r) => r.json())
      .then((data) => { if (data.answer) setQaAnswer(data); })
      .catch(() => {})
      .finally(() => setQaLoading(false));
  }, [q]);

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
    setWordCountMin("");
    setWordCountMax("");
  }

  const hasFilters = selectedCategory || selectedTags.length > 0 || dateFrom || dateTo || wordCountMin || wordCountMax;

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

      {/* Q&A answer panel */}
      {(qaLoading || qaAnswer) && (
        <div className="mb-4 border border-accent/30 bg-accent/5 px-4 py-3">
          <p className="text-[11px] font-bold text-accent uppercase tracking-wide mb-1">Direct answer</p>
          {qaLoading ? (
            <p className="text-[13px] text-muted italic">Searching for an answer...</p>
          ) : qaAnswer ? (
            <>
              <p className="text-[13px] text-foreground">{qaAnswer.answer}</p>
              {qaAnswer.sources.length > 0 && (
                <p className="text-[11px] text-muted mt-2">
                  Sources:{" "}
                  {qaAnswer.sources.map((s, i) => (
                    <span key={s.id}>
                      {i > 0 && ", "}
                      <a href={`/articles/${s.slug}`} className="text-accent hover:underline">{s.title}</a>
                    </span>
                  ))}
                </p>
              )}
            </>
          ) : null}
        </div>
      )}

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
                        {cat.name}
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

                {/* Word count range */}
                <div>
                  <label className="block text-[11px] text-muted font-bold mb-0.5">
                    Word count
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      value={wordCountMin}
                      onChange={(e) => setWordCountMin(e.target.value)}
                      placeholder="Min"
                      className="w-full border border-border bg-surface px-2 py-1 text-[12px] text-foreground focus:border-accent focus:outline-none"
                    />
                    <span className="text-muted text-[11px] shrink-0">–</span>
                    <input
                      type="number"
                      min="0"
                      value={wordCountMax}
                      onChange={(e) => setWordCountMax(e.target.value)}
                      placeholder="Max"
                      className="w-full border border-border bg-surface px-2 py-1 text-[12px] text-foreground focus:border-accent focus:outline-none"
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

      {/* Federated results */}
      {(federatedLoading || federatedResults.length > 0) && (
        <div className="mt-6">
          <h2
            className="text-base font-normal text-heading border-b border-border pb-0.5 mb-2"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Results from other wikis
          </h2>
          {federatedLoading ? (
            <p className="text-[13px] text-muted italic">Searching federated wikis…</p>
          ) : (
            <ul className="text-[13px] space-y-2">
              {federatedResults.map((r) => (
                <li key={`${r.peerUrl}/${r.id}`} className="border-b border-border pb-2">
                  <div>
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-[15px]"
                      style={{ fontFamily: "var(--font-serif)" }}
                    >
                      {r.title}
                    </a>
                    <span className="text-muted text-[12px] ml-2">({r.peerName})</span>
                  </div>
                  {r.excerpt && (
                    <p className="text-muted mt-0.5 leading-relaxed">{r.excerpt}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
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
