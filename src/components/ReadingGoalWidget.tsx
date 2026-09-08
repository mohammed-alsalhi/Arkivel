"use client";

import { useEffect, useState } from "react";

type GoalData = { goal: number; thisWeek: number; streak: number };

export default function ReadingGoalWidget() {
  const [data, setData] = useState<GoalData | null>(null);
  const [editing, setEditing] = useState(false);
  const [newGoal, setNewGoal] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/reading-goals")
      .then((r) => r.json())
      .then((d) => { if (d.goal !== undefined) setData(d); })
      .catch(() => {});
  }, []);

  async function saveGoal() {
    const goal = parseInt(newGoal, 10);
    if (isNaN(goal) || goal < 1) return;
    setSaving(true);
    await fetch("/api/reading-goals", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goal }),
    });
    setData((prev) => ({ ...(prev ?? { thisWeek: 0, streak: 0 }), goal }));
    setEditing(false);
    setSaving(false);
    setNewGoal("");
  }

  if (!data) return null;

  const { goal, thisWeek, streak } = data;
  const pct = goal > 0 ? Math.min(1, thisWeek / goal) : 0;
  const r = 22;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;

  return (
    <div className="space-y-2">
      {goal === 0 || editing ? (
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            placeholder="Articles / week"
            className="h-7 w-28 px-2 text-sm border border-border rounded bg-background"
          />
          <button
            onClick={saveGoal}
            disabled={saving}
            className="h-7 px-2 text-xs border border-border rounded hover:bg-muted disabled:opacity-50"
          >
            {saving ? "Saving…" : "Set goal"}
          </button>
          {editing && (
            <button onClick={() => setEditing(false)} className="text-xs text-muted-foreground hover:underline">
              Cancel
            </button>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <svg width="54" height="54" viewBox="0 0 54 54">
            <circle cx="27" cy="27" r={r} fill="none" stroke="currentColor" strokeWidth="4" className="text-border" />
            <circle
              cx="27" cy="27" r={r}
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray={`${dash} ${circ}`}
              strokeLinecap="round"
              transform="rotate(-90 27 27)"
              className="text-blue-500 transition-all duration-500"
            />
            <text x="27" y="31" textAnchor="middle" className="text-[10px] fill-current font-medium" fontSize="10">
              {thisWeek}/{goal}
            </text>
          </svg>
          <div className="space-y-0.5">
            <p className="text-sm font-medium">{thisWeek} / {goal} articles this week</p>
            {streak > 1 && (
              <p className="text-xs text-muted-foreground">{streak}-week streak</p>
            )}
            <button onClick={() => { setEditing(true); setNewGoal(String(goal)); }} className="text-xs text-muted-foreground hover:underline">
              Change goal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
