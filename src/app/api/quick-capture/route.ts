import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getSession();
  const { title, slug, content, categoryName } = await req.json();

  // Get or create the Inbox category
  let category = await prisma.category.findFirst({ where: { name: categoryName ?? "Inbox" } });
  if (!category) {
    try {
      category = await prisma.category.create({
        data: { name: "Inbox", slug: "inbox", sortOrder: 998 },
      });
    } catch {
      category = await prisma.category.findFirst({ where: { slug: "inbox" } });
    }
  }

  const article = await prisma.article.create({
    data: {
      title: title || "Untitled capture",
      slug: slug || `inbox-${Date.now()}`,
      content: content || "<p></p>",
      status: "draft",
      categoryId: category?.id ?? null,
      userId: session?.id ?? null,
    },
    select: { id: true, slug: true },
  });

  return NextResponse.json(article, { status: 201 });
}
