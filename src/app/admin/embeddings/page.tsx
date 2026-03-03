"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface EmbeddingStats {
  total: number;
  embedded: number;
  missing: Array<{ id: string; title: string; slug: string }>;
}

export default function EmbeddingsAdminPage() {
  const [stats, setStats] = useState<EmbeddingStats | null>(null);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    fetch("/api/ai/embeddings")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  async function generateAll() {
    if (!stats) return;
    setGenerating(true);
    setProgress(0);

    for (let i = 0; i < stats.missing.length; i++) {
      const article = stats.missing[i];
      await fetch("/api/ai/embeddings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId: article.id }),
      });
      setProgress(i + 1);
    }

    // Refresh stats
    const updated = await fetch("/api/ai/embeddings").then((r) => r.json());
    setStats(updated);
    setGenerating(false);
  }

  const coverage = stats ? Math.round((stats.embedded / Math.max(1, stats.total)) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-heading">Semantic Embeddings</h1>
        <Link href="/admin" className="text-sm text-muted hover:text-foreground">
          ← Admin
        </Link>
      </div>

      {!stats ? (
        <p className="text-muted text-sm">Loading…</p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="border border-border rounded p-3 text-center">
              <div className="text-2xl font-semibold">{stats.total}</div>
              <div className="text-xs text-muted">Total articles</div>
            </div>
            <div className="border border-border rounded p-3 text-center">
              <div className="text-2xl font-semibold text-green-600">{stats.embedded}</div>
              <div className="text-xs text-muted">With embeddings</div>
            </div>
            <div className="border border-border rounded p-3 text-center">
              <div className="text-2xl font-semibold text-yellow-600">{stats.missing.length}</div>
              <div className="text-xs text-muted">Missing</div>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-muted mb-1">
              <span>Embedding coverage</span>
              <span>{coverage}%</span>
            </div>
            <div className="h-2 bg-surface-hover rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all"
                style={{ width: `${coverage}%` }}
              />
            </div>
          </div>

          {stats.missing.length === 0 ? (
            <p className="text-sm text-green-600">All articles have embeddings.</p>
          ) : (
            <>
              {!process.env.NEXT_PUBLIC_OPENAI_ENABLED && (
                <div className="text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
                  Set <code>OPENAI_API_KEY</code> to enable semantic embeddings.
                </div>
              )}
              <button
                onClick={generateAll}
                disabled={generating}
                className="px-4 py-2 bg-accent text-white rounded text-sm disabled:opacity-50 mb-4"
              >
                {generating
                  ? `Generating… (${progress}/${stats.missing.length})`
                  : `Generate all missing (${stats.missing.length})`}
              </button>

              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border text-left text-muted text-xs">
                    <th className="py-2">Article</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.missing.map((a) => (
                    <tr key={a.id} className="border-b border-border">
                      <td className="py-1.5">
                        <Link href={`/articles/${a.slug}`} className="text-wiki-link hover:underline">
                          {a.title}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </>
      )}
    </div>
  );
}
