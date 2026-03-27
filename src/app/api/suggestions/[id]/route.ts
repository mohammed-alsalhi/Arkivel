import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/suggestions/[id] — admin: update status ("accepted" | "rejected") + optional adminNote
 * DELETE /api/suggestions/[id] — admin: delete suggestion
 */

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const { status, adminNote } = await request.json();

  if (!["accepted", "rejected", "pending"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updated = await prisma.editSuggestion.update({
    where: { id },
    data: { status, adminNote: adminNote ?? undefined },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  await prisma.editSuggestion.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
