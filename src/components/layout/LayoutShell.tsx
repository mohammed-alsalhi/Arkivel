"use client";

import { useEffect, useState } from "react";

function getStoredSidebarSide(): "left" | "right" {
  try {
    return localStorage.getItem("wiki_sidebar_position") === "right" ? "right" : "left";
  } catch {
    return "left";
  }
}

function getStoredDesktopSidebarOpen(): boolean {
  try {
    return localStorage.getItem("wiki_sidebar_desktop_open") !== "false";
  } catch {
    return true;
  }
}

/**
 * Client wrapper that manages sidebar shell preferences.
 * Reads persisted sidebar side/open state and listens for custom events from
 * Sidebar so the content border and flex direction stay in sync.
 */
export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const [sidebarSide, setSidebarSide] = useState<"left" | "right">(getStoredSidebarSide);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(getStoredDesktopSidebarOpen);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-sidebar-side", sidebarSide);
    return () => root.removeAttribute("data-sidebar-side");
  }, [sidebarSide]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-sidebar-open", desktopSidebarOpen ? "true" : "false");
    return () => root.removeAttribute("data-sidebar-open");
  }, [desktopSidebarOpen]);

  useEffect(() => {
    const handler = (e: Event) => {
      const next = (e as CustomEvent<string>).detail === "right" ? "right" : "left";
      setSidebarSide(next);
    };
    window.addEventListener("sidebar-position-change", handler);
    return () => window.removeEventListener("sidebar-position-change", handler);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      setDesktopSidebarOpen((e as CustomEvent<boolean>).detail !== false);
    };
    window.addEventListener("desktop-sidebar-state-change", handler);
    return () => window.removeEventListener("desktop-sidebar-state-change", handler);
  }, []);

  return (
    <div
      className="wiki-layout flex min-h-[calc(100vh-40px)]"
      data-sidebar-open={desktopSidebarOpen}
      data-sidebar-side={sidebarSide}
    >
      {children}
    </div>
  );
}
