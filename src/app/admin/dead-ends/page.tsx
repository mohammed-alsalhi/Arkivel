import { isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { EmptyState, LinkButton, Page, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function DeadEndsPage() {
  const admin = await isAdmin();
  if (!admin) redirect("/");

  // Dead-end articles: published articles with no outgoing wiki links in content
  const articles = await prisma.article.findMany({
    where: { status: "published", redirectTo: null },
    select: { id: true, title: true, slug: true, content: true, updatedAt: true },
    orderBy: { title: "asc" },
  });

  const deadEnds = articles.filter((a) => !a.content.includes("data-wiki-link="));

  return (
    <Page>
      <PageHeader
        title="Dead-end Articles"
        description={
          <>
            Published articles with no outgoing wiki links.
            These are isolated — readers have no path forward from them.
            Consider adding links to related articles.
            <strong className="ml-2">{deadEnds.length}</strong> of {articles.length} published articles.
          </>
        }
      />

      {deadEnds.length === 0 ? (
        <EmptyState title="✓ No dead-end articles found — all published articles have at least one outgoing wiki link." />
      ) : (
        <div className="border border-border divide-y divide-border">
          {deadEnds.map((a) => (
            <div key={a.id} className="flex items-center justify-between px-3 py-2 hover:bg-surface-hover">
              <div>
                <Link href={`/articles/${a.slug}`} className="text-[13px] text-wiki-link hover:underline font-medium">
                  {a.title}
                </Link>
                <span className="ml-2 text-[11px] text-muted">
                  Last edited {new Date(a.updatedAt).toLocaleDateString()}
                </span>
              </div>
              <LinkButton href={`/articles/${a.slug}/edit`} className="shrink-0">
                Edit
              </LinkButton>
            </div>
          ))}
        </div>
      )}
    </Page>
  );
}
