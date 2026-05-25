import { NextResponse } from "next/server";
import { customization, customizationOptions } from "@/lib/customization";
import { componentCatalog } from "@/components/ui/catalog";
import {
  colorThemePresets,
  componentPacks,
  createMarketplaceRegistry,
  layoutPresets,
  marketplaceItems,
  marketplaceRegistryContract,
  perSpaceCustomizationContract,
  pluginManifests,
  stylePresets,
  themePackSchema,
  themePacks,
} from "@/lib/marketplace";

export async function GET() {
  const registry = createMarketplaceRegistry();

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
      registry,
      registryVersion: registry.version,
      schemaVersion: registry.schemaVersion,
      catalogSource: registry.source,
      contract: marketplaceRegistryContract,
      validation: registry.validation,
    },
  });
}
