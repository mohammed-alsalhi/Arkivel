import prisma from "@/lib/prisma";
import {
  WEBHOOK_DELIVERY_HEADER,
  WEBHOOK_RETRY_DELAYS_MS,
  WEBHOOK_SIGNATURE_HEADER,
  WEBHOOK_TIMESTAMP_HEADER,
  createWebhookBody,
  createWebhookSignature,
  isSupportedWebhookEvent,
  shouldRetryWebhook,
} from "@/lib/webhook-reliability";

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
  if (!isSupportedWebhookEvent(event)) return;

  const webhooks = await prisma.webhook.findMany({
    where: {
      active: true,
      events: { has: event },
    },
  });

  const timestamp = new Date().toISOString();
  const body = createWebhookBody(event, payload, timestamp);

  for (const webhook of webhooks) {
    const startedAt = Date.now();
    let status = "success";
    let responseCode: number | null = null;
    let lastError: string | null = null;
    const deliveryId = crypto.randomUUID();

    for (let attempt = 1; attempt <= WEBHOOK_RETRY_DELAYS_MS.length; attempt++) {
      const delay = WEBHOOK_RETRY_DELAYS_MS[attempt - 1] ?? 0;
      if (delay > 0) await new Promise((resolve) => setTimeout(resolve, delay));

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        [WEBHOOK_TIMESTAMP_HEADER]: timestamp,
        [WEBHOOK_DELIVERY_HEADER]: deliveryId,
      };

      if (webhook.secret) {
        headers[WEBHOOK_SIGNATURE_HEADER] = createWebhookSignature({
          body,
          secret: webhook.secret,
          timestamp,
        });
      }

      try {
        const res = await fetch(webhook.url, {
          method: "POST",
          headers,
          body,
          signal: AbortSignal.timeout(10000),
        });

        responseCode = res.status;
        lastError = null;
        if (res.ok) {
          status = "success";
          break;
        }
        status = "failed";
      } catch (error) {
        status = "failed";
        responseCode = null;
        lastError = error instanceof Error ? error.message : "Delivery failed";
      }

      if (!shouldRetryWebhook(responseCode, attempt)) break;
      status = "retrying";
    }

    // Log delivery
    await prisma.webhookDelivery.create({
      data: {
        webhookId: webhook.id,
        event,
        payload: {
          ...(payload as object),
          deliveryId,
          attempts: status === "success" ? undefined : WEBHOOK_RETRY_DELAYS_MS.length,
          lastError,
        },
        status,
        responseCode,
      },
    });
    await prisma.metricLog.create({
      data: {
        duration: Date.now() - startedAt,
        metadata: { deliveryId, event, webhookId: webhook.id },
        path: webhook.url,
        status: responseCode,
        type: "webhook_delivery",
      },
    }).catch(() => null);
  }
}
