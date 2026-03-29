import { isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";

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
    <div>
      <h1
        className="text-[1.7rem] font-normal text-heading border-b border-border pb-1 mb-3"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Dead-end Articles
      </h1>
      <p className="text-[13px] text-muted mb-4">
        Published articles with no outgoing wiki links.
        These are isolated — readers have no path forward from them.
        Consider adding links to related articles.
        <strong className="ml-2">{deadEnds.length}</strong> of {articles.length} published articles.
      </p>

      {deadEnds.length === 0 ? (
        <p className="text-[13px] text-green-600 dark:text-green-400">
          ✓ No dead-end articles found — all published articles have at least one outgoing wiki link.
        </p>
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
              <Link
                href={`/articles/${a.slug}/edit`}
                className="h-6 px-2 text-[11px] border border-border rounded hover:bg-muted/50 transition-colors shrink-0"
              >
                Edit
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
