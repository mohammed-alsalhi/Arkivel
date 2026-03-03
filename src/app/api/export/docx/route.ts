import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { exportArticleAsDocx } from "@/lib/export/docx";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const article = await prisma.article.findUnique({
    where: { id },
    select: { title: true, content: true, excerpt: true, createdAt: true },
  });
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const nodeBuffer = await exportArticleAsDocx(article);
  const buffer = nodeBuffer.buffer.slice(
    nodeBuffer.byteOffset,
    nodeBuffer.byteOffset + nodeBuffer.byteLength
  ) as ArrayBuffer;
  const filename = `${article.title.replace(/[^a-z0-9]/gi, "_")}.docx`;

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
