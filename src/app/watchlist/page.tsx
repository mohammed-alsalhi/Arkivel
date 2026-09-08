"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button, EmptyState, LinkButton, Page, PageHeader, Section } from "@/components/ui";

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
    category: { name: string } | null;
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
      <Page>
        <PageHeader title="Watchlist" description="Loading your watched articles." />
        <p className="py-4 text-center text-muted italic text-[13px]">Loading...</p>
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader
        title="Watchlist"
        description={
          error
            ? "Sign in to track article updates."
            : `You are watching ${entries.length} article${entries.length !== 1 ? "s" : ""}.`
        }
        actions={
          <>
            <LinkButton href="/watchlist/digest">Digest</LinkButton>
            <LinkButton href="/articles">Browse</LinkButton>
          </>
        }
      />
      {error ? (
        <EmptyState
          title="Sign in required"
          description={error}
          actions={<LinkButton href="/login" variant="primary">Log in</LinkButton>}
        />
      ) : entries.length === 0 ? (
        <EmptyState
          title="Your watchlist is empty"
          description="Visit an article and add it to your watchlist to track changes."
          actions={<LinkButton href="/articles" variant="primary">Browse articles</LinkButton>}
        />
      ) : (
        <Section title="Watched articles">
          <ul className="wiki-compact-list text-[13px]">
            {entries.map((entry) => (
              <li key={entry.articleId} className="wiki-compact-list-item">
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/articles/${entry.article.slug}`}
                      className="font-serif text-[15px] font-bold"
                    >
                      {entry.article.title}
                    </Link>
                    {entry.article.category && (
                      <span className="text-muted text-[12px] ml-2">
                        ({entry.article.category.name})
                      </span>
                    )}
                  </div>
                  <Button
                    onClick={() => handleRemove(entry.articleId)}
                    className="flex-shrink-0"
                    variant="danger"
                  >
                    Unwatch
                  </Button>
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
        </Section>
      )}
    </Page>
  );
}
