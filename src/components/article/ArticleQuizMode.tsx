"use client";

import { useState, useCallback } from "react";

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
        className="h-6 px-2 text-[11px] border border-border rounded text-foreground hover:bg-surface-hover hover:text-accent transition-colors disabled:opacity-50"
      >
        {loading ? "Generating…" : open ? "Close quiz" : "Quiz me"}
      </button>

      {error && (
        <span className="text-[11px] text-red-500 ml-1">{error}</span>
      )}

      {open && !finished && q && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-surface border border-border rounded-lg shadow-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] text-muted font-medium uppercase tracking-wide">
                {articleTitle} — Question {current + 1} / {questions.length}
              </span>
              <button
                onClick={handleClose}
                className="text-muted hover:text-foreground text-sm"
                title="Close quiz"
              >
                ✕
              </button>
            </div>

            <p className="text-[15px] font-semibold text-heading mb-4 leading-snug">{q.q}</p>

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
                  cls += "border-green-500 bg-green-50 text-green-800";
                } else if (selected === i) {
                  cls += "border-red-400 bg-red-50 text-red-700";
                } else {
                  cls += "border-border bg-surface text-muted";
                }
                return (
                  <button key={i} className={cls} onClick={() => handleSelect(i)}>
                    <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>
                    {opt}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[12px] text-muted">
                Score: {score} / {questions.length}
              </span>
              {!revealed ? (
                <button
                  onClick={handleCheck}
                  disabled={selected === null}
                  className="h-6 px-3 text-[11px] border border-border rounded bg-accent text-white hover:bg-accent-hover disabled:opacity-40"
                >
                  Check answer
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="h-6 px-3 text-[11px] border border-border rounded bg-accent text-white hover:bg-accent-hover"
                >
                  {current + 1 >= questions.length ? "See results" : "Next question"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {open && finished && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-surface border border-border rounded-lg shadow-xl w-full max-w-sm p-6 text-center">
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
            <div className="flex gap-2 justify-center">
              <button
                onClick={startQuiz}
                className="h-6 px-3 text-[11px] border border-border rounded bg-accent text-white hover:bg-accent-hover"
              >
                Retry
              </button>
              <button
                onClick={handleClose}
                className="h-6 px-3 text-[11px] border border-border rounded hover:bg-surface-hover"
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
