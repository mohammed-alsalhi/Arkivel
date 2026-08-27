import ProductHome from "@/components/product/ProductHome";
import { config } from "@/lib/config";

export default async function Home() {
  if (config.siteMode === "product") return <ProductHome />;

  const { default: WikiHome } = await import("@/components/WikiHome");
  return <WikiHome />;
}
