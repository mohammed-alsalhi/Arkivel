"use client";

import { useState, useEffect } from "react";

type Heading = { id: string; text: string; level: number };

export default function ScrollSpy({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -80% 0px" }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 3) return null;

  return (
    <nav className="hidden xl:block fixed right-4 top-24 w-48 text-[12px] max-h-[70vh] overflow-y-auto">
      <div className="font-bold text-heading mb-2 text-[11px] uppercaser">On this page</div>
      <ul className="space-y-1 border-l border-border-light pl-3">
        {headings.map((h) => (
          <li key={h.id} style={{ paddingLeft: `${(h.level - 2) * 8}px` }}>
            <a
              href={`#${h.id}`}
              className={`block py-0.5 transition-colors ${
                activeId === h.id
                  ? "text-accent font-medium"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
