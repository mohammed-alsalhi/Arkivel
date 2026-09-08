/**
 * FreshnessBadge — a small colour-coded label showing how recently an article was updated.
 * Green  (≤30 days):   "Fresh"
 * Yellow (31–90 days): "Recent"
 * Orange (91–180 days):"Aging"
 * Red    (>180 days):  "Stale"
 */
type Props = { updatedAt: Date | string };

export default function FreshnessBadge({ updatedAt }: Props) {
  const ageDays = Math.floor(
    // eslint-disable-next-line react-hooks/purity
    (Date.now() - new Date(updatedAt).getTime()) / 86_400_000
  );

  let label: string;
  let cls: string;

  if (ageDays <= 30) {
    label = "Fresh";
    cls = "ui-chip-success";
  } else if (ageDays <= 90) {
    label = "Recent";
    cls = "ui-chip-info";
  } else if (ageDays <= 180) {
    label = "Aging";
    cls = "ui-chip-warning";
  } else {
    label = "Stale";
    cls = "ui-chip-danger";
  }

  return (
    <span
      title={`Last updated ${ageDays} day${ageDays === 1 ? "" : "s"} ago`}
      className={`ui-chip font-medium ${cls}`}
    >
      {label}
    </span>
  );
}
