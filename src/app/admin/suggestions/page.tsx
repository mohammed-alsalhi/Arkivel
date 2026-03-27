"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Suggestion = {
  id: string;
  articleId: string;
  author: string;
  email: string | null;
  suggestion: string;
  status: "pending" | "accepted" | "rejected";
  adminNote: string | null;
  createdAt: string;
  article: { title: string; slug: string };
};

export default function AdminSuggestionsPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [statusFilter, setStatusFilter] = useState<"pending" | "accepted" | "rejected" | "all">("pending");
  const [loading, setLoading] = useState(true);
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    setLoading(true);
    fetch(`/api/suggestions?status=${statusFilter}`)
      .then((r) => r.json())
      .then((data) => { setSuggestions(Array.isArray(data) ? data : []); })
      .finally(() => setLoading(false));
  }, [statusFilter]);

  async function updateStatus(id: string, status: "accepted" | "rejected", adminNote?: string) {
    await fetch(`/api/suggestions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, adminNote: adminNote || undefined }),
    });
    setSuggestions((prev) => prev.filter((s) => s.id !== id));
  }

  async function deleteSuggestion(id: string) {
    await fetch(`/api/suggestions/${id}`, { method: "DELETE" });
    setSuggestions((prev) => prev.filter((s) => s.id !== id));
  }

  const statusColors = {
    pending: "text-yellow-700 bg-yellow-50 border-yellow-200",
    accepted: "text-green-700 bg-green-50 border-green-200",
    rejected: "text-red-700 bg-red-50 border-red-200",
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-[1.4rem] font-normal text-heading border-b border-border pb-1 mb-4" style={{ fontFamily: "var(--font-serif)" }}>
        Edit Suggestions
      </h1>

      <div className="flex gap-2 mb-4">
        {(["pending", "accepted", "rejected", "all"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`h-6 px-2 text-[11px] border border-border rounded capitalize ${statusFilter === s ? "bg-accent text-white border-accent" : "text-muted hover:text-foreground hover:bg-surface-hover"}`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-[13px] text-muted italic">Loading…</p>
      ) : suggestions.length === 0 ? (
        <p className="text-[13px] text-muted italic">No {statusFilter === "all" ? "" : statusFilter + " "}suggestions.</p>
      ) : (
        <div className="space-y-3">
          {suggestions.map((s) => (
            <div key={s.id} className="border border-border rounded p-3 text-[13px]">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div>
                  <Link href={`/articles/${s.article.slug}`} className="wiki-link hover:underline font-medium">
                    {s.article.title}
                  </Link>
                  <span className="text-muted ml-2 text-[11px]">
                    {s.author}{s.email ? ` <${s.email}>` : ""} · {new Date(s.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <span className={`text-[10px] border rounded px-1.5 py-0.5 capitalize ${statusColors[s.status]}`}>
                  {s.status}
                </span>
              </div>

              <p className="text-foreground whitespace-pre-wrap mb-2">{s.suggestion}</p>

              {s.adminNote && (
                <p className="text-[12px] text-muted italic mb-2">Note: {s.adminNote}</p>
              )}

              {s.status === "pending" && (
                <div className="space-y-1.5">
                  <input
                    value={noteInputs[s.id] ?? ""}
                    onChange={(e) => setNoteInputs((p) => ({ ...p, [s.id]: e.target.value }))}
                    placeholder="Optional admin note…"
                    className="w-full h-6 px-2 text-[12px] border border-border rounded bg-surface focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateStatus(s.id, "accepted", noteInputs[s.id])}
                      className="h-6 px-2 text-[11px] border border-green-300 rounded text-green-700 hover:bg-green-50"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => updateStatus(s.id, "rejected", noteInputs[s.id])}
                      className="h-6 px-2 text-[11px] border border-red-200 rounded text-red-600 hover:bg-red-50"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => deleteSuggestion(s.id)}
                      className="h-6 px-2 text-[11px] border border-border rounded text-muted hover:text-foreground hover:bg-surface-hover"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}

              {s.status !== "pending" && (
                <button
                  onClick={() => deleteSuggestion(s.id)}
                  className="text-[11px] text-muted hover:text-foreground hover:underline"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
