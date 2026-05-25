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
  const article = await prisma.article.findUnique({
    where: { id },
    include: { customizationOverride: true },
  });

  if (!article) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  const categories = article.categoryId
    ? await prisma.category.findMany({ include: { customization: true } })
    : [];

  return NextResponse.json(resolveArticleCustomization(categories, article));
}

export async function PUT(request: NextRequest, { params }: Context) {
  const denied = requireAdmin(await isAdmin());
  if (denied) return denied;

  const { id } = await params;
  const article = await prisma.article.findUnique({ where: { id }, select: { id: true, title: true } });
  if (!article) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  const validation = validateSpaceCustomizationInput(await request.json());
  if (!validation.valid) {
    return NextResponse.json({ error: "Invalid customization", issues: validation.errors }, { status: 400 });
  }

  const saved = await prisma.articleCustomizationOverride.upsert({
    where: { articleId: id },
    create: { articleId: id, ...toPrismaCustomizationData(validation.values) },
    update: toPrismaCustomizationData(validation.values),
  });
  await logAudit("space.customization_update", { type: "article", id, label: article.title }, validation.values);

  return NextResponse.json({
    customization: toPublicSpaceCustomization(saved, "article", id),
    privateDraftConfigHidden: true,
  });
}

function resolveArticleCustomization(
  categories: CategoryNode[],
  article: {
    categoryId: string | null;
    customizationOverride: (Omit<Partial<SpaceCustomizationValues>, "navigationMode"> & {
      navigationMode?: string | null;
    }) | null;
    id: string;
    title: string;
  },
) {
  const byId = new Map(categories.map((item) => [item.id, item]));
  const chain: CategoryNode[] = [];
  let cursor = article.categoryId ? byId.get(article.categoryId) : undefined;

  while (cursor) {
    chain.unshift(cursor);
    cursor = cursor.parentId ? byId.get(cursor.parentId) : undefined;
  }

  return resolveSpaceCustomizationInheritance({
    articleOverride: article.customizationOverride
      ? { ...article.customizationOverride, id: article.id, label: article.title }
      : null,
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
