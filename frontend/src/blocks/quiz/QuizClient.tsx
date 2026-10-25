"use client";

import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";
import { apiFetch } from "@/lib/api-client";
import { playFeedback } from "@/lib/sound-feedback";
import { QuizClient as SharedQuizClient } from "@buildment/learning-ui/blocks/exercises/QuizClient";

type Props = ComponentProps<typeof SharedQuizClient>;
type RespondResult = { isCorrect: boolean | null; score: number | null; maxScore: number | null; explanation?: string };

export function QuizClient(props: Props) {
  const router = useRouter();
  return (
    <SharedQuizClient
      {...props}
      onRespond={(payload) => apiFetch<RespondResult>(`/api/v1/blocks/${props.id}/respond`, { method: "POST", json: payload })}
      onComplete={() => router.refresh()}
      onFeedback={playFeedback}
    />
  );
}
