type Props = { flags: string[] };

export default function ArticleFlags({ flags }: Props) {
  if (flags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5 my-2">
      {flags.map((flag) => (
        <span
          key={flag}
          className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] rounded border border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" />
          </svg>
          {flag}
        </span>
      ))}
    </div>
  );
}
