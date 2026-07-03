# Webhook Reliability

Arkivel v4.86.2 hardens the webhook contract with timestamped signatures, retry metadata, redelivery, event schemas, replay protection, and local testing guidance.

## Signing

Webhook deliveries include:

- `X-Arkivel-Signature`
- `X-Arkivel-Timestamp`
- `X-Arkivel-Delivery`

The signature payload is:

```text
timestamp + "." + rawBody
```

The signature format is `sha256=<hmac>`.

## Replay Protection

Consumers should reject deliveries when `X-Arkivel-Timestamp` is more than 300 seconds away from local time. Use constant-time comparison for signatures.

## Retries And Redelivery

Arkivel retries transient delivery failures with delays of `0ms`, `2000ms`, and `10000ms`. Retryable statuses are `408`, `425`, `429`, `500`, `502`, `503`, and `504`, plus network failures.

Admins can queue a redelivery with:

```http
POST /api/webhooks/deliveries/:id/redeliver
```

Admins can send a test event with:

```http
POST /api/webhooks/test
Content-Type: application/json

{ "event": "article.updated" }
```

## Event Schemas

The webhook reliability contract in `src/lib/webhook-reliability.ts` groups event schemas for:

- article
- category
- review
- claim
- export
- import
- plugin
- customization
- user

Unsupported event names are skipped by the dispatcher and rejected by the test sender.

## Local Receiver

For local testing:

```js
import { createHmac, timingSafeEqual } from "node:crypto";

export function verify({ body, secret, signature, timestamp }) {
  const expected = `sha256=${createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex")}`;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}
```

Expose the receiver with a tunnel, configure the URL under `/admin/webhooks`, set a shared secret, then call `POST /api/webhooks/test`.
