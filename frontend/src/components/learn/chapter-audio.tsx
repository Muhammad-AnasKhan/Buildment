"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Pause, Play } from "lucide-react";
import { formatClock, formatListenMinutes, formatMegabytes, formatSpeed, nextSpeed, resumePosition } from "@/lib/narration-format";
import { cn } from "@/lib/utils";

type Status = "idle" | "loading" | "playing" | "paused" | "error";

function readSaved(key: string): number {
  try {
    return Number(window.localStorage.getItem(key)) || 0;
  } catch {
    return 0;
  }
}

function writeSaved(key: string, seconds: number) {
  try {
    window.localStorage.setItem(key, String(Math.floor(seconds)));
  } catch {
    // Remembering where you stopped is a convenience; the player works without it.
  }
}

/**
 * Listen-along audio for a chapter. Nothing is downloaded until the learner presses play,
 * so reading on a slow or metered connection costs nothing extra.
 */
export function ChapterAudio({ src, minutes, bytes, title }: { src: string; minutes: number; bytes: number; title: string }) {
  const audio = useRef<HTMLAudioElement>(null);
  const lastSaved = useRef(0);
  const [status, setStatus] = useState<Status>("idle");
  const [speed, setSpeed] = useState(1);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const storageKey = `buildment:narration:${src}`;

  useEffect(() => {
    const element = audio.current;
    if (element) element.playbackRate = speed;
  }, [speed]);

  function toggle() {
    const element = audio.current;
    if (!element) return;
    if (status === "playing" || status === "loading") {
      element.pause();
      return;
    }
    setStatus("loading");
    element.playbackRate = speed;
    void element.play().catch(() => setStatus("error"));
  }

  function seek(value: number) {
    const element = audio.current;
    if (!element || !duration) return;
    element.currentTime = value;
    setTime(value);
  }

  const label = status === "playing" ? "Pause" : status === "loading" ? "Loading" : "Play";

  return (
    <section aria-label="Listen to this chapter" className="mt-6 rounded-lg border border-border bg-card px-4 py-3 text-card-foreground">
      <audio
        ref={audio}
        src={src}
        preload="none"
        onLoadedMetadata={(event) => {
          const element = event.currentTarget;
          setDuration(element.duration);
          const start = resumePosition(readSaved(storageKey), element.duration);
          if (start > 0) {
            element.currentTime = start;
            setTime(start);
          }
        }}
        onPlaying={() => setStatus("playing")}
        onPause={() => setStatus("paused")}
        onWaiting={() => setStatus("loading")}
        onError={() => setStatus("error")}
        onEnded={() => {
          setStatus("paused");
          writeSaved(storageKey, 0);
        }}
        onTimeUpdate={(event) => {
          const now = event.currentTarget.currentTime;
          setTime(now);
          if (Math.abs(now - lastSaved.current) >= 5) {
            lastSaved.current = now;
            writeSaved(storageKey, now);
          }
        }}
      />
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          aria-label={`${label}: ${title}`}
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {status === "playing" ? <Pause className="size-4" aria-hidden /> : <Play className="size-4 translate-x-px" aria-hidden />}
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">
            Listen to this chapter <span className="font-normal text-muted-foreground">· {formatListenMinutes(minutes)}</span>
          </p>
          <p className="text-xs text-muted-foreground" aria-live="polite">
            {status === "error"
              ? "The audio did not load. Check your connection and press play to try again."
              : status === "loading"
                ? "Loading the audio…"
                : duration > 0
                  ? `${formatClock(time)} / ${formatClock(duration)}`
                  : `Plays when you press play · ${formatMegabytes(bytes)}`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSpeed(nextSpeed(speed))}
          aria-label={`Speed ${formatSpeed(speed)}. Press to change.`}
          className="shrink-0 rounded-md border border-border px-2.5 py-1 font-mono text-xs tabular-nums text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {formatSpeed(speed)}
        </button>
        <a
          href={src}
          download
          aria-label={`Download the audio (${formatMegabytes(bytes)})`}
          className="shrink-0 rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <Download className="size-4" aria-hidden />
        </a>
      </div>
      <input
        type="range"
        min={0}
        max={duration || 1}
        step={1}
        value={Math.min(time, duration || 1)}
        disabled={!duration}
        onChange={(event) => seek(Number(event.target.value))}
        aria-label="Audio position"
        className={cn("mt-3 h-1 w-full cursor-pointer accent-primary", !duration && "opacity-40")}
      />
    </section>
  );
}
