import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function RecentChangesPage() {
  // Get recent revisions (edits)
  const revisions = await prisma.articleRevision.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
    include: {
      article: {
        select: {
          title: true,
          slug: true,
          category: { select: { name: true, slug: true } },
        },
      },
    },
  });

  // Get recently created articles
  const recentArticles = await prisma.article.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      createdAt: true,
      category: { select: { name: true, slug: true } },
    },
  });

  // Merge into a unified timeline
  type ChangeEntry = {
    id: string;
    date: Date;
    type: "edit" | "create";
    articleTitle: string;
    articleSlug: string;
    summary: string | null;
    category: { name: string; slug: string } | null;
  };

  const entries: ChangeEntry[] = [
    ...revisions.map((r) => ({
      id: `rev-${r.id}`,
      date: r.createdAt,
      type: "edit" as const,
      articleTitle: r.article.title,
      articleSlug: r.article.slug,
      summary: r.editSummary,
      category: r.article.category,
    })),
    ...recentArticles.map((a) => ({
      id: `new-${a.id}`,
      date: a.createdAt,
      type: "create" as const,
      articleTitle: a.title,
      articleSlug: a.slug,
      summary: null,
      category: a.category,
    })),
  ];

  // Sort by date descending and take top 50
  entries.sort((a, b) => b.date.getTime() - a.date.getTime());
  const timeline = entries.slice(0, 50);

  // Group by date string
  const grouped: Record<string, ChangeEntry[]> = {};
  for (const entry of timeline) {
    const dateKey = formatDate(entry.date);
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(entry);
  }

  return (
    <div>
      <h1
        className="text-[1.7rem] font-normal text-heading border-b border-border pb-1 mb-3"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Recent changes
      </h1>

      <p className="text-[13px] text-muted mb-4">
        Track the most recent edits and new articles across the wiki.
      </p>

      {timeline.length === 0 ? (
        <div className="wiki-notice">No recent changes to display.</div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([date, changes]) => (
            <div key={date}>
              <h2
                className="text-[15px] font-bold text-heading mb-1"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {date}
              </h2>
              <ul className="space-y-1 text-[13px]">
                {changes.map((entry) => (
                  <li key={entry.id} className="flex items-start gap-2">
                    <span
                      className={`inline-block px-1.5 py-0 text-[11px] font-bold rounded ${
                        entry.type === "create"
                          ? "bg-accent-soft text-accent"
                          : "bg-surface-hover text-muted"
                      }`}
                    >
                      {entry.type === "create" ? "N" : "E"}
                    </span>
                    <div>
                      <Link href={`/articles/${entry.articleSlug}`} className="font-medium">
                        {entry.articleTitle}
                      </Link>
                      {entry.category && (
                        <span className="text-muted text-[11px] ml-1">
                          (<Link href={`/categories/${entry.category.slug}`}>
                            {entry.category.name}
                          </Link>)
                        </span>
                      )}
                      {entry.summary && (
                        <span className="text-muted italic ml-1">
                          &mdash; {entry.summary}
                        </span>
                      )}
                      {entry.type === "create" && (
                        <span className="text-muted italic ml-1">&mdash; Created</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const dynamic = "force-dynamic";
