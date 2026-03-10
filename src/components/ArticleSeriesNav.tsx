"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type SeriesMember = { position: number; article: { title: string; slug: string } };
type SeriesInfo = { id: string; name: string; slug: string; members: SeriesMember[] };

export default function ArticleSeriesNav({ articleId }: { articleId: string }) {
  const [info, setInfo] = useState<{ series: SeriesInfo; position: number } | null>(null);

  useEffect(() => {
    // Find all series containing this article
    fetch("/api/series")
      .then((r) => r.json())
      .then((data: SeriesInfo[]) => {
        for (const s of data) {
          const member = s.members.find((m) => {
            // match by slug via the article prop stored in series members
            return (m as SeriesMember & { article: { id?: string } }).article?.id === articleId ||
              (m as SeriesMember & { article: { id?: string } }).article?.id === articleId;
          });
          if (member) {
            setInfo({ series: s, position: member.position });
            return;
          }
        }
      })
      .catch(() => {});
  }, [articleId]);

  if (!info) return null;

  const { series, position } = info;
  const prev = series.members[position - 1];
  const next = series.members[position + 1];

  return (
    <div className="border border-border rounded-lg p-4 my-6 bg-muted/30">
      <p className="text-xs text-muted-foreground mb-2">
        Part {position + 1} of{" "}
        <Link href={`/series/${series.slug}`} className="font-medium hover:underline">
          {series.name}
        </Link>
      </p>
      <div className="flex justify-between gap-4">
        {prev ? (
          <Link href={`/articles/${prev.article.slug}`}
            className="text-sm hover:underline text-muted-foreground flex items-center gap-1">
            ← {prev.article.title}
          </Link>
        ) : <span />}
        {next ? (
          <Link href={`/articles/${next.article.slug}`}
            className="text-sm hover:underline text-muted-foreground flex items-center gap-1">
            {next.article.title} →
          </Link>
        ) : <span />}
      </div>
    </div>
  );
}
