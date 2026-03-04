"use client";

import { useState } from "react";

type Props = {
  title: string;
  url?: string;
};

export default function ShareButton({ title, url }: Props) {
  const [shared, setShared] = useState(false);

  async function handleShare() {
    const shareUrl = url || window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl });
        return;
      } catch {
        // User cancelled or error, fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1 h-6 px-2 text-[11px] border border-border rounded text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
      title="Share this article"
    >
      {shared ? "Link copied!" : "Share"}
    </button>
  );
}
