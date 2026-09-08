import { isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import SeriesManager from "./SeriesManager";
import { Page, PageHeader } from "@/components/ui";

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
    <Page>
      <PageHeader
        kicker={<Link href="/admin" className="hover:text-foreground">Admin</Link>}
        title="Article Series"
      />
      <SeriesManager initialSeries={allSeries} articles={allArticles} />
    </Page>
  );
}
