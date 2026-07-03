"use client";

import { useState, useCallback, useEffect } from "react";
import { useScrollLock } from "@/lib/useScrollLock";

type Question = {
  q: string;
  options: string[];
  answer: number;
};

type Props = {
  articleId: string;
  articleTitle: string;
};

export default function ArticleQuizMode({ articleId, articleTitle }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [error, setError] = useState("");

  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const startQuiz = useCallback(async () => {
    setLoading(true);
    setError("");
    setQuestions([]);
    setCurrent(0);
    setSelected(null);
    setRevealed(false);
    setScore(0);
    setFinished(false);
    try {
      const res = await fetch(`/api/ai/quiz?articleId=${articleId}`);
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "Failed to generate quiz");
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (!data.questions?.length) {
        setError("No questions returned");
        setLoading(false);
        return;
      }
      setQuestions(data.questions);
      setOpen(true);
    } catch {
      setError("Network error");
    }
    setLoading(false);
  }, [articleId]);

  const handleSelect = (idx: number) => {
    if (revealed) return;
    setSelected(idx);
  };

  const handleCheck = () => {
    if (selected === null) return;
    setRevealed(true);
    if (selected === questions[current].answer) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = async () => {
    if (current + 1 >= questions.length) {
      setFinished(true);
      // Record attempt (fire-and-forget)
      const answers = questions.map((q, i) => ({ question: q.q, selected: i, correct: q.answer }));
      fetch("/api/quiz-attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId,
          score: score + (selected === questions[current].answer ? 1 : 0),
          totalQuestions: questions.length,
          answers,
        }),
      }).catch(() => {});
      return;
    }
    setCurrent((c) => c + 1);
    setSelected(null);
    setRevealed(false);
  };

  const handleClose = () => {
    setOpen(false);
    setQuestions([]);
    setFinished(false);
  };

  const q = questions[current];
  const finalScore = finished ? score + (selected === (q?.answer ?? -1) ? 1 : 0) : score;

  return (
    <>
      <button
        onClick={open ? handleClose : startQuiz}
        disabled={loading}
        title="Quiz mode: test your knowledge of this article"
        className="ui-button disabled:opacity-50"
      >
        {loading ? "Generating…" : open ? "Close quiz" : "Quiz me"}
      </button>

      {error && (
        <span className="text-[11px] text-danger ml-1">{error}</span>
      )}

      {open && !finished && q && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-4" onClick={handleClose}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Quiz: ${articleTitle}`}
            className="bg-surface border border-border rounded shadow-xl w-full max-w-lg p-4 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <span className="min-w-0 break-words text-[11px] text-muted font-medium uppercase">
                {articleTitle} - Question {current + 1} / {questions.length}
              </span>
              <button
                onClick={handleClose}
                className="ui-icon-button"
                title="Close quiz"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <p className="text-[15px] font-semibold text-heading mb-4 leading-snug break-words">{q.q}</p>

            <div className="flex flex-col gap-2 mb-5">
              {q.options.map((opt, i) => {
                let cls =
                  "w-full text-left px-3 py-2 text-[13px] border rounded transition-colors cursor-pointer ";
                if (!revealed) {
                  cls +=
                    selected === i
                      ? "border-accent bg-accent-soft text-accent"
                      : "border-border bg-surface hover:bg-surface-hover text-foreground";
                } else if (i === q.answer) {
                  cls += "border-success-border bg-success-soft text-success";
                } else if (selected === i) {
                  cls += "border-danger-border bg-danger-soft text-danger";
                } else {
                  cls += "border-border bg-surface text-muted";
                }
                return (
                  <button key={i} className={cls} onClick={() => handleSelect(i)}>
                    <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>
                    <span className="break-words">{opt}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[12px] text-muted">
                Score: {score} / {questions.length}
              </span>
              {!revealed ? (
                <button
                  onClick={handleCheck}
                  disabled={selected === null}
                  className="ui-button ui-button-primary disabled:opacity-40"
                >
                  Check answer
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="ui-button ui-button-primary"
                >
                  {current + 1 >= questions.length ? "See results" : "Next question"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {open && finished && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-4" onClick={handleClose}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Quiz results"
            className="bg-surface border border-border rounded shadow-xl w-full max-w-sm p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[28px] font-bold text-heading mb-1">
              {finalScore} / {questions.length}
            </p>
            <p className="text-[13px] text-muted mb-5">
              {finalScore === questions.length
                ? "Perfect score!"
                : finalScore >= questions.length * 0.8
                ? "Great job!"
                : finalScore >= questions.length * 0.6
                ? "Good effort!"
                : "Keep reading and try again!"}
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={startQuiz}
                className="ui-button ui-button-primary"
              >
                Retry
              </button>
              <button
                onClick={handleClose}
                className="ui-button"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
