"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import LocalGraph from "@/components/LocalGraph";

type BacklinkItem = { id: string; title: string; slug: string };
type HeadingItem = { id: string; text: string; level: number };

type Panel = "outline" | "backlinks" | "graph";

export default function ArticleRightSidebar({
  slug,
  backlinks,
}: {
  slug: string;
  backlinks: BacklinkItem[];
}) {
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState<Panel>("outline");
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [unlinkedMentions, setUnlinkedMentions] = useState<BacklinkItem[]>([]);

  // Extract headings from rendered DOM
  useEffect(() => {
    const articleEl = document.querySelector(".wiki-content");
    if (!articleEl) return;
    const els = Array.from(articleEl.querySelectorAll("h1, h2, h3, h4"));
    const items: HeadingItem[] = els.map((el) => ({
      id: el.id || "",
      text: el.textContent || "",
      level: parseInt(el.tagName[1]),
    })).filter((h) => h.id && h.text);
    setHeadings(items);
  }, []);

  // Scrollspy for active heading
  useEffect(() => {
    if (headings.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: "0px 0px -70% 0px", threshold: 0 }
    );
    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [headings]);

  // Load unlinked mentions lazily
  useEffect(() => {
    if (!open || panel !== "backlinks") return;
    const articleEl = document.querySelector("[data-article-id]");
    const id = articleEl?.getAttribute("data-article-id");
    if (!id) return;
    fetch(`/api/articles/${id}/unlinked-mentions`)
      .then((r) => r.ok ? r.json() : [])
      .then(setUnlinkedMentions)
      .catch(() => {});
  }, [open, panel]);

  const panelBtn = (p: Panel, label: string) => (
    <button
      onClick={() => setPanel(p)}
      aria-pressed={panel === p}
      className="ui-button"
    >
      {label}
    </button>
  );

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        title={open ? "Close sidebar" : "Open article sidebar"}
        aria-label={open ? "Close sidebar" : "Open article sidebar"}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-30 bg-surface border border-border px-1.5 py-3 text-muted hover:text-foreground shadow-sm"
        style={{ writingMode: "vertical-rl" }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="15" y1="3" x2="15" y2="21" />
        </svg>
      </button>

      {/* Panel */}
      {open && (
        <aside className="wiki-right-sidebar fixed right-0 top-[40px] z-20 h-[calc(100vh-40px)] w-56 bg-surface border-l border-border overflow-y-auto shadow-lg flex flex-col">
          {/* Panel tabs */}
          <div className="flex items-center gap-1 px-3 py-2 border-b border-border flex-wrap">
            {panelBtn("outline", "Outline")}
            {panelBtn("backlinks", "Links")}
            {panelBtn("graph", "Graph")}
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-3">
            {panel === "outline" && (
              <div className="space-y-0.5">
                {headings.length === 0 && (
                  <p className="text-[11px] text-muted">No headings found.</p>
                )}
                {headings.map((h) => (
                  <a
                    key={h.id}
                    href={`#${h.id}`}
                    className={`block text-[11px] py-0.5 hover:text-foreground truncate transition-colors ${
                      activeId === h.id ? "text-accent font-medium" : "text-muted"
                    }`}
                    style={{ paddingLeft: `${(h.level - 1) * 10}px` }}
                  >
                    {h.text}
                  </a>
                ))}
              </div>
            )}

            {panel === "backlinks" && (
              <div className="space-y-3">
                <div>
                  <div className="text-[10px] font-semibold text-muted uppercase mb-1">
                    Backlinks ({backlinks.length})
                  </div>
                  <div className="space-y-0.5">
                    {backlinks.length === 0 && (
                      <p className="text-[11px] text-muted">No backlinks.</p>
                    )}
                    {backlinks.map((b) => (
                      <Link
                        key={b.id}
                        href={`/articles/${b.slug}`}
                        className="block text-[11px] text-muted hover:text-foreground truncate"
                      >
                        {b.title}
                      </Link>
                    ))}
                  </div>
                </div>

                {unlinkedMentions.length > 0 && (
                  <div>
                    <div className="text-[10px] font-semibold text-muted uppercase mb-1">
                      Unlinked mentions ({unlinkedMentions.length})
                    </div>
                    <div className="space-y-0.5">
                      {unlinkedMentions.map((b) => (
                        <Link
                          key={b.id}
                          href={`/articles/${b.slug}`}
                          className="block text-[11px] text-muted hover:text-foreground truncate"
                        >
                          {b.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {panel === "graph" && <LocalGraph slug={slug} />}
          </div>
        </aside>
      )}
    </>
  );
}
