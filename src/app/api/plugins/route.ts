import { NextRequest, NextResponse } from "next/server";
import { isAdmin, requireAdmin } from "@/lib/auth";
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

  await setPluginEnabled(id, enabled);

  return NextResponse.json({ id, enabled });
}
