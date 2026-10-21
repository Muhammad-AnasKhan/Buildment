import type { BlockState, ContentBlockState } from "../../shared/api/blocks.js";
import { blockDefinitions } from "../../shared/blocks/definitions.js";
import { CodeConfigSchema, type SanitizedCodeConfig } from "../../shared/blocks/code/schema.js";
import { MustReadConfigSchema } from "../../shared/blocks/must-read/schema.js";
import { OpenQuestionConfigSchema, type SanitizedOpenQuestionConfig } from "../../shared/blocks/open-question/schema.js";
import { getOpenQuestionGroupPosition } from "../../shared/blocks/open-question/group-position.js";
import { PredictConfigSchema, type SanitizedPredictConfig } from "../../shared/blocks/predict/schema.js";
import { QuizConfigSchema, type SanitizedQuizConfig } from "../../shared/blocks/quiz/schema.js";
import { applyTokens, applyTokensDeep, contentTokenValues, type ContentTokenValues } from "../../shared/lib/content-tokens.js";
import { prisma } from "../../db/prisma.js";
import type { Block } from "../../generated/prisma/index.js";
import { findEnrollmentForBlockState } from "../enrollment/api-learn-access.js";
import { NotFoundError } from "../../utils/errors.js";
import { sanitizeBlockConfig } from "../../utils/sanitize-block-config.js";
import type { SessionUser } from "../../types/auth.js";

type Payload = Record<string, unknown> | null;

const str = (value: unknown, fallback = "") => (typeof value === "string" ? value : fallback);
const strings = (value: unknown) => (Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []);

/**
 * Client-safe config plus the caller's latest answer. Anonymous callers (course
 * previews) get the config only. Secrets never leave: answer keys, rubrics,
 * hidden tests and solutions are stripped before the config is returned.
 */
export async function loadBlockState(blockId: string, user: SessionUser | undefined): Promise<BlockState> {
  const block = await prisma.block.findUnique({ where: { id: blockId }, include: { chapter: { select: { course: { select: { id: true, familySlug: true } } } } } });
  if (!block || block.archivedAt) throw new NotFoundError("Block not found");

  // Prompts and options read in the caller's variant; anonymous previews get the fallbacks.
  const { course } = block.chapter;
  const enrollment = user && course.familySlug ? await findEnrollmentForBlockState(course.id, user.id) : null;
  return withTokens(await blockStateFor(block, user), contentTokenValues(course.familySlug, enrollment?.variantSlug));
}

/** Resolve placeholders in what the author wrote (config and explanations), never in the learner's own answer. */
function withTokens(state: BlockState, values: ContentTokenValues): BlockState {
  const config = applyTokensDeep(state.config, values);
  if (!("initialState" in state) || !state.initialState || !("explanation" in state.initialState)) return { ...state, config } as BlockState;
  const { explanation } = state.initialState;
  return {
    ...state,
    config,
    initialState: { ...state.initialState, explanation: typeof explanation === "string" ? applyTokens(explanation, values) : explanation },
  } as BlockState;
}

async function blockStateFor(block: Block, user: SessionUser | undefined): Promise<BlockState> {
  const blockId = block.id;

  const latest = user
    ? await prisma.response.findFirst({
        where: { blockId, userId: user.id },
        orderBy: { attempt: "desc" },
        include: { review: { select: { feedback: true, verdict: true } } },
      })
    : null;
  const payload = (latest?.payload ?? null) as Payload;

  switch (block.type) {
    case "QUIZ": {
      const config = QuizConfigSchema.parse(block.config);
      return {
        type: "QUIZ",
        config: sanitizeBlockConfig<typeof config, SanitizedQuizConfig>(config),
        initialState: latest
          ? { selected: strings(payload?.selected), isCorrect: latest.isCorrect, score: latest.score, maxScore: latest.maxScore, explanation: config.explanation }
          : null,
      };
    }
    case "PREDICT": {
      const config = PredictConfigSchema.parse(block.config);
      return {
        type: "PREDICT",
        config: sanitizeBlockConfig<typeof config, SanitizedPredictConfig>(config),
        initialState: latest
          ? { selected: str(payload?.selected), isCorrect: latest.isCorrect, score: latest.score, maxScore: latest.maxScore, explanation: config.explanation }
          : null,
      };
    }
    case "CODE": {
      const config = CodeConfigSchema.parse(block.config);
      return {
        type: "CODE",
        config: sanitizeBlockConfig<typeof config, SanitizedCodeConfig>(config),
        initialState: latest ? { source: str(payload?.source, config.starterCode), isCorrect: latest.isCorrect } : null,
      };
    }
    case "OPEN_QUESTION": {
      const config = OpenQuestionConfigSchema.parse(block.config);
      const chapterBlocks = await prisma.block.findMany({
        where: { chapterId: block.chapterId, archivedAt: null },
        orderBy: { order: "asc" },
        select: { id: true, type: true },
      });
      const submitted = latest && latest.status !== "DRAFT" ? latest : null;
      return {
        type: "OPEN_QUESTION",
        config: sanitizeBlockConfig<typeof config, SanitizedOpenQuestionConfig>(config),
        group: getOpenQuestionGroupPosition(chapterBlocks, blockId),
        initialState: submitted
          ? {
              status: submitted.status,
              attempt: submitted.attempt,
              text: str(payload?.text),
              url: typeof payload?.url === "string" ? payload.url : null,
              feedback: submitted.review?.feedback ?? null,
              verdict: submitted.review?.verdict ?? null,
            }
          : null,
      };
    }
    case "MUST_READ": {
      const config = MustReadConfigSchema.parse(block.config);
      return {
        type: "MUST_READ",
        config: { title: config.title, url: config.url, description: config.description, source: config.source, readMinutes: config.readMinutes },
        initialRead: Boolean(latest && latest.status !== "DRAFT"),
      };
    }
    case "STEPS":
    case "VIDEO":
    case "CHAPTER_RECAP":
    case "LEARNING_OBJECTIVES":
    case "PROJECT_PREVIEW":
    case "ROADMAP":
    case "VISUAL_DIAGRAM":
    case "VISUAL_WALKTHROUGH":
      // Presentation blocks: the config is the content, nothing in it is secret.
      return { type: block.type, config: blockDefinitions[block.type].schema.parse(block.config) } as ContentBlockState;
    default:
      throw new NotFoundError(`Block type ${block.type} has no learner state`);
  }
}
