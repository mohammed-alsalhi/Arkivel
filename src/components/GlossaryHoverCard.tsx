"use client";

import { useState, useRef, useEffect } from "react";

interface Props {
  term: string;
  definition: string;
  children: React.ReactNode;
}

export default function GlossaryHoverCard({ term, definition, children }: Props) {
  const [show, setShow] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const rootRef = useRef<HTMLSpanElement>(null);

  function enter() {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setShow(true), 300);
  }

  function leave() {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setShow(false), 150);
  }

  // Touch and keyboard path: tap or Enter toggles the card.
  function toggle() {
    clearTimeout(timer.current);
    setShow((s) => !s);
  }

  useEffect(() => () => clearTimeout(timer.current), []);

  // Close on tap/click outside — touch devices never fire mouseleave.
  useEffect(() => {
    if (!show) return;
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setShow(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [show]);

  return (
    <span ref={rootRef} className="relative inline" onMouseEnter={enter} onMouseLeave={leave}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={show}
        className="inline border-b border-dotted border-accent cursor-help bg-transparent p-0 text-inherit [font:inherit] text-left"
      >
        {children}
      </button>
      {show && (
        <span
          role="tooltip"
          className="absolute z-50 bottom-full left-0 mb-1 w-64 max-w-[80vw] rounded border border-border bg-surface shadow-lg text-[12px] p-2.5"
          onMouseEnter={enter}
          onMouseLeave={leave}
        >
          <span className="block font-semibold text-heading mb-1">{term}</span>
          <span className="text-foreground leading-snug">{definition}</span>
        </span>
      )}
    </span>
  );
}
