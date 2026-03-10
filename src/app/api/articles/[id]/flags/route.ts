import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

// GET — current flags
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const article = await prisma.article.findUnique({ where: { id }, select: { flags: true } });
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ flags: article.flags });
}

// PUT — replace flags array (body: { flags: string[] })
export async function PUT(req: NextRequest, { params }: Params) {
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { flags } = await req.json();
  if (!Array.isArray(flags)) return NextResponse.json({ error: "flags must be an array" }, { status: 400 });

  const article = await prisma.article.update({
    where: { id },
    data: { flags: flags.map((f: string) => f.trim()).filter(Boolean) },
    select: { flags: true },
  });
  return NextResponse.json({ flags: article.flags });
}
