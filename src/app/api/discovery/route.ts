import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { buildDiscoveryReport, discoveryEngineContract } from "@/lib/discovery-engines";

export const dynamic = "force-dynamic";

export async function GET() {
  const [articles, glossaryTerms] = await Promise.all([
    prisma.article.findMany({
      where: { status: "published" },
      orderBy: { updatedAt: "desc" },
      take: 250,
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        excerpt: true,
        category: { select: { name: true, slug: true } },
        tags: { include: { tag: { select: { name: true, slug: true } } } },
      },
    }),
    prisma.glossaryTerm.findMany({ select: { term: true, aliases: true } }),
  ]);

  const terms = glossaryTerms.flatMap((entry) => [entry.term, ...entry.aliases]);
  return NextResponse.json({
    contract: discoveryEngineContract,
    report: buildDiscoveryReport(articles, terms),
  });
}
