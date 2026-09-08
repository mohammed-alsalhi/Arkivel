"use client";

interface Props {
  percent: number;
  label?: string;
  size?: number;
}

export default function ReadingProgressRing({ percent, label, size = 36 }: Props) {
  const radius = (size - 4) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <span className="inline-flex flex-col items-center gap-0.5" title={`${percent}% read`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-surface-hover)" strokeWidth="3" />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke="var(--color-accent)" strokeWidth="3"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      {label && <span className="text-[9px] text-muted">{label}</span>}
    </span>
  );
}
