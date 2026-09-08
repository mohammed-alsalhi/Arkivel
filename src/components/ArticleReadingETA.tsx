"use client";

import { useEffect, useState } from "react";

/** Shows "~X min left" that updates as the reader scrolls through the article */
export default function ArticleReadingETA({ wordCount }: { wordCount: number }) {
  const [minsLeft, setMinsLeft] = useState<number | null>(null);
  const WPM = 200;

  useEffect(() => {
    const total = Math.max(1, Math.ceil(wordCount / WPM));

    function update() {
      const el = document.getElementById("article-content");
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const height = el.offsetHeight;
      if (height <= 0) return;
      const scrolled = Math.max(0, -rect.top);
      const pct = Math.min(1, scrolled / (height - window.innerHeight || height));
      const remaining = Math.ceil(total * (1 - pct));
      setMinsLeft(remaining <= 0 ? 0 : remaining);
    }

    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, [wordCount]);

  if (minsLeft === null || minsLeft === 0) return null;

  return (
    <span className="text-[11px] text-muted">
      ~{minsLeft} min left
    </span>
  );
}
