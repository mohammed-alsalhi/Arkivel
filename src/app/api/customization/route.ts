import { NextResponse } from "next/server";
import { customization, customizationOptions } from "@/lib/customization";
import { componentCatalog } from "@/components/ui/catalog";
import {
  colorThemePresets,
  componentPacks,
  layoutPresets,
  marketplaceItems,
  perSpaceCustomizationContract,
  pluginManifests,
  stylePresets,
  themePackSchema,
  themePacks,
  validateMarketplaceCatalog,
} from "@/lib/marketplace";

export async function GET() {
  return NextResponse.json({
    customization,
    options: customizationOptions,
    stylePresets,
    colorThemePresets,
    layoutPresets,
    componentPacks,
    pluginManifests,
    themePackSchema,
    themePacks,
    perSpaceCustomizationContract,
    ui: {
      componentCatalog,
      stylePresets,
      colorThemePresets,
      layoutPresets,
      componentPacks,
      pluginManifests,
      themePackSchema,
      themePacks,
      perSpaceCustomizationContract,
      themeHooks: [
        "src/app/globals.css @theme tokens",
        "html[data-theme=\"dark\"] overrides",
        "html[data-style=\"classic-wiki\"] default skin",
        "html[data-style=\"atlas-modern\"] alternate built-in skin",
        "html[data-color-theme=\"standard\"] default color palette",
        "html[data-color-theme=\"forest\"] alternate built-in color palette",
        "html[data-color-theme=\"ember\"] alternate built-in color palette",
        "html[data-layout=\"classic-wiki\"] default layout preset hook",
        "ui-* shared component classes",
        "wiki-* product shell classes",
      ],
    },
    marketplace: {
      items: marketplaceItems,
      contract: {
        id: "Stable machine-readable id",
        kind: "style | color-theme | layout | component-pack | plugin | theme-pack",
        status: "built-in | planned | experimental",
        compatibility: "Arkivel version range or future marker",
      },
      validation: validateMarketplaceCatalog(),
    },
  });
}
