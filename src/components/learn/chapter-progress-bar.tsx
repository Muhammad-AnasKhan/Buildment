"use client";

import { useEffect, useState, type RefObject } from "react";

type ProgressBarProps = {
  progress: number; // 0-100
};

export function ChapterProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="h-px w-full shrink-0 bg-neutral-100" aria-hidden>
      <div
        className="h-px bg-indigo-500/50 transition-[width] duration-500 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  );
}

export function useReadingProgress(scrollRef: RefObject<HTMLElement | null>) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const scrollEl = scrollRef.current;
    const article = scrollEl?.querySelector("article.prose") as HTMLElement | null;
    if (!scrollEl || !article) return;

    const updateProgress = () => {
      const scrollTop = scrollEl.scrollTop;
      const scrollHeight = scrollEl.scrollHeight - scrollEl.clientHeight;
      const percent = scrollHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100)) : 0;
      setProgress(percent);
    };

    scrollEl.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();

    return () => scrollEl.removeEventListener("scroll", updateProgress);
  }, [scrollRef]);

  return { progress };
}
