"use client";

import { useEffect, useState, useCallback } from "react";
import { useScrollLock } from "@/lib/useScrollLock";

interface LightboxImage {
  src: string;
  alt: string;
}

export default function ImageLightbox() {
  const [image, setImage] = useState<LightboxImage | null>(null);

  useScrollLock(image !== null);

  const handleImageClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName !== "IMG") return;
    const img = target as HTMLImageElement;
    // Only lightbox images inside article-content
    if (!img.closest("#article-content")) return;
    e.preventDefault();
    setImage({ src: img.src, alt: img.alt || "" });
  }, []);

  useEffect(() => {
    document.addEventListener("click", handleImageClick);
    return () => document.removeEventListener("click", handleImageClick);
  }, [handleImageClick]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setImage(null);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  if (!image) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={() => setImage(null)}
    >
      <button
        onClick={() => setImage(null)}
        className="absolute top-4 right-4 text-white/80 hover:text-white p-2"
        aria-label="Close"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.src}
        alt={image.alt}
        className="max-h-[90vh] max-w-[90vw] object-contain shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
      {image.alt && (
        <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[12px] text-white/70 bg-black/50 px-3 py-1 max-w-sm text-center">
          {image.alt}
        </p>
      )}
    </div>
  );
}
