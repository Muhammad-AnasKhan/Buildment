import { prisma } from "@/server/db";
import { sanitizeBlockConfig } from "@/mdx/sanitize";
import { QuizConfigSchema, type SanitizedQuizConfig } from "./schema";
import { QuizClient } from "./QuizClient";

// Registered in the MDX component map (src/mdx/components.tsx) as <Quiz id="...">.
// A server component so it can fetch and sanitize its own config directly —
// Block.config (with the correct answer) never has to travel through MDX
// source or client props. See docs/03-blocks-registry.mdx and 09-security.mdx.
export async function QuizComponent({ id }: { id: string }) {
  const block = await prisma.block.findUnique({ where: { id } });
  if (!block || block.type !== "QUIZ") {
    return (
      <div className="my-6 rounded-md border border-dashed border-destructive/50 p-4 text-sm text-destructive">
        Quiz block {id} is missing or misconfigured.
      </div>
    );
  }

  const config = QuizConfigSchema.parse(block.config);
  const sanitized = sanitizeBlockConfig<typeof config, SanitizedQuizConfig>(config);

  return <QuizClient id={id} config={sanitized} />;
}
