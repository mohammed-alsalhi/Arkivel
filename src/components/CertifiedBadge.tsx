interface Props {
  certifiedAt?: Date | string | null;
}

export default function CertifiedBadge({ certifiedAt }: Props) {
  if (!certifiedAt) return null;
  const date = new Date(certifiedAt);
  return (
    <span
      title={`Verified by expert reviewers on ${date.toLocaleDateString()}`}
      className="ui-chip ui-chip-success font-medium"
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      Verified
    </span>
  );
}
