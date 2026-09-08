import { NextResponse } from "next/server";
import { customization, customizationOptions } from "@/lib/customization";
import { layoutCompositionHooks } from "@/lib/layout-composition";
import {
  colorThemePresets,
  componentPacks,
  createMarketplaceRegistry,
  layoutPresets,
  marketplaceItems,
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
    ui: {
      stylePresets,
      colorThemePresets,
      layoutPresets,
      layoutComposition: layoutCompositionHooks,
      themePacks,
      themePackSchema,
    },
    marketplace: {
      items: marketplaceItems,
      registry,
      registryVersion: registry.version,
      schemaVersion: registry.schemaVersion,
      catalogSource: registry.source,
      contract: registry.contract,
      validation: registry.validation,
    },
  });
}
