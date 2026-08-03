import { prisma } from "@/server/db";
import { sanitizeBlockConfig } from "@/mdx/sanitize";
import { OpenQuestionConfigSchema, type SanitizedOpenQuestionConfig } from "./schema";
import { OpenQuestionClient } from "./OpenQuestionClient";

// Registered in the MDX component map as <OpenQuestion id="...">. Server
// component for the same reason as the Quiz block — see quiz/Component.tsx.
export async function OpenQuestionComponent({ id }: { id: string }) {
  const block = await prisma.block.findUnique({ where: { id } });
  if (!block || block.type !== "OPEN_QUESTION") {
    return (
      <div className="my-6 rounded-md border border-dashed border-destructive/50 p-4 text-sm text-destructive">
        Open question block {id} is missing or misconfigured.
      </div>
    );
  }

  const config = OpenQuestionConfigSchema.parse(block.config);
  const sanitized = sanitizeBlockConfig<typeof config, SanitizedOpenQuestionConfig>(config);

  return <OpenQuestionClient id={id} config={sanitized} />;
}
