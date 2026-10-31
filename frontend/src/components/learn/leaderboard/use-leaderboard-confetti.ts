"use client";

import { useEffect, useRef } from "react";
import { fireMiniConfetti } from "@buildment/learning-ui/components/learn/mini-confetti";
import { playFeedback } from "@/lib/sound-feedback";
import type { LeaderboardHubView } from "@/shared/api/gamification";

/**
 * Celebrates the learner exactly once per board: when they reach a podium (top three) on a ready
 * board, or when last week's reset promoted them. The returned ref anchors the confetti burst —
 * attach it to the podium section so the particles rain over the winners.
 */
export function useLeaderboardConfetti(view: LeaderboardHubView | null) {
  const anchorRef = useRef<HTMLElement | null>(null);
  const celebratedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!view || view.status !== "ready") return;
    const key = `${view.category}|${view.scope}|${view.courseId ?? "global"}`;
    const onPodium = view.you.rank >= 1 && view.you.rank <= 3 && view.you.score > 0;
    const promoted = view.league?.lastWeek?.outcome === "PROMOTED";
    if ((!onPodium && !promoted) || celebratedKeyRef.current === key) return;
    celebratedKeyRef.current = key;
    const timer = window.setTimeout(() => {
      if (anchorRef.current) fireMiniConfetti(anchorRef.current);
      if (onPodium) playFeedback("celebration");
    }, 700);
    return () => window.clearTimeout(timer);
  }, [view]);

  return anchorRef;
}
