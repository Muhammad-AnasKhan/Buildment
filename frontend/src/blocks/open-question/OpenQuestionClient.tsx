"use client";

import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";
import { apiFetch } from "@/lib/api-client";
import { playFeedback } from "@/lib/sound-feedback";
import { OpenQuestionClient as SharedOpenQuestionClient } from "@buildment/learning-ui/blocks/exercises/OpenQuestionClient";

type Props = ComponentProps<typeof SharedOpenQuestionClient>;

export function OpenQuestionClient(props: Props) {
  const router = useRouter();
  return (
    <SharedOpenQuestionClient
      {...props}
      onRespond={(payload) => apiFetch(`/api/v1/blocks/${props.id}/respond`, { method: "POST", json: payload })}
      onComplete={() => router.refresh()}
      onFeedback={playFeedback}
    />
  );
}
