"use client";

import { useEffect, useRef, useState } from "react";

type Tip = { term: string; definition: string; x: number; y: number } | null;

/**
 * Attaches to the article body via event delegation.
 * Shows a hover card when the user mouses over any `[data-glossary-term]` span.
 */
export default function GlossaryTooltipLayer() {
  const [tip, setTip] = useState<Tip>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    function onOver(e: MouseEvent) {
      const target = (e.target as Element).closest("[data-glossary-term]") as HTMLElement | null;
      if (!target) return;
      clearTimeout(hideTimer.current);
      const rect = target.getBoundingClientRect();
      setTip({
        term: decodeURIComponent(target.dataset.glossaryTerm ?? ""),
        definition: target.dataset.glossaryDef ?? "",
        x: rect.left + window.scrollX,
        y: rect.top + window.scrollY,
      });
    }

    function onOut(e: MouseEvent) {
      const related = e.relatedTarget as Element | null;
      if (related?.closest?.("[data-glossary-term]") || related?.closest?.("[data-glossary-card]")) return;
      hideTimer.current = setTimeout(() => setTip(null), 150);
    }

    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    return () => {
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      clearTimeout(hideTimer.current);
    };
  }, []);

  if (!tip) return null;

  return (
    <div
      data-glossary-card
      style={{ position: "absolute", left: tip.x, top: tip.y - 8, transform: "translateY(-100%)", zIndex: 50 }}
      className="w-64 rounded border border-border bg-surface shadow-lg text-[12px] p-2.5 pointer-events-auto"
      onMouseEnter={() => clearTimeout(hideTimer.current)}
      onMouseLeave={() => { hideTimer.current = setTimeout(() => setTip(null), 150); }}
    >
      <span className="block font-semibold text-heading mb-1">{tip.term}</span>
      <span className="text-foreground leading-snug">{tip.definition}</span>
    </div>
  );
}
