"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ArticleStatusBadge from "@/components/ArticleStatusBadge";
import { DataTable, EmptyState, LinkButton, Page, PageHeader, Section } from "@/components/ui";

type ReviewArticle = {
  id: string;
  title: string;
  slug: string;
  status: string;
  updatedAt: string;
};

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewArticles, setReviewArticles] = useState<ReviewArticle[]>([]);

  useEffect(() => {
    async function checkAuth() {
      const r = await fetch("/api/auth/check");
      const data = await r.json();
      setIsAdmin(data.admin);
      setLoading(false);
      if (data.admin) {
        const [draftRes, reviewRes] = await Promise.all([
          fetch("/api/articles?status=draft&limit=50"),
          fetch("/api/articles?status=review&limit=50"),
        ]);
        const items: ReviewArticle[] = [];
        if (draftRes.ok) {
          const d = await draftRes.json();
          items.push(...d.articles);
        }
        if (reviewRes.ok) {
          const d = await reviewRes.json();
          items.push(...d.articles);
        }
        items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        setReviewArticles(items);
      }
    }
    checkAuth();
  }, []);

  if (loading) {
    return <div className="py-8 text-center text-muted italic text-[13px]">Loading...</div>;
  }

  return (
    <Page>
      <PageHeader
        title="Admin"
        description="Review drafts and keep operational tools close at hand."
        actions={
          <>
            <LinkButton href="/admin/users">Users</LinkButton>
            <LinkButton href="/admin/categories">Categories</LinkButton>
            <LinkButton href="/admin/quality">Quality</LinkButton>
            <LinkButton href="/admin/plugins">Plugins</LinkButton>
          </>
        }
      />
      {isAdmin ? (
        reviewArticles.length > 0 ? (
          <Section title={`Articles needing review (${reviewArticles.length})`}>
            <DataTable>
              <thead>
                <tr>
                  <th>Article</th>
                  <th className="w-24">Status</th>
                  <th className="w-28">Last edited</th>
                </tr>
              </thead>
              <tbody>
                {reviewArticles.map((article) => (
                  <tr key={article.id}>
                    <td>
                      <Link href={`/articles/${article.slug}/edit`} className="font-medium">
                        {article.title}
                      </Link>
                    </td>
                    <td>
                      <ArticleStatusBadge status={article.status} />
                    </td>
                    <td className="text-muted text-[12px]">
                      {new Date(article.updatedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
          </Section>
        ) : (
          <EmptyState
            title="Nothing needs review"
            description="Draft and review queues are clear."
            actions={<LinkButton href="/articles" variant="primary">Browse articles</LinkButton>}
          />
        )
      ) : (
        <EmptyState
          title="Admin access required"
          description="You need to be logged in as an admin to access this page."
          actions={<LinkButton href="/login" variant="primary">Log in</LinkButton>}
        />
      )}
    </Page>
  );
}
