import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin, requireAdmin } from "@/lib/auth";
import { dispatchWebhook } from "@/lib/webhooks";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = requireAdmin(await isAdmin());
  if (denied) return denied;

  const { id } = await params;
  const delivery = await prisma.webhookDelivery.findUnique({
    where: { id },
    include: { webhook: true },
  });

  if (!delivery) {
    return NextResponse.json({ error: "Webhook delivery not found" }, { status: 404 });
  }

  if (!delivery.webhook.active) {
    return NextResponse.json({ error: "Webhook is inactive" }, { status: 409 });
  }

  dispatchWebhook(delivery.event, {
    redeliveryOf: delivery.id,
    originalPayload: delivery.payload,
  });

  return NextResponse.json({ queued: true, deliveryId: delivery.id, event: delivery.event });
}

export const dynamic = "force-dynamic";
