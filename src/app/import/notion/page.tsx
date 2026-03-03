"use client";

import { useState } from "react";

export default function NotionImportPage() {
  const [accessToken, setAccessToken] = useState("");
  const [pageId, setPageId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ slug?: string; title?: string; error?: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch("/api/import/notion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken, pageId }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ error: "Network error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Import from Notion</h1>
      <p className="text-muted mb-6 text-sm">
        Enter your Notion integration token and the page ID to import. The page will be created
        as a draft article.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Integration token</label>
          <input
            type="password"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            placeholder="secret_…"
            className="block w-full text-sm border border-border rounded px-3 py-2 bg-surface"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Page ID</label>
          <input
            type="text"
            value={pageId}
            onChange={(e) => setPageId(e.target.value)}
            placeholder="32-character page ID from the URL"
            className="block w-full text-sm border border-border rounded px-3 py-2 bg-surface"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="self-start px-4 py-2 bg-primary text-white rounded hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Importing…" : "Import page"}
        </button>
      </form>

      {result?.error && <p className="mt-4 text-red-500 text-sm">{result.error}</p>}
      {result?.slug && (
        <p className="mt-4 text-green-600 text-sm">
          Imported as draft:{" "}
          <a href={`/articles/${result.slug}`} className="underline">
            {result.title}
          </a>
        </p>
      )}
    </div>
  );
}
