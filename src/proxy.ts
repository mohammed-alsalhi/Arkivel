import { NextResponse, type NextRequest } from "next/server";
import { isProductRouteAllowed, resolveSiteMode } from "@/lib/site-mode";

const securityHeaders = {
  "Content-Security-Policy-Report-Only":
    "default-src 'self'; base-uri 'self'; frame-ancestors 'none'; object-src 'none'; form-action 'self'; upgrade-insecure-requests",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
  "X-DNS-Prefetch-Control": "off",
  "X-Frame-Options": "DENY",
} as const;

export function proxy(request: NextRequest) {
  const productRouteBlocked = resolveSiteMode(process.env.ARKIVEL_SITE_MODE) === "product"
    && !isProductRouteAllowed(request.nextUrl.pathname);
  const response = productRouteBlocked
    ? new NextResponse("Not Found", { status: 404 })
    : NextResponse.next({ request });

  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/image|favicon.ico).*)"],
};
