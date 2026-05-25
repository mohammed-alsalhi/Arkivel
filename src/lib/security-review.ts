export const SECURITY_REVIEW_SCHEMA_VERSION = "2026-05-25.v4.89.0";

export type SecuritySurface =
  | "auth"
  | "sessions"
  | "api-keys"
  | "csrf"
  | "webhooks"
  | "imports"
  | "uploads"
  | "plugin-manifests"
  | "marketplace-packs"
  | "admin-routes"
  | "exports";

export type SecurityReviewItem = {
  checks: string[];
  notes: string;
  owner: "core" | "admin" | "plugin-author" | "self-host-operator";
  status: "hardened" | "review-required" | "planned";
  surface: SecuritySurface;
};

export type AbuseCase = {
  expected: string;
  id: string;
  scenario: string;
  surface: SecuritySurface;
};

export const securityReviewChecklist: SecurityReviewItem[] = [
  {
    checks: ["admin secret fallback", "role hierarchy", "login errors", "registration policy"],
    notes: "Local installs can run without ADMIN_SECRET, but production deployments should set it and use user accounts for attribution.",
    owner: "self-host-operator",
    status: "review-required",
    surface: "auth",
  },
  {
    checks: ["httpOnly", "sameSite=strict", "secure in production", "30-day expiry", "expired-session cleanup"],
    notes: "Session cookies are httpOnly and strict; middleware now adds browser security headers to every app response.",
    owner: "core",
    status: "hardened",
    surface: "sessions",
  },
  {
    checks: ["X-API-Key required", "last-used tracking", "scope freeze planning", "no browser cookie fallback"],
    notes: "Public API v1 requires X-API-Key. Fine-grained API key scopes remain a pre-v5 review item.",
    owner: "core",
    status: "review-required",
    surface: "api-keys",
  },
  {
    checks: ["mutating route inventory", "sameSite cookie boundary", "admin POST/PUT/PATCH/DELETE review"],
    notes: "SameSite=strict cookies reduce ambient cross-site writes; mutating admin routes stay on the abuse-case matrix for pre-v5 review.",
    owner: "core",
    status: "review-required",
    surface: "csrf",
  },
  {
    checks: ["timestamp signatures", "replay window", "delivery redaction", "redelivery access"],
    notes: "Webhook reliability metadata covers signing, replay protection, retries, and admin-only redelivery.",
    owner: "core",
    status: "hardened",
    surface: "webhooks",
  },
  {
    checks: ["dry-run import reports", "path traversal", "private-data warnings", "rollback plan"],
    notes: "Current import rehearsal contracts are dry-run-first and separate from future write-capable restore flows.",
    owner: "core",
    status: "review-required",
    surface: "imports",
  },
  {
    checks: ["admin-only upload", "content type", "size limits", "asset privacy"],
    notes: "Uploads remain admin-only; file scanning and storage-retention policies need final pre-v5 deployment guidance.",
    owner: "self-host-operator",
    status: "review-required",
    surface: "uploads",
  },
  {
    checks: ["manifest-only discovery", "permission prompts", "blocked remote code", "route namespace"],
    notes: "Trusted local plugins are manifest-first and do not import remote code during discovery.",
    owner: "plugin-author",
    status: "hardened",
    surface: "plugin-manifests",
  },
  {
    checks: ["preview-only imports", "checksums", "unsafe permissions", "remote URL rejection"],
    notes: "Marketplace pack import parsing remains preview-only and rejects executable or unsafe payloads before install support exists.",
    owner: "core",
    status: "hardened",
    surface: "marketplace-packs",
  },
  {
    checks: ["requireAdmin coverage", "redirect-only pages", "diagnostic redaction", "manual action auditability"],
    notes: "Admin APIs should use requireAdmin or an equivalent role check and keep support bundles redacted.",
    owner: "core",
    status: "review-required",
    surface: "admin-routes",
  },
  {
    checks: ["admin-only downloads", "manifest checksums", "omitted private data", "downloadable history"],
    notes: "Export endpoints attach checksums/manifests and keep history reports admin-only.",
    owner: "core",
    status: "hardened",
    surface: "exports",
  },
];

export const securityHeaders = {
  "Cross-Origin-Opener-Policy": "same-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
  "X-DNS-Prefetch-Control": "off",
  "X-Frame-Options": "DENY",
} as const;

export const cspReportOnly =
  "default-src 'self'; base-uri 'self'; frame-ancestors 'none'; object-src 'none'; form-action 'self'; upgrade-insecure-requests";

export const abuseCaseTestMatrix: AbuseCase[] = [
  {
    expected: "Unauthenticated users receive 401/403 or redirect responses from admin APIs and pages.",
    id: "admin-route-access",
    scenario: "Anonymous request attempts to read admin operations, cache, maintenance, users, exports, or plugin settings.",
    surface: "admin-routes",
  },
  {
    expected: "Draft/review content stays hidden from public readers unless an admin session or explicit share token allows access.",
    id: "draft-visibility",
    scenario: "Anonymous or API-key-only caller requests a non-published article through public article/search/feed surfaces.",
    surface: "auth",
  },
  {
    expected: "Public API v1 rejects missing or invalid X-API-Key and never falls back to browser session cookies.",
    id: "api-key-required",
    scenario: "External client calls /api/v1 articles, categories, tags, or search without X-API-Key.",
    surface: "api-keys",
  },
  {
    expected: "Only admin users can grant plugin permissions; runtime use remains role-aware and anonymous-safe.",
    id: "plugin-permission-grant",
    scenario: "Editor, viewer, API key, or anonymous actor attempts to grant settings, file, job, or webhook permissions.",
    surface: "plugin-manifests",
  },
];

export const dependencySupplyChainChecklist = [
  "Run npm audit or the deployment platform's dependency scanner before release candidates.",
  "Review Next.js, React, Prisma, PostgreSQL adapter, Tiptap, and auth-related advisories before v5.",
  "Keep package-lock.json committed and review unexpected transitive dependency churn.",
  "Reject marketplace packs and plugin manifests that point to executable remote payloads or unsupported schema versions.",
  "Document any accepted vulnerability with impact, mitigation, and upgrade plan in release notes.",
] as const;

export const preV5ThreatModelDraft = {
  assets: ["article content", "drafts", "users", "sessions", "API keys", "webhook secrets", "exports", "plugin manifests", "marketplace packs"],
  primaryThreats: [
    "unauthorized admin access",
    "draft leakage through public routes",
    "cross-site writes against mutating routes",
    "unsafe plugin or marketplace payloads",
    "export/import privacy mistakes",
    "webhook replay or secret exposure",
  ],
  trustBoundaries: ["browser session cookies", "X-API-Key clients", "admin-only routes", "trusted local plugin directories", "preview-only marketplace imports", "external webhook receivers"],
} as const;

export const securityReviewContract = {
  apiRoute: "/api/security/review",
  docs: "docs/security-review.md",
  headers: Object.keys(securityHeaders),
  reportOnlyCsp: true,
  schemaVersion: SECURITY_REVIEW_SCHEMA_VERSION,
  surfaces: securityReviewChecklist.map((item) => item.surface),
  threatModelAssets: preV5ThreatModelDraft.assets,
} as const;

export function buildSecurityHeaders() {
  return {
    ...securityHeaders,
    "Content-Security-Policy-Report-Only": cspReportOnly,
  };
}

export function classifySecurityPath(pathname: string): SecuritySurface | "public" {
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) return "admin-routes";
  if (pathname.startsWith("/api/auth") || pathname.startsWith("/login") || pathname.startsWith("/register")) return "auth";
  if (pathname.startsWith("/api/v1")) return "api-keys";
  if (pathname.startsWith("/api/webhooks")) return "webhooks";
  if (pathname.startsWith("/api/import")) return "imports";
  if (pathname.startsWith("/api/upload")) return "uploads";
  if (pathname.startsWith("/api/plugins")) return "plugin-manifests";
  if (pathname.startsWith("/api/export")) return "exports";
  return "public";
}

export function isCsrfSensitiveRequest(pathname: string, method: string) {
  const normalizedMethod = method.toUpperCase();
  if (["GET", "HEAD", "OPTIONS"].includes(normalizedMethod)) return false;
  return ["auth", "admin-routes", "imports", "uploads", "exports", "plugin-manifests"].includes(classifySecurityPath(pathname));
}
