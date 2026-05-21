"use client";

type Props = {
  categorySlug?: string;
  label?: string;
  className?: string;
};

export default function RandomArticleButton({ categorySlug, label = "Random article", className }: Props) {
  const href = categorySlug ? `/api/random?category=${encodeURIComponent(categorySlug)}` : "/api/random";

  return (
    <a
      href={href}
      className={className ?? "ui-button"}
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="16 3 21 3 21 8" />
        <line x1="4" y1="20" x2="21" y2="3" />
        <polyline points="21 16 21 21 16 21" />
        <line x1="15" y1="15" x2="21" y2="21" />
      </svg>
      {label}
    </a>
  );
}
