import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { resolveWikiLinks } from "@/lib/wikilinks";
import SpecialBlocksRenderer from "@/components/SpecialBlocksRenderer";

function appendFootnoteSection(html: string): string {
  const footnotes: string[] = [];
  const regex = /data-footnote="([^"]*)"/g;
  let m;
  while ((m = regex.exec(html)) !== null) footnotes.push(m[1]);
  if (footnotes.length === 0) return html;
  const items = footnotes
    .map((note, i) => `<div style="padding-left:1.5rem"><sup style="position:absolute;left:0;font-weight:700">[${i + 1}]</sup> ${note}</div>`)
    .join("");
  return html + `<div>${items}</div>`;
}

export const revalidate = 300; // 5-minute cache

interface Props {
  params: Promise<{ token: string }>;
}

export default async function EmbedPage({ params }: Props) {
  const { token } = await params;

  const embedToken = await prisma.embedToken.findUnique({
    where: { token },
    include: {
      article: {
        select: { id: true, title: true, content: true, status: true, slug: true },
      },
    },
  });

  if (!embedToken || embedToken.article.status !== "published") notFound();

  const { article } = embedToken;
  const resolvedContent = await resolveWikiLinks(article.content);
  const finalHtml = appendFootnoteSection(resolvedContent);

  return (
    <div className="embed-widget p-4 font-sans text-sm max-w-3xl mx-auto">
      <h1 className="text-lg font-bold mb-3">{article.title}</h1>
      <SpecialBlocksRenderer html={finalHtml} />
      <p className="mt-4 text-xs text-muted">
        <a
          href={`/articles/${article.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          View full article →
        </a>
      </p>
    </div>
  );
}

export const dynamic = "force-dynamic";
