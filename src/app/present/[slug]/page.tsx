"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type Slide = { title: string; content: string };

export default function PresentModePage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [articleTitle, setArticleTitle] = useState("");
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showOverview, setShowOverview] = useState(false);
  const [animDir, setAnimDir] = useState<"in" | "out">("in");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/articles?slug=${encodeURIComponent(slug)}`);
        const data = await res.json();
        const articles = Array.isArray(data) ? data : (data.articles || []);
        const article = articles.find((a: { slug: string }) => a.slug === slug);
        if (!article) { setLoading(false); return; }

        const detail = await fetch(`/api/articles/${article.id}/present`);
        if (detail.ok) {
          const { slides: s, title } = await detail.json();
          setSlides(s);
          setArticleTitle(title);
        }
        setLoading(false);
      } catch {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  const goTo = useCallback((i: number) => {
    const next = Math.max(0, Math.min(slides.length - 1, i));
    setAnimDir(next > current ? "in" : "out");
    setCurrent(next);
    setShowOverview(false);
  }, [current, slides.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault(); goTo(current + 1);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault(); goTo(current - 1);
      } else if (e.key === "Escape") {
        router.push(`/articles/${slug}`);
      } else if (e.key === "g" || e.key === "G") {
        setShowOverview((v) => !v);
      } else if (e.key === "f" || e.key === "F") {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
        else document.exitFullscreen().catch(() => {});
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [current, goTo, router, slug]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#0d0d14] flex items-center justify-center">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0ms]" />
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="fixed inset-0 bg-[#0d0d14] flex flex-col items-center justify-center text-white gap-4">
        <p className="text-[16px] text-gray-300">No slides could be generated from this article.</p>
        <Link href={`/articles/${slug}`} className="text-blue-400 hover:underline text-[14px]">
          ← Back to article
        </Link>
      </div>
    );
  }

  const slide = slides[current];
  const progress = ((current + 1) / slides.length) * 100;
  const isFirst = current === 0;
  const isLast = current === slides.length - 1;

  // Overview mode
  if (showOverview) {
    return (
      <div className="fixed inset-0 bg-[#0d0d14] overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-[20px] font-bold text-white">{articleTitle}</h2>
              <p className="text-[13px] text-gray-500 mt-0.5">{slides.length} slides</p>
            </div>
            <button
              onClick={() => setShowOverview(false)}
              className="text-[13px] text-gray-400 hover:text-white border border-gray-700 px-3 py-1 rounded transition-colors"
            >
              Back to presentation
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {slides.map((s, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`group text-left p-4 rounded border transition-all ${
                  i === current
                    ? "border-blue-500 bg-blue-950/50 ring-1 ring-blue-500"
                    : "border-gray-700/50 bg-gray-900/60 hover:border-gray-500 hover:bg-gray-900"
                }`}
              >
                <span className="text-[10px] font-mono text-gray-600 mb-2 block">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-[13px] font-semibold text-gray-100 leading-snug line-clamp-2 mb-1.5">
                  {s.title}
                </p>
                {s.content && (
                  <p
                    className="text-[11px] text-gray-500 line-clamp-2"
                    dangerouslySetInnerHTML={{
                      __html: s.content.replace(/<[^>]+>/g, " ").slice(0, 100),
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#0d0d14] text-white flex flex-col select-none overflow-hidden">
      {/* Progress bar */}
      <div className="h-[2px] bg-gray-800 shrink-0">
        <div
          className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-3 shrink-0">
        <Link
          href={`/articles/${slug}`}
          className="text-[12px] text-gray-600 hover:text-gray-300 transition-colors flex items-center gap-1.5"
        >
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Exit
        </Link>
        <span className="text-[11px] font-mono text-gray-600">
          {String(current + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </span>
        <button
          onClick={() => setShowOverview(true)}
          className="text-[12px] text-gray-600 hover:text-gray-300 transition-colors"
        >
          Overview (G)
        </button>
      </div>

      {/* Slide — centred, large */}
      <div
        key={`${current}-${animDir}`}
        className="flex-1 flex flex-col justify-center px-[8%] max-w-[1200px] mx-auto w-full"
        style={{ animation: "presentSlideIn 0.3s ease both" }}
      >
        {/* Slide number accent */}
        <div className="text-[11px] font-mono text-blue-600/60 mb-4st uppercase">
          {isFirst ? articleTitle : `${articleTitle}  ›  slide ${current + 1}`}
        </div>

        {/* Title */}
        <h1
          className="font-bold text-white mb-8 leading-tight"
          style={{
            fontSize: slide.title.length > 60 ? "2.2rem" : slide.title.length > 40 ? "2.8rem" : "3.5rem",
            fontFamily: "'Georgia', 'Times New Roman', serif",
            letterSpacing: "-0.01em",
          }}
        >
          {slide.title}
        </h1>

        {/* Body */}
        {slide.content && (
          <div
            className="text-[1.15rem] text-gray-300 leading-relaxed max-w-[72ch] space-y-3 presentation-content"
            dangerouslySetInnerHTML={{ __html: slide.content }}
          />
        )}
      </div>

      {/* Bottom bar */}
      <div className="shrink-0 flex items-center justify-between px-8 py-5 border-t border-gray-800/50">
        {/* Dot nav */}
        <div className="flex items-center gap-1.5 flex-1">
          {slides.slice(0, 30).map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-200 ${
                i === current
                  ? "w-5 h-1.5 bg-blue-500"
                  : i < current
                  ? "w-1.5 h-1.5 bg-gray-600"
                  : "w-1.5 h-1.5 bg-gray-800 hover:bg-gray-600"
              }`}
              title={slides[i].title}
            />
          ))}
          {slides.length > 30 && (
            <span className="text-[10px] text-gray-700 ml-1">+{slides.length - 30}</span>
          )}
        </div>

        {/* Arrow buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => goTo(current - 1)}
            disabled={isFirst}
            className="group flex items-center gap-1.5 px-4 py-1.5 rounded-lg border border-gray-700/60 text-[12px] text-gray-400 hover:text-white hover:border-gray-500 disabled:opacity-20 transition-all"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Prev
          </button>
          <button
            onClick={() => goTo(current + 1)}
            disabled={isLast}
            className="group flex items-center gap-1.5 px-4 py-1.5 rounded-lg border border-gray-700/60 text-[12px] text-gray-400 hover:text-white hover:border-gray-500 disabled:opacity-20 transition-all"
          >
            Next
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Keyboard hint on first slide */}
      {isFirst && (
        <div className="absolute bottom-[72px] left-1/2 -translate-x-1/2 text-[11px] text-gray-700 pointer-events-none whitespace-nowrap">
          ← → Space to navigate · Esc exit · G overview · F fullscreen
        </div>
      )}

      <style>{`
        @keyframes presentSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .presentation-content p { margin-bottom: 0.5rem; }
        .presentation-content ul, .presentation-content ol {
          padding-left: 1.25rem;
          list-style: disc;
          space-y: 0.25rem;
        }
        .presentation-content li { margin-bottom: 0.35rem; }
        .presentation-content strong { color: white; }
        .presentation-content h3, .presentation-content h4 {
          color: #93c5fd;
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 0.25rem;
        }
        .presentation-content code {
          background: rgba(255,255,255,0.08);
          padding: 0.1em 0.35em;
          border-radius: 3px;
          font-size: 0.9em;
        }
        .presentation-content a { color: #93c5fd; text-decoration: underline; }
        .presentation-content blockquote {
          border-left: 3px solid #3b82f6;
          padding-left: 1rem;
          color: #9ca3af;
          font-style: italic;
        }
      `}</style>
    </div>
  );
}
