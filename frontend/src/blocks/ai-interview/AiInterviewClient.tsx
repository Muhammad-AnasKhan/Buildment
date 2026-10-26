"use client";

import { useRouter } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api-client";
import { playFeedback } from "@/lib/sound-feedback";
import { AiInterviewClient as SharedAiInterviewClient } from "@buildment/learning-ui/blocks/ai-interview/AiInterviewClient";
import type { AiInterviewInitialState, AiInterviewSessionResult } from "@/shared/api/ai";
import type { SanitizedAiInterviewConfig } from "@/shared/blocks/ai-interview/schema";

export function AiInterviewClient({ id, config, initialState }: {
  id: string;
  config: SanitizedAiInterviewConfig;
  initialState: AiInterviewInitialState;
}) {
  const router = useRouter();
  return (
    <SharedAiInterviewClient
      config={config}
      initialState={initialState}
      request={async (action, json) => {
        try {
          return (await apiFetch<AiInterviewSessionResult>(`/api/v1/blocks/${encodeURIComponent(id)}/ai-interview/${action}`, { method: "POST", json })).session;
        } catch (error) {
          if (error instanceof ApiError) throw Object.assign(new Error(error.message), { code: error.code });
          throw error;
        }
      }}
      onComplete={() => router.refresh()}
      onFeedback={playFeedback}
    />
  );
}
