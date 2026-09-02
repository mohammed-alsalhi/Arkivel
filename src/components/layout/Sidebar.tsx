"use client";

import { clsx } from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import BrandMark from "@/components/brand/BrandMark";
import ThemeToggle from "@/components/ThemeToggle";
import CommandPalette, { openCommandPalette } from "@/components/layout/CommandPalette";
import UserMenu from "@/components/layout/UserMenu";
import { config } from "@/lib/config";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { generateSlug } from "@/lib/utils";
import { useScrollLock } from "@/lib/useScrollLock";

type Category = {
  id: string;
  name: string;
  slug: string;
  children?: Category[];
};

function safePathSegment(value: string | null | undefined, fallback: string, id: string): string {
  const raw = (value?.trim() || generateSlug(fallback) || id).replace(/^\/+|\/+$/g, "");
  return encodeURIComponent(raw);
}

function categoryPath(category: Category): string {
  return `/categories/${safePathSegment(category.slug, category.name, category.id)}`;
}

function isPathActive(pathname: string, href: string): boolean {
  try {
    const current = decodeURIComponent(pathname);
    const target = decodeURIComponent(href);
    return current === target || current.startsWith(`${target}/`);
  } catch {
    return pathname === href || pathname.startsWith(`${href}/`);
  }
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  );
}

const navIconProps = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

function SearchIcon() {
  return (
    <svg {...navIconProps}>
      <circle cx="11" cy="11" r="7" />
      <line x1="16.5" y1="16.5" x2="21" y2="21" />
    </svg>
  );
}

function InboxIcon() {
  return (
    <svg {...navIconProps}>
      <path d="M4 5h16v14H4z" />
      <path d="M4 14h5l1.5 2.5h3L15 14h5" />
    </svg>
  );
}

function PagesIcon() {
  return (
    <svg {...navIconProps}>
      <path d="M8 3h7l4 4v12a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M15 3v4h4" />
      <path d="M4 7v13a1 1 0 0 0 1 1h10" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg {...navIconProps}>
      <path d="M3 12V4h8l9 9-8 8-9-9z" />
      <circle cx="7.5" cy="8.5" r="1.25" />
    </svg>
  );
}

function GraphIcon() {
  return (
    <svg {...navIconProps}>
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="18" cy="8" r="2.5" />
      <circle cx="10" cy="18" r="2.5" />
      <path d="M8.2 7.2 15.6 8.1M7.2 8.3l1.9 7.3M12.3 16.8l4.4-6.6" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg {...navIconProps}>
      <path d="M3 6a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6z" />
    </svg>
  );
}

const subscribeToNothing = () => () => {};
const isApplePlatform = () => /mac|iphone|ipad|ipod/i.test(navigator.platform || navigator.userAgent);

export default function Sidebar({
  brandName,
  categories,
  articleCount = 0,
  logoMark,
}: {
  brandName: string;
  categories: Category[];
  articleCount?: number;
  logoMark: string;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);
  const asideRef = useRef<HTMLElement>(null);
  // null on the server and during hydration, so the kbd hint never mismatches.
  const isMac = useSyncExternalStore(subscribeToNothing, isApplePlatform, () => null);

  // Navigating from the palette bypasses the link onClick handlers, so close
  // the drawer whenever the route changes (adjusting state during render).
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMobileOpen(false);
  }

  useScrollLock(mobileOpen);
  useFocusTrap(asideRef, mobileOpen);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  const close = () => setMobileOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen((open) => !open)}
        aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={mobileOpen}
        aria-controls="wiki-navigation"
        className="wiki-main-menu-button"
      >
        {mobileOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      {mobileOpen && (
        <button
          type="button"
          className="wiki-sidebar-backdrop"
          aria-label="Close navigation"
          onClick={close}
        />
      )}

      <aside
        ref={asideRef}
        id="wiki-navigation"
        className={clsx("wiki-sidebar", mobileOpen && "wiki-sidebar-open")}
        aria-label="Wiki navigation"
        // As a mobile drawer this covers the page, so it becomes a modal dialog.
        role={mobileOpen ? "dialog" : undefined}
        aria-modal={mobileOpen ? true : undefined}
      >
        <Link href="/" className="wiki-sidebar-brand" aria-label={`${brandName} home`} onClick={close}>
          <BrandMark className="wiki-sidebar-brand-mark" imageSize={42} logoMark={logoMark} priority />
        </Link>

        <button
          type="button"
          className="wiki-sidebar-search-trigger"
          aria-label={`Search ${brandName}`}
          aria-keyshortcuts="Meta+K Control+K"
          onClick={openCommandPalette}
        >
          <span className="wiki-sidebar-search-trigger-icon">
            <SearchIcon />
          </span>
          <span className="wiki-sidebar-search-trigger-label">search…</span>
          {isMac !== null && <kbd aria-hidden="true">{isMac ? "⌘K" : "ctrl K"}</kbd>}
        </button>

        <nav className="wiki-sidebar-navigation">
          <SidebarSection title="library">
            <SidebarLink href="/recent-changes" active={pathname === "/recent-changes"} onClick={close} icon={<InboxIcon />}>
              inbox
            </SidebarLink>
            <SidebarLink
              href="/articles"
              active={pathname === "/articles" || pathname.startsWith("/articles/")}
              onClick={close}
              icon={<PagesIcon />}
            >
              all pages
            </SidebarLink>
            <SidebarLink href="/tags" active={isPathActive(pathname, "/tags")} onClick={close} icon={<TagIcon />}>
              tags
            </SidebarLink>
            <SidebarLink href="/graph" active={pathname === "/graph"} onClick={close} icon={<GraphIcon />}>
              graph
            </SidebarLink>
          </SidebarSection>

          <SidebarSection title="spaces">
            {categories.length > 0 ? (
              categories.map((category) => (
                <SidebarCategory
                  key={category.id}
                  category={category}
                  pathname={pathname}
                  onNavigate={close}
                />
              ))
            ) : (
              <p className="wiki-sidebar-empty">no spaces yet</p>
            )}
          </SidebarSection>
        </nav>

        <div className="wiki-sidebar-footer">
          <div className="wiki-sidebar-footer-copy">
            <span>{articleCount.toLocaleString()} pages</span>
            <span aria-hidden="true">·</span>
            <span>v{config.version}</span>
          </div>
          <div className="wiki-sidebar-footer-actions">
            <Link href="/articles/new" className="wiki-sidebar-new-page" onClick={close}>
              new page
            </Link>
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </aside>

      <CommandPalette />
    </>
  );
}

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="wiki-sidebar-section" aria-labelledby={`sidebar-${title}`}>
      <h2 id={`sidebar-${title}`} className="wiki-sidebar-section-title">
        {title}
      </h2>
      <div className="wiki-sidebar-section-links">{children}</div>
    </section>
  );
}

function SidebarCategory({
  category,
  pathname,
  onNavigate,
  depth = 0,
}: {
  category: Category;
  pathname: string;
  onNavigate: () => void;
  depth?: number;
}) {
  const href = categoryPath(category);

  return (
    <div className="wiki-sidebar-category">
      <SidebarLink
        href={href}
        active={isPathActive(pathname, href)}
        onClick={onNavigate}
        depth={depth}
        icon={<FolderIcon />}
      >
        <span>{category.name}</span>
      </SidebarLink>
      {category.children?.map((child) => (
        <SidebarCategory
          key={child.id}
          category={child}
          pathname={pathname}
          onNavigate={onNavigate}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}

function SidebarLink({
  href,
  active,
  onClick,
  children,
  depth = 0,
  icon,
}: {
  href: string;
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  depth?: number;
  icon?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={clsx("wiki-sidebar-link", active && "wiki-sidebar-link-active")}
      style={{ paddingLeft: `${1 + depth * 1.2}rem` }}
    >
      {icon && <span className="wiki-sidebar-link-icon">{icon}</span>}
      <span className="wiki-sidebar-link-label">{children}</span>
    </Link>
  );
}
