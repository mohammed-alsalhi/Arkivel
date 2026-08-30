export type SiteMode = "product" | "wiki";

export function resolveSiteMode(value: string | undefined): SiteMode {
  return value === "product" ? "product" : "wiki";
}

const PRODUCT_ROUTES = new Set([
  "/",
  "/api-docs",
  "/api/v1/contract",
  "/api/v1/openapi.json",
  "/api/v1/sdk",
  "/docs",
  "/manifest.webmanifest",
  "/robots.txt",
  "/sitemap.xml",
]);

export function isProductRouteAllowed(pathname: string): boolean {
  return PRODUCT_ROUTES.has(pathname)
    || pathname.startsWith("/_next/")
    || pathname.startsWith("/_vercel/")
    || pathname.startsWith("/brand/");
}
