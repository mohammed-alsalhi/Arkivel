"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

function getReadSlugs(): Set<string> {
  try {
    const history: { slug: string }[] = JSON.parse(localStorage.getItem("wiki_view_history") ?? "[]");
    return new Set(history.map((h) => h.slug));
  } catch {
    return new Set();
  }
}

type SeriesMember = { position: number; article: { title: string; slug: string } };
type SeriesInfo = { id: string; name: string; slug: string; members: SeriesMember[] };

export default function ArticleSeriesNav({ articleId }: { articleId: string }) {
  const [info, setInfo] = useState<{ series: SeriesInfo; position: number } | null>(null);
  const [readCount, setReadCount] = useState(0);

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
            // Count how many articles in the series have been read
            const readSlugs = getReadSlugs();
            const count = s.members.filter((m) => readSlugs.has(m.article.slug)).length;
            setReadCount(count);
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
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-muted-foreground">
          Part {position + 1} of{" "}
          <Link href={`/series/${series.slug}`} className="font-medium hover:underline">
            {series.name}
          </Link>
        </p>
        {readCount > 0 && (
          <span className="text-[11px] text-accent">
            {readCount}/{series.members.length} read
          </span>
        )}
      </div>
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
