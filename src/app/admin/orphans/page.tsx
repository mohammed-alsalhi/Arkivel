import { isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { EmptyState, LinkButton, Page, PageHeader, Section } from "@/components/ui";

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
    <Page>
      <PageHeader
        title="Orphan Articles"
        description={
          <>
            Published articles that no other article links to.
            These may be hard for readers to discover — consider adding links from related articles or a parent article.
            <strong className="ml-2">{orphans.length}</strong> of {articles.length} published articles.
          </>
        }
      />

      {orphans.length === 0 ? (
        <EmptyState title="✓ No orphan articles found — all published articles are linked from at least one other article." />
      ) : (
        <div className="space-y-4">
          {grouped.size > 0 && Array.from(grouped.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([catName, arts]) => (
            <Section key={catName} title={catName}>
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
                      <LinkButton href={`/articles/${a.slug}/edit`}>Edit</LinkButton>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          ))}

          {uncategorized.length > 0 && (
            <Section title="Uncategorized">
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
                    <LinkButton href={`/articles/${a.slug}/edit`} className="shrink-0">
                      Edit
                    </LinkButton>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>
      )}
    </Page>
  );
}
