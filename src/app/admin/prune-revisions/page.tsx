"use client";

import { useState } from "react";

export default function PruneRevisionsPage() {
  const [keep, setKeep] = useState(50);
  const [preview, setPreview] = useState<{ totalWouldDelete: number; affectedArticles: number } | null>(null);
  const [result, setResult] = useState<{ deleted: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [pruning, setPruning] = useState(false);

  async function handlePreview() {
    setLoading(true);
    setResult(null);
    const res = await fetch(`/api/admin/prune-revisions?keep=${keep}`);
    if (res.ok) setPreview(await res.json());
    setLoading(false);
  }

  async function handlePrune() {
    if (!confirm(`Delete ${preview?.totalWouldDelete} revisions? This cannot be undone.`)) return;
    setPruning(true);
    const res = await fetch("/api/admin/prune-revisions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keep }),
    });
    if (res.ok) {
      const data = await res.json();
      setResult(data);
      setPreview(null);
    }
    setPruning(false);
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-semibold text-heading mb-4">Revision Pruning</h1>

      <div className="border border-border rounded p-4 bg-surface space-y-4">
        <p className="text-[13px] text-muted">
          Delete old revision history beyond a threshold. Only the most recent <strong>N</strong> revisions are kept per article.
          This cannot be undone — make sure you have a backup.
        </p>

        <div className="flex items-center gap-3">
          <label className="text-[13px] text-foreground">Keep latest</label>
          <input
            type="number"
            min={1}
            max={1000}
            value={keep}
            onChange={(e) => { setKeep(parseInt(e.target.value, 10) || 1); setPreview(null); }}
            className="w-20 border border-border bg-background px-2 py-1 text-[13px] text-foreground focus:border-accent focus:outline-none"
          />
          <span className="text-[13px] text-foreground">revisions per article</span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handlePreview}
            disabled={loading}
            className="h-6 px-2 text-[11px] border border-border rounded text-muted hover:text-foreground transition-colors"
          >
            {loading ? "Calculating…" : "Preview"}
          </button>
          {preview && preview.totalWouldDelete > 0 && (
            <button
              onClick={handlePrune}
              disabled={pruning}
              className="h-6 px-2 text-[11px] border border-red-300 rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              {pruning ? "Pruning…" : `Delete ${preview.totalWouldDelete} revisions`}
            </button>
          )}
        </div>

        {preview && (
          <div className={`rounded px-3 py-2 text-[12px] ${preview.totalWouldDelete === 0 ? "bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400" : "bg-yellow-500/10 border border-yellow-500/30 text-yellow-700 dark:text-yellow-400"}`}>
            {preview.totalWouldDelete === 0
              ? "No revisions to prune — all articles are within the threshold."
              : `${preview.totalWouldDelete} revisions across ${preview.affectedArticles} article(s) would be deleted.`}
          </div>
        )}

        {result && (
          <div className="rounded bg-green-500/10 border border-green-500/30 px-3 py-2 text-[12px] text-green-700 dark:text-green-400">
            Pruned {result.deleted} revision(s) successfully.
          </div>
        )}
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
