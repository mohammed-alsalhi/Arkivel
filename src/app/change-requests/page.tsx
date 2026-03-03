"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAdmin } from "@/components/AdminContext";

type ChangeRequestArticle = {
  id: string;
  title: string;
  slug: string;
};

type ChangeRequestAuthor = {
  id: string;
  username: string;
  displayName: string | null;
};

type ChangeRequestItem = {
  id: string;
  title: string;
  description: string | null;
  content: string;
  status: string;
  reviewNote: string | null;
  createdAt: string;
  updatedAt: string;
  article: ChangeRequestArticle;
  author: ChangeRequestAuthor;
};

type TabKey = "open" | "accepted" | "rejected";

const STATUS_MAP: Record<TabKey, string> = {
  open: "open",
  accepted: "accepted",
  rejected: "rejected",
};

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    open: "bg-yellow-100 text-yellow-800 border border-yellow-300",
    accepted: "bg-green-100 text-green-800 border border-green-300",
    rejected: "bg-red-100 text-red-800 border border-red-300",
    withdrawn: "bg-gray-100 text-gray-600 border border-gray-300",
  };

  const labels: Record<string, string> = {
    open: "Open",
    accepted: "Accepted",
    rejected: "Rejected",
    withdrawn: "Withdrawn",
  };

  const cls = styles[status] ?? "bg-gray-100 text-gray-600 border border-gray-300";
  const label = labels[status] ?? status;

  return (
    <span className={`px-2 py-0.5 text-[11px] font-medium rounded ${cls}`}>
      {label}
    </span>
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ChangeRequestsPage() {
  const isAdmin = useAdmin();
  const [activeTab, setActiveTab] = useState<TabKey>("open");
  const [items, setItems] = useState<ChangeRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async (status: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/change-requests?status=${encodeURIComponent(status)}`);
      if (!res.ok) throw new Error("Failed to load change requests");
      const data = await res.json();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load change requests");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems(STATUS_MAP[activeTab]);
  }, [activeTab, fetchItems]);

  async function handleStatusChange(
    id: string,
    status: "accepted" | "rejected"
  ) {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/change-requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Action failed");
      }
      // Refresh the list
      await fetchItems(STATUS_MAP[activeTab]);
      // Collapse if was expanded
      if (expandedId === id) setExpandedId(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActionLoading(null);
    }
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: "open", label: "Open" },
    { key: "accepted", label: "Accepted" },
    { key: "rejected", label: "Rejected" },
  ];

  return (
    <div>
      <h1
        className="text-[1.7rem] font-normal text-heading border-b border-border pb-1 mb-3"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Change Requests
      </h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 text-[12px] border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-accent text-accent font-bold"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <p className="text-[13px] text-muted italic">Loading...</p>
      ) : error ? (
        <p className="text-[13px] text-red-600">{error}</p>
      ) : items.length === 0 ? (
        <p className="text-[13px] text-muted italic">
          No {activeTab} change requests.
        </p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const isExpanded = expandedId === item.id;
            const isActioning = actionLoading === item.id;

            return (
              <div
                key={item.id}
                className="border border-border bg-surface"
              >
                {/* Row header — clickable to expand */}
                <div
                  className="flex items-start gap-3 px-3 py-2.5 cursor-pointer hover:bg-surface-hover transition-colors"
                  onClick={() =>
                    setExpandedId(isExpanded ? null : item.id)
                  }
                >
                  {/* Expand indicator */}
                  <span className="text-muted text-[11px] mt-0.5 select-none w-3 flex-shrink-0">
                    {isExpanded ? "▼" : "▶"}
                  </span>

                  {/* Title */}
                  <div className="flex-1 min-w-0">
                    <span className="text-[13px] font-medium text-foreground">
                      {item.title}
                    </span>
                    <span className="text-[12px] text-muted ml-2">
                      on{" "}
                      <Link
                        href={`/articles/${item.article.slug}`}
                        className="text-accent hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {item.article.title}
                      </Link>
                    </span>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusBadge status={item.status} />
                    <span className="text-[11px] text-muted">
                      {item.author.displayName || item.author.username}
                    </span>
                    <span className="text-[11px] text-muted">
                      {formatDate(item.createdAt)}
                    </span>

                    {/* Accept / Reject buttons for editors/admins on open requests */}
                    {isAdmin && item.status === "open" && (
                      <>
                        <button
                          disabled={isActioning}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(item.id, "accepted");
                          }}
                          className="px-2 py-0.5 text-[11px] bg-green-600 hover:bg-green-700 text-white border border-green-700 transition-colors disabled:opacity-50"
                        >
                          {isActioning ? "..." : "Accept"}
                        </button>
                        <button
                          disabled={isActioning}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(item.id, "rejected");
                          }}
                          className="px-2 py-0.5 text-[11px] bg-red-600 hover:bg-red-700 text-white border border-red-700 transition-colors disabled:opacity-50"
                        >
                          {isActioning ? "..." : "Reject"}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Expanded description */}
                {isExpanded && (
                  <div className="border-t border-border px-4 py-3 bg-surface">
                    {item.description ? (
                      <p className="text-[13px] text-foreground whitespace-pre-wrap mb-2">
                        {item.description}
                      </p>
                    ) : (
                      <p className="text-[13px] text-muted italic mb-2">
                        No description provided.
                      </p>
                    )}

                    {item.reviewNote && (
                      <div className="mt-2 p-2 bg-amber-50 border border-amber-200 text-[12px] text-amber-800">
                        <span className="font-semibold">Review note:</span>{" "}
                        {item.reviewNote}
                      </div>
                    )}

                    {item.status === "withdrawn" && (
                      <div className="mt-2">
                        <StatusBadge status="withdrawn" />
                      </div>
                    )}

                    <div className="mt-2 text-[11px] text-muted">
                      Proposed content:{" "}
                      <span className="font-mono">
                        {item.content.length} characters
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
