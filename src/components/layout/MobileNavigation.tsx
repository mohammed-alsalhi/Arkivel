"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import { isFocusedWorkspacePath } from "@/lib/navigation";

const navItems = [
  {
    href: "/",
    label: "Home",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
      </svg>
    ),
  },
  {
    href: "/search",
    label: "Search",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
    ),
  },
  {
    href: "/articles/new",
    label: "Create",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path d="M12 5v14M5 12h14" />
      </svg>
    ),
  },
  {
    href: "/recent-changes",
    label: "Recent",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
];

export default function MobileNavigation() {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const hideForFocusedWorkspace = isFocusedWorkspacePath(pathname);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
    // Toggle the existing sidebar by dispatching a custom event
    window.dispatchEvent(new CustomEvent("toggle-mobile-sidebar"));
  }, []);

  useEffect(() => {
    function handleSidebarState(e: Event) {
      setSidebarOpen(Boolean((e as CustomEvent<boolean>).detail));
    }

    window.addEventListener("mobile-sidebar-state-change", handleSidebarState);
    return () => window.removeEventListener("mobile-sidebar-state-change", handleSidebarState);
  }, []);

  if (hideForFocusedWorkspace) return null;

  return (
    <nav className="wiki-mobile-nav fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-surface md:hidden">
      <div className="flex h-14 items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                setSidebarOpen(false);
                window.dispatchEvent(new CustomEvent("close-mobile-sidebar"));
              }}
              aria-current={isActive ? "page" : undefined}
              className={`flex h-full min-w-0 flex-1 flex-col items-center justify-center gap-0.5 text-[10px] no-underline transition-colors ${
                isActive
                  ? "text-accent font-semibold"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {item.icon}
              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          );
        })}

        {/* Menu button to toggle sidebar */}
        <button
          onClick={toggleSidebar}
          className={`flex h-full min-w-0 flex-1 flex-col items-center justify-center gap-0.5 text-[10px] transition-colors ${
            sidebarOpen
              ? "text-accent font-semibold"
              : "text-muted hover:text-foreground"
          }`}
          aria-label="Toggle browse navigation"
          aria-pressed={sidebarOpen}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {sidebarOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <>
                <path d="M4 5h7v6H4z" />
                <path d="M13 5h7v6h-7z" />
                <path d="M4 13h7v6H4z" />
                <path d="M13 13h7v6h-7z" />
              </>
            )}
          </svg>
          <span className="max-w-full truncate">Browse</span>
        </button>
      </div>
    </nav>
  );
}
