import { prisma } from "@/server/db";
import { getSessionUser } from "@/server/auth/guards";
import { sanitizeBlockConfig } from "@/mdx/sanitize";
import { OpenQuestionConfigSchema, type SanitizedOpenQuestionConfig } from "./schema";
import { getOpenQuestionGroupPosition } from "./group-position";
import { OpenQuestionClient, type OpenQuestionInitialState } from "./OpenQuestionClient";
import { PendingBlockCard } from "@/components/learn/pending-block-card";

export async function OpenQuestionComponent({
  id,
  prompt,
  minWords = 0,
  maxWords,
  sampleAnswer,
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
    try {
      const block = await prisma.block.findUnique({ where: { id } });
      const parsed = block ? OpenQuestionConfigSchema.safeParse(block.config) : null;
      if (block && block.type === "OPEN_QUESTION" && parsed?.success) {
        const chapterBlocks = await prisma.block.findMany({
          where: { chapterId: block.chapterId, archivedAt: null },
          orderBy: { order: "asc" },
          select: { id: true, type: true },
        });

        const { position, index, total } = getOpenQuestionGroupPosition(chapterBlocks, id);
        const config = parsed.data;
        const sanitized = sanitizeBlockConfig<typeof config, SanitizedOpenQuestionConfig>(config);

        const user = await getSessionUser();
        let initialState: OpenQuestionInitialState | null = null;
        if (user) {
          const latest = await prisma.response.findFirst({
            where: { blockId: id, userId: user.id },
            orderBy: { attempt: "desc" },
            include: { review: { select: { feedback: true, verdict: true } } },
          });
          if (latest && latest.status !== "DRAFT") {
            const payload = latest.payload as { text?: string; url?: string } | null;
            const text = typeof payload?.text === "string" ? payload.text : "";
            const url = typeof payload?.url === "string" ? payload.url : null;
            initialState = {
              status: latest.status,
              attempt: latest.attempt,
              text,
              url,
              feedback: latest.review?.feedback ?? null,
              verdict: latest.review?.verdict ?? null,
            };
          }
        }

        return (
          <OpenQuestionClient
            id={id}
            config={sanitized}
            initialState={initialState}
            groupPosition={position}
            questionIndex={index}
            questionTotal={total}
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
        typeLabel="Reflective Question"
        title={prompt || "Open question checkpoint in progress"}
        description="Prompt instructions and reflection guidelines are being prepared for this section."
        blockId={id}
      />
    );
  }

  return null;
}
