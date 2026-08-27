import { NextResponse, type NextRequest } from "next/server";
import { buildSecurityHeaders } from "@/lib/security-review";
import { isProductRouteAllowed, resolveSiteMode } from "@/lib/site-mode";

export function proxy(request: NextRequest) {
  const productRouteBlocked = resolveSiteMode(process.env.ARKIVEL_SITE_MODE) === "product"
    && !isProductRouteAllowed(request.nextUrl.pathname);
  const response = productRouteBlocked
    ? new NextResponse("Not Found", { status: 404 })
    : NextResponse.next({ request });

  for (const [key, value] of Object.entries(buildSecurityHeaders())) {
    response.headers.set(key, value);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/image|favicon.ico).*)"],
};
