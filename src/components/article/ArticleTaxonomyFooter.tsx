import Link from "next/link";

type CategoryRef = {
  name: string;
  slug: string;
} | null;

type TagRef = {
  id: string;
  name: string;
  slug: string;
};

type Props = {
  category: CategoryRef;
  tags: TagRef[];
};

export default function ArticleTaxonomyFooter({ category, tags }: Props) {
  return (
    <nav className="article-taxonomy" aria-label="Article taxonomy">
      <div className="article-taxonomy-group">
        <span className="article-taxonomy-label">Category</span>
        <div className="article-taxonomy-chips">
          {category ? (
            <Link href={`/categories/${category.slug}`} className="ui-chip article-taxonomy-chip">
              {category.name}
            </Link>
          ) : (
            <span className="ui-chip">Uncategorized</span>
          )}
        </div>
      </div>

      {tags.length > 0 && (
        <div className="article-taxonomy-group">
          <span className="article-taxonomy-label">Tags</span>
          <div className="article-taxonomy-chips">
            {tags.map((tag) => (
              <Link key={tag.id} href={`/tags/${tag.slug}`} className="ui-chip article-taxonomy-chip">
                {tag.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
