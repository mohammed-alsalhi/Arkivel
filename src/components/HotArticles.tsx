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
    <div className="wiki-portal">
      <div className="wiki-portal-header">Trending this week</div>
      <div className="wiki-portal-body p-0">
        <ol className="wiki-compact-list">
          {articles.map((a, i) => (
            <li key={a.id} className="wiki-compact-list-item wiki-compact-list-ranked">
              <span className="wiki-compact-rank">{i + 1}</span>
              <div className="min-w-0">
                <Link href={`/articles/${a.slug}`} className="wiki-compact-list-title">
                  {a.title}
                </Link>
                <span className="wiki-compact-list-meta">
                  {a.views.toLocaleString()} view{a.views !== 1 ? "s" : ""}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
