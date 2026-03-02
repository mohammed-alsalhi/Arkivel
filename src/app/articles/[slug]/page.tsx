import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { config } from "@/lib/config";
import { resolveWikiLinks, getBacklinks } from "@/lib/wikilinks";
import AdminEditTab from "@/components/AdminEditTab";
import ArticleExportButtons from "@/components/ArticleExportButtons";
import InfoboxDisplay from "@/components/InfoboxDisplay";
import TableOfContents, { addHeadingIds } from "@/components/TableOfContents";
import RelatedArticles from "@/components/RelatedArticles";

type Props = {
  params: Promise<{ slug: string }>;
};

function appendFootnoteSection(html: string): string {
  const footnotes: string[] = [];
  const regex = /data-footnote="([^"]*)"/g;
  let m;
  while ((m = regex.exec(html)) !== null) {
    footnotes.push(m[1]);
  }
  if (footnotes.length === 0) return html;

  const items = footnotes
    .map((note, i) => `<div class="footnote-item" style="padding-left:1.5rem"><sup style="position:absolute;left:0;font-weight:700;color:var(--color-accent)">[${i + 1}]</sup> ${note}</div>`)
    .join("");

  return html + `<div class="footnote-section"><div class="footnote-section-title">Notes</div>${items}</div>`;
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;

  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      category: true,
      tags: { include: { tag: true } },
    },
  });

  if (!article) notFound();
  if (article.redirectTo) redirect(`/articles/${article.redirectTo}`);

  const [resolvedContent, backlinks, allCategories] = await Promise.all([
    resolveWikiLinks(article.content),
    getBacklinks(slug),
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        children: {
          orderBy: { sortOrder: "asc" },
          include: { children: { orderBy: { sortOrder: "asc" } } },
        },
      },
    }),
  ]);

  return (
    <div>
      {/* Article tabs */}
      <div className="wiki-tabs">
        <span className="wiki-tab wiki-tab-active">Article</span>
        <AdminEditTab slug={slug} />
        <Link href={`/articles/${slug}/history`} className="wiki-tab">
          History
        </Link>
        <Link href={`/articles/${slug}/discussion`} className="wiki-tab">
          Discussion
        </Link>
      </div>

      {/* Article body in bordered content area */}
      <div className="border border-t-0 border-border bg-surface px-5 py-4">
        {/* Article title */}
        <h1
          className="text-[1.7rem] font-normal text-heading border-b border-border pb-1 mb-0.5"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {article.title}
        </h1>

        {/* From World Wiki line + export buttons */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] text-muted">
            From {config.name} &mdash; Last edited {formatDate(article.updatedAt)}
          </p>
          <ArticleExportButtons
            title={article.title}
            slug={article.slug}
            contentRaw={article.contentRaw}
            contentHtml={resolvedContent}
          />
        </div>

        {/* Status badge */}
        {article.status !== "published" && (
          <div className={`wiki-notice ${article.status === "draft" ? "border-l-3 border-l-yellow-500" : "border-l-3 border-l-blue-500"}`}>
            <strong>{article.status === "draft" ? "Draft" : "Under Review"}</strong>
            {" — "} This article has not been published yet.
          </div>
        )}

        {/* Pinned indicator */}
        {article.isPinned && (
          <div className="text-[11px] text-muted mb-1">📌 Pinned article</div>
        )}

        {/* Disambiguation notice */}
        {article.isDisambiguation && (
          <div className="wiki-disambiguation-notice">
            <strong>{article.title}</strong> may refer to multiple subjects.
            This is a <em>disambiguation page</em> listing articles with similar names.
          </div>
        )}

        {/* Infobox */}
        <InfoboxDisplay
          title={article.title}
          coverImage={article.coverImage}
          category={article.category}
          tags={article.tags.map((t) => t.tag)}
          infobox={article.infobox as Record<string, string> | null}
          allCategories={allCategories}
          createdAt={article.createdAt}
          updatedAt={article.updatedAt}
        />

        {/* Table of contents */}
        <TableOfContents html={resolvedContent} />

        {/* Article content */}
        <div
          className="wiki-content"
          dangerouslySetInnerHTML={{ __html: addHeadingIds(appendFootnoteSection(resolvedContent)) }}
        />

        {/* Clear float from infobox */}
        <div className="clear-both" />

        {/* Categories bar at bottom */}
        <div className="wiki-categories">
          <strong>Categories: </strong>
          {article.category ? (
            <Link href={`/categories/${article.category.slug}`}>
              {article.category.name}
            </Link>
          ) : (
            <span className="italic">Uncategorized</span>
          )}
          {article.tags.length > 0 && (
            <>
              {" | "}
              {article.tags.map(({ tag }, i) => (
                <span key={tag.id}>
                  {i > 0 && " | "}
                  <Link href={`/tags/${tag.slug}`}>{tag.name}</Link>
                </span>
              ))}
            </>
          )}
        </div>

        {/* Related articles */}
        <RelatedArticles
          articleId={article.id}
          categoryId={article.categoryId}
          tagIds={article.tags.map(t => t.tag.id)}
        />

        {/* What links here */}
        {backlinks.length > 0 && (
          <div className="mt-4">
            <h2
              className="text-base font-normal text-heading border-b border-border pb-1 mb-2"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              What links here
            </h2>
            <ul className="list-disc pl-6 text-[13px] space-y-0.5">
              {backlinks.map((link) => (
                <li key={link.id}>
                  <Link href={`/articles/${link.slug}`}>
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
