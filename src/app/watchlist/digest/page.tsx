"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button, DataTable, EmptyState, LinkButton, Page, PageHeader } from "@/components/ui";

type DigestEntry = {
  articleId: string;
  articleTitle: string;
  articleSlug: string;
  editCount: number;
  editors: string[];
  lastEdit: string;
};

export default function WatchlistDigestPage() {
  const [entries, setEntries] = useState<DigestEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState<string | null>(null);

  useEffect(() => {
    loadDigest();
  }, []);

  async function loadDigest() {
    setLoading(true);
    const res = await fetch("/api/watchlist/digest");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) setEntries(data);
    }
    setLoading(false);
  }

  async function runDigest() {
    setRunning(true);
    setRunResult(null);
    const res = await fetch("/api/cron/digest", { method: "POST" });
    const data = await res.json();
    setRunResult(`Sent ${data.notified ?? 0} notification${data.notified !== 1 ? "s" : ""} across ${data.articlesProcessed ?? 0} articles.`);
    setRunning(false);
  }

  return (
    <Page>
      <PageHeader
        title="Watchlist digest"
        description="Changes to your watched articles in the past 7 days."
        actions={
          <>
            <Button
              onClick={runDigest}
              disabled={running}
            >
              {running ? "Running..." : "Generate digest now"}
            </Button>
            <LinkButton href="/watchlist">Watchlist</LinkButton>
          </>
        }
      />

      {runResult && <div className="wiki-notice">{runResult}</div>}

      {loading ? (
        <p className="text-[13px] text-muted italic">Loading...</p>
      ) : entries.length === 0 ? (
        <EmptyState
          title="No digest activity"
          description="No changes to your watched articles in the past 7 days."
          actions={<LinkButton href="/watchlist" variant="primary">View your watchlist</LinkButton>}
        />
      ) : (
        <DataTable>
          <thead>
            <tr>
              <th>Article</th>
              <th className="w-16">Edits</th>
              <th>Editors</th>
              <th className="w-28">Last edit</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.articleId}>
                <td>
                  <Link href={`/articles/${e.articleSlug}`} className="font-medium">
                    {e.articleTitle}
                  </Link>
                </td>
                <td className="text-center">{e.editCount}</td>
                <td className="text-muted text-[12px]">
                  {e.editors.slice(0, 3).join(", ")}
                  {e.editors.length > 3 && ` +${e.editors.length - 3} more`}
                </td>
                <td className="text-muted text-[12px]">
                  {new Date(e.lastEdit).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      )}
    </Page>
  );
}

export const dynamic = "force-dynamic";
