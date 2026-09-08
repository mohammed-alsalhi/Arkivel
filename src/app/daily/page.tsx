import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

function todaySlug() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `daily-${y}-${m}-${day}`;
}

function todayTitle() {
  const d = new Date();
  return d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

function defaultContent(title: string) {
  const d = new Date();
  const dateStr = d.toISOString().split("T")[0];
  return `<h1>${title}</h1>
<p><em>${dateStr}</em></p>
<h2>Today&apos;s Focus</h2>
<ul><li></li></ul>
<h2>Notes</h2>
<p></p>
<h2>Links &amp; References</h2>
<p></p>`;
}

export default async function DailyPage() {
  const session = await getSession();
  const slug = todaySlug();

  // Find or create today's daily note
  let article = await prisma.article.findUnique({ where: { slug } });

  if (!article) {
    const title = todayTitle();
    // Try to find a "Daily Note" template category or use Inbox
    let category = await prisma.category.findFirst({ where: { name: "Daily Notes" } });
    if (!category) {
      try {
        category = await prisma.category.create({
          data: { name: "Daily Notes", slug: "daily-notes", sortOrder: 999 },
        });
      } catch {
        category = await prisma.category.findFirst({ where: { slug: "daily-notes" } });
      }
    }

    article = await prisma.article.create({
      data: {
        title,
        slug,
        content: defaultContent(title),
        status: "published",
        categoryId: category?.id ?? null,
        userId: session?.id ?? null,
      },
    });
  }

  // Redirect to the article (edit if admin, view if not)
  if (await isAdmin()) {
    redirect(`/articles/${slug}/edit`);
  } else {
    redirect(`/articles/${slug}`);
  }
}
