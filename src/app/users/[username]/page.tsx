import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";

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
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      article: { select: { id: true, title: true, slug: true } },
    },
  });

  // Fetch articles created by this user
  const articles = await prisma.article.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      title: true,
      slug: true,
      createdAt: true,
      category: { select: { name: true, icon: true } },
    },
  });

  // Fetch discussion contributions
  const discussions = await prisma.discussion.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      article: { select: { id: true, title: true, slug: true } },
    },
  });

  const roleColors: Record<string, string> = {
    admin: "text-wiki-link-broken",
    editor: "text-accent",
    viewer: "text-muted",
  };

  return (
    <div>
      <h1
        className="text-[1.7rem] font-normal text-heading border-b border-border pb-1 mb-3"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        User: {user.displayName || user.username}
      </h1>

      {/* User info */}
      <div className="wiki-portal max-w-lg mb-4">
        <div className="wiki-portal-header">User information</div>
        <div className="wiki-portal-body">
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
                  {" "}{articles.length} article{articles.length !== 1 ? "s" : ""} created,
                  {" "}{discussions.length} discussion{discussions.length !== 1 ? "s" : ""}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Articles created */}
      {articles.length > 0 && (
        <div className="mb-4">
          <h2
            className="text-[1.3rem] font-normal text-heading border-b border-border pb-1 mb-2"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Articles created
          </h2>
          <ul className="text-[13px] space-y-1">
            {articles.map((article) => (
              <li key={article.id}>
                <Link href={`/articles/${article.slug}`} className="font-medium">
                  {article.title}
                </Link>
                {article.category && (
                  <span className="text-muted text-[12px] ml-1">
                    ({article.category.icon} {article.category.name})
                  </span>
                )}
                <span className="text-muted text-[11px] ml-2">
                  {formatDate(article.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recent edits */}
      {revisions.length > 0 && (
        <div className="mb-4">
          <h2
            className="text-[1.3rem] font-normal text-heading border-b border-border pb-1 mb-2"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Recent edits
          </h2>
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
        </div>
      )}

      {/* Discussion contributions */}
      {discussions.length > 0 && (
        <div>
          <h2
            className="text-[1.3rem] font-normal text-heading border-b border-border pb-1 mb-2"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Discussion contributions
          </h2>
          <ul className="text-[13px] space-y-1">
            {discussions.map((disc) => (
              <li key={disc.id}>
                <span className="text-muted text-[11px]">
                  {formatDate(disc.createdAt)}
                </span>
                {" "}
                {disc.article ? (
                  <Link
                    href={`/articles/${disc.article.slug}/discussion`}
                    className="font-medium"
                  >
                    {disc.article.title}
                  </Link>
                ) : (
                  <span className="text-muted italic">(deleted article)</span>
                )}
                <span className="text-muted text-[12px] ml-1">
                  &mdash; {disc.content.substring(0, 80)}
                  {disc.content.length > 80 ? "..." : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {articles.length === 0 && revisions.length === 0 && discussions.length === 0 && (
        <div className="wiki-notice">
          This user has not made any contributions yet.
        </div>
      )}
    </div>
  );
}
