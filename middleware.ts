import { NextResponse, type NextRequest } from "next/server";
import { buildSecurityHeaders } from "@/lib/security-review";

export function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });

  for (const [key, value] of Object.entries(buildSecurityHeaders())) {
    response.headers.set(key, value);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/image|favicon.ico).*)"],
};
