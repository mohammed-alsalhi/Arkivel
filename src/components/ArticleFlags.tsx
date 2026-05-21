type Props = { flags: string[] };

export default function ArticleFlags({ flags }: Props) {
  if (flags.length === 0) return null;
  return (
    <div className="article-flags">
      {flags.map((flag) => (
        <span
          key={flag}
          className="ui-chip ui-chip-warning"
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
