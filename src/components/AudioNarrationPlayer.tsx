"use client";

import { useState, useRef, useEffect } from "react";

interface Props {
  articleId: string;
  articleText: string; // plain text for browser TTS fallback
}

export default function AudioNarrationPlayer({ articleId, articleText }: Props) {
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [useBrowserTts, setUseBrowserTts] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      window.speechSynthesis?.cancel();
    };
  }, []);

  async function toggle() {
    if (playing) {
      audioRef.current?.pause();
      window.speechSynthesis?.pause();
      setPlaying(false);
      return;
    }

    if (useBrowserTts || !window.AudioContext) {
      startBrowserTts();
      return;
    }

    // Try server-side TTS first
    if (!audioRef.current) {
      setLoading(true);
      try {
        const res = await fetch(`/api/articles/${articleId}/narrate`);
        if (res.ok) {
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          audio.playbackRate = speed;
          audio.onended = () => setPlaying(false);
          audioRef.current = audio;
        } else {
          setUseBrowserTts(true);
          setLoading(false);
          startBrowserTts();
          return;
        }
      } catch {
        setUseBrowserTts(true);
        setLoading(false);
        startBrowserTts();
        return;
      } finally {
        setLoading(false);
      }
    }

    audioRef.current!.playbackRate = speed;
    audioRef.current!.play();
    setPlaying(true);
  }

  function startBrowserTts() {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(articleText.slice(0, 3000));
    utterance.rate = speed;
    utterance.onend = () => setPlaying(false);
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setPlaying(true);
  }

  function stop() {
    audioRef.current?.pause();
    if (audioRef.current) { audioRef.current.currentTime = 0; }
    window.speechSynthesis?.cancel();
    setPlaying(false);
  }

  function changeSpeed(s: number) {
    setSpeed(s);
    if (audioRef.current) audioRef.current.playbackRate = s;
    if (utteranceRef.current) utteranceRef.current.rate = s;
  }

  if (typeof window !== "undefined" && !window.speechSynthesis && !process.env.NEXT_PUBLIC_ELEVENLABS_ENABLED) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 my-2 text-xs text-muted">
      <button
        onClick={toggle}
        disabled={loading}
        className="px-2 py-0.5 border border-border rounded hover:bg-surface-hover disabled:opacity-50"
        aria-label={playing ? "Pause narration" : "Play narration"}
      >
        {loading ? "Loading…" : playing ? "⏸ Pause" : "▶ Listen"}
      </button>
      {playing && (
        <button onClick={stop} className="px-2 py-0.5 border border-border rounded hover:bg-surface-hover" aria-label="Stop narration">
          ⏹
        </button>
      )}
      <select
        value={speed}
        onChange={(e) => changeSpeed(Number(e.target.value))}
        className="border border-border rounded px-1 bg-surface text-xs"
        aria-label="Playback speed"
      >
        {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
          <option key={s} value={s}>{s}×</option>
        ))}
      </select>
    </div>
  );
}
