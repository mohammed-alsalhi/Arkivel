interface Props {
  className?: string;
}

export default function FeaturedArticleBadge({ className = "" }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1 border border-yellow-400 bg-yellow-50 px-2 py-0.5 text-[11px] text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-600 ${className}`}
      title="Featured article"
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      Featured
    </span>
  );
}
