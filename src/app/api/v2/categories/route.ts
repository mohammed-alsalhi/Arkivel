import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type CategoryNode = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  articleCount: number;
  children: CategoryNode[];
};

type FlatCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  parentId: string | null;
  _count: { articles: number };
};

function buildTree(categories: FlatCategory[]): CategoryNode[] {
  const map = new Map<string, CategoryNode>();

  for (const cat of categories) {
    map.set(cat.id, {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      sortOrder: cat.sortOrder,
      articleCount: cat._count.articles,
      children: [],
    });
  }

  const roots: CategoryNode[] = [];

  for (const cat of categories) {
    const node = map.get(cat.id)!;
    if (cat.parentId && map.has(cat.parentId)) {
      map.get(cat.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  // Sort at each level by sortOrder
  function sortNodes(nodes: CategoryNode[]): void {
    nodes.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
    for (const node of nodes) {
      sortNodes(node.children);
    }
  }
  sortNodes(roots);

  return roots;
}

// GET /api/v2/categories — no auth required
// Returns full hierarchical category tree with article counts
export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      sortOrder: true,
      parentId: true,
      _count: { select: { articles: true } },
    },
  });

  const tree = buildTree(categories as FlatCategory[]);

  return NextResponse.json({
    data: tree,
    meta: {
      total: categories.length,
    },
  });
}

export const dynamic = "force-dynamic";
