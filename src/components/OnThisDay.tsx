import prisma from "@/lib/prisma";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default async function OnThisDay() {
  const today = new Date();
  const month = today.getMonth();
  const day = today.getDate();

  const articles = await prisma.article.findMany({
    where: { published: true, status: "published" },
    select: { id: true, title: true, slug: true, createdAt: true },
  }).catch(() => []);

  const matches = articles.filter((a) => {
    const d = new Date(a.createdAt);
    return d.getMonth() === month && d.getDate() === day && d.getFullYear() !== today.getFullYear();
  });

  if (matches.length === 0) return null;

  return (
    <div className="wiki-portal">
      <div className="wiki-portal-header">On this day</div>
      <div className="wiki-portal-body p-0">
        <ul className="divide-y divide-border-light text-[13px]">
          {matches.map((a) => (
            <li key={a.id} className="px-3 py-1.5 hover:bg-surface-hover">
              <Link href={`/articles/${a.slug}`}>{a.title}</Link>
              <span className="text-[11px] text-muted ml-2">({formatDate(a.createdAt)})</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
