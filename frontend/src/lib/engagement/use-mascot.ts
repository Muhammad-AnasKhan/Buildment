"use client";

import { useEffect, useEffectEvent, useRef } from "react";
import { usePathname } from "next/navigation";
import type { EngagementTrackInput, MascotReaction } from "@/shared/engagement/engine";
import {
  announceMessages,
  reportPendingEngagement,
  startEngagementSession,
  startStudyStretchClock,
  subscribeToMascotReactions,
  trackEngagement,
  watchChapterLingering,
} from "@/lib/engagement/client";
import { ASK_HELP_EVENT } from "@/lib/engagement/ask-help";

// The React side of the engagement client (client.ts). Components say what the mascot should
// notice and these hooks own the effects and their cleanup, so no component wires listeners,
// timers or subscriptions by hand.
//
//   const { track } = useMascot();                                  // report a moment
//   useMascot({ watchChapter: { chapterId, estimatedMinutes } });   // offer a mentor after a while
//   useMascot({ onAskHelp: () => setOpen(true) });                  // answer "Ask a mentor"

export type UseMascotOptions = {
  /**
   * Offers a mentor after a long engaged while on this chapter (see lingeringThresholdMs). Pass
   * null or leave it out when there is nothing to watch, e.g. once the chapter is complete.
   */
  watchChapter?: { chapterId: string; estimatedMinutes?: number | null } | null;
  /** Runs when the learner presses a mascot's "Ask a mentor" button. */
  onAskHelp?: () => void;
};

export type MascotControls = {
  /** Reports a learning moment after the component's own action succeeded. Never throws; do not await. */
  track: (input: EngagementTrackInput) => void;
};

const controls: MascotControls = { track: trackEngagement };

export function useMascot(options: UseMascotOptions = {}): MascotControls {
  const { watchChapter, onAskHelp } = options;
  const chapterId = watchChapter?.chapterId;
  const estimatedMinutes = watchChapter?.estimatedMinutes;

  useEffect(() => {
    if (!chapterId) return;
    return watchChapterLingering(chapterId, estimatedMinutes);
  }, [chapterId, estimatedMinutes]);

  const askHelp = useEffectEvent(() => onAskHelp?.());
  const answersAskHelp = onAskHelp !== undefined;
  useEffect(() => {
    if (!answersAskHelp) return;
    const listener = () => askHelp();
    window.addEventListener(ASK_HELP_EVENT, listener);
    return () => window.removeEventListener(ASK_HELP_EVENT, listener);
  }, [answersAskHelp]);

  return controls;
}

/**
 * For the one mascot player: delivers each reaction to `onReaction` and, while mounted, runs the
 * tab's session start, live message announcements and the study-stretch clock. It also reports a
 * moment a server redirect left behind, on mount and after each navigation (see pending-event.ts).
 */
export function useMascotReactions(onReaction: (reaction: MascotReaction, seq: number) => void): void {
  const present = useEffectEvent(onReaction);
  const seq = useRef(0);
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = subscribeToMascotReactions((reaction) => {
      seq.current += 1;
      present(reaction, seq.current);
    });
    startEngagementSession();
    const stopMessages = announceMessages();
    const stopStretchClock = startStudyStretchClock();
    return () => {
      unsubscribe();
      stopMessages();
      stopStretchClock();
    };
  }, []);

  // Declared after the subscription, so on mount a pending moment is reported once someone listens.
  useEffect(() => {
    reportPendingEngagement();
  }, [pathname]);
}
