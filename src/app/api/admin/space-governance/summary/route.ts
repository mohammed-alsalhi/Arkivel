import { NextResponse } from "next/server";
import { isAdmin, requireAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  defaultGlobalSpaceGovernance,
  resolveSpaceGovernanceInheritance,
  type SpaceGovernanceValues,
} from "@/lib/space-governance";

type CategoryNode = {
  governance: (Omit<Partial<SpaceGovernanceValues>, "defaultVisibility" | "healthRequiredSignals"> & {
    defaultVisibility?: string | null;
    healthRequiredSignals?: unknown;
  }) | null;
  id: string;
  name: string;
  parentId: string | null;
};

export async function GET() {
  const denied = requireAdmin(await isAdmin());
  if (denied) return denied;

  const [categories, staleArticles, draftArticles] = await Promise.all([
    prisma.category.findMany({
      include: {
        governance: true,
        _count: { select: { articles: true } },
      },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.article.findMany({
      where: {
        status: "published",
        updatedAt: { lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
      },
      select: { categoryId: true },
    }),
    prisma.article.findMany({
      where: { status: { in: ["draft", "review"] } },
      select: { categoryId: true },
    }),
  ]);
  const staleByCategory = countByCategory(staleArticles);
  const draftByCategory = countByCategory(draftArticles);

  return NextResponse.json({
    spaces: categories.map((category) => {
      const resolved = resolveForCategory(categories, category);

      return {
        articleCount: category._count.articles,
        badges: resolved.badges,
        categoryId: category.id,
        categoryName: category.name,
        defaultVisibility: resolved.effective.defaultVisibility,
        ownerLabel: resolved.effective.ownerLabel,
        reviewCadenceDays: resolved.effective.reviewCadenceDays,
        reviewerLabel: resolved.effective.reviewerLabel,
        stalePages: staleByCategory.get(category.id) ?? 0,
        unreviewedDrafts: draftByCategory.get(category.id) ?? 0,
        widgets: resolved.widgets,
      };
    }),
  });
}

function resolveForCategory(categories: CategoryNode[], category: CategoryNode) {
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

function countByCategory(articles: { categoryId: string | null }[]) {
  const counts = new Map<string, number>();
  for (const article of articles) {
    if (!article.categoryId) continue;
    counts.set(article.categoryId, (counts.get(article.categoryId) ?? 0) + 1);
  }
  return counts;
}

export const dynamic = "force-dynamic";
