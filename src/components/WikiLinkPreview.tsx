"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";

type PreviewData = {
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  category: { name: string; icon?: string | null } | null;
  updatedAt: string;
  exists: boolean;
};

const previewCache = new Map<string, PreviewData>();

export default function WikiLinkPreview() {
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [position, setPosition] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });
  const [visible, setVisible] = useState(false);

  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentSlugRef = useRef<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const showPreview = useCallback(
    async (slug: string, rect: DOMRect) => {
      // Position the card below the link, centered horizontally
      const top = rect.bottom + window.scrollY + 6;
      let left = rect.left + window.scrollX + rect.width / 2 - 150;

      // Clamp to viewport
      if (left < 8) left = 8;
      if (left + 300 > window.innerWidth - 8) {
        left = window.innerWidth - 308;
      }

      setPosition({ top, left });

      // Check cache first
      if (previewCache.has(slug)) {
        setPreview(previewCache.get(slug)!);
        setVisible(true);
        return;
      }

      // Fetch from API
      try {
        const res = await fetch(
          `/api/articles/preview?slug=${encodeURIComponent(slug)}`
        );
        if (res.ok) {
          const data: PreviewData = await res.json();
          previewCache.set(slug, data);
          // Only show if still hovering the same link
          if (currentSlugRef.current === slug) {
            setPreview(data);
            setVisible(true);
          }
        } else {
          // Article not found
          const notFound: PreviewData = {
            title: slug
              .replace(/-/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase()),
            excerpt: null,
            coverImage: null,
            category: null,
            updatedAt: "",
            exists: false,
          };
          previewCache.set(slug, notFound);
          if (currentSlugRef.current === slug) {
            setPreview(notFound);
            setVisible(true);
          }
        }
      } catch {
        // Network error — silently ignore
      }
    },
    []
  );

  const handleMouseOver = useCallback(
    (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest(
        ".wiki-link"
      ) as HTMLAnchorElement | null;
      if (!target) return;

      // Extract slug from href
      const href = target.getAttribute("href");
      if (!href) return;
      const slug = href.replace(/^\/wiki\//, "").replace(/^\//, "");
      if (!slug) return;

      // Clear any pending hide
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }

      currentSlugRef.current = slug;

      // Show after 300ms delay
      hoverTimerRef.current = setTimeout(() => {
        const rect = target.getBoundingClientRect();
        showPreview(slug, rect);
      }, 300);
    },
    [showPreview]
  );

  const handleMouseOut = useCallback((e: MouseEvent) => {
    const target = (e.target as HTMLElement).closest(".wiki-link");
    const relatedTarget = (e as MouseEvent).relatedTarget as HTMLElement | null;

    // If moving to the preview card, don't hide
    if (relatedTarget?.closest?.(".wiki-link-preview-card")) return;

    if (target) {
      // Cancel pending show
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
        hoverTimerRef.current = null;
      }

      // Hide after 100ms grace period
      hideTimerRef.current = setTimeout(() => {
        setVisible(false);
        currentSlugRef.current = null;
      }, 100);
    }
  }, []);

  const handleCardMouseEnter = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const handleCardMouseLeave = useCallback(() => {
    hideTimerRef.current = setTimeout(() => {
      setVisible(false);
      currentSlugRef.current = null;
    }, 100);
  }, []);

  useEffect(() => {
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);

    return () => {
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [handleMouseOver, handleMouseOut]);

  if (!visible || !preview) return null;

  const truncatedExcerpt = preview.excerpt
    ? preview.excerpt.length > 150
      ? preview.excerpt.substring(0, 150).trimEnd() + "..."
      : preview.excerpt
    : null;

  const card = (
    <div
      ref={cardRef}
      className="wiki-link-preview-card"
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
        width: 300,
        zIndex: 50,
      }}
      onMouseEnter={handleCardMouseEnter}
      onMouseLeave={handleCardMouseLeave}
    >
      {preview.exists ? (
        <>
          {preview.coverImage && (
            <div className="wiki-link-preview-image">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview.coverImage}
                alt={preview.title}
              />
            </div>
          )}
          <div className="wiki-link-preview-body">
            <div className="wiki-link-preview-title">{preview.title}</div>
            {preview.category && (
              <div className="wiki-link-preview-category">
                {preview.category.icon} {preview.category.name}
              </div>
            )}
            {truncatedExcerpt && (
              <div className="wiki-link-preview-excerpt">
                {truncatedExcerpt}
              </div>
            )}
            {preview.updatedAt && (
              <div className="wiki-link-preview-date">
                Last edited{" "}
                {new Date(preview.updatedAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="wiki-link-preview-body">
          <div className="wiki-link-preview-title wiki-link-preview-broken">
            {preview.title}
          </div>
          <div className="wiki-link-preview-excerpt" style={{ fontStyle: "italic" }}>
            This article does not exist yet.
          </div>
        </div>
      )}
    </div>
  );

  return createPortal(card, document.body);
}
