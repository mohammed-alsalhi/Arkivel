"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type HotArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  views: number;
};

export default function HotArticles({ days = 7, limit = 5 }: { days?: number; limit?: number }) {
  const [articles, setArticles] = useState<HotArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/articles/hot?days=${days}&limit=${limit}`)
      .then((r) => r.json())
      .then((data) => { setArticles(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [days, limit]);

  if (loading) return null;
  if (articles.length === 0) return null;

  return (
    <div className="mt-4">
      <h3
        className="text-sm font-semibold text-heading border-b border-border pb-1 mb-2"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Trending this week
      </h3>
      <ol className="space-y-1 text-[12px]">
        {articles.map((a, i) => (
          <li key={a.id} className="flex items-start gap-2">
            <span className="text-muted opacity-60 w-4 shrink-0 text-right">{i + 1}.</span>
            <div className="min-w-0">
              <Link href={`/articles/${a.slug}`} className="text-wiki-link hover:underline line-clamp-1">
                {a.title}
              </Link>
              <span className="text-muted opacity-60 ml-1">· {a.views.toLocaleString()} view{a.views !== 1 ? "s" : ""}</span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
