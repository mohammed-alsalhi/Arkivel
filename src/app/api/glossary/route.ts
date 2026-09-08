import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const terms = await prisma.glossaryTerm.findMany({
    orderBy: { term: "asc" },
  });
  return NextResponse.json(terms);
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { term, definition, aliases } = await request.json();
  if (!term?.trim() || !definition?.trim()) {
    return NextResponse.json({ error: "Term and definition are required" }, { status: 400 });
  }

  try {
    const entry = await prisma.glossaryTerm.create({
      data: {
        term: term.trim(),
        definition: definition.trim(),
        aliases: Array.isArray(aliases) ? aliases.map((a: string) => a.trim()).filter(Boolean) : [],
      },
    });
    return NextResponse.json(entry, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Term already exists" }, { status: 409 });
  }
}
