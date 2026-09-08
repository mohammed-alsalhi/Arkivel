import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import type { PermissionGrant } from "@prisma/client";

const PERMISSION_LEVELS: Record<string, number> = {
  view: 0,
  edit: 1,
  admin: 2,
};

/**
 * Check whether a user has a given permission on a resource.
 * First checks explicit PermissionGrant rows, then falls back to role-based defaults.
 * Admin role always passes all permission checks.
 */
export async function checkPermission(
  userId: string,
  resourceType: "category" | "article",
  resourceId: string,
  action: "view" | "edit" | "admin"
): Promise<boolean> {
  // Fetch the user's role from the database
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user) return false;

  // Admins always have full access
  if (user.role === "admin") return true;

  // Check explicit grants for this resource
  const grants = await prisma.permissionGrant.findMany({
    where: { userId, resourceType, resourceId },
  });

  if (grants.length > 0) {
    const requiredLevel = PERMISSION_LEVELS[action] ?? 0;
    const highestGranted = Math.max(
      ...grants.map((g) => PERMISSION_LEVELS[g.permission] ?? 0)
    );
    return highestGranted >= requiredLevel;
  }

  // Fall back to role-based defaults
  const roleLevel: Record<string, number> = {
    viewer: 0,  // view only
    editor: 1,  // view + edit
    admin: 2,   // all (handled above)
  };

  const userLevel = roleLevel[user.role] ?? 0;
  const requiredLevel = PERMISSION_LEVELS[action] ?? 0;
  return userLevel >= requiredLevel;
}

/**
 * Grant a permission to a user on a resource.
 * Uses upsert to avoid duplicate errors.
 */
export async function grantPermission(
  userId: string,
  resourceType: string,
  resourceId: string,
  permission: string
): Promise<void> {
  await prisma.permissionGrant.upsert({
    where: {
      userId_resourceType_resourceId_permission: {
        userId,
        resourceType,
        resourceId,
        permission,
      },
    },
    create: { userId, resourceType, resourceId, permission },
    update: {}, // already exists, nothing to update
  });
}

/**
 * Revoke a specific permission from a user on a resource.
 */
export async function revokePermission(
  userId: string,
  resourceType: string,
  resourceId: string,
  permission: string
): Promise<void> {
  await prisma.permissionGrant.deleteMany({
    where: { userId, resourceType, resourceId, permission },
  });
}

/**
 * Return all PermissionGrant rows belonging to a user.
 */
export async function getUserPermissions(
  userId: string
): Promise<PermissionGrant[]> {
  return prisma.permissionGrant.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
}

/**
 * Return all PermissionGrant rows for a specific resource.
 */
export async function getResourcePermissions(
  resourceType: string,
  resourceId: string
): Promise<PermissionGrant[]> {
  return prisma.permissionGrant.findMany({
    where: { resourceType, resourceId },
    orderBy: { createdAt: "asc" },
  });
}

/**
 * Convenience helper: check permission for the currently authenticated session user.
 * Returns false when there is no active session.
 */
export async function checkSessionPermission(
  resourceType: "category" | "article",
  resourceId: string,
  action: "view" | "edit" | "admin"
): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;
  return checkPermission(session.id, resourceType, resourceId, action);
}
