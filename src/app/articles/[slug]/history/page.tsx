import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import AdminEditTab from "@/components/AdminEditTab";
import RestoreRevisionButton from "@/components/RestoreRevisionButton";
import { EmptyState, Page, PageHeader } from "@/components/ui";
import { canViewArticle } from "@/lib/article-visibility";
import { isAdmin } from "@/lib/auth";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function HistoryPage({ params }: Props) {
  const { slug } = await params;

  const [article, canViewDrafts] = await Promise.all([
    prisma.article.findUnique({
      where: { slug },
      include: {
        revisions: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            editSummary: true,
            createdAt: true,
          },
        },
      },
    }),
    isAdmin(),
  ]);

  if (!article || !canViewArticle(article, canViewDrafts)) notFound();

  return (
    <div>
      <nav className="article-tabbar" aria-label="Article sections">
        <Link href={`/articles/${slug}`} className="article-tab">
          Article
        </Link>
        <AdminEditTab slug={slug} className="article-tab" />
        <span className="article-tab article-tab-active">History</span>
      </nav>

      <Page className="border border-border bg-surface px-5 py-4">
        <PageHeader title={<>Revision history of &ldquo;{article.title}&rdquo;</>} />

        {article.revisions.length === 0 ? (
          <EmptyState description="No previous revisions. This article has not been edited since creation." />
        ) : (
          <DiffForm slug={slug} articleId={article.id} revisions={article.revisions} />
        )}
      </Page>
    </div>
  );
}

function DiffForm({
  slug,
  articleId,
  revisions,
}: {
  slug: string;
  articleId: string;
  revisions: { id: string; title: string; editSummary: string | null; createdAt: Date }[];
}) {
  return (
    <form action={`/articles/${slug}/diff`} method="get">
      <div className="flex gap-2 mb-3">
        <button type="submit" className="ui-button ui-button-primary">
          Compare selected revisions
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-1.5 px-2 font-bold text-heading w-8">Old</th>
              <th className="py-1.5 px-2 font-bold text-heading w-8">New</th>
              <th className="py-1.5 px-2 font-bold text-heading">Date</th>
              <th className="py-1.5 px-2 font-bold text-heading">Summary</th>
              <th className="py-1.5 px-2 font-bold text-heading w-16"></th>
            </tr>
          </thead>
          <tbody>
            {/* Current version row */}
            <tr className="border-b border-border-light bg-accent-soft">
              <td className="py-1.5 px-2">
                <input type="radio" name="from" value="current" />
              </td>
              <td className="py-1.5 px-2">
                <input type="radio" name="to" value="current" defaultChecked />
              </td>
              <td className="py-1.5 px-2 text-muted">Current version</td>
              <td className="py-1.5 px-2 italic text-muted">Latest</td>
              <td className="py-1.5 px-2">
                <Link href={`/articles/${slug}`} className="text-wiki-link text-[12px]">
                  view
                </Link>
              </td>
            </tr>

            {revisions.map((rev, index) => (
              <tr key={rev.id} className="border-b border-border-light hover:bg-surface-hover">
                <td className="py-1.5 px-2">
                  <input
                    type="radio"
                    name="from"
                    value={rev.id}
                    defaultChecked={index === 0}
                  />
                </td>
                <td className="py-1.5 px-2">
                  <input type="radio" name="to" value={rev.id} />
                </td>
                <td className="py-1.5 px-2 text-muted">
                  {formatDate(rev.createdAt)}
                </td>
                <td className="py-1.5 px-2">
                  {rev.editSummary ? (
                    <span className="italic">{rev.editSummary}</span>
                  ) : (
                    <span className="text-muted italic">No summary</span>
                  )}
                </td>
                <td className="py-1.5 px-2">
                  <div className="flex gap-2">
                    <Link
                      href={`/articles/${slug}/diff?from=${rev.id}&to=current`}
                      className="text-wiki-link text-[12px]"
                    >
                      view
                    </Link>
                    <RestoreRevisionButton articleId={articleId} revisionId={rev.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </form>
  );
}

export const dynamic = "force-dynamic";
