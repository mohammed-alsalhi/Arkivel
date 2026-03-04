import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import AdminEditTab from "@/components/AdminEditTab";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function HistoryPage({ params }: Props) {
  const { slug } = await params;

  const article = await prisma.article.findUnique({
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
  });

  if (!article) notFound();

  return (
    <div>
      {/* Tabs */}
      <div className="wiki-tabs">
        <Link href={`/articles/${slug}`} className="wiki-tab">
          Article
        </Link>
        <AdminEditTab slug={slug} />
        <span className="wiki-tab wiki-tab-active">History</span>
        <Link href={`/articles/${slug}/discussion`} className="wiki-tab">
          Discussion
        </Link>
      </div>

      <div className="border border-t-0 border-border bg-surface px-5 py-4">
        <h1
          className="text-[1.5rem] font-normal text-heading border-b border-border pb-1 mb-3"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Revision history of &ldquo;{article.title}&rdquo;
        </h1>

        {article.revisions.length === 0 ? (
          <p className="text-[13px] text-muted italic">
            No previous revisions. This article has not been edited since creation.
          </p>
        ) : (
          <DiffForm slug={slug} articleId={article.id} revisions={article.revisions} />
        )}
      </div>
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
        <button
          type="submit"
          className="bg-accent px-3 py-1 text-[12px] font-bold text-white hover:bg-accent-hover"
        >
          Compare selected revisions
        </button>
      </div>

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

          {revisions.map((rev, i) => (
            <tr key={rev.id} className="border-b border-border-light hover:bg-surface-hover">
              <td className="py-1.5 px-2">
                <input
                  type="radio"
                  name="from"
                  value={rev.id}
                  defaultChecked={i === 0}
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
              <td className="py-1.5 px-2 flex gap-2">
                <Link
                  href={`/articles/${slug}/diff?from=${rev.id}&to=current`}
                  className="text-wiki-link text-[12px]"
                >
                  view
                </Link>
                <form action={`/api/articles/${articleId}/revisions/${rev.id}`} method="post">
                  <button
                    type="submit"
                    className="text-wiki-link-broken text-[12px] hover:underline"
                  >
                    revert
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </form>
  );
}

export const dynamic = "force-dynamic";
