"use client";

import { createContext, useContext, type ReactNode } from "react";

const QuizEnabledContext = createContext(false);
export const useQuizEnabled = () => useContext(QuizEnabledContext);

const ChapterBlockConfigsContext = createContext<Record<string, unknown>>({});

export function ChapterBlockConfigsProvider({
  configs,
  quizEnabled = false,
  children,
}: {
  quizEnabled?: boolean;
  configs: Record<string, unknown>;
  children: ReactNode;
}) {
  return (
    <QuizEnabledContext.Provider value={quizEnabled}>
    <ChapterBlockConfigsContext.Provider value={configs}>
      {children}
    </ChapterBlockConfigsContext.Provider>
    </QuizEnabledContext.Provider>
  );
}

export function useChapterBlockConfig(blockId: string | undefined): unknown {
  const configs = useContext(ChapterBlockConfigsContext);
  if (!blockId) return undefined;
  return configs[blockId];
}
