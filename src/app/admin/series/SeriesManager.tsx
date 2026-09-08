"use client";

import { useState } from "react";
import Link from "next/link";

type Article = { id: string; title: string; slug: string };
type SeriesMember = { id: string; position: number; article: Article };
type Series = { id: string; name: string; slug: string; description: string | null; members: SeriesMember[] };

export default function SeriesManager({
  initialSeries,
  articles,
}: {
  initialSeries: Series[];
  articles: Article[];
}) {
  const [series, setSeries] = useState<Series[]>(initialSeries);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [addArticleId, setAddArticleId] = useState("");

  async function createSeries(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    const res = await fetch("/api/series", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), description: newDesc.trim() || null }),
    });
    if (res.ok) {
      const created = await res.json();
      setSeries((prev) => [...prev, { ...created, members: [] }]);
      setNewName("");
      setNewDesc("");
    }
    setSaving(false);
  }

  async function deleteSeries(id: string) {
    await fetch(`/api/series/${id}`, { method: "DELETE" });
    setSeries((prev) => prev.filter((s) => s.id !== id));
  }

  async function addMember(seriesId: string) {
    if (!addArticleId) return;
    const s = series.find((x) => x.id === seriesId)!;
    const members = [...s.members.map((m) => ({ articleId: m.article.id })), { articleId: addArticleId }];
    const res = await fetch(`/api/series/${seriesId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ members }),
    });
    if (res.ok) {
      const article = articles.find((a) => a.id === addArticleId)!;
      setSeries((prev) =>
        prev.map((x) =>
          x.id === seriesId
            ? { ...x, members: [...x.members, { id: Date.now().toString(), position: x.members.length, article }] }
            : x
        )
      );
      setAddArticleId("");
    }
  }

  async function removeMember(seriesId: string, articleId: string) {
    const s = series.find((x) => x.id === seriesId)!;
    const members = s.members.filter((m) => m.article.id !== articleId).map((m) => ({ articleId: m.article.id }));
    await fetch(`/api/series/${seriesId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ members }),
    });
    setSeries((prev) =>
      prev.map((x) =>
        x.id === seriesId ? { ...x, members: x.members.filter((m) => m.article.id !== articleId) } : x
      )
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={createSeries} className="flex gap-2 items-end flex-wrap">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Series name</label>
          <input value={newName} onChange={(e) => setNewName(e.target.value)} required placeholder="My Series"
            className="h-8 px-2 text-sm border border-border rounded bg-background w-48" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Description (optional)</label>
          <input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="A short description"
            className="h-8 px-2 text-sm border border-border rounded bg-background w-64" />
        </div>
        <button type="submit" disabled={saving}
          className="h-8 px-3 text-sm border border-border rounded hover:bg-muted disabled:opacity-50">
          {saving ? "Creating…" : "Create series"}
        </button>
      </form>

      {series.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">No series yet.</p>
      ) : (
        <div className="space-y-3">
          {series.map((s) => (
            <div key={s.id} className="border border-border rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-muted/30">
                <div>
                  <Link href={`/series/${s.slug}`} className="font-medium hover:underline">{s.name}</Link>
                  {s.description && <span className="text-xs text-muted-foreground ml-2">{s.description}</span>}
                  <span className="ml-2 text-xs text-muted-foreground">({s.members.length} articles)</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                    className="text-xs text-muted-foreground hover:underline">
                    {expanded === s.id ? "Collapse" : "Edit"}
                  </button>
                  <button onClick={() => deleteSeries(s.id)} className="text-xs text-destructive hover:underline">
                    Delete
                  </button>
                </div>
              </div>

              {expanded === s.id && (
                <div className="px-4 py-3 space-y-2">
                  <ol className="space-y-1">
                    {s.members.map((m, i) => (
                      <li key={m.id} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground w-5">{i + 1}.</span>
                        <Link href={`/articles/${m.article.slug}`} className="flex-1 hover:underline">
                          {m.article.title}
                        </Link>
                        <button onClick={() => removeMember(s.id, m.article.id)}
                          className="text-xs text-destructive hover:underline ml-2">Remove</button>
                      </li>
                    ))}
                  </ol>
                  <div className="flex gap-2 mt-2">
                    <select value={addArticleId} onChange={(e) => setAddArticleId(e.target.value)}
                      className="h-7 px-2 text-xs border border-border rounded bg-background flex-1">
                      <option value="">Add article…</option>
                      {articles
                        .filter((a) => !s.members.some((m) => m.article.id === a.id))
                        .map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
                    </select>
                    <button onClick={() => addMember(s.id)} disabled={!addArticleId}
                      className="h-7 px-2 text-xs border border-border rounded hover:bg-muted disabled:opacity-50">
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
