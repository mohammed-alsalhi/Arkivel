"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const WPM_OPTIONS = [150, 250, 400, 600];

function extractWords(html: string): string[] {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text.split(/\s+/).filter(Boolean);
}

export default function SpeedReader({ articleId }: { articleId: string }) {
  const [open, setOpen] = useState(false);
  const [words, setWords] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [wpm, setWpm] = useState(250);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) return;
    const el = document.getElementById("article-content");
    if (el) setWords(extractWords(el.innerHTML));
  }, [open]);

  const advance = useCallback(() => {
    setIndex((i) => {
      if (i + 1 >= words.length) {
        setPlaying(false);
        return 0;
      }
      return i + 1;
    });
  }, [words.length]);

  useEffect(() => {
    if (!playing) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }
    const delay = Math.round(60000 / wpm);
    timerRef.current = setTimeout(advance, delay);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [playing, wpm, index, advance]);

  function togglePlay() {
    if (index >= words.length) setIndex(0);
    setPlaying((p) => !p);
  }

  function reset() {
    setPlaying(false);
    setIndex(0);
  }

  const current = words[index] ?? "";
  // ORP: highlight the optimal recognition point (1/3 into word)
  const orpPos = Math.max(0, Math.floor(current.length / 3) - 1);
  const before = current.slice(0, orpPos);
  const pivot = current.slice(orpPos, orpPos + 1);
  const after = current.slice(orpPos + 1);

  const progress = words.length > 0 ? Math.round((index / words.length) * 100) : 0;

  void articleId;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center h-6 px-2 text-[11px] border border-border rounded text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
        title="Speed read this article"
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
        Speed read
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-lg w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-semibold text-heading">Speed reader</h2>
              <button
                onClick={() => { reset(); setOpen(false); }}
                className="text-muted hover:text-foreground text-[20px] leading-none"
              >
                &times;
              </button>
            </div>

            {/* Word display */}
            <div className="flex items-center justify-center h-20 bg-surface-hover rounded mb-4">
              {words.length === 0 ? (
                <p className="text-muted text-[13px] italic">No text found</p>
              ) : (
                <p className="text-[28px] font-mono tracking-wide select-none">
                  <span className="text-muted">{before}</span>
                  <span className="text-accent font-bold">{pivot}</span>
                  <span className="text-muted">{after}</span>
                </p>
              )}
            </div>

            {/* Progress */}
            <div className="w-full bg-border rounded h-1.5 mb-4">
              <div
                className="bg-accent h-1.5 rounded transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-center text-[11px] text-muted mb-4">
              {index + 1} / {words.length} · {progress}%
            </p>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <button onClick={reset} className="h-8 px-3 text-[12px] border border-border rounded text-muted hover:text-foreground hover:bg-surface-hover transition-colors">
                Reset
              </button>
              <button
                onClick={togglePlay}
                className="h-8 px-5 text-[13px] font-bold bg-accent text-white rounded hover:bg-accent-hover transition-colors"
              >
                {playing ? "Pause" : index > 0 ? "Resume" : "Start"}
              </button>
            </div>

            {/* WPM selector */}
            <div className="flex items-center justify-center gap-2 text-[11px] text-muted">
              <span>Speed:</span>
              {WPM_OPTIONS.map((w) => (
                <button
                  key={w}
                  onClick={() => setWpm(w)}
                  className={`px-2 py-0.5 rounded border transition-colors ${
                    wpm === w ? "border-accent text-accent" : "border-border hover:text-foreground"
                  }`}
                >
                  {w}
                </button>
              ))}
              <span>wpm</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
