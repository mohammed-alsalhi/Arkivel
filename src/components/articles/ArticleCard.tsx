import Link from "next/link";
import { formatDate } from "@/lib/utils";

type ArticleCardProps = {
  article: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    coverImage: string | null;
    updatedAt: Date;
    category: { name: string; slug: string } | null;
    tags: { tag: { id: string; name: string; slug: string; color: string | null } }[];
  };
};

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group flex min-h-36 flex-col border border-border bg-surface transition-colors hover:bg-surface-hover hover:no-underline"
    >
      {article.coverImage && (
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={article.coverImage}
            alt={article.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-3">
        <h3
          className="text-[15px] font-semibold leading-snug text-wiki-link group-hover:underline"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="mt-1.5 line-clamp-2 text-[12px] text-muted leading-relaxed">
            {article.excerpt}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between gap-3 pt-3 text-[11px] text-muted">
          <span>
            {article.category && (
              <>{article.category.name}</>
            )}
          </span>
          <span>{formatDate(article.updatedAt)}</span>
        </div>
      </div>
    </Link>
  );
}
