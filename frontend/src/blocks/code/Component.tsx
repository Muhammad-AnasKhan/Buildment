import { prisma } from "@/server/db";
import { getSessionUser } from "@/server/auth/guards";
import { getLatestBlockResponse } from "@/server/progress/latest-response";
import { sanitizeBlockConfig } from "@/mdx/sanitize";
import { CodeConfigSchema, type SanitizedCodeConfig } from "./schema";
import { CodeExerciseClient, type CodeInitialState } from "./CodeExerciseClient";
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
    try {
      const block = await prisma.block.findUnique({ where: { id } });
      const parsed = block ? CodeConfigSchema.safeParse(block.config) : null;
      if (block && block.type === "CODE" && parsed?.success) {
        const user = await getSessionUser();
        let initialState: CodeInitialState | null = null;
        if (user) {
          const latest = await getLatestBlockResponse(id, user.id);
          if (latest) {
            initialState = {
              source:
                typeof (latest.payload as { source?: unknown }).source === "string"
                  ? (latest.payload as { source: string }).source
                  : parsed.data.starterCode,
              isCorrect: latest.isCorrect,
            };
          }
        }

        return (
          <CodeExerciseClient
            id={id}
            config={sanitizeBlockConfig<typeof parsed.data, SanitizedCodeConfig>(parsed.data)}
            initialState={initialState}
          />
        );
      }
    } catch {
      // Ignore DB lookup error in preview / pending states
    }
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
