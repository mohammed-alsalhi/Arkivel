import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import CategoryWatchButton from "@/components/CategoryWatchButton";
import RandomArticleButton from "@/components/RandomArticleButton";
import SynthesizeButton from "@/components/SynthesizeButton";
import CategoryOverviewGenerator from "@/components/CategoryOverviewGenerator";

type Props = {
  params: Promise<{ slug: string }>;
};

async function getParentChain(parentId: string | null) {
  const chain: { id: string; name: string; slug: string; parentId: string | null }[] = [];
  let currentId = parentId;
  while (currentId) {
    const parent = await prisma.category.findUnique({
      where: { id: currentId },
      select: { id: true, name: true, slug: true, parentId: true },
    });
    if (!parent) break;
    chain.unshift(parent);
    currentId = parent.parentId;
  }
  return chain;
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      children: {
        orderBy: { sortOrder: "asc" },
        include: { _count: { select: { articles: true } } },
      },
    },
  });

  if (!category) notFound();

  const [articles, parentChain] = await Promise.all([
    prisma.article.findMany({
      where: { categoryId: category.id, status: "published" },
      orderBy: [{ isPinned: "desc" }, { sortOrder: "asc" }, { updatedAt: "desc" }],
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
    }),
    getParentChain(category.parentId),
  ]);

  return (
    <div>
      {/* Cover image banner */}
      {category.coverImage && (
        <div className="w-full h-36 mb-4 overflow-hidden rounded-sm border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={category.coverImage}
            alt={`${category.name} banner`}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Breadcrumbs */}
      {parentChain.length > 0 && (
        <nav className="text-[12px] text-muted mb-2">
          {parentChain.map((p, i) => (
            <span key={p.id}>
              {i > 0 && " \u203A "}
              <Link href={`/categories/${p.slug}`}>{p.name}</Link>
            </span>
          ))}
          {" \u203A "}{category.name}
        </nav>
      )}

      <div className="flex items-center justify-between mb-1">
        <h1
          className="text-[1.7rem] font-normal text-heading border-b border-border pb-1"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Category: {category.name}
        </h1>
        <div className="flex items-center gap-2">
          <SynthesizeButton categoryId={category.id} categoryName={category.name} articleCount={articles.length} />
          <RandomArticleButton categorySlug={slug} label="Random" />
          <CategoryWatchButton categoryId={category.id} />
        </div>
      </div>
      {category.description && (
        <p className="text-[13px] text-muted mb-3">{category.description}</p>
      )}
      <div className="mb-3">
        <CategoryOverviewGenerator categoryId={category.id} />
      </div>
      <p className="text-[12px] text-muted mb-3">
        {articles.length} article{articles.length !== 1 ? "s" : ""} in this category
      </p>

      {/* Subcategories */}
      {category.children.length > 0 && (
        <div className="wiki-portal mb-4">
          <div className="wiki-portal-header">Subcategories</div>
          <div className="wiki-portal-body">
            <ul className="list-disc pl-5 space-y-0.5">
              {category.children.map((child) => (
                <li key={child.id}>
                  <Link href={`/categories/${child.slug}`}>
                    {child.name}
                  </Link>
                  {child._count.articles > 0 && (
                    <span className="text-[11px] text-muted ml-1">
                      ({child._count.articles} article{child._count.articles !== 1 ? "s" : ""})
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {articles.length === 0 ? (
        <div className="wiki-notice">
          This category has no articles yet. <Link href="/articles/new">Create one.</Link>
        </div>
      ) : (
        <div>
          <h2
            className="text-base font-normal text-heading border-b border-border pb-0.5 mb-2"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Articles in this category
          </h2>
          <table className="w-full border-collapse border border-border bg-surface text-[13px]">
            <thead>
              <tr className="bg-surface-hover">
                <th className="border border-border px-3 py-1.5 text-left font-bold text-heading">Article</th>
                <th className="border border-border px-3 py-1.5 text-left font-bold text-heading w-28">Last edited</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-surface-hover">
                  <td className="border border-border px-3 py-1.5">
                    {article.isPinned && (
                      <span title="Pinned" className="inline-block mr-1 align-middle text-muted">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="17" x2="12" y2="22" />
                          <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17z" />
                        </svg>
                      </span>
                    )}
                    <Link href={`/articles/${article.slug}`} className="font-medium">
                      {article.title}
                    </Link>
                    {article.excerpt && (
                      <span className="text-muted text-[12px]">
                        {" "}&ndash; {article.excerpt.substring(0, 100)}{article.excerpt.length > 100 ? "..." : ""}
                      </span>
                    )}
                  </td>
                  <td className="border border-border px-3 py-1.5 text-muted text-[12px]">
                    {formatDate(article.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-[13px] flex items-center gap-4">
        <Link href="/categories">&larr; All categories</Link>
        <Link href={`/categories/${category.slug}/concept-map`} className="text-muted hover:text-foreground">
          Concept map
        </Link>
      </p>
    </div>
  );
}

export const dynamic = "force-dynamic";
