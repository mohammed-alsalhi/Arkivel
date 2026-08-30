import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { DataTable, EmptyState, LinkButton, Page, PageHeader, Section } from "@/components/ui";

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
        include: {
          _count: {
            select: { articles: { where: { published: true, status: "published" } } },
          },
        },
      },
    },
  });

  if (!category) notFound();

  const [articles, parentChain] = await Promise.all([
    prisma.article.findMany({
      where: { categoryId: category.id, published: true, status: "published" },
      orderBy: [{ isPinned: "desc" }, { sortOrder: "asc" }, { updatedAt: "desc" }],
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
    }),
    getParentChain(category.parentId),
  ]);

  const articleCountText = `${articles.length} article${articles.length !== 1 ? "s" : ""} in this category`;

  return (
    <Page>
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
              {i > 0 && " / "}
              <Link href={`/categories/${p.slug}`}>{p.name}</Link>
            </span>
          ))}
          {" / "}{category.name}
        </nav>
      )}

      <PageHeader
        title={`Category: ${category.name}`}
        description={
          category.description ? (
            <>
              {category.description}
              <br />
              <span>{articleCountText}</span>
            </>
          ) : (
            articleCountText
          )
        }
      />

      {/* Subcategories */}
      {category.children.length > 0 && (
        <Section title="Subcategories">
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
        </Section>
      )}

      {articles.length === 0 ? (
        <EmptyState
          title="No articles yet"
          description="This category is ready for its first article."
          actions={<LinkButton href="/articles/new" variant="primary">Create one</LinkButton>}
        />
      ) : (
        <Section title="Articles in this category">
          <DataTable>
            <thead>
              <tr>
                <th>Article</th>
                <th className="w-28">Last edited</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.id}>
                  <td>
                    {article.isPinned && (
                      <strong className="mr-1 text-[10px] uppercase text-muted">pinned</strong>
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
                  <td className="text-muted text-[12px]">
                    {formatDate(article.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        </Section>
      )}

      <p className="mt-4 text-[13px] flex items-center gap-4">
        <Link href="/categories">All categories</Link>
      </p>
    </Page>
  );
}

export const dynamic = "force-dynamic";
