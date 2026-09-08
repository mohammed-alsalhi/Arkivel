import { NextRequest, NextResponse } from "next/server";
import { isAdmin, requireAdmin } from "@/lib/auth";
import { dispatchWebhook } from "@/lib/webhooks";
import { isSupportedWebhookEvent, webhookReliabilityContract } from "@/lib/webhook-reliability";

export async function POST(request: NextRequest) {
  const denied = requireAdmin(await isAdmin());
  if (denied) return denied;

  const body = await request.json().catch(() => ({}));
  const event = typeof body.event === "string" ? body.event : "article.updated";

  if (!isSupportedWebhookEvent(event)) {
    return NextResponse.json({ error: "Unsupported webhook event", supported: webhookReliabilityContract.eventSchemas }, { status: 400 });
  }

  dispatchWebhook(event, {
    test: true,
    sentAt: new Date().toISOString(),
    source: "/api/webhooks/test",
  });

  return NextResponse.json({ queued: true, event });
}

export const dynamic = "force-dynamic";
