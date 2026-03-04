import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const revisions = await prisma.articleRevision.findMany({
    where: { articleId: id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      editSummary: true,
      createdAt: true,
    },
  });

  return NextResponse.json(revisions);
}

export const dynamic = "force-dynamic";
