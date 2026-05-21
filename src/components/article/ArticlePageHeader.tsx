import Link from "next/link";
import ArticleViewHistory from "@/components/ArticleViewHistory";
import CertifiedBadge from "@/components/CertifiedBadge";
import FeaturedArticleBadge from "@/components/FeaturedArticleBadge";
import FreshnessBadge from "@/components/FreshnessBadge";
import ReadingLevelBadge from "@/components/ReadingLevelBadge";
import { config } from "@/lib/config";
import { formatDate } from "@/lib/utils";

type CategoryRef = {
  name: string;
  slug: string;
} | null;

type UserRef = {
  username: string;
  displayName: string | null;
};

type CoAuthorRef = {
  user: UserRef;
};

type Props = {
  title: string;
  slug: string;
  excerpt: string | null;
  category: CategoryRef;
  updatedAt: Date | string;
  lastRevisionUser: UserRef | null;
  coAuthors: CoAuthorRef[];
  words: number;
  characters: number;
  readingTimeMin: number;
  plainText: string;
  readCount: number;
  reactionCount: number;
  certifiedAt: Date | string | null;
  isFeatured: boolean;
  status: string;
  lastVerifiedAt: Date | string | null;
};

function pluralize(value: number, singular: string, plural = `${singular}s`) {
  return `${value.toLocaleString()} ${value === 1 ? singular : plural}`;
}

export default function ArticlePageHeader({
  title,
  slug,
  excerpt,
  category,
  updatedAt,
  lastRevisionUser,
  coAuthors,
  words,
  characters,
  readingTimeMin,
  plainText,
  readCount,
  reactionCount,
  certifiedAt,
  isFeatured,
  status,
  lastVerifiedAt,
}: Props) {
  return (
    <section className="article-hero" aria-labelledby="article-h1">
      <div className="article-hero-kicker">
        <span>From {config.name}</span>
        {category && (
          <>
            <span className="article-dot" aria-hidden="true" />
            <Link href={`/categories/${category.slug}`}>{category.name}</Link>
          </>
        )}
      </div>

      <div className="article-title-row">
        <h1 id="article-h1" className="article-title">
          {title}
        </h1>
        <div className="article-title-badges">
          <CertifiedBadge certifiedAt={certifiedAt} />
          {isFeatured && <FeaturedArticleBadge />}
          {status !== "published" && (
            <span className="ui-chip ui-chip-warning">
              {status === "draft" ? "Draft" : "Review"}
            </span>
          )}
        </div>
      </div>

      {excerpt && <p className="article-dek">{excerpt}</p>}

      <div className="article-meta-line">
        <span>Last edited {formatDate(updatedAt)}</span>
        {lastRevisionUser && (
          <span>
            by{" "}
            <Link href={`/users/${lastRevisionUser.username}`}>
              {lastRevisionUser.displayName || lastRevisionUser.username}
            </Link>
          </span>
        )}
        <FreshnessBadge updatedAt={updatedAt} />
        {lastVerifiedAt && (
          <span className="ui-chip ui-chip-success">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Verified {new Date(lastVerifiedAt).toLocaleDateString()}
          </span>
        )}
      </div>

      <div className="article-stat-strip" aria-label="Article statistics">
        <span className="ui-chip">{pluralize(words, "word")}</span>
        <span className="ui-chip">{pluralize(characters, "char")}</span>
        <span className="ui-chip">~{readingTimeMin} min read</span>
        <span className="ui-chip">{pluralize(readCount, "read")}</span>
        <span className="ui-chip">{pluralize(reactionCount, "reaction")}</span>
        <ReadingLevelBadge text={plainText} />
        <ArticleViewHistory slug={slug} title={title} className="ui-chip" />
      </div>

      {coAuthors.length > 0 && (
        <p className="article-coauthors">
          Co-authored by{" "}
          {coAuthors.map((coAuthor, index) => (
            <span key={coAuthor.user.username}>
              {index > 0 && ", "}
              <Link href={`/users/${coAuthor.user.username}`}>
                {coAuthor.user.displayName || coAuthor.user.username}
              </Link>
            </span>
          ))}
        </p>
      )}
    </section>
  );
}
