"use client";

import { clsx } from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import BrandMark from "@/components/brand/BrandMark";
import ThemeToggle from "@/components/ThemeToggle";
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
  const asideRef = useRef<HTMLElement>(null);

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
      >
        <Link href="/" className="wiki-sidebar-brand" aria-label={`${brandName} home`} onClick={close}>
          <BrandMark className="wiki-sidebar-brand-mark" imageSize={42} logoMark={logoMark} priority />
        </Link>

        <form action="/search" className="wiki-sidebar-search" role="search">
          <label htmlFor="wiki-sidebar-search-input" className="sr-only">
            Search {brandName}
          </label>
          <input
            id="wiki-sidebar-search-input"
            name="q"
            type="search"
            placeholder={`search ${brandName.toLowerCase()}...`}
            className="wiki-sidebar-search-input"
          />
        </form>

        <nav className="wiki-sidebar-navigation">
          <SidebarSection title="library">
            <SidebarLink href="/recent-changes" active={pathname === "/recent-changes"} onClick={close}>
              inbox
            </SidebarLink>
            <SidebarLink href="/articles" active={pathname === "/articles" || pathname.startsWith("/articles/")} onClick={close}>
              all pages
            </SidebarLink>
            <SidebarLink href="/tags" active={isPathActive(pathname, "/tags")} onClick={close}>
              tags
            </SidebarLink>
            <SidebarLink href="/graph" active={pathname === "/graph"} onClick={close}>
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
      <SidebarLink href={href} active={isPathActive(pathname, href)} onClick={onNavigate} depth={depth}>
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
}: {
  href: string;
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  depth?: number;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={clsx("wiki-sidebar-link", active && "wiki-sidebar-link-active")}
      style={{ paddingLeft: `${1 + depth * 1.2}rem` }}
    >
      {children}
    </Link>
  );
}
