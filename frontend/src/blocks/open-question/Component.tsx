import { fetchBlockState } from "@/blocks/block-state";
import type { SanitizedOpenQuestionConfig } from "@/shared/blocks/open-question/schema";
import { OpenQuestionClient } from "./OpenQuestionClient";
import { PendingBlockCard } from "@/components/learn/pending-block-card";

export async function OpenQuestionComponent({
  id,
  prompt,
  minWords = 0,
  maxWords,
  allowSpeechInput = true,
  speechPrimary = false,
  submissionMode = "text",
  allowUrl = false,
  urlLabel,
  urlRequired = false,
  urlHint,
}: {
  id?: string;
  prompt?: string;
  minWords?: number;
  maxWords?: number;
  sampleAnswer?: string;
  allowSpeechInput?: boolean;
  speechPrimary?: boolean;
  submissionMode?: "text" | "url" | "url_required" | "article" | "video_demo";
  allowUrl?: boolean;
  urlLabel?: string;
  urlRequired?: boolean;
  urlHint?: string;
}) {
  // Direct prop authoring fallback
  if (prompt) {
    const clientConfig: SanitizedOpenQuestionConfig = {
      prompt,
      minWords,
      maxWords,
      allowSpeechInput,
      speechPrimary,
      submissionMode,
      allowUrl,
      urlLabel,
      urlRequired,
      urlHint,
    };

    return (
      <OpenQuestionClient
        id={id || "preview-open-question"}
        config={clientConfig}
        initialState={null}
        groupPosition="single"
        questionIndex={0}
        questionTotal={1}
      />
    );
  }

  if (id) {
    const state = await fetchBlockState(id, "OPEN_QUESTION");
    if (state) {
      return (
        <OpenQuestionClient
          id={id}
          config={state.config}
          initialState={state.initialState}
          groupPosition={state.group.position}
          questionIndex={state.group.index}
          questionTotal={state.group.total}
        />
      );
    }
  }

  // Graceful pending state
  if (id || prompt) {
    return (
      <PendingBlockCard
        typeLabel="Reflective Question"
        title={prompt || "Open question checkpoint in progress"}
        description="Prompt instructions and reflection guidelines are being prepared for this section."
        blockId={id}
      />
    );
  }

  return null;
}
