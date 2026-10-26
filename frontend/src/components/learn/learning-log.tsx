"use client";

import { createContext, useCallback, useContext } from "react";
import {
  LearningLog as SharedLearningLog,
  type LearningLogQuestionData,
} from "@buildment/learning-ui/components/learn/learning-log";
import { saveLearningLogAnswers } from "@/server/actions/learning-log";
import { trackEngagement } from "@/lib/engagement/client";

type Answers = Record<string, string>;
const LearningLogContext = createContext<{ chapterId: string; initialAnswers: Answers } | null>(null);

export function LearningLogProvider({
  chapterId,
  initialAnswers,
  children,
}: {
  chapterId: string;
  initialAnswers: Answers;
  children: React.ReactNode;
}) {
  return (
    <LearningLogContext.Provider value={{ chapterId, initialAnswers }}>
      {children}
    </LearningLogContext.Provider>
  );
}

export function LearningLog(props: {
  title?: string;
  instruction?: string;
  questions: LearningLogQuestionData[] | string;
  variant?: "default" | "gate";
}) {
  const context = useContext(LearningLogContext);
  const chapterId = context?.chapterId;
  const onSave = useCallback(async (answers: Answers) => {
    if (!chapterId) return { ok: false };
    const result = await saveLearningLogAnswers({ chapterId, answers });
    if (!result.ok) return { ok: false };
    trackEngagement({ type: "notes_saved", chapterId });
    return result;
  }, [chapterId]);
  return (
    <SharedLearningLog
      {...props}
      initialAnswers={context?.initialAnswers}
      onSave={context ? onSave : undefined}
    />
  );
}
