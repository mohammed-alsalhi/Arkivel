import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function TagPage({ params }: Props) {
  const { slug } = await params;

  const tag = await prisma.tag.findUnique({
    where: { slug },
  });

  if (!tag) notFound();

  const articles = await prisma.article.findMany({
    where: { tags: { some: { tagId: tag.id } } },
    orderBy: { updatedAt: "desc" },
    include: {
      category: true,
      tags: { include: { tag: true } },
    },
  });

  return (
    <div>
      <h1
        className="text-[1.7rem] font-normal text-heading border-b border-border pb-1 mb-1"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Tag: {tag.name}
      </h1>
      <p className="text-[12px] text-muted mb-3">
        {articles.length} article{articles.length !== 1 ? "s" : ""} tagged with &ldquo;{tag.name}&rdquo;
      </p>

      {articles.length === 0 ? (
        <div className="wiki-notice">
          No articles have been tagged with &ldquo;{tag.name}&rdquo; yet.
        </div>
      ) : (
        <table className="w-full border-collapse border border-border bg-surface text-[13px]">
          <thead>
            <tr className="bg-surface-hover">
              <th className="border border-border px-3 py-1.5 text-left font-bold text-heading">Article</th>
              <th className="border border-border px-3 py-1.5 text-left font-bold text-heading w-32">Category</th>
              <th className="border border-border px-3 py-1.5 text-left font-bold text-heading w-28">Last edited</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article.id} className="hover:bg-surface-hover">
                <td className="border border-border px-3 py-1.5">
                  <Link href={`/articles/${article.slug}`} className="font-medium">
                    {article.title}
                  </Link>
                </td>
                <td className="border border-border px-3 py-1.5 text-muted">
                  {article.category ? (
                    <Link href={`/categories/${article.category.slug}`}>
                      {article.category.name}
                    </Link>
                  ) : (
                    <span className="italic">None</span>
                  )}
                </td>
                <td className="border border-border px-3 py-1.5 text-muted text-[12px]">
                  {formatDate(article.updatedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p className="mt-4 text-[13px]">
        <Link href="/articles">&larr; All articles</Link>
      </p>
    </div>
  );
}

export const dynamic = "force-dynamic";
