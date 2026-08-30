import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";
import { EmptyState, Page, PageHeader, Section } from "@/components/ui";

type Props = {
  params: Promise<{ username: string }>;
};

export default async function UserProfilePage({ params }: Props) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      displayName: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    notFound();
  }

  // Fetch contribution history (recent revisions by this user)
  const revisions = await prisma.articleRevision.findMany({
    where: {
      userId: user.id,
      article: { published: true, status: "published" },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      article: { select: { id: true, title: true, slug: true } },
    },
  });

  // Fetch articles created by this user
  const articles = await prisma.article.findMany({
    where: { userId: user.id, published: true, status: "published" },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      title: true,
      slug: true,
      createdAt: true,
      category: { select: { name: true } },
    },
  });

  const roleColors: Record<string, string> = {
    admin: "text-wiki-link-broken",
    editor: "text-accent",
    viewer: "text-muted",
  };

  return (
    <Page>
      <PageHeader title={`User: ${user.displayName || user.username}`} />

      {/* User info */}
      <div className="wiki-portal max-w-lg mb-4">
        <div className="wiki-portal-header">User information</div>
        <div className="wiki-portal-body">
          <div className="overflow-x-auto">
            <table className="text-[13px]">
              <tbody>
                <tr>
                  <td className="pr-4 py-0.5 text-muted font-bold">Username</td>
                  <td className="py-0.5">{user.username}</td>
                </tr>
                <tr>
                  <td className="pr-4 py-0.5 text-muted font-bold">Display name</td>
                  <td className="py-0.5">{user.displayName || user.username}</td>
                </tr>
                <tr>
                  <td className="pr-4 py-0.5 text-muted font-bold">Role</td>
                  <td className={`py-0.5 font-bold ${roleColors[user.role] || "text-muted"}`}>
                    {user.role}
                  </td>
                </tr>
                <tr>
                  <td className="pr-4 py-0.5 text-muted font-bold">Member since</td>
                  <td className="py-0.5">{formatDate(user.createdAt)}</td>
                </tr>
                <tr>
                  <td className="pr-4 py-0.5 text-muted font-bold">Contributions</td>
                  <td className="py-0.5">
                    {revisions.length} edit{revisions.length !== 1 ? "s" : ""},
                    {" "}{articles.length} article{articles.length !== 1 ? "s" : ""} created
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Articles created */}
      {articles.length > 0 && (
        <Section title="Articles created" className="mb-4">
          <ul className="text-[13px] space-y-1">
            {articles.map((article) => (
              <li key={article.id}>
                <Link href={`/articles/${article.slug}`} className="font-medium">
                  {article.title}
                </Link>
                {article.category && (
                  <span className="text-muted text-[12px] ml-1">
                    ({article.category.name})
                  </span>
                )}
                <span className="text-muted text-[11px] ml-2">
                  {formatDate(article.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Recent edits */}
      {revisions.length > 0 && (
        <Section title="Recent edits" className="mb-4">
          <ul className="text-[13px] space-y-1">
            {revisions.map((rev) => (
              <li key={rev.id}>
                <span className="text-muted text-[11px]">
                  {formatDate(rev.createdAt)}
                </span>
                {" "}
                {rev.article ? (
                  <Link href={`/articles/${rev.article.slug}`} className="font-medium">
                    {rev.article.title}
                  </Link>
                ) : (
                  <span className="text-muted italic">(deleted article)</span>
                )}
                {rev.editSummary && (
                  <span className="text-muted text-[12px] ml-1 italic">
                    &mdash; {rev.editSummary}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {articles.length === 0 && revisions.length === 0 && (
        <EmptyState description="This user has not made any contributions yet." />
      )}
    </Page>
  );
}

export const dynamic = "force-dynamic";
