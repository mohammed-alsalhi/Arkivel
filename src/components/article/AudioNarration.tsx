"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type Props = { html: string; title: string };

export default function AudioNarration({ html, title }: Props) {
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [supported, setSupported] = useState(false);
  const [progress, setProgress] = useState(0); // 0–100
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const chunksRef = useRef<string[]>([]);
  const chunkIndexRef = useRef(0);
  const totalChunksRef = useRef(0);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
  }, []);

  // Extract plain text from HTML
  function extractText(htmlStr: string): string {
    const div = document.createElement("div");
    div.innerHTML = htmlStr;
    // Remove footnote section, code blocks, etc.
    div.querySelectorAll("pre, .footnote-section, sup").forEach((el) => el.remove());
    return div.textContent?.trim() ?? "";
  }

  // Split text into sentence-based chunks (~200 chars max) for progress tracking
  function chunkText(text: string): string[] {
    const sentences = text.match(/[^.!?]+[.!?]+[\s]*/g) ?? [text];
    const chunks: string[] = [];
    let current = "";
    for (const s of sentences) {
      if ((current + s).length > 250 && current.length > 0) {
        chunks.push(current.trim());
        current = s;
      } else {
        current += s;
      }
    }
    if (current.trim()) chunks.push(current.trim());
    return chunks;
  }

  const speakChunk = useCallback((chunks: string[], index: number) => {
    if (index >= chunks.length) {
      setPlaying(false);
      setPaused(false);
      setProgress(100);
      chunkIndexRef.current = 0;
      return;
    }

    const utterance = new SpeechSynthesisUtterance(chunks[index]);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.lang = "en-US";

    utterance.onend = () => {
      const next = index + 1;
      chunkIndexRef.current = next;
      setProgress(Math.round((next / totalChunksRef.current) * 100));
      speakChunk(chunks, next);
    };

    utterance.onerror = () => {
      setPlaying(false);
      setPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  function play() {
    if (paused) {
      window.speechSynthesis.resume();
      setPlaying(true);
      setPaused(false);
      return;
    }

    window.speechSynthesis.cancel();
    const raw = extractText(html);
    const full = title ? `${title}. ${raw}` : raw;
    const chunks = chunkText(full);
    chunksRef.current = chunks;
    totalChunksRef.current = chunks.length;
    chunkIndexRef.current = 0;
    setProgress(0);
    setPlaying(true);
    setPaused(false);
    speakChunk(chunks, 0);
  }

  function pause() {
    window.speechSynthesis.pause();
    setPlaying(false);
    setPaused(true);
  }

  function stop() {
    window.speechSynthesis.cancel();
    setPlaying(false);
    setPaused(false);
    setProgress(0);
    chunkIndexRef.current = 0;
  }

  // Clean up on unmount
  useEffect(() => {
    return () => { window.speechSynthesis?.cancel(); };
  }, []);

  if (!supported) return null;

  return (
    <div className="flex items-center gap-2">
      {!playing && !paused ? (
        <button
          onClick={play}
          className="h-6 px-2 text-[11px] border border-border rounded text-muted hover:text-foreground hover:bg-surface-hover transition-colors flex items-center gap-1"
          title="Listen to this article"
        >
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5.14v14l11-7-11-7z" />
          </svg>
          Listen
        </button>
      ) : (
        <div className="flex items-center gap-1.5">
          <button
            onClick={playing ? pause : play}
            className="h-6 px-2 text-[11px] border border-accent rounded text-accent hover:bg-accent/10 transition-colors flex items-center gap-1"
            title={playing ? "Pause" : "Resume"}
          >
            {playing ? (
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5.14v14l11-7-11-7z" />
              </svg>
            )}
            {playing ? "Pause" : "Resume"}
          </button>
          <button
            onClick={stop}
            className="h-6 px-2 text-[11px] border border-border rounded text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
            title="Stop narration"
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <rect x="4" y="4" width="16" height="16" rx="1" />
            </svg>
          </button>
          <div className="flex items-center gap-1">
            <div className="w-16 h-1 bg-surface-hover rounded-full overflow-hidden border border-border">
              <div
                className="h-full bg-accent transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[9px] text-muted tabular-nums">{progress}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
