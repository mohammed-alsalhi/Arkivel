import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { invalidateMacroCache } from "@/lib/macros";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const { name, description, template } = await request.json();
  try {
    const macro = await prisma.macro.update({
      where: { id },
      data: {
        name: name?.trim().toLowerCase(),
        description: description?.trim() || null,
        template: template?.trim(),
      },
    });
    invalidateMacroCache();
    return NextResponse.json(macro);
  } catch {
    return NextResponse.json({ error: "Not found or name conflict" }, { status: 404 });
  }
}

export async function DELETE(_: NextRequest, { params }: Params) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  await prisma.macro.delete({ where: { id } });
  invalidateMacroCache();
  return NextResponse.json({ ok: true });
}

export const dynamic = "force-dynamic";
