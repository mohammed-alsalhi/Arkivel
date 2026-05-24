import { NextResponse } from "next/server";
import { customization, customizationOptions } from "@/lib/customization";
import { componentCatalog } from "@/components/ui/catalog";
import { colorThemePresets, marketplaceItems, stylePresets } from "@/lib/marketplace";

export async function GET() {
  return NextResponse.json({
    customization,
    options: customizationOptions,
    ui: {
      componentCatalog,
      stylePresets,
      colorThemePresets,
      themeHooks: [
        "src/app/globals.css @theme tokens",
        "html[data-theme=\"dark\"] overrides",
        "html[data-style=\"classic-wiki\"] default skin",
        "html[data-style=\"atlas-modern\"] alternate built-in skin",
        "html[data-color-theme=\"standard\"] default color palette",
        "html[data-color-theme=\"forest\"] alternate built-in color palette",
        "html[data-color-theme=\"ember\"] alternate built-in color palette",
        "ui-* shared component classes",
        "wiki-* product shell classes",
      ],
    },
    marketplace: {
      items: marketplaceItems,
      contract: {
        id: "Stable machine-readable id",
        kind: "style | color-theme | component-pack | plugin",
        status: "built-in | planned | experimental",
        compatibility: "Arkivel version range or future marker",
      },
    },
  });
}
