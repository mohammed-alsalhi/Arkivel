# Security Review

Arkivel v4.89.0 starts the pre-v5 security review with conservative browser headers, a public review contract, abuse-case gates, dependency review guidance, and a threat-model draft.

## Surfaces

- `/api/security/review` publishes the review checklist, security header set, abuse-case matrix, supply-chain checklist, and threat-model draft.
- `securityReview` in `/api/customization` exposes the schema version, API route, reviewed surfaces, header names, and threat-model asset list.
- `middleware.ts` adds browser security headers to app responses.

## Header Hardening

Arkivel now sends:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Cross-Origin-Opener-Policy: same-origin`
- `X-DNS-Prefetch-Control: off`
- `Permissions-Policy` disabling camera, microphone, geolocation, payment, USB, and browsing topics
- `Content-Security-Policy-Report-Only` with self/default, no object embedding, self form actions, and no framing

The CSP is report-only for v4.89.0 so self-host installs can identify inline-script or asset issues before v5 enforcement.

## Review Checklist

The review covers auth, sessions, API keys, CSRF-sensitive writes, webhooks, imports, uploads, plugin manifests, marketplace packs, admin routes, and exports. Each surface records checks, status, owner, and notes in `src/lib/security-review.ts`.

## Abuse-Case Gates

Pre-v5 release rehearsals must keep regression coverage for:

- Anonymous access to admin routes.
- Draft/review visibility through public article, search, feed, and API surfaces.
- Missing or invalid `X-API-Key` on public REST API v1.
- Plugin permission grants by non-admin actors.

## Supply Chain

Run dependency scanning before release candidates, review advisories for Next.js, React, Prisma, PostgreSQL adapter, Tiptap, and auth-adjacent packages, keep `package-lock.json` committed, and document accepted vulnerabilities with mitigation and upgrade plans.

## Threat Model Draft

Primary assets are article content, drafts, users, sessions, API keys, webhook secrets, exports, plugin manifests, and marketplace packs. Primary threats are unauthorized admin access, draft leakage, cross-site writes, unsafe plugin/marketplace payloads, export/import privacy mistakes, and webhook replay or secret exposure.
