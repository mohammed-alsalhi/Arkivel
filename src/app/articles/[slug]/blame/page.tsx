"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Paragraph = {
  text: string;
  revisionId: string;
  editedAt: string;
  editor: string | null;
  editSummary: string | null;
};

export default function BlamePage() {
  const params = useParams<{ slug: string }>();
  const [paragraphs, setParagraphs] = useState<Paragraph[]>([]);
  const [articleId, setArticleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // First get the article ID from the slug
      const res = await fetch(`/api/articles?slug=${params.slug}`);
      if (!res.ok) { setLoading(false); return; }
      const data = await res.json();
      const id = Array.isArray(data?.articles) ? data.articles[0]?.id : null;
      if (!id) { setLoading(false); return; }
      setArticleId(id);

      const blameRes = await fetch(`/api/articles/${id}/blame`);
      if (blameRes.ok) setParagraphs(await blameRes.json());
      setLoading(false);
    }
    load();
  }, [params.slug]);

  // Generate a stable colour from a revision ID
  function revisionColor(revId: string): string {
    let hash = 0;
    for (let i = 0; i < revId.length; i++) hash = (hash * 31 + revId.charCodeAt(i)) >>> 0;
    const hue = hash % 360;
    return `hsl(${hue}, 60%, 88%)`;
  }

  return (
    <div>
      <div className="wiki-tabs mb-0">
        <Link href={`/articles/${params.slug}`} className="wiki-tab">Article</Link>
        <Link href={`/articles/${params.slug}/history`} className="wiki-tab">History</Link>
        <span className="wiki-tab wiki-tab-active">Blame</span>
      </div>

      <div className="border border-t-0 border-border bg-surface px-5 py-4">
        <h1
          className="text-[1.4rem] font-normal text-heading border-b border-border pb-1 mb-4"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Blame view
        </h1>
        <p className="text-[12px] text-muted mb-4">
          Each paragraph is colour-coded by the earliest revision that introduced it.
        </p>

        {loading ? (
          <p className="text-muted text-[13px] italic">Loading…</p>
        ) : paragraphs.length === 0 ? (
          <p className="text-muted text-[13px] italic">No paragraph data found.</p>
        ) : (
          <div className="space-y-1 text-[13px]">
            {paragraphs.map((p, i) => (
              <div
                key={i}
                className="flex gap-3 group"
              >
                {/* Blame metadata sidebar */}
                <div
                  className="w-40 shrink-0 rounded px-2 py-1 text-[10px] leading-snug"
                  style={{ background: revisionColor(p.revisionId) }}
                >
                  <div className="font-semibold truncate">{p.editor ?? "Unknown"}</div>
                  <div className="opacity-70">{new Date(p.editedAt).toLocaleDateString()}</div>
                  {p.editSummary && <div className="opacity-60 truncate italic">{p.editSummary}</div>}
                  {p.revisionId !== "current" && articleId && (
                    <Link
                      href={`/articles/${params.slug}/history#${p.revisionId}`}
                      className="underline opacity-70"
                    >
                      View revision
                    </Link>
                  )}
                </div>
                {/* Paragraph text */}
                <p className="flex-1 text-foreground leading-relaxed py-1">{p.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
