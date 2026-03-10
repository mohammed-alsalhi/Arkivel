"use client";

import { useEffect, useState } from "react";

type Heading = { id: string; text: string; level: number };

function parseHeadings(html: string): Heading[] {
  const regex = /<h([23])[^>]*id="([^"]*)"[^>]*>(.*?)<\/h[23]>/gi;
  const results: Heading[] = [];
  let m;
  while ((m = regex.exec(html)) !== null) {
    results.push({
      level: parseInt(m[1]),
      id: m[2],
      text: m[3].replace(/<[^>]+>/g, ""),
    });
  }
  return results;
}

type Props = { html: string };

export default function TableOfContentsFloat({ html }: Props) {
  const [activeId, setActiveId] = useState<string>("");
  const headings = parseHeadings(html);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: "0px 0px -60% 0px", threshold: 0 }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 3) return null;

  return (
    <aside className="hidden xl:block fixed top-24 right-4 w-56 max-h-[70vh] overflow-y-auto z-10">
      <div className="border border-border rounded-lg bg-surface px-3 py-2.5 text-[11px]">
        <p className="font-medium text-muted-foreground mb-2 uppercase tracking-wide text-[10px]">Contents</p>
        <nav>
          <ul className="space-y-0.5">
            {headings.map(({ id, text, level }) => (
              <li key={id} style={{ paddingLeft: level === 3 ? "0.75rem" : "0" }}>
                <a
                  href={`#${id}`}
                  className={`block truncate py-0.5 hover:text-wiki-link transition-colors ${
                    activeId === id ? "text-wiki-link font-medium" : "text-muted-foreground"
                  }`}
                >
                  {text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
