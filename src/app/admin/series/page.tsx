import { isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import SeriesManager from "./SeriesManager";

export const dynamic = "force-dynamic";

export default async function AdminSeriesPage() {
  const admin = await isAdmin();
  if (!admin) redirect("/login");

  const [allSeries, allArticles] = await Promise.all([
    prisma.articleSeries.findMany({
      orderBy: { name: "asc" },
      include: {
        members: {
          orderBy: { position: "asc" },
          include: { article: { select: { id: true, title: true, slug: true } } },
        },
      },
    }),
    prisma.article.findMany({
      where: { status: { not: "draft" } },
      select: { id: true, title: true, slug: true },
      orderBy: { title: "asc" },
    }),
  ]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">Admin</Link>
        <span className="text-muted-foreground">/</span>
        <h1 className="text-xl font-semibold">Article Series</h1>
      </div>
      <SeriesManager initialSeries={allSeries} articles={allArticles} />
    </div>
  );
}
