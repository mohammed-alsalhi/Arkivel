import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin, requireAdmin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const denied = requireAdmin(await isAdmin());
  if (denied) return denied;

  const { articleIds } = await request.json();

  if (!Array.isArray(articleIds) || articleIds.length === 0) {
    return NextResponse.json(
      { error: "articleIds must be a non-empty array" },
      { status: 400 }
    );
  }

  // Update sortOrder based on array position using a transaction
  const updates = articleIds.map((id: string, index: number) =>
    prisma.article.update({
      where: { id },
      data: { sortOrder: index },
    })
  );

  await prisma.$transaction(updates);

  return NextResponse.json({ success: true, updated: articleIds.length });
}

export const dynamic = "force-dynamic";
