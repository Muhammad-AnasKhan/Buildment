import { prisma } from "@/server/db";
import { getSessionUser } from "@/server/auth/guards";
import { sanitizeBlockConfig } from "@/mdx/sanitize";
import { OpenQuestionConfigSchema, type SanitizedOpenQuestionConfig } from "./schema";
import { getOpenQuestionGroupPosition } from "./group-position";
import { OpenQuestionClient, type OpenQuestionInitialState } from "./OpenQuestionClient";

// Registered in the MDX component map as <OpenQuestion id="...">. Server
// component for the same reason as the Quiz block — see quiz/Component.tsx.
export async function OpenQuestionComponent({ id }: { id: string }) {
  const block = await prisma.block.findUnique({ where: { id } });
  const parsed = block ? OpenQuestionConfigSchema.safeParse(block.config) : null;
  if (!block || block.type !== "OPEN_QUESTION" || !parsed?.success) {
    return (
      <div className="my-6 rounded-md border border-dashed border-destructive/50 p-4 text-sm text-destructive">
        Open question block {id} is missing or misconfigured.
      </div>
    );
  }

  const chapterBlocks = await prisma.block.findMany({
    where: { chapterId: block.chapterId, archivedAt: null },
    orderBy: { order: "asc" },
    select: { id: true, type: true },
  });

  const { position, index, total } = getOpenQuestionGroupPosition(chapterBlocks, id);

  const config = parsed.data;
  const sanitized = sanitizeBlockConfig<typeof config, SanitizedOpenQuestionConfig>(config);

  // Restore the mentee's prior attempt so submissions survive reloads and the
  // needs-revision loop (docs/05-review-queue.mdx) can show mentor feedback.
  const user = await getSessionUser();
  let initialState: OpenQuestionInitialState | null = null;
  if (user) {
    const latest = await prisma.response.findFirst({
      where: { blockId: id, userId: user.id },
      orderBy: { attempt: "desc" },
      include: { review: { select: { feedback: true, verdict: true } } },
    });
    if (latest && latest.status !== "DRAFT") {
      const text =
        typeof (latest.payload as { text?: string } | null)?.text === "string"
          ? ((latest.payload as { text?: string }).text as string)
          : "";
      initialState = {
        status: latest.status,
        attempt: latest.attempt,
        text,
        feedback: latest.review?.feedback ?? null,
        verdict: latest.review?.verdict ?? null,
      };
    }
  }

  return (
    <OpenQuestionClient
      id={id}
      config={sanitized}
      groupPosition={position}
      questionIndex={index}
      questionTotal={total}
      initialState={initialState}
    />
  );
}
