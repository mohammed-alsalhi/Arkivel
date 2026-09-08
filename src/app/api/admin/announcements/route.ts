import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin, requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const denied = requireAdmin(await isAdmin());
  if (denied) return denied;

  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(announcements);
}

export async function POST(request: NextRequest) {
  const denied = requireAdmin(await isAdmin());
  if (denied) return denied;

  const { message, type, expiresAt, scheduledAt } = await request.json();
  if (!message?.trim()) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  const announcement = await prisma.announcement.create({
    data: {
      message: message.trim(),
      type: type ?? "info",
      active: true,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
    },
  });
  return NextResponse.json(announcement, { status: 201 });
}
