import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from "docx";

interface ArticleData {
  title: string;
  content: string;
  excerpt?: string | null;
  createdAt: Date;
}

function htmlToDocxParagraphs(html: string): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  // Strip tags and split by block-level breaks for a simple conversion
  const stripped = html
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, "\x01H1\x02$1\x03")
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, "\x01H2\x02$1\x03")
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, "\x01H3\x02$1\x03")
    .replace(/<h4[^>]*>(.*?)<\/h4>/gi, "\x01H4\x02$1\x03")
    .replace(/<li[^>]*>(.*?)<\/li>/gi, "\x01LI\x02• $1\x03")
    .replace(/<p[^>]*>(.*?)<\/p>/gi, "\x01P\x02$1\x03")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");

  const blocks = stripped.split("\x03").filter(Boolean);
  for (const block of blocks) {
    const typeMatch = block.match(/^\x01(\w+)\x02([\s\S]*)$/);
    if (!typeMatch) {
      const text = block.trim();
      if (text) paragraphs.push(new Paragraph({ children: [new TextRun(text)] }));
      continue;
    }
    const [, type, text] = typeMatch;
    const clean = text.trim();
    if (!clean) continue;
    switch (type) {
      case "H1":
        paragraphs.push(new Paragraph({ text: clean, heading: HeadingLevel.HEADING_1 }));
        break;
      case "H2":
        paragraphs.push(new Paragraph({ text: clean, heading: HeadingLevel.HEADING_2 }));
        break;
      case "H3":
        paragraphs.push(new Paragraph({ text: clean, heading: HeadingLevel.HEADING_3 }));
        break;
      case "H4":
        paragraphs.push(new Paragraph({ text: clean, heading: HeadingLevel.HEADING_4 }));
        break;
      default:
        paragraphs.push(
          new Paragraph({ children: [new TextRun(clean)], alignment: AlignmentType.LEFT })
        );
    }
  }
  return paragraphs;
}

export async function exportArticleAsDocx(article: ArticleData): Promise<Buffer> {
  const contentParagraphs = htmlToDocxParagraphs(article.content);

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({ text: article.title, heading: HeadingLevel.TITLE }),
          ...(article.excerpt
            ? [new Paragraph({ children: [new TextRun({ text: article.excerpt, italics: true })] })]
            : []),
          new Paragraph({ text: "" }),
          ...contentParagraphs,
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}
