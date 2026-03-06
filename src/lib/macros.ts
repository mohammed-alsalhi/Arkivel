import prisma from "./prisma";

let cache: Map<string, string> | null = null;
let cacheTime = 0;
const CACHE_TTL = 60_000; // 1 minute

async function getMacroMap(): Promise<Map<string, string>> {
  if (cache && Date.now() - cacheTime < CACHE_TTL) return cache;
  const macros = await prisma.macro.findMany({ select: { name: true, template: true } });
  cache = new Map(macros.map((m) => [m.name, m.template]));
  cacheTime = Date.now();
  return cache;
}

/**
 * Expand {{macroName|arg1|arg2}} shortcodes in HTML.
 * Template variables: {{{1}}}, {{{2}}}, ..., {{{body}}} (alias for {{{1}}})
 */
export async function expandMacros(html: string): Promise<string> {
  if (!html.includes("{{")) return html;

  const macros = await getMacroMap();
  if (macros.size === 0) return html;

  return html.replace(/\{\{([^}|]+)(\|[^}]*)?\}\}/g, (_match, rawName: string, rawArgs: string | undefined) => {
    const name = rawName.trim().toLowerCase();
    const template = macros.get(name);
    if (!template) return _match; // Unknown macro — leave as-is

    const args = rawArgs ? rawArgs.slice(1).split("|") : [];
    let result = template;
    args.forEach((arg, i) => {
      result = result.replaceAll(`{{{${i + 1}}}}`, arg.trim());
    });
    // {{{body}}} is alias for first arg
    result = result.replaceAll("{{{body}}}", args[0]?.trim() ?? "");
    // Clear unused placeholders
    result = result.replace(/\{\{\{\d+\}\}\}/g, "").replace(/\{\{\{body\}\}\}/g, "");
    return result;
  });
}

/** Invalidate the in-process cache (call after admin saves a macro) */
export function invalidateMacroCache() {
  cache = null;
}
