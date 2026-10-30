"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { useChapterAsk, type ChapterAsk } from "@/lib/use-chapter-ask";

type AskChapterValue = {
  ask: ChapterAsk;
  windowOpen: boolean;
  /** Opens the floating window. The element that asked gets focus back when the window closes. */
  openWindow: (opener?: HTMLElement | null) => void;
  closeWindow: () => void;
  /** Closes the window and hands the learner to the mentor dialog. */
  askMentor: () => void;
  /** Element to focus after the window closes, or null when focus should stay where the next step put it. */
  takeOpener: () => HTMLElement | null;
};

const AskChapterContext = createContext<AskChapterValue | null>(null);

/**
 * Holds the one quick-answers state for a chapter and whether its floating window is open. Draft, answers
 * and history live here, so closing and reopening the window (or using the inline card) loses nothing.
 */
export function AskChapterProvider({
  chapterId,
  headings,
  enabled,
  onAskMentor,
  children,
}: {
  chapterId: string;
  headings: { text: string }[];
  /** False on quiz chapters: no question is fetched and nothing shows. */
  enabled: boolean;
  onAskMentor: () => void;
  children: ReactNode;
}) {
  const ask = useChapterAsk(chapterId, headings, enabled);
  const [windowOpen, setWindowOpen] = useState(false);
  const opener = useRef<HTMLElement | null>(null);

  const openWindow = useCallback((element?: HTMLElement | null) => {
    opener.current = element ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    setWindowOpen(true);
  }, []);
  const closeWindow = useCallback(() => setWindowOpen(false), []);
  const askMentor = useCallback(() => {
    opener.current = null;
    setWindowOpen(false);
    onAskMentor();
  }, [onAskMentor]);
  const takeOpener = useCallback(() => {
    const element = opener.current;
    opener.current = null;
    return element;
  }, []);

  const value = useMemo(
    () => ({ ask, windowOpen, openWindow, closeWindow, askMentor, takeOpener }),
    [ask, windowOpen, openWindow, closeWindow, askMentor, takeOpener]
  );
  return <AskChapterContext.Provider value={value}>{children}</AskChapterContext.Provider>;
}

export function useAskChapter(): AskChapterValue {
  const value = useContext(AskChapterContext);
  if (!value) throw new Error("useAskChapter needs an AskChapterProvider above it.");
  return value;
}
