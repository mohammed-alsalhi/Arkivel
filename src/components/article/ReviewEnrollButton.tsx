"use client";

import { useState, useEffect } from "react";

type Props = { articleId: string };

export default function ReviewEnrollButton({ articleId }: Props) {
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check if already enrolled by fetching all items
    fetch("/api/spaced-repetition?mode=all")
      .then((r) => r.ok ? r.json() : [])
      .then((items: { articleId: string }[]) => {
        setEnrolled(items.some((i) => i.articleId === articleId));
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [articleId]);

  async function toggle() {
    setLoading(true);
    if (enrolled) {
      await fetch("/api/spaced-repetition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unenroll", articleId }),
      });
      setEnrolled(false);
    } else {
      await fetch("/api/spaced-repetition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "enroll", articleId }),
      });
      setEnrolled(true);
    }
    setLoading(false);
  }

  if (checking) return null;

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={enrolled ? "Remove from review queue" : "Add to spaced repetition review queue"}
      className={`h-6 px-2 text-[11px] border rounded transition-colors flex items-center gap-1 ${
        enrolled
          ? "border-accent text-accent bg-accent/10 hover:bg-accent/20"
          : "border-border text-muted hover:text-foreground hover:bg-surface-hover"
      }`}
    >
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {enrolled ? "In review queue" : "Review later"}
    </button>
  );
}
