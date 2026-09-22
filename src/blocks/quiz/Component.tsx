import { prisma } from "@/server/db";
import { getSessionUser } from "@/server/auth/guards";
import { sanitizeBlockConfig } from "@/mdx/sanitize";
import { QuizConfigSchema, type SanitizedQuizConfig } from "./schema";
import { QuizClient, type QuizInitialState } from "./QuizClient";
import { getLatestBlockResponse } from "@/server/progress/latest-response";

// Registered in the MDX component map (src/mdx/components.tsx) as <Quiz id="...">.
// A server component so it can fetch and sanitize its own config directly —
// Block.config (with the correct answer) never has to travel through MDX
// source or client props. See docs/03-blocks-registry.mdx and 09-security.mdx.
export async function QuizComponent({
  id,
  presentation = "standalone",
}: {
  id: string;
  presentation?: "standalone" | "wizard";
}) {
  const block = await prisma.block.findUnique({ where: { id } });
  const parsed = block ? QuizConfigSchema.safeParse(block.config) : null;
  if (!block || block.type !== "QUIZ" || !parsed?.success) {
    return (
      <div className="my-6 rounded-md border border-dashed border-destructive/50 p-4 text-sm text-destructive">
        Quiz block {id} is missing or misconfigured.
      </div>
    );
  }

  const sanitized = sanitizeBlockConfig<typeof parsed.data, SanitizedQuizConfig>(parsed.data);

  const user = await getSessionUser();
  let initialState: QuizInitialState | null = null;
  if (user) {
    const latest = await getLatestBlockResponse(id, user.id);
    if (latest) {
      const selected = Array.isArray((latest.payload as { selected?: unknown } | null)?.selected)
        ? ((latest.payload as { selected: string[] }).selected)
        : [];
      initialState = {
        selected,
        isCorrect: latest.isCorrect,
        score: latest.score,
        maxScore: latest.maxScore,
        explanation: parsed.data.explanation,
      };
    }
  }

  return (
    <QuizClient
      id={id}
      config={sanitized}
      initialState={initialState}
      presentation={presentation}
    />
  );
}
