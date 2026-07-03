import Link from "next/link";
import { Page, PageHeader } from "@/components/ui";

export default function NotFound() {
  return (
    <Page>
      <PageHeader title="Page not found" />

      <div className="wiki-notice">
        <p>
          There is currently no article with this name. You can{" "}
          <Link href="/articles/new">create this page</Link>, or{" "}
          <Link href="/search">search the wiki</Link> for an existing article.
        </p>
      </div>

      <p className="mt-4 text-[13px]">
        <Link href="/">&larr; Return to Main Page</Link>
      </p>
    </Page>
  );
}
