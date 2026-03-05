"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type ArticleEntry = {
  id: string;
  title: string;
  slug: string;
  status: string;
  expiresAt?: string | null;
  reviewDueAt?: string | null;
};

type ScheduleData = {
  expiredArticles: ArticleEntry[];
  expiringSoon: ArticleEntry[];
  reviewOverdue: ArticleEntry[];
  reviewDueSoon: ArticleEntry[];
};

function ArticleRow({ a, dateField }: { a: ArticleEntry; dateField: "expiresAt" | "reviewDueAt" }) {
  const date = a[dateField];
  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-3 py-2">
        <Link href={`/articles/${a.slug}`} className="text-[13px] text-accent hover:underline font-medium">
          {a.title}
        </Link>
      </td>
      <td className="px-3 py-2 text-[12px] text-muted">
        {date ? new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
      </td>
      <td className="px-3 py-2">
        <span className={`text-[11px] px-1.5 py-0.5 rounded border ${
          a.status === "published" ? "border-green-300 text-green-700 bg-green-50 dark:bg-green-950/30 dark:text-green-400"
          : a.status === "review" ? "border-blue-300 text-blue-700 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400"
          : "border-amber-300 text-amber-700 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400"
        }`}>
          {a.status}
        </span>
      </td>
      <td className="px-3 py-2">
        <Link href={`/articles/${a.slug}/edit`} className="text-[11px] text-muted hover:text-accent">
          edit
        </Link>
      </td>
    </tr>
  );
}

function Section({
  title,
  colour,
  articles,
  dateField,
  emptyText,
}: {
  title: string;
  colour: string;
  articles: ArticleEntry[];
  dateField: "expiresAt" | "reviewDueAt";
  emptyText: string;
}) {
  return (
    <div className={`border rounded-md overflow-hidden mb-6 ${colour}`}>
      <div className="px-4 py-2 border-b border-inherit flex items-center justify-between">
        <h2 className="text-[13px] font-bold text-heading">{title}</h2>
        <span className="text-[11px] text-muted">{articles.length}</span>
      </div>
      {articles.length === 0 ? (
        <p className="px-4 py-3 text-[13px] text-muted italic">{emptyText}</p>
      ) : (
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-inherit bg-surface-hover">
              <th className="text-left px-3 py-1.5 text-[11px] font-bold text-muted uppercase">Title</th>
              <th className="text-left px-3 py-1.5 text-[11px] font-bold text-muted uppercase">Date</th>
              <th className="text-left px-3 py-1.5 text-[11px] font-bold text-muted uppercase">Status</th>
              <th className="px-3 py-1.5"></th>
            </tr>
          </thead>
          <tbody>
            {articles.map((a) => <ArticleRow key={a.id} a={a} dateField={dateField} />)}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function ContentSchedulePage() {
  const [data, setData] = useState<ScheduleData | null>(null);
  const [archiving, setArchiving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/content-schedule").then((r) => r.json()).then(setData);
  }, []);

  async function runArchive() {
    setArchiving(true);
    await fetch("/api/cron/expire-articles", { method: "POST" });
    const fresh = await fetch("/api/admin/content-schedule").then((r) => r.json());
    setData(fresh);
    setArchiving(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-heading">Content Schedule</h1>
          <p className="text-[12px] text-muted mt-0.5">
            Articles with expiry or review dates. Set these in the article editor.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={runArchive}
            disabled={archiving}
            className="h-6 px-2 text-[11px] border border-border rounded bg-surface hover:bg-surface-hover disabled:opacity-50"
          >
            {archiving ? "Archiving..." : "Run auto-archive"}
          </button>
          <Link href="/admin" className="h-6 px-2 text-[11px] border border-border rounded bg-surface hover:bg-surface-hover">
            ← Admin
          </Link>
        </div>
      </div>

      {!data ? (
        <p className="text-[13px] text-muted italic">Loading...</p>
      ) : (
        <>
          <Section
            title="Expired (need archiving)"
            colour="border-red-200 dark:border-red-900"
            articles={data.expiredArticles}
            dateField="expiresAt"
            emptyText="No expired articles."
          />
          <Section
            title="Expiring in the next 14 days"
            colour="border-amber-200 dark:border-amber-900"
            articles={data.expiringSoon}
            dateField="expiresAt"
            emptyText="None expiring soon."
          />
          <Section
            title="Review overdue"
            colour="border-red-200 dark:border-red-900"
            articles={data.reviewOverdue}
            dateField="reviewDueAt"
            emptyText="No overdue reviews."
          />
          <Section
            title="Review due in the next 14 days"
            colour="border-blue-200 dark:border-blue-900"
            articles={data.reviewDueSoon}
            dateField="reviewDueAt"
            emptyText="No reviews due soon."
          />
        </>
      )}
    </div>
  );
}
