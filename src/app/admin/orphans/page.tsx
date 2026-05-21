import { isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function OrphansPage() {
  const admin = await isAdmin();
  if (!admin) redirect("/");

  // Fetch all published articles with their slugs
  const articles = await prisma.article.findMany({
    where: { status: "published", redirectTo: null },
    select: {
      id: true,
      title: true,
      slug: true,
      categoryId: true,
      category: { select: { id: true, name: true, slug: true } },
      updatedAt: true,
    },
    orderBy: { title: "asc" },
  });

  // An orphan has no other article linking to it with data-wiki-link
  // We check each article's slug against all content
  const allContent = await prisma.article.findMany({
    where: { status: "published", redirectTo: null },
    select: { content: true },
  });

  const combined = allContent.map((a) => a.content).join(" ");

  const orphans = articles.filter((a) => {
    // Check if any article content contains a link to this slug
    // Wiki links are stored as href="/articles/slug" in content
    return !combined.includes(`/articles/${a.slug}`) && !combined.includes(`data-wiki-link="${a.title}"`);
  });

  // Group orphans by category
  const grouped = new Map<string, typeof orphans>();
  const uncategorized: typeof orphans = [];

  for (const a of orphans) {
    if (a.category) {
      const key = a.category.name;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(a);
    } else {
      uncategorized.push(a);
    }
  }

  return (
    <div>
      <h1
        className="text-[1.7rem] font-normal text-heading border-b border-border pb-1 mb-3"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Orphan Articles
      </h1>
      <p className="text-[13px] text-muted mb-4">
        Published articles that no other article links to.
        These may be hard for readers to discover — consider adding links from related articles or a parent article.
        <strong className="ml-2">{orphans.length}</strong> of {articles.length} published articles.
      </p>

      {orphans.length === 0 ? (
        <p className="text-[13px] text-green-600 dark:text-green-400">
          ✓ No orphan articles found — all published articles are linked from at least one other article.
        </p>
      ) : (
        <div className="space-y-4">
          {grouped.size > 0 && Array.from(grouped.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([catName, arts]) => (
            <div key={catName}>
              <h2 className="text-[13px] font-bold text-muted uppercase mb-1">{catName}</h2>
              <div className="border border-border divide-y divide-border">
                {arts.map((a) => (
                  <div key={a.id} className="flex items-center justify-between px-3 py-2 hover:bg-surface-hover">
                    <div>
                      <Link href={`/articles/${a.slug}`} className="text-[13px] text-wiki-link hover:underline font-medium">
                        {a.title}
                      </Link>
                      <span className="ml-2 text-[11px] text-muted">
                        Last edited {new Date(a.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Link href={`/articles/${a.slug}/edit`} className="h-6 px-2 text-[11px] border border-border rounded hover:bg-muted/50">
                        Edit
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {uncategorized.length > 0 && (
            <div>
              <h2 className="text-[13px] font-bold text-muted uppercase mb-1">Uncategorized</h2>
              <div className="border border-border divide-y divide-border">
                {uncategorized.map((a) => (
                  <div key={a.id} className="flex items-center justify-between px-3 py-2 hover:bg-surface-hover">
                    <div>
                      <Link href={`/articles/${a.slug}`} className="text-[13px] text-wiki-link hover:underline font-medium">
                        {a.title}
                      </Link>
                      <span className="ml-2 text-[11px] text-muted">
                        Last edited {new Date(a.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <Link href={`/articles/${a.slug}/edit`} className="h-6 px-2 text-[11px] border border-border rounded hover:bg-muted/50 shrink-0">
                      Edit
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
