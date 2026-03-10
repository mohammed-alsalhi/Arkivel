"use client";

type Props = { wordGoal: number; currentWords: number };

export default function WordGoalBadge({ wordGoal, currentWords }: Props) {
  if (!wordGoal || wordGoal <= 0) return null;

  const pct = Math.min(1, currentWords / wordGoal);
  const done = currentWords >= wordGoal;

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground" title={`Word goal: ${currentWords} / ${wordGoal}`}>
      <div className="w-20 h-1.5 bg-border rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${done ? "bg-green-500" : "bg-blue-500"}`}
          style={{ width: `${pct * 100}%` }}
        />
      </div>
      <span className={done ? "text-green-600 dark:text-green-400 font-medium" : ""}>
        {currentWords}/{wordGoal} words{done ? " ✓" : ""}
      </span>
    </div>
  );
}
