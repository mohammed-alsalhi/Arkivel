type Props = {
  badges: string[];
};

export default function SpaceGovernanceBadges({ badges }: Props) {
  if (badges.length === 0) return null;

  return (
    <div className="article-soft-banner" aria-label="Inherited space governance">
      <span className="font-medium text-foreground">Space governance</span>
      <span className="flex flex-wrap gap-1">
        {badges.map((badge) => (
          <span key={badge} className="ui-chip">
            {badge}
          </span>
        ))}
      </span>
    </div>
  );
}
