"use client";

import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";
import { apiFetch } from "@/lib/api-client";
import { playFeedback } from "@/lib/sound-feedback";
import { PredictClient as SharedPredictClient } from "@buildment/learning-ui/blocks/exercises/PredictClient";

type Props = ComponentProps<typeof SharedPredictClient>;
type RespondResult = { isCorrect: boolean | null; score: number | null; maxScore: number | null; explanation?: string };

export function PredictClient(props: Props) {
  const router = useRouter();
  return (
    <SharedPredictClient
      {...props}
      onRespond={(payload) => apiFetch<RespondResult>(`/api/v1/blocks/${props.id}/respond`, { method: "POST", json: payload })}
      onComplete={() => router.refresh()}
      onFeedback={playFeedback}
    />
  );
}
