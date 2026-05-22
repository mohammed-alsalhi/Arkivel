"use client";

import { useEffect, useState } from "react";

function getStoredSidebarSide(): "left" | "right" {
  try {
    return localStorage.getItem("wiki_sidebar_position") === "right" ? "right" : "left";
  } catch {
    return "left";
  }
}

/**
 * Client wrapper that manages the sidebar position preference (left / right).
 * Reads `wiki_sidebar_position` from localStorage on mount and listens for
 * the custom `sidebar-position-change` event dispatched by the Sidebar toggle.
 */
export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const [sidebarSide, setSidebarSide] = useState<"left" | "right">(getStoredSidebarSide);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-sidebar-side", sidebarSide);
    return () => root.removeAttribute("data-sidebar-side");
  }, [sidebarSide]);

  useEffect(() => {
    const handler = (e: Event) => {
      const next = (e as CustomEvent<string>).detail === "right" ? "right" : "left";
      setSidebarSide(next);
    };
    window.addEventListener("sidebar-position-change", handler);
    return () => window.removeEventListener("sidebar-position-change", handler);
  }, []);

  return (
    <div className="wiki-layout flex min-h-[calc(100vh-40px)]" data-sidebar-side={sidebarSide}>
      {children}
    </div>
  );
}
