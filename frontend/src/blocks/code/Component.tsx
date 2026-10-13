import { fetchBlockState } from "@/blocks/block-state";
import { sanitizeBlockConfig } from "@/mdx/sanitize";
import type { SanitizedCodeConfig } from "@buildment/shared/blocks/code/schema";
import { CodeExerciseClient } from "./CodeExerciseClient";
import { PendingBlockCard } from "@/components/learn/pending-block-card";

export async function CodeExerciseComponent({
  id,
  prompt,
  language = "typescript",
  mode = "exercise",
  filename,
  starterCode = "",
  solution,
  hints,
  tests,
  allowRetry = true,
}: {
  id?: string;
  prompt?: string;
  language?: string;
  mode?: "exercise" | "playground";
  filename?: string;
  starterCode?: string;
  solution?: string;
  hints?: string[];
  tests?: Array<{
    id: string;
    description: string;
    hidden?: boolean;
    setupCode?: string;
    testCode?: string;
  }>;
  allowRetry?: boolean;
}) {
  // Direct prop authoring fallback
  if (prompt || starterCode) {
    const rawConfig = {
      prompt: prompt || "Complete the code exercise below:",
      language,
      mode,
      filename,
      starterCode,
      solution,
      hints,
      tests,
      allowRetry,
    };
    const sanitized = sanitizeBlockConfig<typeof rawConfig, SanitizedCodeConfig>(rawConfig);

    return (
      <CodeExerciseClient
        id={id || "preview-code-exercise"}
        config={sanitized}
        initialState={null}
      />
    );
  }

  if (id) {
    const state = await fetchBlockState(id, "CODE");
    if (state) return <CodeExerciseClient id={id} config={state.config} initialState={state.initialState} />;
  }

  // Graceful pending state
  if (id || prompt) {
    return (
      <PendingBlockCard
        typeLabel="Code Exercise"
        title={prompt || "Code exercise in progress"}
        description="Starter code, tests, and hints are being prepared for this checkpoint."
        blockId={id}
      />
    );
  }

  return null;
}
