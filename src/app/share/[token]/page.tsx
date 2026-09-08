import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { resolveWikiLinks } from "@/lib/wikilinks";
import { expandMacros } from "@/lib/macros";
import { formatDate } from "@/lib/utils";
import { config } from "@/lib/config";
import SpecialBlocksRenderer from "@/components/SpecialBlocksRenderer";
import TableOfContents, { addHeadingIds } from "@/components/TableOfContents";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ token: string }> };

function appendFootnotes(html: string): string {
  const footnotes: string[] = [];
  const regex = /data-footnote="([^"]*)"/g;
  let m;
  while ((m = regex.exec(html)) !== null) footnotes.push(m[1]);
  if (footnotes.length === 0) return html;
  const items = footnotes
    .map((note, i) => `<div style="padding-left:1.5rem"><sup style="position:absolute;left:0;font-weight:700">[${i + 1}]</sup> ${note}</div>`)
    .join("");
  return html + `<div><div style="font-weight:600;margin-bottom:0.5rem">Notes</div>${items}</div>`;
}

export default async function SharePreviewPage({ params }: Props) {
  const { token } = await params;

  const article = await prisma.article.findUnique({
    where: { shareToken: token },
    include: { category: true, tags: { include: { tag: true } } },
  });

  if (!article) notFound();

  const macroExpanded = await expandMacros(article.content);
  const resolved = await resolveWikiLinks(macroExpanded);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="wiki-notice border-l-4 border-l-orange-500 mb-6">
        <strong>Draft preview</strong> — This is a private preview link. This article has not been published.
      </div>

      <h1 className="ui-page-title mb-1">
        {article.title}
      </h1>
      <p className="text-[11px] text-muted mb-4">
        From {config.name} &mdash; Last edited {formatDate(article.updatedAt)}
        {article.category && ` · ${article.category.name}`}
      </p>

      <TableOfContents html={resolved} />

      <div id="article-content">
        <SpecialBlocksRenderer html={addHeadingIds(appendFootnotes(resolved))} />
      </div>

      {article.tags.length > 0 && (
        <div className="mt-6 pt-4 border-t border-border text-[12px] text-muted">
          Tags: {article.tags.map(({ tag }) => tag.name).join(", ")}
        </div>
      )}
    </div>
  );
}
