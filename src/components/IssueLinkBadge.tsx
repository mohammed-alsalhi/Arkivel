"use client";

import { useEffect, useState } from "react";

interface IssueLink {
  id: string;
  url: string;
  provider: string;
  issueId: string;
  title?: string | null;
  status?: string | null;
}

function statusColor(status: string | null | undefined) {
  if (status === "open") return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
  if (status === "closed") return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
  if (status === "in_progress") return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
  return "bg-surface text-muted";
}

function providerIcon(provider: string) {
  if (provider === "github") return "⚫";
  if (provider === "jira") return "🔵";
  if (provider === "linear") return "🟣";
  return "🔗";
}

interface Props {
  articleId: string;
}

export default function IssueLinkBadge({ articleId }: Props) {
  const [links, setLinks] = useState<IssueLink[]>([]);

  useEffect(() => {
    fetch(`/api/articles/${articleId}/issue-links`)
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setLinks(data))
      .catch(() => {});
  }, [articleId]);

  if (links.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 my-3">
      {links.map((link) => (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${statusColor(link.status)}`}
        >
          <span>{providerIcon(link.provider)}</span>
          <span>{link.issueId}</span>
          {link.title && <span className="max-w-[180px] truncate">— {link.title}</span>}
          {link.status && (
            <span className="opacity-70 capitalize">{link.status.replace("_", " ")}</span>
          )}
        </a>
      ))}
    </div>
  );
}
