import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { config } from "@/lib/config";

async function getRecentArticles() {
  return prisma.article.findMany({
    take: 10,
    where: { published: true, status: "published" },
    orderBy: { updatedAt: "desc" },
    include: {
      category: true,
      tags: { include: { tag: true } },
    },
  });
}

async function getFeaturedArticle() {
  // Prefer pinned articles; fall back to longest content
  const pinned = await prisma.article.findFirst({
    where: { published: true, isPinned: true, status: "published" },
    orderBy: { updatedAt: "desc" },
    include: { category: true },
  });
  if (pinned) return pinned;

  const articles = await prisma.article.findMany({
    where: { published: true, status: "published", excerpt: { not: "" } },
    orderBy: { updatedAt: "desc" },
    take: 5,
    include: { category: true },
  });
  return articles.sort((a, b) => (b.content?.length || 0) - (a.content?.length || 0))[0] || null;
}

async function getStats() {
  const [articles, categories, tags] = await Promise.all([
    prisma.article.count({ where: { published: true } }),
    prisma.category.count(),
    prisma.tag.count(),
  ]);
  return { articles, categories, tags };
}

async function getCategories() {
  return prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { articles: true } } },
  });
}

export default async function Home() {
  const [recentArticles, featured, stats, categories] = await Promise.all([
    getRecentArticles(),
    getFeaturedArticle(),
    getStats(),
    getCategories(),
  ]);

  const isEmpty = stats.articles === 0 && stats.categories === 0;

  if (isEmpty) {
    return (
      <div>
        <h1
          className="text-[1.7rem] font-normal text-heading border-b border-border pb-1 mb-3"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Welcome to {config.name}
        </h1>
        <div className="wiki-portal mb-4">
          <div className="wiki-portal-header">Getting Started</div>
          <div className="wiki-portal-body">
            <p className="leading-relaxed mb-3">
              {config.welcomeText}
            </p>
            <p className="mb-2">Get started by setting up your wiki:</p>
            <div className="flex gap-3 mt-3">
              <Link
                href="/categories"
                className="inline-block border border-border bg-surface-hover px-4 py-2 text-[13px] font-medium hover:bg-surface transition-colors"
              >
                Set up categories
              </Link>
              <Link
                href="/articles/new"
                className="inline-block border border-border bg-surface-hover px-4 py-2 text-[13px] font-medium hover:bg-surface transition-colors"
              >
                Create your first article
              </Link>
            </div>
          </div>
        </div>
        <div className="wiki-notice">
          <strong>Tip:</strong> You can customize this wiki&apos;s name, tagline, and more
          through environment variables. See the <code className="bg-surface-hover px-1 text-[12px]">.env.example</code> file for details.
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Title */}
      <h1
        className="text-[1.7rem] font-normal text-heading border-b border-border pb-1 mb-4"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {config.name}
      </h1>

      {/* Welcome + Stats bar */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">
          Welcome
        </div>
        <div className="wiki-portal-body">
          <p className="leading-relaxed mb-3">
            {config.welcomeText}
          </p>

          {/* Stats row */}
          <div className="flex flex-wrap gap-3 mb-3">
            <Link href="/articles" className="home-stat-badge">
              <span className="home-stat-number">{stats.articles}</span>
              <span className="home-stat-label">articles</span>
            </Link>
            <Link href="/categories" className="home-stat-badge">
              <span className="home-stat-number">{stats.categories}</span>
              <span className="home-stat-label">categories</span>
            </Link>
            <span className="home-stat-badge">
              <span className="home-stat-number">{stats.tags}</span>
              <span className="home-stat-label">tags</span>
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <Link href="/articles/new" className="home-action-btn home-action-btn-primary">
              + Create article
            </Link>
            <Link href="/articles" className="home-action-btn">
              Browse all
            </Link>
            <Link href="/search" className="home-action-btn">
              Search
            </Link>
            {config.mapEnabled && (
              <Link href="/map" className="home-action-btn">
                {config.mapLabel}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Featured article (if available) */}
      {featured && (
        <div className="wiki-portal mb-4">
          <div className="wiki-portal-header">
            Featured article
          </div>
          <div className="wiki-portal-body">
            <p className="mb-1">
              <Link
                href={`/articles/${featured.slug}`}
                className="font-bold text-[14px]"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {featured.title}
              </Link>
              {featured.category && (
                <span className="text-muted text-[12px] ml-2">
                  in {featured.category.name}
                </span>
              )}
            </p>
            {featured.excerpt && (
              <p className="text-[13px] text-muted leading-relaxed">
                {featured.excerpt.length > 300
                  ? featured.excerpt.substring(0, 300) + "..."
                  : featured.excerpt}
                {" "}
                <Link href={`/articles/${featured.slug}`} className="text-[12px]">
                  Read more &rarr;
                </Link>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid gap-4 md:grid-cols-5">
        {/* Main column — recent changes */}
        <div className="md:col-span-3">
          <div className="wiki-portal">
            <div className="wiki-portal-header flex items-center justify-between">
              <span>Recent changes</span>
              <Link href="/recent-changes" className="text-[11px] font-normal opacity-70 hover:opacity-100">
                View all &rarr;
              </Link>
            </div>
            <div className="wiki-portal-body p-0">
              {recentArticles.length === 0 ? (
                <div className="px-4 py-6 text-center text-muted italic">
                  No published articles yet.{" "}
                  <Link href="/articles/new">Create the first one.</Link>
                </div>
              ) : (
                <ul className="divide-y divide-border-light text-[13px]">
                  {recentArticles.map((article) => (
                    <li key={article.id} className="px-3 py-2 hover:bg-surface-hover transition-colors">
                      <div className="flex items-baseline gap-2">
                        <Link
                          href={`/articles/${article.slug}`}
                          className="font-medium"
                        >
                          {article.title}
                        </Link>
                        {article.category && (
                          <span className="text-[11px] text-muted bg-surface-hover px-1.5 py-0.5 shrink-0">
                            {article.category.name}
                          </span>
                        )}
                        <span className="text-muted text-[11px] ml-auto whitespace-nowrap shrink-0">
                          {formatDate(article.updatedAt)}
                        </span>
                      </div>
                      {article.excerpt && (
                        <p className="text-muted text-[12px] mt-0.5 leading-snug">
                          {article.excerpt.substring(0, 100)}{article.excerpt.length > 100 ? "..." : ""}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="md:col-span-2 space-y-4">
          {/* Browse by category */}
          <div className="wiki-portal">
            <div className="wiki-portal-header flex items-center justify-between">
              <span>Categories</span>
              <Link href="/categories" className="text-[11px] font-normal opacity-70 hover:opacity-100">
                View all &rarr;
              </Link>
            </div>
            <div className="wiki-portal-body p-0">
              {categories.length === 0 ? (
                <div className="px-3 py-4 text-center text-muted italic text-[13px]">
                  No categories yet.
                </div>
              ) : (
                <ul className="divide-y divide-border-light text-[13px]">
                  {categories.map((cat) => (
                    <li key={cat.id}>
                      <Link
                        href={`/categories/${cat.slug}`}
                        className="flex items-center justify-between px-3 py-1.5 hover:bg-surface-hover transition-colors"
                      >
                        <span>{cat.icon} {cat.name}</span>
                        <span className="text-muted text-[11px]">{cat._count.articles}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Quick links */}
          <div className="wiki-portal">
            <div className="wiki-portal-header">Explore</div>
            <div className="wiki-portal-body p-0">
              <div className="grid grid-cols-2 text-[13px]">
                <Link href="/recent-changes" className="flex items-center gap-1.5 px-3 py-2 hover:bg-surface-hover transition-colors border-b border-r border-border-light">
                  <span className="text-muted text-[11px]">&#9679;</span> Recent changes
                </Link>
                <Link href="/articles" className="flex items-center gap-1.5 px-3 py-2 hover:bg-surface-hover transition-colors border-b border-border-light">
                  <span className="text-muted text-[11px]">&#9679;</span> All articles
                </Link>
                <Link href="/categories" className="flex items-center gap-1.5 px-3 py-2 hover:bg-surface-hover transition-colors border-r border-border-light">
                  <span className="text-muted text-[11px]">&#9679;</span> Categories
                </Link>
                <Link href="/help" className="flex items-center gap-1.5 px-3 py-2 hover:bg-surface-hover transition-colors">
                  <span className="text-muted text-[11px]">&#9679;</span> Help
                </Link>
              </div>
            </div>
          </div>

          {/* Tip */}
          <div className="wiki-notice text-[12px]">
            <strong>Tip:</strong> Link articles together with{" "}
            <code className="bg-surface-hover px-1 text-[11px]">[[Article Name]]</code>{" "}
            wiki link syntax to build connections across your knowledge base.
          </div>
        </div>
      </div>
    </div>
  );
}
