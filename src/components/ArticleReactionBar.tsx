"use client";

import { useState, useEffect } from "react";

// SVG icons for reactions
function ThumbUpIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
      <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </svg>
  );
}

function LightbulbIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function HelpCircleIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

const REACTIONS = [
  { key: "helpful",   Icon: ThumbUpIcon,    label: "Helpful" },
  { key: "insightful", Icon: LightbulbIcon, label: "Insightful" },
  { key: "outdated",  Icon: ClockIcon,      label: "Outdated" },
  { key: "confusing", Icon: HelpCircleIcon, label: "Confusing" },
] as const;

interface Props {
  articleId: string;
}

type Counts = Record<string, number>;

export default function ArticleReactionBar({ articleId }: Props) {
  const [counts, setCounts] = useState<Counts>({});
  const [voted, setVoted] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/articles/${articleId}/react`)
      .then((r) => r.json())
      .then((data) => setCounts(data || {}))
      .catch(() => {});
  }, [articleId]);

  async function react(reaction: string) {
    if (voted === reaction) return;
    setVoted(reaction);
    setCounts((prev) => ({ ...prev, [reaction]: (prev[reaction] ?? 0) + 1 }));
    await fetch(`/api/articles/${articleId}/react`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reaction }),
    });
  }

  return (
    <div className="flex items-center gap-1 mt-4 flex-wrap">
      <span className="text-xs text-muted mr-1">Was this helpful?</span>
      {REACTIONS.map(({ key, Icon, label }) => (
        <button
          key={key}
          onClick={() => react(key)}
          title={label}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs transition-colors ${
            voted === key
              ? "border-accent bg-accent/10 text-accent"
              : "border-border text-muted hover:border-accent/40 hover:text-foreground"
          }`}
        >
          <Icon />
          <span>{label}</span>
          {counts[key] ? <span className="ml-0.5 opacity-70">{counts[key]}</span> : null}
        </button>
      ))}
    </div>
  );
}
