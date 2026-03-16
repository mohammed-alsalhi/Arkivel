"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

// ─── Widget definitions ───────────────────────────────────────────────────────

const ALL_WIDGETS = [
  { id: "recentArticles", label: "Recent articles" },
  { id: "watchlist", label: "Watchlist" },
  { id: "recentEdits", label: "Recent edits" },
  { id: "randomArticle", label: "Random article" },
  { id: "scratchpad", label: "Scratchpad" },
  { id: "stats", label: "Wiki stats" },
  { id: "notifications", label: "Notifications" },
] as const;

type WidgetId = (typeof ALL_WIDGETS)[number]["id"];

// ─── Widget data hooks ────────────────────────────────────────────────────────

function useApiData<T>(url: string, defaultVal: T): { data: T; loading: boolean } {
  const [data, setData] = useState<T>(defaultVal);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch(url)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d !== null) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [url]);
  return { data, loading };
}

// ─── Individual widgets ───────────────────────────────────────────────────────

function RecentArticlesWidget() {
  const { data, loading } = useApiData<{ id: string; title: string; slug: string; updatedAt: string }[]>(
    "/api/articles?limit=5&status=published", []
  );
  const articles = Array.isArray(data) ? data : (data as { articles?: typeof data }).articles ?? [];
  return (
    <div>
      {loading ? <p className="text-[12px] text-muted italic">Loading…</p> : (
        <ul className="space-y-1 text-[12px]">
          {articles.slice(0, 5).map((a) => (
            <li key={a.id}>
              <Link href={`/articles/${a.slug}`} className="hover:underline">{a.title}</Link>
              <span className="text-muted ml-1 text-[11px]">{new Date(a.updatedAt).toLocaleDateString()}</span>
            </li>
          ))}
          {articles.length === 0 && <li className="text-muted italic">No articles yet.</li>}
        </ul>
      )}
      <Link href="/articles" className="text-[11px] text-accent hover:underline mt-2 block">All articles →</Link>
    </div>
  );
}

function WatchlistWidget() {
  const { data, loading } = useApiData<{ articleId: string; article: { title: string; slug: string; updatedAt: string } }[]>(
    "/api/watchlist", []
  );
  const items = Array.isArray(data) ? data : [];
  return (
    <div>
      {loading ? <p className="text-[12px] text-muted italic">Loading…</p> : items.length === 0 ? (
        <p className="text-[12px] text-muted italic">Your watchlist is empty.</p>
      ) : (
        <ul className="space-y-1 text-[12px]">
          {items.slice(0, 5).map((w) => (
            <li key={w.articleId}>
              <Link href={`/articles/${w.article.slug}`} className="hover:underline">{w.article.title}</Link>
            </li>
          ))}
        </ul>
      )}
      <Link href="/watchlist" className="text-[11px] text-accent hover:underline mt-2 block">Full watchlist →</Link>
    </div>
  );
}

function RecentEditsWidget() {
  const { data, loading } = useApiData<{ id: string; articleId: string; article: { title: string; slug: string }; createdAt: string; user: { username: string } | null }[]>(
    "/api/revisions?limit=5", []
  );
  const revs = Array.isArray(data) ? data : [];
  return (
    <div>
      {loading ? <p className="text-[12px] text-muted italic">Loading…</p> : revs.length === 0 ? (
        <p className="text-[12px] text-muted italic">No recent edits.</p>
      ) : (
        <ul className="space-y-1 text-[12px]">
          {revs.slice(0, 5).map((r) => (
            <li key={r.id}>
              <Link href={`/articles/${r.article?.slug}`} className="hover:underline">{r.article?.title}</Link>
              <span className="text-muted ml-1 text-[11px]">by {r.user?.username ?? "anon"}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RandomArticleWidget() {
  const [article, setArticle] = useState<{ title: string; slug: string; excerpt: string | null } | null>(null);
  const [loading, setLoading] = useState(false);

  function fetchRandom() {
    setLoading(true);
    fetch("/api/articles/random")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => setArticle(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchRandom(); }, []);

  return (
    <div>
      {loading ? <p className="text-[12px] text-muted italic">Loading…</p> : article ? (
        <>
          <Link href={`/articles/${article.slug}`} className="font-medium text-[13px] hover:underline">{article.title}</Link>
          {article.excerpt && <p className="text-[12px] text-muted mt-1 line-clamp-2">{article.excerpt}</p>}
        </>
      ) : <p className="text-[12px] text-muted italic">No articles available.</p>}
      <button onClick={fetchRandom} className="text-[11px] text-accent hover:underline mt-2 block">Another random article →</button>
    </div>
  );
}

function ScratchpadWidget() {
  const { data, loading } = useApiData<{ content: string }>("/api/scratchpad", { content: "" });
  const preview = data?.content?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 200);
  return (
    <div>
      {loading ? <p className="text-[12px] text-muted italic">Loading…</p> : (
        <p className="text-[12px] text-muted italic line-clamp-4">{preview || "Your scratchpad is empty."}</p>
      )}
      <Link href="/scratchpad" className="text-[11px] text-accent hover:underline mt-2 block">Open scratchpad →</Link>
    </div>
  );
}

function StatsWidget() {
  const { data, loading } = useApiData<{ totalArticles: number; totalCategories: number; totalUsers: number; totalRevisions: number }>(
    "/api/stats", { totalArticles: 0, totalCategories: 0, totalUsers: 0, totalRevisions: 0 }
  );
  const stats = [
    { label: "Articles", value: data.totalArticles ?? 0 },
    { label: "Categories", value: data.totalCategories ?? 0 },
    { label: "Users", value: data.totalUsers ?? 0 },
    { label: "Revisions", value: data.totalRevisions ?? 0 },
  ];
  return (
    <div>
      {loading ? <p className="text-[12px] text-muted italic">Loading…</p> : (
        <dl className="grid grid-cols-2 gap-2">
          {stats.map((s) => (
            <div key={s.label} className="text-center border border-border py-2">
              <dd className="text-[1.2rem] font-bold text-heading">{s.value.toLocaleString()}</dd>
              <dt className="text-[11px] text-muted">{s.label}</dt>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

function NotificationsWidget() {
  const { data, loading } = useApiData<{ id: string; message: string; read: boolean; createdAt: string }[]>(
    "/api/notifications?limit=5", []
  );
  const notes = Array.isArray(data) ? data : [];
  return (
    <div>
      {loading ? <p className="text-[12px] text-muted italic">Loading…</p> : notes.length === 0 ? (
        <p className="text-[12px] text-muted italic">No notifications.</p>
      ) : (
        <ul className="space-y-1 text-[12px]">
          {notes.slice(0, 5).map((n) => (
            <li key={n.id} className={n.read ? "text-muted" : "font-medium"}>
              {n.message}
            </li>
          ))}
        </ul>
      )}
      <Link href="/notifications" className="text-[11px] text-accent hover:underline mt-2 block">All notifications →</Link>
    </div>
  );
}

function renderWidget(id: WidgetId) {
  switch (id) {
    case "recentArticles": return <RecentArticlesWidget />;
    case "watchlist": return <WatchlistWidget />;
    case "recentEdits": return <RecentEditsWidget />;
    case "randomArticle": return <RandomArticleWidget />;
    case "scratchpad": return <ScratchpadWidget />;
    case "stats": return <StatsWidget />;
    case "notifications": return <NotificationsWidget />;
  }
}

// ─── Dashboard page ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [widgets, setWidgets] = useState<WidgetId[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  // Load preferences
  useEffect(() => {
    fetch("/api/preferences")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        const saved: string[] = d?.dashboardWidgets ?? [];
        const validIds = new Set(ALL_WIDGETS.map((w) => w.id));
        const filtered = saved.filter((id) => validIds.has(id as WidgetId)) as WidgetId[];
        setWidgets(filtered.length > 0 ? filtered : (ALL_WIDGETS.map((w) => w.id) as WidgetId[]));
      })
      .catch(() => setWidgets(ALL_WIDGETS.map((w) => w.id) as WidgetId[]))
      .finally(() => setLoading(false));
  }, []);

  async function savePreferences(newWidgets: WidgetId[]) {
    setSaving(true);
    await fetch("/api/preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dashboardWidgets: newWidgets }),
    });
    setSaving(false);
  }

  function onDragStart(i: number) { dragItem.current = i; }
  function onDragEnter(i: number) { dragOverItem.current = i; }
  function onDragEnd() {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const next = [...widgets];
    const [dragged] = next.splice(dragItem.current, 1);
    next.splice(dragOverItem.current, 0, dragged);
    dragItem.current = null;
    dragOverItem.current = null;
    setWidgets(next);
    savePreferences(next);
  }

  function toggleWidget(id: WidgetId) {
    const next = widgets.includes(id)
      ? widgets.filter((w) => w !== id)
      : [...widgets, id];
    setWidgets(next);
    savePreferences(next);
  }

  if (loading) return <div className="py-8 text-center text-muted italic text-[13px]">Loading dashboard…</div>;

  return (
    <div>
      <div className="flex items-center justify-between border-b border-border pb-1 mb-4">
        <h1
          className="text-[1.7rem] font-normal text-heading"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          My dashboard
        </h1>
        <div className="flex items-center gap-2">
          {saving && <span className="text-[11px] text-muted">Saving…</span>}
          <button
            onClick={() => setEditMode(!editMode)}
            className="h-6 px-2 text-[11px] border border-border rounded hover:bg-surface-hover"
          >
            {editMode ? "Done" : "Customize"}
          </button>
        </div>
      </div>

      {/* Widget picker in edit mode */}
      {editMode && (
        <div className="wiki-portal mb-4">
          <div className="wiki-portal-header">Visible widgets (drag to reorder)</div>
          <div className="wiki-portal-body">
            <div className="flex flex-wrap gap-2">
              {ALL_WIDGETS.map((w) => (
                <label key={w.id} className="flex items-center gap-1.5 text-[12px] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={widgets.includes(w.id)}
                    onChange={() => toggleWidget(w.id)}
                  />
                  {w.label}
                </label>
              ))}
            </div>
            <p className="text-[11px] text-muted mt-2">Drag widget cards to reorder. Changes are saved automatically.</p>
          </div>
        </div>
      )}

      {/* Widget grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {widgets.map((id, i) => {
          const def = ALL_WIDGETS.find((w) => w.id === id);
          if (!def) return null;
          return (
            <div
              key={id}
              draggable={editMode}
              onDragStart={() => onDragStart(i)}
              onDragEnter={() => onDragEnter(i)}
              onDragEnd={onDragEnd}
              onDragOver={(e) => e.preventDefault()}
              className={`wiki-portal ${editMode ? "cursor-grab active:cursor-grabbing opacity-90 border-dashed" : ""}`}
            >
              <div className="wiki-portal-header flex items-center justify-between">
                <span>{def.label}</span>
                {editMode && (
                  <button
                    onClick={() => toggleWidget(id)}
                    className="text-[10px] text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="wiki-portal-body">
                {renderWidget(id)}
              </div>
            </div>
          );
        })}

        {widgets.length === 0 && (
          <div className="col-span-3 wiki-notice">
            No widgets selected. Click &ldquo;Customize&rdquo; to add some.
          </div>
        )}
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
