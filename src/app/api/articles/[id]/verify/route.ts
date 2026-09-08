import { NextRequest, NextResponse } from "next/server";
import { getSession, isAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

// POST — stamp lastVerifiedAt on an article
export async function POST(req: NextRequest, { params }: Params) {
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const session = await getSession();

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const evidence = typeof body.evidence === "string" && body.evidence.trim() ? body.evidence.trim() : null;
  const expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;

  const article = await prisma.article.update({
    where: { id },
    data: {
      lastVerifiedAt: new Date(),
      lastVerifiedById: session?.id ?? null,
      verificationEvidence: evidence,
      verificationExpiresAt: expiresAt,
    },
    select: { lastVerifiedAt: true, lastVerifiedById: true, verificationEvidence: true, verificationExpiresAt: true },
  });

  return NextResponse.json(article);
}
