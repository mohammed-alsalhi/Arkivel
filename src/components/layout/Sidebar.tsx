"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { useEffect, useRef, useState } from "react";
import { useAdmin } from "@/components/AdminContext";
import BrandMark from "@/components/brand/BrandMark";
import { config } from "@/lib/config";
import { generateSlug } from "@/lib/utils";
import { useScrollLock } from "@/lib/useScrollLock";
import { useFocusTrap } from "@/lib/useFocusTrap";

type Category = {
  id: string;
  name: string;
  slug: string;
  _count: { articles: number };
  children?: Category[];
};

type MenuItem = {
  href: string;
  label: string;
  active?: (pathname: string) => boolean;
  indent?: boolean;
};

type SidebarSide = "left" | "right";

function safePathSegment(value: string | null | undefined, fallback: string, id: string): string {
  const raw = (value?.trim() || generateSlug(fallback) || id).replace(/^\/+|\/+$/g, "");
  return encodeURIComponent(raw);
}

function categoryPath(category: Category): string {
  return `/categories/${safePathSegment(category.slug, category.name, category.id)}`;
}

function isPathActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;

  try {
    return decodeURIComponent(pathname) === decodeURIComponent(href);
  } catch {
    return false;
  }
}

function defaultActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

// ── SVG primitives ────────────────────────────────────────────────────────────

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="11" height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={clsx("transition-transform flex-shrink-0", !open && "-rotate-90")}
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// ── Main sidebar ──────────────────────────────────────────────────────────────

export default function Sidebar({
  brandName,
  categories,
  articleCount,
  logoMark,
  styleId,
}: {
  brandName: string;
  categories: Category[];
  articleCount?: number;
  logoMark: string;
  styleId: string;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  // Defaults must match the server render; the bootstrap script in layout.tsx
  // applies the persisted values to <html> pre-paint, and this effect syncs
  // component state after mount without a hydration mismatch.
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [sidebarSide, setSidebarSide] = useState<SidebarSide>("left");
  const isAdmin = useAdmin();
  const asideRef = useRef<HTMLElement>(null);
  const close = () => setMobileOpen(false);

  useScrollLock(mobileOpen);
  // mobileOpen can only become true via the md:hidden hamburger, so the trap
  // never engages on desktop where the sidebar is part of the normal layout.
  useFocusTrap(asideRef, mobileOpen);

  useEffect(() => {
    const root = document.documentElement;
    setDesktopOpen(root.getAttribute("data-sidebar-open") !== "false");
    setSidebarSide(root.getAttribute("data-sidebar-side") === "right" ? "right" : "left");
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  // Deliberately short: the sidebar carries daily essentials only.
  // Everything else lives in /tools, /admin and the command palette.
  const mainItems: MenuItem[] = [
    { href: "/", label: "Main Page", active: (path) => path === "/" },
    {
      href: "/articles",
      label: `Articles${articleCount ? ` (${articleCount})` : ""}`,
      active: (path) => path === "/articles" || path.startsWith("/articles/"),
    },
    { href: "/articles/new", label: "New article", active: (path) => path === "/articles/new" },
    { href: "/recent-changes", label: "Recent changes" },
    { href: "/search", label: "Search" },
  ];

  const discoverItems: MenuItem[] = [
    { href: "/categories", label: "Categories", active: (path) => path === "/categories" || path.startsWith("/categories/") },
    { href: "/tags", label: "Tags", active: (path) => path === "/tags" || path.startsWith("/tags/") },
    { href: "/graph", label: "Article graph" },
    { href: "/random", label: "Random article" },
    ...(config.mapEnabled ? [{ href: "/map", label: config.mapLabel, active: (path: string) => path === "/map" || path.startsWith("/map/") }] : []),
  ];

  const workItems: MenuItem[] = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/studio", label: "Arkivel Studio" },
    { href: "/bookmarks", label: "Bookmarks" },
    { href: "/reading-lists", label: "Reading lists", active: (path) => path.startsWith("/reading-lists") },
    { href: "/watchlist", label: "Watchlist", active: (path) => path === "/watchlist" },
  ];

  const moreItems: MenuItem[] = [
    { href: "/tools", label: "All tools" },
    { href: "/help", label: "Help" },
  ];

  const adminItems: MenuItem[] = [
    { href: "/admin", label: "Admin dashboard", active: (path) => path === "/admin" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/analytics", label: "Analytics" },
  ];

  useEffect(() => {
    function handleMobileToggle() {
      setMobileOpen((open) => !open);
    }

    function handleMobileClose() {
      setMobileOpen(false);
    }

    window.addEventListener("toggle-mobile-sidebar", handleMobileToggle);
    window.addEventListener("close-mobile-sidebar", handleMobileClose);
    return () => {
      window.removeEventListener("toggle-mobile-sidebar", handleMobileToggle);
      window.removeEventListener("close-mobile-sidebar", handleMobileClose);
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setMobileOpen(false), 0);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("mobile-sidebar-state-change", { detail: mobileOpen }));
  }, [mobileOpen]);

  function setDesktopSidebarVisibility(next: boolean) {
    setDesktopOpen(next);
    try {
      localStorage.setItem("wiki_sidebar_desktop_open", String(next));
      window.dispatchEvent(new CustomEvent("desktop-sidebar-state-change", { detail: next }));
    } catch {}
  }

  function setSidebarPosition(next: SidebarSide) {
    setSidebarSide(next);
    try {
      localStorage.setItem("wiki_sidebar_position", next);
      window.dispatchEvent(new CustomEvent("sidebar-position-change", { detail: next }));
    } catch {}
  }

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle main menu"
        aria-pressed={mobileOpen}
        className="wiki-main-menu-button wiki-main-menu-button-mobile ui-icon-button fixed top-1.5 left-2 z-50 bg-surface border-border text-foreground"
      >
        {mobileOpen ? <CloseIcon /> : <MenuIcon />}
      </button>
      <button
        onClick={() => setDesktopSidebarVisibility(!desktopOpen)}
        aria-label="Toggle main menu"
        aria-pressed={desktopOpen}
        className="wiki-main-menu-button wiki-main-menu-button-desktop ui-icon-button fixed top-1.5 left-2 z-50 bg-surface border-border text-foreground"
      >
        {desktopOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          aria-hidden="true"
          onClick={close}
        />
      )}
      <aside
        ref={asideRef}
        className={clsx(
          "wiki-sidebar fixed top-[40px] z-40 h-[calc(100vh-40px)] w-[212px] overflow-y-auto bg-sidebar-bg transition-[transform,opacity,visibility] flex flex-col",
          mobileOpen
            ? "translate-x-0 opacity-100 visible pointer-events-auto"
            : "-translate-x-full max-md:opacity-0 max-md:invisible max-md:pointer-events-none",
          "md:sticky md:top-0 md:translate-x-0 md:h-auto md:min-h-[calc(100vh-40px)] md:flex-shrink-0 md:opacity-100 md:visible md:pointer-events-auto md:flex"
        )}
      >
        {styleId === "simplesque" && (
          <Link href="/" className="wiki-sidebar-brand border-b border-border px-3 py-4" aria-label={`${brandName} home`}>
            <BrandMark className="wiki-sidebar-brand-mark" imageSize={36} logoMark={logoMark} priority />
            <span className="wiki-sidebar-brand-name">{brandName}</span>
          </Link>
        )}

        <MenuSection title="Main" items={mainItems} pathname={pathname} onNavigate={close} />
        <MenuSection title="Discover" items={discoverItems} pathname={pathname} onNavigate={close} />
        <MenuSection title="Work" items={workItems} pathname={pathname} onNavigate={close} />
        <MenuSection title="More" items={moreItems} pathname={pathname} onNavigate={close} />

        {isAdmin && (
          <MenuSection title="Admin" items={adminItems} pathname={pathname} onNavigate={close} />
        )}

        {/* Categories */}
        <SidebarSection title="Categories" defaultOpen={false}>
          <SidebarLink href="/categories" active={pathname === "/categories"} onClick={close}>
            All categories
          </SidebarLink>
          {categories.map((cat) => (
            <SidebarCategoryItem
              key={cat.id}
              category={cat}
              pathname={pathname}
              depth={0}
              onNavigate={close}
            />
          ))}
        </SidebarSection>

        {/* Footer */}
        <div className="wiki-sidebar-footer mt-auto border-t border-border px-3 py-2 text-[10px] text-muted">
          <span>v{config.version}</span>
          <button
            type="button"
            title={sidebarSide === "right" ? "Dock sidebar on the left" : "Dock sidebar on the right"}
            onClick={() => setSidebarPosition(sidebarSide === "right" ? "left" : "right")}
            className="wiki-sidebar-dock-button"
            aria-label={sidebarSide === "right" ? "Dock sidebar on the left" : "Dock sidebar on the right"}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {sidebarSide === "right" ? (
                <>
                  <rect x="3" y="4" width="18" height="16" rx="1" />
                  <path d="M9 4v16" />
                  <path d="M6 8h.01M6 12h.01M6 16h.01" />
                </>
              ) : (
                <>
                  <rect x="3" y="4" width="18" height="16" rx="1" />
                  <path d="M15 4v16" />
                  <path d="M18 8h.01M18 12h.01M18 16h.01" />
                </>
              )}
            </svg>
            <span>{sidebarSide === "right" ? "Dock left" : "Dock right"}</span>
          </button>
        </div>
      </aside>
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SidebarCategoryItem({
  category,
  pathname,
  depth,
  onNavigate,
}: {
  category: Category;
  pathname: string;
  depth: number;
  onNavigate: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = category.children && category.children.length > 0;
  const href = categoryPath(category);

  return (
    <div>
      <div className="flex items-center" style={{ paddingLeft: `${depth * 12}px` }}>
        {hasChildren ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-center w-7 self-stretch md:w-4 flex-shrink-0 text-muted hover:text-foreground transition-colors"
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            <ChevronIcon open={expanded} />
          </button>
        ) : (
          <span className="w-7 md:w-4 flex-shrink-0" />
        )}
        <SidebarLink
          href={href}
          active={isPathActive(pathname, href)}
          onClick={onNavigate}
        >
          <span className="flex items-center justify-between w-full">
            <span>{category.name}</span>
            {category._count.articles > 0 && (
              <span className="text-[10px] text-muted ml-1 flex-shrink-0">
                {category._count.articles}
              </span>
            )}
          </span>
        </SidebarLink>
      </div>
      {hasChildren && expanded && (
        <div>
          {category.children!.map((child) => (
            <SidebarCategoryItem
              key={child.id}
              category={child}
              pathname={pathname}
              depth={depth + 1}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MenuSection({
  title,
  items,
  pathname,
  onNavigate,
  defaultOpen = true,
}: {
  title: string;
  items: MenuItem[];
  pathname: string;
  onNavigate: () => void;
  defaultOpen?: boolean;
}) {
  return (
    <SidebarSection title={title} defaultOpen={defaultOpen}>
      {items.map((item) => (
        <SidebarLink
          key={`${title}-${item.href}-${item.label}`}
          href={item.href}
          active={item.active ? item.active(pathname) : defaultActive(pathname, item.href)}
          onClick={onNavigate}
          indent={item.indent}
        >
          {item.label}
        </SidebarLink>
      ))}
    </SidebarSection>
  );
}

function SidebarSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full bg-infobox-header px-3 py-2 text-[12px] md:py-1 md:text-[11px] font-bold text-foreground uppercase hover:bg-surface-hover transition-colors"
        aria-expanded={open}
      >
        <span>{title}</span>
        <ChevronIcon open={open} />
      </button>
      {open && <div className="px-2 py-1">{children}</div>}
    </div>
  );
}

function SidebarLink({
  href,
  active,
  onClick,
  children,
  indent,
}: {
  href: string;
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  indent?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={clsx(
        "block py-2 text-[15px] md:py-[3px] md:text-[13px] transition-colors hover:no-underline",
        indent ? "px-4" : "px-2",
        active ? "bg-surface text-heading font-bold" : "text-wiki-link hover:bg-surface-hover"
      )}
    >
      {children}
    </Link>
  );
}
