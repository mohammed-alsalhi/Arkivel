"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Props {
  title: string;
  slug: string;
  isAdmin: boolean;
}

/**
 * Appears as a slim bar fixed to the top of the viewport once the user scrolls
 * past the article's h1 heading. Shows article title + quick edit link.
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
      className="fixed top-[40px] left-0 right-0 z-30 bg-surface border-b border-border px-4 py-1.5 flex items-center justify-between shadow-sm"
      style={{ backdropFilter: "blur(4px)" }}
    >
      <span className="text-[13px] font-semibold text-heading truncate max-w-[70%]">{title}</span>
      <div className="flex items-center gap-2 text-[12px]">
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
