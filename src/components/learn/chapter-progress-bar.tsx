"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type ProgressBarProps = {
  progress: number; // 0-100
};

export function ChapterProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="fixed left-0 top-14 z-40 h-1 w-full bg-neutral-100">
      <div
        className="h-full bg-indigo-600 transition-all duration-700 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  );
}

export function useReadingProgress() {
  const [progress, setProgress] = useState(0);
  const articleRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const article = document.querySelector("article.prose") as HTMLElement | null;
    if (!article) return;

    const updateProgress = () => {
      const rect = article.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const articleTop = rect.top;
      const articleBottom = rect.bottom;
      const articleHeight = article.offsetHeight;

      if (articleHeight === 0) return;

      const scrolled = -articleTop;
      const totalScrollable = articleHeight - windowHeight + 200;
      const percent = totalScrollable > 0 ? Math.min(100, Math.max(0, (scrolled / totalScrollable) * 100)) : 0;
      setProgress(percent);
    };

    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();

    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  return { progress };
}
