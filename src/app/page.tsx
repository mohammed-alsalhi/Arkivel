import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { config } from "@/lib/config";
import OnThisDay from "@/components/OnThisDay";
import HotArticles from "@/components/HotArticles";
import NewArticles from "@/components/NewArticles";

async function getRecentArticles() {
  try {
    return await prisma.article.findMany({
      take: 9,
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

async function getHomeStats() {
  try {
    const [articles, categories, tags, revisions] = await Promise.all([
      prisma.article.count({ where: { published: true, status: "published" } }),
      prisma.category.count(),
      prisma.tag.count(),
      prisma.articleRevision.count(),
    ]);

    return { articles, categories, tags, revisions };
  } catch {
    return { articles: 0, categories: 0, tags: 0, revisions: 0 };
  }
}

export default async function Home() {
  const [recentArticles, featured, stats] = await Promise.all([
    getRecentArticles(),
    getFeaturedArticle(),
    getHomeStats(),
  ]);

  const isEmpty = recentArticles.length === 0 && !featured;
  const recent = recentArticles.filter((a) => a.id !== featured?.id).slice(0, 8);

  const directoryLinks = [
    {
      href: "/articles",
      label: "Article index",
      meta: `${stats.articles.toLocaleString()} published`,
      description: "Browse the full encyclopedia in one dense, filterable table.",
    },
    {
      href: "/categories",
      label: "Categories",
      meta: `${stats.categories.toLocaleString()} groups`,
      description: "Move through the hierarchy and find nearby bodies of knowledge.",
    },
    {
      href: "/tags",
      label: "Tags",
      meta: `${stats.tags.toLocaleString()} labels`,
      description: "Follow cross-cutting concepts that span categories.",
    },
    {
      href: "/graph",
      label: "Article graph",
      meta: "Network view",
      description: "See how wiki links connect articles into a larger map.",
    },
    {
      href: "/atlas",
      label: "Canon atlas",
      meta: "World view",
      description: "See territories, dossiers, story threads, and continuity pressure.",
    },
    {
      href: "/intelligence",
      label: "Command center",
      meta: "20 live engines",
      description: "Turn wiki data into quality, graph, canon, and audience signals.",
    },
    {
      href: "/recent-changes",
      label: "Recent changes",
      meta: "Live activity",
      description: "Review the newest edits and recently active pages.",
    },
    {
      href: "/random",
      label: "Random article",
      meta: "Serendipity",
      description: "Jump into an article you might not have looked for.",
    },
  ];

  if (isEmpty) {
    return (
      <div className="home-page">
        <header className="ui-page-header home-header">
          <div>
            <p className="ui-page-kicker">Main page</p>
            <h1 className="ui-page-title">Welcome to {config.name}</h1>
            <p className="ui-page-dek">{config.welcomeText}</p>
          </div>
          <div className="ui-page-actions">
            <Link href="/categories" className="ui-button">Set up categories</Link>
            <Link href="/articles/new" className="ui-button ui-button-primary">Create first article</Link>
          </div>
        </header>

        <div className="wiki-portal mb-4">
          <div className="wiki-portal-header">Getting Started</div>
          <div className="wiki-portal-body">
            <p className="leading-relaxed mb-3">
              {config.welcomeText}
            </p>
            <ol className="list-decimal pl-5 text-[13px] space-y-1">
              <li>Create a few categories so the sidebar has structure.</li>
              <li>Write the first article, then link related pages with wiki links.</li>
              <li>Return here as the front page fills with stats, featured content, and recent updates.</li>
            </ol>
          </div>
        </div>
        <div className="wiki-notice">
          <strong>Tip:</strong>{" "}You can customize this wiki&apos;s name, tagline, and more
          through environment variables. See the <code className="bg-surface-hover px-1 text-[12px]">.env.example</code> file for details.
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <header className="ui-page-header home-header">
        <div>
          <p className="ui-page-kicker">Main page</p>
          <h1 className="ui-page-title">{config.name}</h1>
          <p className="ui-page-dek">{config.welcomeText}</p>
        </div>
        <div className="ui-page-actions">
          <Link href="/articles/new" className="ui-button ui-button-primary">Create article</Link>
          <Link href="/atlas" className="ui-button">Canon atlas</Link>
          <Link href="/intelligence" className="ui-button">Command center</Link>
          <Link href="/search" className="ui-button">Search</Link>
          <Link href="/random" className="ui-button">Random</Link>
        </div>
      </header>

      <section className="home-stat-rail" aria-label="Wiki overview">
        <div className="home-stat">
          <strong>{stats.articles.toLocaleString()}</strong>
          <span>Published articles</span>
        </div>
        <div className="home-stat">
          <strong>{stats.categories.toLocaleString()}</strong>
          <span>Categories</span>
        </div>
        <div className="home-stat">
          <strong>{stats.tags.toLocaleString()}</strong>
          <span>Tags</span>
        </div>
        <div className="home-stat">
          <strong>{stats.revisions.toLocaleString()}</strong>
          <span>Revision snapshots</span>
        </div>
      </section>

      <div className="home-layout">
        <section className="home-primary">
          {featured && (
            <div className="home-featured">
              <p className="ui-page-kicker">Featured article</p>
              <Link href={`/articles/${featured.slug}`} className="home-featured-title">
                {featured.title}
              </Link>
              <p className="home-featured-meta">
                {featured.category?.name && (
                  <>
                    <Link href={`/categories/${featured.category.slug}`}>{featured.category.name}</Link>
                    <span aria-hidden="true">/</span>
                  </>
                )}
                <span>Last edited {formatDate(featured.updatedAt)}</span>
              </p>
              {featured.excerpt && (
                <p className="home-featured-excerpt">
                  {featured.excerpt.length > 460
                    ? `${featured.excerpt.substring(0, 460)}...`
                    : featured.excerpt}
                </p>
              )}
              <div className="home-featured-actions">
                <Link href={`/articles/${featured.slug}`} className="ui-button ui-button-primary">Read article</Link>
                <Link href="/articles" className="ui-button">Browse index</Link>
              </div>
            </div>
          )}

          <section className="wiki-portal home-directory">
            <div className="wiki-portal-header">Browse the wiki</div>
            <div className="wiki-portal-body p-0">
              <div className="home-directory-grid">
                {directoryLinks.map((item) => (
                  <Link key={item.href} href={item.href} className="home-directory-link">
                    <span className="home-directory-title">{item.label}</span>
                    <span className="home-directory-meta">{item.meta}</span>
                    <span className="home-directory-description">{item.description}</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <section className="wiki-portal home-recent">
            <div className="wiki-portal-header">
              <span>Recently updated</span>
              <Link href="/recent-changes" className="wiki-portal-header-link">View all</Link>
            </div>
            <div className="wiki-portal-body p-0">
              {recent.length === 0 ? (
                <div className="ui-empty-state">
                  No recent articles. <Link href="/articles/new">Create the first one.</Link>
                </div>
              ) : (
                <ol className="home-recent-list">
                  {recent.map((article) => (
                    <li key={article.id} className="home-recent-row">
                      <div className="min-w-0">
                        <Link href={`/articles/${article.slug}`} className="home-recent-title">
                          {article.title}
                        </Link>
                        {article.excerpt && (
                          <p className="home-recent-excerpt">
                            {article.excerpt.length > 150
                              ? `${article.excerpt.substring(0, 150)}...`
                              : article.excerpt}
                          </p>
                        )}
                      </div>
                      <div className="home-recent-meta">
                        {article.category && (
                          <Link href={`/categories/${article.category.slug}`}>{article.category.name}</Link>
                        )}
                        <span>{formatDate(article.updatedAt)}</span>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </section>
        </section>

        <aside className="home-sidebar" aria-label="Home sidebar">
          <div className="wiki-portal home-sidebar-note">
            <div className="wiki-portal-header">Reading queue</div>
            <div className="wiki-portal-body">
              <div className="home-sidebar-links">
                {[
                  ["Daily digest", "/digest"],
                  ["Review queue", "/review"],
                  ["Bookmarks", "/bookmarks"],
                  ["Watchlist", "/watchlist"],
                ].map(([label, href]) => (
                  <Link key={href} href={href}>{label}</Link>
                ))}
              </div>
            </div>
          </div>
          <NewArticles limit={5} />
          <OnThisDay />
          <HotArticles days={7} limit={5} />
        </aside>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
