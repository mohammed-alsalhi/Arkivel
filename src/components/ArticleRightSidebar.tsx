"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import LocalGraph from "@/components/LocalGraph";
import { TabButton, Tabs } from "@/components/ui";
import { useScrollLock } from "@/lib/useScrollLock";

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
  const [isMobile, setIsMobile] = useState(false);

  // On phones the panel is a bottom sheet over the content, so lock the page
  // behind it; on desktop it docks beside the article and scrolling stays free.
  useScrollLock(open && isMobile);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

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
    <TabButton
      active={panel === p}
      onClick={() => setPanel(p)}
    >
      {label}
    </TabButton>
  );

  return (
    <>
      {/* Toggle: edge tab on desktop, floating button above the bottom nav on phones */}
      <button
        onClick={() => setOpen((o) => !o)}
        title={open ? "Close sidebar" : "Open article sidebar"}
        aria-label={open ? "Close sidebar" : "Open article sidebar"}
        aria-expanded={open}
        className="fixed z-30 bg-surface border border-border text-muted hover:text-foreground shadow-sm right-3 bottom-20 h-10 w-10 inline-flex items-center justify-center rounded-full md:rounded-none md:h-auto md:w-auto md:right-0 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:px-1.5 md:py-3 md:[writing-mode:vertical-rl]"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="15" y1="3" x2="15" y2="21" />
        </svg>
      </button>

      {/* Backdrop for the mobile bottom sheet */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          aria-hidden="true"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Panel: bottom sheet on phones, docked right panel on md+ */}
      {open && (
        <aside className="wiki-right-sidebar fixed z-50 inset-x-0 bottom-0 h-[70dvh] w-full border-t border-border bg-surface overflow-y-auto shadow-lg flex flex-col md:z-30 md:inset-x-auto md:right-0 md:top-[40px] md:bottom-auto md:h-[calc(100vh-40px)] md:w-64 md:border-t-0 md:border-l">
          {/* Panel tabs */}
          <Tabs label="Article sidebar panels" className="border-x-0 border-t-0 px-3 pt-2">
            {panelBtn("outline", "Outline")}
            {panelBtn("backlinks", "Links")}
            {panelBtn("graph", "Graph")}
          </Tabs>

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
                    onClick={() => { if (isMobile) setOpen(false); }}
                    className={`block text-[13px] py-1.5 md:text-[11px] md:py-0.5 hover:text-foreground truncate transition-colors ${
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
                        className="block text-[13px] py-1 md:text-[11px] md:py-0 text-muted hover:text-foreground truncate"
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
                          className="block text-[13px] py-1 md:text-[11px] md:py-0 text-muted hover:text-foreground truncate"
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
