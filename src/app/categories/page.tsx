import Link from "next/link";
import prisma from "@/lib/prisma";
import CategoryManager from "@/components/CategoryManager";
import TagManager from "@/components/TagManager";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { articles: true } },
      children: {
        orderBy: { sortOrder: "asc" },
        include: {
          _count: { select: { articles: true } },
          children: {
            orderBy: { sortOrder: "asc" },
            include: { _count: { select: { articles: true } } },
          },
        },
      },
    },
  });

  return (
    <div>
      <h1
        className="text-[1.7rem] font-normal text-heading border-b border-border pb-1 mb-3"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Categories
      </h1>

      <p className="text-[13px] text-muted mb-4">
        The following is a list of all categories in the encyclopedia.
        Select a category to browse its articles.
      </p>

      {categories.length === 0 ? (
        <div className="wiki-notice">No categories have been created yet.</div>
      ) : (
        <div className="max-w-xl mb-6">
          {categories.map((cat) => (
            <CategoryTreeRow key={cat.id} category={cat} depth={0} />
          ))}
        </div>
      )}

      {/* Admin-only create form (client component) */}
      <CategoryManager />

      {/* Admin-only tag management */}
      <TagManager />
    </div>
  );
}

type TreeCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count: { articles: number };
  children?: TreeCategory[];
};

function CategoryTreeRow({ category, depth }: { category: TreeCategory; depth: number }) {
  return (
    <>
      <div
        className="flex items-center gap-2 border-b border-border-light py-1.5 hover:bg-surface-hover"
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
      >
        {depth > 0 && <span className="text-muted text-[12px]">{"\u2514"}</span>}
        <Link
          href={`/categories/${category.slug}`}
          className="text-[13px] font-medium"
        >
          {category.name}
        </Link>
        <span className="text-[11px] text-muted">
          ({category._count.articles} article{category._count.articles !== 1 ? "s" : ""})
        </span>
        {category.description && (
          <span className="text-[12px] text-muted hidden sm:inline">
            &ndash; {category.description}
          </span>
        )}
      </div>
      {category.children?.map((child) => (
        <CategoryTreeRow key={child.id} category={child} depth={depth + 1} />
      ))}
    </>
  );
}

export const dynamic = "force-dynamic";
