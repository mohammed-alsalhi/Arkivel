import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export default async function ArticleAnalyticsPage({ params }: Props) {
  const { slug } = await params;
  const adminFlag = await isAdmin();
  if (!adminFlag) redirect(`/articles/${slug}`);

  const article = await prisma.article.findUnique({
    where: { slug },
    select: { id: true, title: true, slug: true },
  });
  if (!article) notFound();

  // Last 30 days of page views
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  const dateStr = thirtyDaysAgo.toISOString().slice(0, 10);

  const [viewRows, readCount, reactionCount, revisionCount] = await Promise.all([
    prisma.articleView.findMany({
      where: { articleId: article.id, date: { gte: dateStr } },
      orderBy: { date: "asc" },
    }),
    prisma.articleRead.count({ where: { articleId: article.id } }),
    prisma.articleReaction.count({ where: { articleId: article.id } }),
    prisma.articleRevision.count({ where: { articleId: article.id } }),
  ]);

  // Build 30-day view series
  const viewMap = new Map(viewRows.map((r) => [r.date, r.count]));
  const days: { date: string; count: number }[] = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(thirtyDaysAgo);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    days.push({ date: key, count: viewMap.get(key) ?? 0 });
  }
  const totalViews = days.reduce((s, d) => s + d.count, 0);
  const maxViews = Math.max(...days.map((d) => d.count), 1);

  return (
    <div>
      <nav className="article-tabbar" aria-label="Article sections">
        <Link href={`/articles/${slug}`} className="article-tab">Article</Link>
        <Link href={`/articles/${slug}/edit`} className="article-tab">Edit</Link>
        <Link href={`/articles/${slug}/history`} className="article-tab">History</Link>
        <Link href={`/articles/${slug}/discussion`} className="article-tab">Discussion</Link>
        <span className="article-tab article-tab-active">Analytics</span>
      </nav>

      <div className="border border-border bg-surface px-5 py-4">
        <h1 className="text-[1.4rem] font-normal text-heading border-b border-border pb-1 mb-4" style={{ fontFamily: "var(--font-serif)" }}>
          Analytics: {article.title}
        </h1>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Views (30d)", value: totalViews.toLocaleString() },
            { label: "Total reads", value: readCount.toLocaleString() },
            { label: "Reactions", value: reactionCount.toLocaleString() },
            { label: "Revisions", value: revisionCount.toLocaleString() },
          ].map((stat) => (
            <div key={stat.label} className="border border-border bg-surface p-3 text-center">
              <div className="text-[1.4rem] font-semibold text-heading">{stat.value}</div>
              <div className="text-[11px] text-muted">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* 30-day views bar chart */}
        <div className="border border-border bg-surface p-4 mb-4">
          <p className="text-[12px] font-bold text-heading mb-3">Page views — last 30 days</p>
          <div className="flex items-end gap-0.5 h-24">
            {days.map((day) => {
              const pct = (day.count / maxViews) * 100;
              const label = new Date(day.date + "T00:00:00Z").toLocaleDateString(undefined, { month: "short", day: "numeric" });
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center" title={`${label}: ${day.count} views`}>
                  <div
                    className="w-full bg-accent/70 hover:bg-accent transition-colors rounded-t"
                    style={{ height: `${Math.max(pct, day.count > 0 ? 4 : 0)}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-muted">
            <span>{days[0]?.date}</span>
            <span>{days[days.length - 1]?.date}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
