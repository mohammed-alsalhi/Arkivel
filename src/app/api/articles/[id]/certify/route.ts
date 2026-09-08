import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
  const { id } = await params;
  const user = await getSession();
  if (!user || !await isAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Check >= 2 approved expert reviews
  const approvedReviews = await prisma.reviewRequest.count({
    where: { articleId: id, status: "approved" },
  });

  if (approvedReviews < 2) {
    return NextResponse.json(
      { error: `Need at least 2 approved reviews; currently have ${approvedReviews}` },
      { status: 400 }
    );
  }

  const updated = await prisma.article.update({
    where: { id },
    data: { certified: true, certifiedAt: new Date() },
    select: { id: true, certified: true, certifiedAt: true },
  });

  return NextResponse.json(updated);
}

export const dynamic = "force-dynamic";
