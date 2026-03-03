import prisma from "./prisma";
import { stripHtml, generateSlug } from "./utils";

export type LintLevel = "error" | "warning" | "info";

export type LintResult = {
  level: LintLevel;
  message: string;
  rule: string;
};

export type ArticleLintInput = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  categoryId: string | null;
  tags: { tagId: string }[];
};

export type ArticleLintReport = {
  articleId: string;
  articleTitle: string;
  articleSlug: string;
  results: LintResult[];
};

/**
 * Lint a single article against content quality rules.
 * The `existingSlugs` set is used to check for broken wiki links without
 * hitting the database — callers are expected to supply it.
 */
export function lintArticle(
  article: ArticleLintInput,
  existingSlugs: Set<string>
): LintResult[] {
  const results: LintResult[] = [];

  // Rule: missing excerpt
  if (!article.excerpt || article.excerpt.trim().length === 0) {
    results.push({
      level: "warning",
      message: "Article has no excerpt. Excerpts improve search results and link previews.",
      rule: "missing-excerpt",
    });
  }

  // Rule: no category
  if (!article.categoryId) {
    results.push({
      level: "warning",
      message: "Article is not assigned to any category.",
      rule: "no-category",
    });
  }

  // Rule: very short content
  const plainText = stripHtml(article.content);
  if (plainText.length < 100) {
    results.push({
      level: "info",
      message: `Article content is very short (${plainText.length} characters). Consider expanding it.`,
      rule: "short-content",
    });
  }

  // Rule: no tags
  if (!article.tags || article.tags.length === 0) {
    results.push({
      level: "info",
      message: "Article has no tags assigned. Tags help with discovery and organization.",
      rule: "no-tags",
    });
  }

  // Rule: broken wiki links
  const wikiLinkRegex = /data-wiki-link="([^"]*)"/g;
  let match;
  const checkedLinks = new Set<string>();

  while ((match = wikiLinkRegex.exec(article.content)) !== null) {
    const linkTitle = match[1];
    if (checkedLinks.has(linkTitle)) continue;
    checkedLinks.add(linkTitle);

    const linkSlug = generateSlug(linkTitle);
    if (!existingSlugs.has(linkSlug)) {
      results.push({
        level: "error",
        message: `Broken wiki link: "${linkTitle}" does not match any existing article.`,
        rule: "broken-wiki-link",
      });
    }
  }

  return results;
}

/**
 * Lint all articles in the wiki, including orphaned article detection.
 * Returns a report for every article that has at least one lint result.
 */
export async function lintAllArticles(): Promise<ArticleLintReport[]> {
  const articles = await prisma.article.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
      excerpt: true,
      categoryId: true,
      tags: { select: { tagId: true } },
    },
  });

  // Build slug set once for broken-link checks
  const existingSlugs = new Set(articles.map((a) => a.slug));

  // Build a set of slugs that are linked to by at least one other article
  const linkedSlugs = new Set<string>();
  for (const article of articles) {
    const wikiLinkRegex = /data-wiki-link="([^"]*)"/g;
    let match;
    while ((match = wikiLinkRegex.exec(article.content)) !== null) {
      const targetSlug = generateSlug(match[1]);
      // Only count cross-article links, not self-links
      if (targetSlug !== article.slug) {
        linkedSlugs.add(targetSlug);
      }
    }
  }

  const reports: ArticleLintReport[] = [];

  for (const article of articles) {
    const results = lintArticle(article, existingSlugs);

    // Orphan detection: article has no incoming wiki links from other articles
    if (!linkedSlugs.has(article.slug)) {
      results.push({
        level: "info",
        message: "Orphaned article: no other articles link to this page.",
        rule: "orphaned",
      });
    }

    if (results.length > 0) {
      reports.push({
        articleId: article.id,
        articleTitle: article.title,
        articleSlug: article.slug,
        results,
      });
    }
  }

  // Sort reports: articles with errors first, then by number of issues descending
  const levelWeight: Record<LintLevel, number> = { error: 3, warning: 2, info: 1 };
  reports.sort((a, b) => {
    const aMax = Math.max(...a.results.map((r) => levelWeight[r.level]));
    const bMax = Math.max(...b.results.map((r) => levelWeight[r.level]));
    if (aMax !== bMax) return bMax - aMax;
    return b.results.length - a.results.length;
  });

  return reports;
}
