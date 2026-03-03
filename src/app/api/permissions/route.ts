import { NextRequest, NextResponse } from "next/server";
import { isAdmin, getSession } from "@/lib/auth";
import {
  grantPermission,
  revokePermission,
  getResourcePermissions,
} from "@/lib/permissions";

// GET /api/permissions?resourceType=article&resourceId=<id>
// Lists all permission grants for a specific resource. Admin only.
export async function GET(request: NextRequest) {
  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const resourceType = searchParams.get("resourceType");
  const resourceId = searchParams.get("resourceId");

  if (!resourceType || !resourceId) {
    return NextResponse.json(
      { error: "resourceType and resourceId are required" },
      { status: 400 }
    );
  }

  try {
    const permissions = await getResourcePermissions(resourceType, resourceId);
    return NextResponse.json(permissions);
  } catch (error) {
    console.error("Failed to fetch permissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch permissions" },
      { status: 500 }
    );
  }
}

// POST /api/permissions
// Grants a permission. Admin only.
// Body: { userId, resourceType, resourceId, permission }
export async function POST(request: NextRequest) {
  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { userId, resourceType, resourceId, permission } = body;

    if (!userId || !resourceType || !resourceId || !permission) {
      return NextResponse.json(
        { error: "userId, resourceType, resourceId, and permission are required" },
        { status: 400 }
      );
    }

    const validResourceTypes = ["category", "article"];
    if (!validResourceTypes.includes(resourceType)) {
      return NextResponse.json(
        { error: "resourceType must be 'category' or 'article'" },
        { status: 400 }
      );
    }

    const validPermissions = ["view", "edit", "admin"];
    if (!validPermissions.includes(permission)) {
      return NextResponse.json(
        { error: "permission must be 'view', 'edit', or 'admin'" },
        { status: 400 }
      );
    }

    await grantPermission(userId, resourceType, resourceId, permission);

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("Failed to grant permission:", error);
    return NextResponse.json(
      { error: "Failed to grant permission" },
      { status: 500 }
    );
  }
}

// DELETE /api/permissions
// Revokes a permission. Admin only.
// Body: { userId, resourceType, resourceId, permission }
export async function DELETE(request: NextRequest) {
  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { userId, resourceType, resourceId, permission } = body;

    if (!userId || !resourceType || !resourceId || !permission) {
      return NextResponse.json(
        { error: "userId, resourceType, resourceId, and permission are required" },
        { status: 400 }
      );
    }

    await revokePermission(userId, resourceType, resourceId, permission);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to revoke permission:", error);
    return NextResponse.json(
      { error: "Failed to revoke permission" },
      { status: 500 }
    );
  }
}
