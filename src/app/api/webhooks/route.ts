import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin, requireAdmin } from "@/lib/auth";

export async function GET() {
  const denied = requireAdmin(await isAdmin());
  if (denied) return denied;

  const webhooks = await prisma.webhook.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      deliveries: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          event: true,
          status: true,
          responseCode: true,
          createdAt: true,
        },
      },
      _count: { select: { deliveries: true } },
    },
  });

  return NextResponse.json(webhooks);
}

export async function POST(request: NextRequest) {
  const denied = requireAdmin(await isAdmin());
  if (denied) return denied;

  const body = await request.json();
  const { url, events, secret } = body;

  if (!url || !events || !Array.isArray(events) || events.length === 0) {
    return NextResponse.json(
      { error: "url and events[] are required" },
      { status: 400 }
    );
  }

  const webhook = await prisma.webhook.create({
    data: {
      url,
      events,
      secret: secret || null,
      active: true,
    },
  });

  return NextResponse.json(webhook, { status: 201 });
}

export const dynamic = "force-dynamic";
