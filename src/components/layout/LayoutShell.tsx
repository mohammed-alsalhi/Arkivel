"use client";

import { useEffect, useState } from "react";

/**
 * Client wrapper that manages the sidebar position preference (left / right).
 * Reads `wiki_sidebar_position` from localStorage on mount and listens for
 * the custom `sidebar-position-change` event dispatched by the Sidebar toggle.
 */
export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const [reversed, setReversed] = useState(false);

  useEffect(() => {
    try {
      setReversed(localStorage.getItem("wiki_sidebar_position") === "right");
    } catch {}

    const handler = (e: Event) => {
      setReversed((e as CustomEvent<string>).detail === "right");
    };
    window.addEventListener("sidebar-position-change", handler);
    return () => window.removeEventListener("sidebar-position-change", handler);
  }, []);

  return (
    <div className={`wiki-layout flex min-h-[calc(100vh-40px)] ${reversed ? "flex-row-reverse" : ""}`}>
      {children}
    </div>
  );
}
