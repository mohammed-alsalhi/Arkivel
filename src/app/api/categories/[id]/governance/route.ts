import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { isAdmin, requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import prisma from "@/lib/prisma";
import {
  defaultGlobalSpaceGovernance,
  resolveSpaceGovernanceInheritance,
  toPublicSpaceGovernance,
  validateSpaceGovernanceInput,
  type SpaceGovernanceValues,
} from "@/lib/space-governance";

type Context = { params: Promise<{ id: string }> };
type CategoryNode = {
  governance: (Omit<Partial<SpaceGovernanceValues>, "defaultVisibility" | "healthRequiredSignals"> & {
    defaultVisibility?: string | null;
    healthRequiredSignals?: unknown;
  }) | null;
  id: string;
  name: string;
  parentId: string | null;
};

export async function GET(_request: NextRequest, { params }: Context) {
  const { id } = await params;
  const categories = await prisma.category.findMany({ include: { governance: true } });
  const category = categories.find((item) => item.id === id);

  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  return NextResponse.json(resolveCategoryGovernance(categories, category));
}

export async function PUT(request: NextRequest, { params }: Context) {
  const denied = requireAdmin(await isAdmin());
  if (denied) return denied;

  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id }, select: { id: true, name: true } });
  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  const validation = validateSpaceGovernanceInput(await request.json());
  if (!validation.valid) {
    return NextResponse.json({ error: "Invalid governance", issues: validation.errors }, { status: 400 });
  }

  const saved = await prisma.spaceGovernance.upsert({
    where: { categoryId: id },
    create: { categoryId: id, ...toPrismaGovernanceData(validation.values) },
    update: toPrismaGovernanceData(validation.values),
  });
  await logAudit("space.governance_update", { type: "category", id, label: category.name }, validation.values);

  return NextResponse.json({
    governance: toPublicSpaceGovernance(saved, "space", id),
  });
}

function resolveCategoryGovernance(categories: CategoryNode[], category: CategoryNode) {
  const byId = new Map(categories.map((item) => [item.id, item]));
  const chain: CategoryNode[] = [];
  let cursor: CategoryNode | undefined = category;

  while (cursor) {
    chain.unshift(cursor);
    cursor = cursor.parentId ? byId.get(cursor.parentId) : undefined;
  }

  return resolveSpaceGovernanceInheritance({
    categoryChain: chain.map((item) => ({
      ...(item.governance ?? {}),
      id: item.id,
      label: item.name,
      parentId: item.parentId,
    })),
    globalDefaults: defaultGlobalSpaceGovernance(),
  });
}

function toPrismaGovernanceData(values: SpaceGovernanceValues) {
  const { healthRequiredSignals, ...rest } = values;

  return {
    ...rest,
    healthRequiredSignals: healthRequiredSignals.length > 0 ? (healthRequiredSignals as Prisma.InputJsonValue) : Prisma.JsonNull,
  };
}

export const dynamic = "force-dynamic";
