"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Props {
  title: string;
  slug: string;
  isAdmin: boolean;
}

/**
 * Appears as a compact floating pill after scrolling past the article heading.
 * Keeps quick actions available without covering a full strip of content.
 */
export default function StickyArticleHeader({ title, slug, isAdmin }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const heading = document.getElementById("article-h1");

    if (!heading) return;

    const observer = new IntersectionObserver(
      ([entry]) => { setVisible(!entry.isIntersecting); },
      { threshold: 0, rootMargin: "-48px 0px 0px 0px" }
    );
    observer.observe(heading);
    return () => observer.disconnect();
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed top-2 right-3 z-30 hidden md:flex items-center gap-3 max-w-[min(92vw,28rem)] bg-surface border border-border rounded-full px-3 py-1.5 shadow-sm"
      style={{ backdropFilter: "blur(4px)" }}
    >
      <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-heading">{title}</span>
      <div className="flex shrink-0 items-center gap-2 text-[11px]">
        {isAdmin && (
          <Link href={`/articles/${slug}/edit`} className="text-muted hover:text-foreground">
            Edit
          </Link>
        )}
        <a href="#top" className="text-muted hover:text-foreground">
          Top
        </a>
      </div>
    </div>
  );
}
