import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { invalidateMacroCache } from "@/lib/macros";

export async function GET() {
  const macros = await prisma.macro.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(macros);
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { name, description, template } = await request.json();
  if (!name?.trim() || !template?.trim()) {
    return NextResponse.json({ error: "name and template required" }, { status: 400 });
  }
  try {
    const macro = await prisma.macro.create({
      data: { name: name.trim().toLowerCase(), description: description?.trim() || null, template: template.trim() },
    });
    invalidateMacroCache();
    return NextResponse.json(macro, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Name already exists" }, { status: 409 });
  }
}

export const dynamic = "force-dynamic";
