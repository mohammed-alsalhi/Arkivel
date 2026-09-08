"use client";

import { useState } from "react";
import Link from "next/link";

type Revision = {
  id: string;
  editSummary: string | null;
  createdAt: string;
  user: { username: string; displayName: string | null } | null;
};

type Props = { slug: string; revisions: Revision[] };

export default function ArticleChangelogPanel({ slug, revisions }: Props) {
  const [open, setOpen] = useState(false);
  if (revisions.length === 0) return null;

  return (
    <div className="border border-border rounded-lg overflow-hidden my-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium bg-muted/30 hover:bg-muted/50"
      >
        <span>Recent changes</span>
        <span className="text-muted-foreground text-xs">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <ul className="divide-y divide-border">
          {revisions.slice(0, 5).map((rev) => (
            <li key={rev.id} className="px-4 py-2 text-xs flex items-start justify-between gap-4">
              <div>
                <span className="text-muted-foreground">
                  {new Date(rev.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                {rev.user && (
                  <span className="ml-2 font-medium">
                    {rev.user.displayName || rev.user.username}
                  </span>
                )}
                {rev.editSummary && (
                  <span className="ml-2 italic text-muted-foreground">{rev.editSummary}</span>
                )}
              </div>
              <Link
                href={`/articles/${slug}/diff?from=${rev.id}&to=current`}
                className="text-wiki-link hover:underline flex-shrink-0"
              >
                diff
              </Link>
            </li>
          ))}
        </ul>
      )}
      <div className="px-4 py-2 border-t border-border bg-muted/10">
        <Link href={`/articles/${slug}/history`} className="text-xs text-wiki-link hover:underline">
          View full history →
        </Link>
      </div>
    </div>
  );
}
