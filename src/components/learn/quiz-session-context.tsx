"use client";

import { createContext, useContext } from "react";

export type QuizBlockGrade = {
  selected: string[];
  isCorrect: boolean | null;
  explanation?: string;
};

export type QuizSessionContextValue = {
  chapterTitle: string;
  questionTotal: number;
  reviewMode: boolean;
  dirtyBlockIds: ReadonlySet<string>;
  blockGrades: Record<string, QuizBlockGrade>;
};

export const QuizSessionContext = createContext<QuizSessionContextValue | null>(null);

export function useQuizSession() {
  return useContext(QuizSessionContext);
}
