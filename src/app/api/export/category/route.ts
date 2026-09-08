import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import JSZip from "jszip";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const categoryId = url.searchParams.get("categoryId");
  const format = url.searchParams.get("format") ?? "zip";

  if (!categoryId) return NextResponse.json({ error: "categoryId required" }, { status: 400 });

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const articles = await prisma.article.findMany({
    where: { categoryId, status: "published" },
    select: { title: true, slug: true, content: true, excerpt: true, createdAt: true },
    orderBy: { sortOrder: "asc" },
  });

  if (format === "zip") {
    const zip = new JSZip();
    for (const article of articles) {
      const md = `# ${article.title}\n\n${article.excerpt ?? ""}\n\n${article.content
        .replace(/<[^>]+>/g, "")
        .trim()}`;
      zip.file(`${article.slug}.md`, md);
    }
    const buffer = await zip.generateAsync({ type: "arraybuffer" });
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${category.slug}-articles.zip"`,
      },
    });
  }

  return NextResponse.json({ error: "Unsupported format" }, { status: 400 });
}

export const dynamic = "force-dynamic";
