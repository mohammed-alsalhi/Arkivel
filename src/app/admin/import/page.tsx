"use client";

import Link from "next/link";
import { useState, useRef } from "react";

type ImportedArticle = { id: string; title: string; slug: string };

export default function ImportPage() {
  // ── Confluence ──────────────────────────────────────────────────────────────
  const [confHtml, setConfHtml] = useState("");
  const [confCategory, setConfCategory] = useState("");
  const [confLoading, setConfLoading] = useState(false);
  const [confResult, setConfResult] = useState<ImportedArticle | null>(null);
  const [confError, setConfError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setConfHtml((ev.target?.result as string) ?? "");
    reader.readAsText(file);
  }

  async function importConfluence() {
    if (!confHtml.trim()) { setConfError("Paste or upload HTML first"); return; }
    setConfLoading(true);
    setConfError("");
    setConfResult(null);
    const res = await fetch("/api/import/confluence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ html: confHtml, categoryId: confCategory || undefined }),
    });
    setConfLoading(false);
    if (!res.ok) {
      const d = await res.json();
      setConfError(d.error ?? "Import failed");
    } else {
      setConfResult(await res.json());
      setConfHtml("");
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div>
      <h1
        className="text-[1.7rem] font-normal text-heading border-b border-border pb-1 mb-3"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Import
      </h1>

      {/* ── Confluence ──────────────────────────────────────────────────────── */}
      <div className="wiki-portal mb-6">
        <div className="wiki-portal-header">Confluence HTML export</div>
        <div className="wiki-portal-body space-y-3">
          <p className="text-[12px] text-muted">
            Export a single page from Confluence (<strong>Space Tools → Content Tools → Export → HTML</strong>),
            then paste or upload the resulting <code>.html</code> file.
            The page is imported as a <strong>draft</strong> article.
          </p>

          <div>
            <label className="block text-[11px] text-muted font-bold mb-0.5">Upload HTML file</label>
            <input ref={fileRef} type="file" accept=".html,.htm" onChange={handleFile}
              className="text-[12px]" />
          </div>

          <div>
            <label className="block text-[11px] text-muted font-bold mb-0.5">
              — or paste HTML directly —
            </label>
            <textarea
              value={confHtml}
              onChange={(e) => setConfHtml(e.target.value)}
              rows={6}
              placeholder="<html>…</html>"
              className="w-full border border-border bg-surface px-2 py-1 text-[11px] font-mono focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] text-muted font-bold mb-0.5">Category ID (optional)</label>
            <input
              value={confCategory}
              onChange={(e) => setConfCategory(e.target.value)}
              placeholder="Leave blank for uncategorised"
              className="w-full border border-border bg-surface px-2 py-1 text-[12px] focus:border-accent focus:outline-none"
            />
          </div>

          {confError && <p className="text-[12px] text-red-600">{confError}</p>}
          {confResult && (
            <p className="text-[12px] text-green-700">
              Imported as draft:{" "}
              <Link href={`/articles/${confResult.slug}/edit`} className="underline font-medium">
                {confResult.title}
              </Link>
            </p>
          )}

          <button
            onClick={importConfluence}
            disabled={confLoading}
            className="h-6 px-2 text-[11px] border border-border rounded hover:bg-surface-hover disabled:opacity-50"
          >
            {confLoading ? "Importing…" : "Import page"}
          </button>
        </div>
      </div>

      {/* ── Other importers notice ──────────────────────────────────────────── */}
      <div className="wiki-notice text-[12px]">
        <strong>Other importers:</strong> Use the API directly at{" "}
        <code className="bg-surface-hover px-1 rounded">/api/import/notion</code> (Notion) and{" "}
        <code className="bg-surface-hover px-1 rounded">/api/import/obsidian</code> (Obsidian Markdown vault).
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
