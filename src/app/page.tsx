import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { config } from "@/lib/config";
import OnThisDay from "@/components/OnThisDay";
import ArticleCard from "@/components/articles/ArticleCard";
import HotArticles from "@/components/HotArticles";

async function getRecentArticles() {
  try {
    return await prisma.article.findMany({
      take: 7,
      where: { published: true, status: "published" },
      orderBy: { updatedAt: "desc" },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
    });
  } catch {
    return [];
  }
}

async function getFeaturedArticle() {
  try {
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
  } catch {
    return null;
  }
}

export default async function Home() {
  const [recentArticles, featured] = await Promise.all([
    getRecentArticles(),
    getFeaturedArticle(),
  ]);

  const isEmpty = recentArticles.length === 0 && !featured;

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

  const recent = recentArticles.filter((a) => a.id !== featured?.id).slice(0, 6);

  return (
    <div>
      {/* Title */}
      <h1
        className="text-[1.7rem] font-normal text-heading border-b border-border pb-1 mb-5"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {config.name}
      </h1>

      {/* Featured article */}
      {featured && (
        <div className="mb-6 pb-5 border-b border-border">
          <p className="text-[11px] uppercase tracking-wider text-muted mb-1.5">Featured</p>
          <Link
            href={`/articles/${featured.slug}`}
            className="block text-[1.35rem] font-normal leading-snug text-heading hover:text-accent transition-colors mb-1"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {featured.title}
          </Link>
          <p className="text-[12px] text-muted mb-2">
            {featured.category?.name && <>{featured.category.name} · </>}
            {formatDate(featured.updatedAt)}
          </p>
          {featured.excerpt && (
            <p className="text-[13px] text-muted leading-relaxed">
              {featured.excerpt.length > 400
                ? featured.excerpt.substring(0, 400) + "..."
                : featured.excerpt}
              {" "}
              <Link href={`/articles/${featured.slug}`} className="text-accent hover:underline">
                Read &rarr;
              </Link>
            </p>
          )}
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid gap-6 md:grid-cols-5">
        {/* Recently updated */}
        <div className="md:col-span-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[12px] font-bold text-heading uppercase tracking-wide">
              Recently updated
            </h2>
            <Link href="/recent-changes" className="text-[11px] text-muted hover:text-foreground transition-colors">
              View all &rarr;
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="text-[13px] text-muted italic">
              No recent articles.{" "}
              <Link href="/articles/new">Create the first one.</Link>
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recent.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="md:col-span-2">
          <OnThisDay />
          <HotArticles days={7} limit={5} />
        </div>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
