"use client";

import { useState } from "react";

type RedirectRow = { id: string; fromSlug: string; toSlug: string; createdAt: Date | string };

export default function RedirectsManager({ initialRedirects }: { initialRedirects: RedirectRow[] }) {
  const [redirects, setRedirects] = useState<RedirectRow[]>(initialRedirects);
  const [fromSlug, setFromSlug] = useState("");
  const [toSlug, setToSlug] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/admin/redirects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromSlug: fromSlug.trim(), toSlug: toSlug.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save");
      } else {
        const newRedirect = await res.json();
        setRedirects((prev) => {
          const existing = prev.findIndex((r) => r.id === newRedirect.id);
          if (existing >= 0) {
            const updated = [...prev];
            updated[existing] = newRedirect;
            return updated;
          }
          return [newRedirect, ...prev];
        });
        setFromSlug("");
        setToSlug("");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await fetch("/api/admin/redirects", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setRedirects((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div className="space-y-6">
      {/* Add form */}
      <form onSubmit={handleAdd} className="flex gap-2 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">From slug (old)</label>
          <input
            value={fromSlug}
            onChange={(e) => setFromSlug(e.target.value)}
            placeholder="old-article-slug"
            required
            className="h-8 px-2 text-sm border border-border rounded bg-background w-48"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">To slug (new)</label>
          <input
            value={toSlug}
            onChange={(e) => setToSlug(e.target.value)}
            placeholder="new-article-slug"
            required
            className="h-8 px-2 text-sm border border-border rounded bg-background w-48"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="h-8 px-3 text-sm border border-border rounded hover:bg-muted disabled:opacity-50"
        >
          {saving ? "Saving…" : "Add redirect"}
        </button>
        {error && <span className="text-xs text-destructive">{error}</span>}
      </form>

      {/* Table */}
      {redirects.length === 0 ? (
        <p className="text-sm text-muted-foreground">No redirects yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-border rounded overflow-hidden">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-3 py-2 font-medium">From slug</th>
                <th className="text-left px-3 py-2 font-medium">To slug</th>
                <th className="text-left px-3 py-2 font-medium">Created</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {redirects.map((r) => (
                <tr key={r.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-3 py-2 font-mono text-xs">{r.fromSlug}</td>
                  <td className="px-3 py-2 font-mono text-xs">{r.toSlug}</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="text-xs text-destructive hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
