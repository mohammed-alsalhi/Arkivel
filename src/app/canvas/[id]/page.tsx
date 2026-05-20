import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import CanvasEditor from "./CanvasEditor";

export const dynamic = "force-dynamic";

export default async function CanvasDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session) notFound();

  const canvas = await prisma.canvas.findFirst({
    where: { id, userId: session.id },
  });
  if (!canvas) notFound();

  // Load article titles for the article picker
  const articles = await prisma.article.findMany({
    where: { status: "published" },
    select: { id: true, title: true, slug: true, excerpt: true },
    orderBy: { title: "asc" },
    take: 500,
  });

  return (
    <CanvasEditor
      canvasId={canvas.id}
      canvasName={canvas.name}
      initialState={canvas.state as Record<string, unknown>}
      articles={articles}
    />
  );
}
