import type { ReactNode } from "react";
import Link from "next/link";
import AdminEditTab from "@/components/AdminEditTab";
import { Page, PageHeader } from "@/components/ui";

type ArticleWorkflowSection = "blame" | "diff" | "history";

const sectionLabels: Record<ArticleWorkflowSection, string> = {
  blame: "Blame",
  diff: "Diff",
  history: "History",
};

export function ArticleWorkflowNav({
  active,
  showEditTab = false,
  slug,
}: {
  active: ArticleWorkflowSection;
  showEditTab?: boolean;
  slug: string;
}) {
  return (
    <nav className="article-tabbar" aria-label="Article sections">
      <Link href={`/articles/${slug}`} className="article-tab">Article</Link>
      {showEditTab && <AdminEditTab slug={slug} className="article-tab" />}
      {active !== "history" && (
        <Link href={`/articles/${slug}/history`} className="article-tab">History</Link>
      )}
      <span aria-current="page" className="article-tab article-tab-active">{sectionLabels[active]}</span>
    </nav>
  );
}

export function ArticleWorkflowShell({
  actions,
  active,
  children,
  description,
  showEditTab = false,
  slug,
  title,
}: {
  actions?: ReactNode;
  active: ArticleWorkflowSection;
  children: ReactNode;
  description?: ReactNode;
  showEditTab?: boolean;
  slug: string;
  title: ReactNode;
}) {
  return (
    <div>
      <ArticleWorkflowNav active={active} showEditTab={showEditTab} slug={slug} />
      <Page className="border border-border bg-surface px-5 py-4">
        <PageHeader actions={actions} description={description} title={title} />
        {children}
      </Page>
    </div>
  );
}
