"use client";

import { useEffect } from "react";

/**
 * Client wrapper that keeps sidebar shell preferences in sync.
 * The persisted side/open state is applied to <html> before first paint by the
 * bootstrap script in layout.tsx; this component only updates those attributes
 * when Sidebar dispatches preference-change events, so the server and client
 * always render identical markup (no hydration mismatch).
 */
export default function LayoutShell({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;

    const onSideChange = (e: Event) => {
      const next = (e as CustomEvent<string>).detail === "right" ? "right" : "left";
      root.setAttribute("data-sidebar-side", next);
    };
    const onOpenChange = (e: Event) => {
      const open = (e as CustomEvent<boolean>).detail !== false;
      root.setAttribute("data-sidebar-open", open ? "true" : "false");
    };

    window.addEventListener("sidebar-position-change", onSideChange);
    window.addEventListener("desktop-sidebar-state-change", onOpenChange);
    return () => {
      window.removeEventListener("sidebar-position-change", onSideChange);
      window.removeEventListener("desktop-sidebar-state-change", onOpenChange);
    };
  }, []);

  return <div className="wiki-layout flex min-h-[calc(100vh-40px)]">{children}</div>;
}
