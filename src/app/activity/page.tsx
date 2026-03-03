"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";

type ActivityUser = {
  id: string;
  username: string;
  displayName: string | null;
};

type ActivityArticle = {
  id: string;
  title: string;
  slug: string;
};

type ActivityEventItem = {
  id: string;
  type: string;
  userId: string | null;
  articleId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  user: ActivityUser | null;
  article: ActivityArticle | null;
};

const ACTIVITY_TYPES: Record<string, { label: string; icon: string }> = {
  article_created: { label: "created an article", icon: "+" },
  article_edited: { label: "edited", icon: "\u270E" },
  article_published: { label: "published", icon: "\u2713" },
  discussion_posted: { label: "commented on", icon: "\uD83D\uDCAC" },
  review_requested: { label: "requested a review for", icon: "\uD83D\uDCCB" },
  review_completed: { label: "completed review of", icon: "\u2705" },
  change_request_opened: { label: "suggested changes to", icon: "\uD83D\uDCDD" },
  change_request_accepted: { label: "accepted changes to", icon: "\u2713" },
  user_registered: { label: "joined the wiki", icon: "\uD83D\uDC64" },
};

type FilterTab = "all" | "articles" | "discussions" | "reviews";

const FILTER_TYPES: Record<FilterTab, string[]> = {
  all: [],
  articles: ["article_created", "article_edited", "article_published"],
  discussions: ["discussion_posted"],
  reviews: [
    "review_requested",
    "review_completed",
    "change_request_opened",
    "change_request_accepted",
  ],
};

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function groupByDate(
  events: ActivityEventItem[]
): { date: string; events: ActivityEventItem[] }[] {
  const groups: Map<string, ActivityEventItem[]> = new Map();

  for (const event of events) {
    const dateKey = new Date(event.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const existing = groups.get(dateKey);
    if (existing) {
      existing.push(event);
    } else {
      groups.set(dateKey, [event]);
    }
  }

  return Array.from(groups.entries()).map(([date, events]) => ({
    date,
    events,
  }));
}

export default function ActivityPage() {
  const [events, setEvents] = useState<ActivityEventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const fetchEvents = useCallback(
    async (cursor?: string) => {
      const params = new URLSearchParams({ limit: "30" });
      if (cursor) params.set("cursor", cursor);

      // Apply type filter
      const types = FILTER_TYPES[activeTab];
      if (types.length === 1) {
        params.set("type", types[0]);
      }

      const res = await fetch(`/api/activity?${params.toString()}`);
      if (!res.ok) return { events: [], nextCursor: undefined };
      return res.json();
    },
    [activeTab]
  );

  useEffect(() => {
    setLoading(true);
    setEvents([]);
    setNextCursor(undefined);

    fetchEvents().then((data) => {
      let filtered = data.events || [];
      // Client-side filter for multi-type tabs
      const types = FILTER_TYPES[activeTab];
      if (types.length > 1) {
        filtered = filtered.filter((e: ActivityEventItem) =>
          types.includes(e.type)
        );
      }
      setEvents(filtered);
      setNextCursor(data.nextCursor);
      setLoading(false);
    });
  }, [activeTab, fetchEvents]);

  async function loadMore() {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    const data = await fetchEvents(nextCursor);
    let newEvents = data.events || [];
    const types = FILTER_TYPES[activeTab];
    if (types.length > 1) {
      newEvents = newEvents.filter((e: ActivityEventItem) =>
        types.includes(e.type)
      );
    }
    setEvents((prev) => [...prev, ...newEvents]);
    setNextCursor(data.nextCursor);
    setLoadingMore(false);
  }

  const grouped = groupByDate(events);

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "articles", label: "Articles" },
    { key: "discussions", label: "Discussions" },
    { key: "reviews", label: "Reviews" },
  ];

  return (
    <div>
      <h1
        className="text-[1.7rem] font-normal text-heading border-b border-border pb-1 mb-3"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Recent Activity
      </h1>

      {/* Filter tabs */}
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

      {loading ? (
        <p className="text-[13px] text-muted italic">Loading activity...</p>
      ) : events.length === 0 ? (
        <p className="text-[13px] text-muted italic">No activity to show.</p>
      ) : (
        <div className="space-y-5">
          {grouped.map((group) => (
            <div key={group.date}>
              <h2 className="text-[12px] font-bold text-muted uppercase tracking-wide mb-2">
                {group.date}
              </h2>
              <ul className="space-y-1.5">
                {group.events.map((event) => {
                  const typeInfo = ACTIVITY_TYPES[event.type] || {
                    label: event.type,
                    icon: "?",
                  };
                  return (
                    <li
                      key={event.id}
                      className="flex items-start gap-2 text-[13px] py-1 border-b border-border/50"
                    >
                      <span
                        className="w-5 h-5 flex items-center justify-center text-[11px] flex-shrink-0 mt-0.5"
                        title={event.type}
                      >
                        {typeInfo.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span>
                          {event.user ? (
                            <Link
                              href={`/users/${event.user.username}`}
                              className="font-bold text-accent hover:underline"
                            >
                              {event.user.displayName || event.user.username}
                            </Link>
                          ) : (
                            <span className="text-muted">Anonymous</span>
                          )}{" "}
                          {typeInfo.label}{" "}
                          {event.article && (
                            <Link
                              href={`/articles/${event.article.slug}`}
                              className="font-bold hover:underline"
                              style={{ fontFamily: "var(--font-serif)" }}
                            >
                              {event.article.title}
                            </Link>
                          )}
                        </span>
                      </div>
                      <span className="text-[11px] text-muted flex-shrink-0">
                        {formatRelativeTime(event.createdAt)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}

      {nextCursor && (
        <div className="mt-4 text-center">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-4 py-1.5 text-[12px] border border-border bg-surface hover:bg-surface-hover text-foreground transition-colors"
          >
            {loadingMore ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
