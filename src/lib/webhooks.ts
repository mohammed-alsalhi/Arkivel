import prisma from "@/lib/prisma";
import { createHmac } from "crypto";

export function dispatchWebhook(
  event: string,
  payload: Record<string, unknown>
): void {
  // Fire-and-forget: do not await this
  doDispatch(event, payload).catch((err) => {
    console.error("[Webhook dispatch error]", err);
  });
}

async function doDispatch(
  event: string,
  payload: Record<string, unknown>
): Promise<void> {
  const webhooks = await prisma.webhook.findMany({
    where: {
      active: true,
      events: { has: event },
    },
  });

  const body = JSON.stringify({ event, payload, timestamp: new Date().toISOString() });

  for (const webhook of webhooks) {
    let status = "success";
    let responseCode: number | null = null;

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (webhook.secret) {
        const signature = createHmac("sha256", webhook.secret)
          .update(body)
          .digest("hex");
        headers["X-Webhook-Signature"] = `sha256=${signature}`;
      }

      const res = await fetch(webhook.url, {
        method: "POST",
        headers,
        body,
        signal: AbortSignal.timeout(10000),
      });

      responseCode = res.status;
      if (!res.ok) {
        status = "failed";
      }
    } catch {
      status = "failed";
    }

    // Log delivery
    await prisma.webhookDelivery.create({
      data: {
        webhookId: webhook.id,
        event,
        payload: payload as object,
        status,
        responseCode,
      },
    });
  }
}
