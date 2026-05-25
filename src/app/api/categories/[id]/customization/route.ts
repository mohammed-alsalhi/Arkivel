import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { isAdmin, requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import prisma from "@/lib/prisma";
import {
  defaultGlobalSpaceCustomization,
  resolveSpaceCustomizationInheritance,
  toPublicSpaceCustomization,
  validateSpaceCustomizationInput,
  type SpaceCustomizationValues,
} from "@/lib/space-customization";

type Context = { params: Promise<{ id: string }> };
type CategoryNode = {
  customization: (Omit<Partial<SpaceCustomizationValues>, "navigationMode"> & {
    navigationMode?: string | null;
  }) | null;
  id: string;
  name: string;
  parentId: string | null;
};

export async function GET(_request: NextRequest, { params }: Context) {
  const { id } = await params;
  const categories = await prisma.category.findMany({
    include: { customization: true },
  });
  const category = categories.find((item) => item.id === id);

  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  return NextResponse.json(resolveCategoryCustomization(categories, category));
}

export async function PUT(request: NextRequest, { params }: Context) {
  const denied = requireAdmin(await isAdmin());
  if (denied) return denied;

  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id }, select: { id: true, name: true } });
  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  const validation = validateSpaceCustomizationInput(await request.json());
  if (!validation.valid) {
    return NextResponse.json({ error: "Invalid customization", issues: validation.errors }, { status: 400 });
  }

  const saved = await prisma.spaceCustomization.upsert({
    where: { categoryId: id },
    create: { categoryId: id, ...toPrismaCustomizationData(validation.values) },
    update: toPrismaCustomizationData(validation.values),
  });
  await logAudit("space.customization_update", { type: "category", id, label: category.name }, validation.values);

  return NextResponse.json({
    customization: toPublicSpaceCustomization(saved, "space", id),
    privateDraftConfigHidden: true,
  });
}

function resolveCategoryCustomization(categories: CategoryNode[], category: CategoryNode) {
  const byId = new Map(categories.map((item) => [item.id, item]));
  const chain: CategoryNode[] = [];
  let cursor: CategoryNode | undefined = category;

  while (cursor) {
    chain.unshift(cursor);
    cursor = cursor.parentId ? byId.get(cursor.parentId) : undefined;
  }

  return resolveSpaceCustomizationInheritance({
    categoryChain: chain.map((item) => ({
      ...(item.customization ?? {}),
      id: item.id,
      label: item.name,
      parentId: item.parentId,
    })),
    globalDefaults: defaultGlobalSpaceCustomization(),
  });
}

function toPrismaCustomizationData(values: SpaceCustomizationValues) {
  const { privateDraftConfig, ...rest } = values;

  return {
    ...rest,
    privateDraftConfig:
      privateDraftConfig === undefined
        ? undefined
        : privateDraftConfig === null
          ? Prisma.JsonNull
          : (privateDraftConfig as Prisma.InputJsonValue),
  };
}

export const dynamic = "force-dynamic";
