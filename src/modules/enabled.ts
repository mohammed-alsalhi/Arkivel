import { notFound } from "next/navigation";
import { NextResponse } from "next/server";
import { cache } from "react";
import { config } from "@/lib/config";
import { moduleById, moduleForPath, resolveEnabledModules } from "./registry";
import type { ModuleDefinition, ModuleId } from "./types";

export { moduleForPath };

/** SystemSetting row holding the admin override: `config: { enabled: ModuleId[] }`. */
export const MODULES_SETTING_KEY = "modules";

/**
 * The stored admin override, or null when the deployment runs on its
 * environment default. The product site has no admin and no wiki database,
 * so it never reads one.
 */
export const getModuleOverride = cache(async (): Promise<unknown> => {
  if (config.siteMode === "product") return null;
  const { default: prisma } = await import("@/lib/prisma");
  const record = await prisma.systemSetting
    .findUnique({ where: { id: MODULES_SETTING_KEY }, select: { config: true } })
    .catch(() => null);
  return record?.config ?? null;
});

/**
 * The enabled module ids for this request: `ARKIVEL_MODULES` (or each
 * module's default), overridden by the `modules` SystemSetting when present.
 * Cached per request; the root layout hands the list to clients.
 */
export const getEnabledModules = cache(async (): Promise<ModuleId[]> => {
  return resolveEnabledModules(process.env.ARKIVEL_MODULES, await getModuleOverride());
});

export async function isModuleEnabled(id: ModuleId): Promise<boolean> {
  return (await getEnabledModules()).includes(id);
}

/** Server pages inside a module: 404 when the module is disabled. */
export async function requireModule(id: ModuleId): Promise<ModuleDefinition> {
  const definition = moduleById(id);
  if (!definition || !(await isModuleEnabled(id))) notFound();
  return definition;
}

/** Route handlers inside a module: the 404 JSON response to return when disabled, else null. */
export async function moduleDisabledResponse(id: ModuleId): Promise<NextResponse | null> {
  if (await isModuleEnabled(id)) return null;
  return NextResponse.json({ error: "Not Found", module: id }, { status: 404 });
}
