import { NextRequest, NextResponse } from "next/server";
import { isAdmin, requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { loadPlugins, setPluginEnabled } from "@/lib/plugins/registry";

export async function GET() {
  const denied = requireAdmin(await isAdmin());
  if (denied) return denied;

  const plugins = await loadPlugins();
  return NextResponse.json(plugins);
}

export async function PUT(request: NextRequest) {
  const denied = requireAdmin(await isAdmin());
  if (denied) return denied;

  const body = await request.json();
  const { id, enabled } = body;

  if (!id || typeof enabled !== "boolean") {
    return NextResponse.json(
      { error: "id and enabled (boolean) are required" },
      { status: 400 }
    );
  }

  const result = await setPluginEnabled(id, enabled).catch((error) => ({
    error: error instanceof Error ? error.message : String(error),
    plugin: undefined,
  }));
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  await logAudit(enabled ? "plugin.enable" : "plugin.disable", {
    type: "plugin",
    id,
    label: result.plugin?.name,
  }, {
    permissions: result.plugin?.permissions ?? [],
    routes: result.plugin?.routes ?? [],
    source: result.plugin?.source ?? "registered",
  });

  return NextResponse.json({ id, enabled, plugin: result.plugin });
}
