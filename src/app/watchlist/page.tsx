"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type WatchlistEntry = {
  userId: string;
  articleId: string;
  createdAt: string;
  article: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    updatedAt: string;
    category: { name: string; icon: string | null } | null;
  };
};

export default function WatchlistPage() {
  const [entries, setEntries] = useState<WatchlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/watchlist")
      .then((r) => {
        if (r.status === 401) throw new Error("auth");
        return r.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setEntries(data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.message === "auth") {
          setError("You must be logged in to view your watchlist.");
        } else {
          setError("Failed to load watchlist.");
        }
        setLoading(false);
      });
  }, []);

  async function handleRemove(articleId: string) {
    const res = await fetch("/api/watchlist", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleId }),
    });

    if (res.ok) {
      setEntries((prev) => prev.filter((e) => e.articleId !== articleId));
    }
  }

  if (loading) {
    return (
      <div className="py-8 text-center text-muted italic text-[13px]">Loading...</div>
    );
  }

  return (
    <div>
      <h1
        className="text-[1.7rem] font-normal text-heading border-b border-border pb-1 mb-3"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Watchlist
      </h1>

      {error ? (
        <div className="wiki-notice">
          {error}{" "}
          <Link href="/login" className="text-accent hover:underline">
            Log in
          </Link>
        </div>
      ) : entries.length === 0 ? (
        <div className="wiki-notice">
          Your watchlist is empty. Visit an article and add it to your watchlist to track changes.
        </div>
      ) : (
        <>
          <p className="text-[12px] text-muted mb-3">
            You are watching {entries.length} article{entries.length !== 1 ? "s" : ""}.
          </p>
          <ul className="text-[13px] space-y-2">
            {entries.map((entry) => (
              <li key={entry.articleId} className="border-b border-border pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <Link
                      href={`/articles/${entry.article.slug}`}
                      className="font-bold text-[15px]"
                      style={{ fontFamily: "var(--font-serif)" }}
                    >
                      {entry.article.title}
                    </Link>
                    {entry.article.category && (
                      <span className="text-muted text-[12px] ml-2">
                        ({entry.article.category.icon} {entry.article.category.name})
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemove(entry.articleId)}
                    className="text-[11px] text-wiki-link-broken hover:underline flex-shrink-0 ml-2"
                  >
                    Unwatch
                  </button>
                </div>
                {entry.article.excerpt && (
                  <p className="text-muted mt-0.5 leading-relaxed text-[12px]">
                    {entry.article.excerpt}
                  </p>
                )}
                <p className="text-muted text-[11px] mt-0.5">
                  Last edited{" "}
                  {new Date(entry.article.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
