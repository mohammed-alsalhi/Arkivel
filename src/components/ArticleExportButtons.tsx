"use client";

import { config } from "@/lib/config";

type Props = {
  title: string;
  slug: string;
  contentRaw: string | null;
  contentHtml: string;
};

export default function ArticleExportButtons({ title, slug, contentRaw, contentHtml }: Props) {
  function exportPdf() {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>${escapeHtml(title)} - ${escapeHtml(config.name)}</title>
      <style>
        body { font-family: Georgia, serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #202122; }
        h1 { font-size: 1.6rem; border-bottom: 1px solid #a2a9b1; padding-bottom: 4px; }
        h2 { font-size: 1.3rem; border-bottom: 1px solid #a2a9b1; padding-bottom: 3px; }
        h3 { font-size: 1.1rem; }
        img { max-width: 100%; }
        a { color: #0645ad; }
        ul, ol { padding-left: 2rem; }
        blockquote { border-left: 3px solid #c8ccd1; padding-left: 1rem; color: #54595d; font-style: italic; }
      </style></head>
      <body><h1>${escapeHtml(title)}</h1>${contentHtml}</body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  }

  function exportMarkdown() {
    const content = contentRaw || htmlToMarkdownFallback(contentHtml);
    const blob = new Blob([`# ${title}\n\n${content}`], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex gap-1">
      <button
        onClick={exportPdf}
        className="border border-border bg-surface-hover px-2 py-0.5 text-[11px] text-muted hover:text-foreground hover:bg-surface transition-colors"
      >
        Export PDF
      </button>
      <button
        onClick={exportMarkdown}
        className="border border-border bg-surface-hover px-2 py-0.5 text-[11px] text-muted hover:text-foreground hover:bg-surface transition-colors"
      >
        Export MD
      </button>
    </div>
  );
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function htmlToMarkdownFallback(html: string): string {
  return html
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n\n")
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n\n")
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n\n")
    .replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n")
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**")
    .replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*")
    .replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .trim();
}
