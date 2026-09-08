import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type Params = { params: Promise<{ categoryId: string }> };

export async function GET(_: NextRequest, { params }: Params) {
  const { categoryId } = await params;
  const schema = await prisma.metadataSchema.findUnique({ where: { categoryId } });
  if (!schema) return NextResponse.json({ fields: [] });
  return NextResponse.json(schema);
}

export const dynamic = "force-dynamic";
