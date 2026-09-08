"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button, EmptyState, Page, PageHeader } from "@/components/ui";

type Suggestion = {
  id: string;
  articleId: string;
  author: string;
  email: string | null;
  suggestion: string;
  status: "pending" | "accepted" | "rejected" | "commented" | "assigned" | "converted";
  adminNote: string | null;
  assigneeId: string | null;
  reviewerComment: string | null;
  convertedTaskUrl: string | null;
  spamScore: number;
  moderationState: string;
  createdAt: string;
  article: { title: string; slug: string };
};

export default function AdminSuggestionsPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [statusFilter, setStatusFilter] = useState<Suggestion["status"] | "all">("pending");
  const [loading, setLoading] = useState(true);
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});
  const [assigneeInputs, setAssigneeInputs] = useState<Record<string, string>>({});
  const [taskInputs, setTaskInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    setLoading(true);
    fetch(`/api/suggestions?status=${statusFilter}`)
      .then((r) => r.json())
      .then((data) => { setSuggestions(Array.isArray(data) ? data : []); })
      .finally(() => setLoading(false));
  }, [statusFilter]);

  async function reviewSuggestion(
    id: string,
    action: "accept" | "reject" | "comment" | "assign" | "convert-to-task",
    adminNote?: string
  ) {
    await fetch(`/api/suggestions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        adminNote: adminNote || undefined,
        assigneeId: assigneeInputs[id] || undefined,
        convertedTaskUrl: taskInputs[id] || undefined,
        reviewerComment: adminNote || undefined,
      }),
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
    commented: "text-blue-700 bg-blue-50 border-blue-200",
    assigned: "text-purple-700 bg-purple-50 border-purple-200",
    converted: "text-slate-700 bg-slate-50 border-slate-200",
  };

  return (
    <Page>
      <PageHeader title="Edit Suggestions" />

      <div className="flex gap-2 mb-4">
        {(["pending", "commented", "assigned", "accepted", "rejected", "converted", "all"] as const).map((s) => (
          <Button
            key={s}
            onClick={() => setStatusFilter(s)}
            variant={statusFilter === s ? "primary" : "default"}
            className="capitalize"
          >
            {s}
          </Button>
        ))}
      </div>

      {loading ? (
        <p className="text-[13px] text-muted italic">Loading…</p>
      ) : suggestions.length === 0 ? (
        <EmptyState title={`No ${statusFilter === "all" ? "" : statusFilter + " "}suggestions.`} />
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
                    {s.author}{s.email ? ` <${s.email}>` : ""} · {new Date(s.createdAt).toLocaleDateString()} · spam {s.spamScore} · {s.moderationState}
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
              {s.reviewerComment && (
                <p className="text-[12px] text-muted italic mb-2">Reviewer comment: {s.reviewerComment}</p>
              )}
              {s.convertedTaskUrl && (
                <p className="text-[12px] text-muted italic mb-2">Task: {s.convertedTaskUrl}</p>
              )}

              {s.status === "pending" && (
                <div className="space-y-1.5">
                  <input
                    value={noteInputs[s.id] ?? ""}
                    onChange={(e) => setNoteInputs((p) => ({ ...p, [s.id]: e.target.value }))}
                    placeholder="Optional admin note…"
                    className="w-full h-6 px-2 text-[12px] border border-border rounded bg-surface focus:outline-none"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    <input
                      value={assigneeInputs[s.id] ?? ""}
                      onChange={(e) => setAssigneeInputs((p) => ({ ...p, [s.id]: e.target.value }))}
                      placeholder="Assignee user id"
                      className="w-full h-6 px-2 text-[12px] border border-border rounded bg-surface focus:outline-none"
                    />
                    <input
                      value={taskInputs[s.id] ?? ""}
                      onChange={(e) => setTaskInputs((p) => ({ ...p, [s.id]: e.target.value }))}
                      placeholder="Task URL or id"
                      className="w-full h-6 px-2 text-[12px] border border-border rounded bg-surface focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => reviewSuggestion(s.id, "accept", noteInputs[s.id])}
                      className="h-6 px-2 text-[11px] border border-green-300 rounded text-green-700 hover:bg-green-50"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => reviewSuggestion(s.id, "reject", noteInputs[s.id])}
                      className="h-6 px-2 text-[11px] border border-red-200 rounded text-red-600 hover:bg-red-50"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => reviewSuggestion(s.id, "comment", noteInputs[s.id])}
                      className="h-6 px-2 text-[11px] border border-blue-200 rounded text-blue-700 hover:bg-blue-50"
                    >
                      Comment
                    </button>
                    <button
                      onClick={() => reviewSuggestion(s.id, "assign", noteInputs[s.id])}
                      className="h-6 px-2 text-[11px] border border-purple-200 rounded text-purple-700 hover:bg-purple-50"
                    >
                      Assign
                    </button>
                    <button
                      onClick={() => reviewSuggestion(s.id, "convert-to-task", noteInputs[s.id])}
                      className="h-6 px-2 text-[11px] border border-border rounded text-foreground hover:bg-surface-hover"
                    >
                      Convert
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
    </Page>
  );
}
