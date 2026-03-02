import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function RandomArticlePage() {
  const count = await prisma.article.count({ where: { published: true, status: "published" } });

  if (count === 0) {
    redirect("/");
  }

  const skip = Math.floor(Math.random() * count);
  const article = await prisma.article.findFirst({
    where: { published: true, status: "published" },
    skip,
    select: { slug: true },
  });

  if (!article) {
    redirect("/");
  }

  redirect(`/articles/${article.slug}`);
}
