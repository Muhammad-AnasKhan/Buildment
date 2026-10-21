"use client";

import { createContext, useContext, type ReactNode } from "react";

const QuizEnabledContext = createContext(false);
export const useQuizEnabled = () => useContext(QuizEnabledContext);

const ChapterBlockConfigsContext = createContext<Record<string, unknown>>({});
const CourseMediaContext = createContext<string | null>(null);

export function ChapterBlockConfigsProvider({
  configs,
  quizEnabled = false,
  courseId,
  children,
}: {
  quizEnabled?: boolean;
  courseId: string;
  configs: Record<string, unknown>;
  children: ReactNode;
}) {
  return (
    <QuizEnabledContext.Provider value={quizEnabled}>
    <CourseMediaContext.Provider value={courseId}>
    <ChapterBlockConfigsContext.Provider value={configs}>
      {children}
    </ChapterBlockConfigsContext.Provider>
    </CourseMediaContext.Provider>
    </QuizEnabledContext.Provider>
  );
}

export function useCourseMediaId(): string | null {
  return useContext(CourseMediaContext);
}

export function useChapterBlockConfig(blockId: string | undefined): unknown {
  const configs = useContext(ChapterBlockConfigsContext);
  if (!blockId) return undefined;
  return configs[blockId];
}
