import { CardLink } from "@/components/ui";
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
    <CardLink
      href={`/articles/${article.slug}`}
      className="group min-h-36"
      title={article.title}
      description={article.excerpt}
      media={
        article.coverImage ? (
          <div className="aspect-video w-full overflow-hidden">
            <img
              src={article.coverImage}
              alt={article.title}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </div>
        ) : null
      }
      meta={
        <span className="flex items-center justify-between gap-3">
          <span>{article.category?.name}</span>
          <span>{formatDate(article.updatedAt)}</span>
        </span>
      }
    />
  );
}
