import Anthropic from "@anthropic-ai/sdk";
import { env, learnerQaAvailable } from "../../../config/env.js";
import { prisma } from "../../../db/prisma.js";
import { applyTokens, contentTokenValues } from "../../../shared/lib/content-tokens.js";
import { resolveCourseFamily } from "../../../shared/lib/course-tracks.js";
import type { ChapterQuestionAnswer, ChapterQuestionStatus } from "./types.js";
import type { SessionUser } from "../../../types/auth.js";
import { AppError, ForbiddenError, NotFoundError } from "../../../utils/errors.js";
import { logger } from "../../../utils/logger.js";
import { bypassProgressGatingForEmail } from "../../auth/seed-access.js";
import { requireBlockSubmissionAccess } from "../../enrollment/api-learn-access.js";
import { ChapterLockedError, assertChapterUnlocked } from "../../progress/gate.js";
import { readCourseAssistant } from "./assistant.js";
import { buildMessages, buildSystemPrompt, modelSettings, type PreviousTurn } from "./prompt.js";
import { recordTokens, releaseQuestion, remainingToday, reserveQuestion } from "./usage.js";

// Ask about this chapter: one short question, one short answer, grounded in the chapter's
// teaching text. The platform Anthropic key is read from env for the request and is never
// logged or returned. Upstream failures become one plain message; the provider's reply
// and error text stay on the server.

const NOT_AVAILABLE = "Chapter questions are not available right now.";
const TRY_LATER = "We could not answer that just now. Please try again in a moment.";
const DECLINED = "I can only help with this chapter, so I cannot answer that one. Ask me about the chapter instead.";
const REQUEST_TIMEOUT_MS = 30_000;

export type ChapterQaDeps = { client?: Pick<Anthropic, "messages"> };

let sharedClient: Anthropic | null = null;
function anthropicClient(): Anthropic {
  sharedClient ??= new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, timeout: REQUEST_TIMEOUT_MS, maxRetries: 1 });
  return sharedClient;
}

/** The same checks blocks use: verified learner, enrolled, chapter unlocked. Quiz chapters never qualify. */
async function loadAskableChapter(chapterId: string, user: SessionUser | undefined) {
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    select: {
      id: true,
      title: true,
      courseId: true,
      readerMode: true,
      archivedAt: true,
      publishedAt: true,
      source: true,
      compiled: true,
      course: { select: { title: true, familySlug: true, variantFamily: true, assistant: true } },
    },
  });
  if (!chapter || chapter.archivedAt || !chapter.publishedAt) throw new NotFoundError("Chapter not found");
  if (chapter.readerMode === "QUIZ") throw new ForbiddenError(NOT_AVAILABLE, "QA_UNAVAILABLE");

  const enrollment = await requireBlockSubmissionAccess(chapter.courseId, user);
  const learner = user!;
  try {
    await assertChapterUnlocked({
      courseId: chapter.courseId,
      enrollmentId: enrollment.id,
      chapterId: chapter.id,
      bypassLocking: bypassProgressGatingForEmail(learner.email),
    });
  } catch (error) {
    if (error instanceof ChapterLockedError) {
      throw new ForbiddenError("This chapter is locked. Finish the previous chapter first.", "CHAPTER_LOCKED");
    }
    throw error;
  }
  return { chapter, enrollment, learner };
}

export async function chapterQuestionStatus(chapterId: string, user: SessionUser | undefined): Promise<ChapterQuestionStatus> {
  if (!learnerQaAvailable) return { available: false, remaining: 0, dailyLimit: env.LEARNER_QA_DAILY_LIMIT, starters: [] };
  const { chapter, learner } = await loadAskableChapter(chapterId, user);
  const { starters } = readCourseAssistant(chapter.course.assistant);
  return { available: true, ...(await remainingToday(learner.id)), starters: starters ?? [] };
}

type Prepared = {
  chapterId: string;
  learnerId: string;
  reservation: string;
  params: Anthropic.MessageCreateParamsNonStreaming;
  remaining: { remaining: number; dailyLimit: number };
};

export type AskInput = { chapterId: string; user: SessionUser | undefined; question: string; previous?: PreviousTurn };

/** Access, limits and the model request, shared by the single and streaming paths. A question is reserved here. */
async function prepareQuestion(input: AskInput): Promise<Prepared> {
  if (!learnerQaAvailable) throw new AppError(NOT_AVAILABLE, 503, "QA_UNAVAILABLE");
  const { chapter, enrollment, learner } = await loadAskableChapter(input.chapterId, input.user);

  const family = resolveCourseFamily(chapter.course.familySlug, chapter.course.variantFamily);
  const source = applyTokens(chapter.compiled ?? chapter.source, contentTokenValues(family, enrollment.variantSlug));
  const assistant = readCourseAssistant(chapter.course.assistant);

  const reservation = await reserveQuestion({ userId: learner.id, courseId: chapter.courseId, chapterId: chapter.id });
  try {
    return {
      chapterId: chapter.id,
      learnerId: learner.id,
      reservation,
      params: {
        model: env.LEARNER_QA_MODEL,
        ...modelSettings(assistant.effort),
        system: buildSystemPrompt({ courseTitle: chapter.course.title, chapterTitle: chapter.title, source, guidance: assistant.guidance }),
        messages: buildMessages(input.question, input.previous),
      },
      remaining: await remainingToday(learner.id),
    };
  } catch (error) {
    await releaseQuestion(reservation).catch(() => undefined);
    throw error;
  }
}

/** Log the status only (the error text can echo request details) and hide the rest from the learner. */
function failure(error: unknown, chapterId: string): AppError {
  if (error instanceof AppError) return error;
  logger.error({ status: error instanceof Anthropic.APIError ? error.status : undefined, chapterId }, "chapter question failed");
  return new AppError(TRY_LATER, 502, "QA_FAILED");
}

export async function askAboutChapter(input: AskInput, deps: ChapterQaDeps = {}): Promise<ChapterQuestionAnswer> {
  const prepared = await prepareQuestion(input);
  try {
    const message = await (deps.client ?? anthropicClient()).messages.create(prepared.params);
    await recordTokens(prepared.reservation, { inputTokens: message.usage.input_tokens, outputTokens: message.usage.output_tokens });

    const text = message.content
      .flatMap((block) => (block.type === "text" ? [block.text] : []))
      .join("")
      .trim();
    const answer = message.stop_reason === "refusal" ? DECLINED : text;
    if (!answer) throw new AppError(TRY_LATER, 502, "QA_FAILED");
    return { answer, ...(await remainingToday(prepared.learnerId)) };
  } catch (error) {
    await releaseQuestion(prepared.reservation).catch(() => undefined);
    throw failure(error, prepared.chapterId);
  }
}

/** Separates a streamed answer from the message of a failure that happens after the first byte. */
export const STREAM_ERROR_MARK = "\u0000";

export type StreamedQuestion = {
  /** The learner's questions left today, counting this one. */
  remaining: { remaining: number; dailyLimit: number };
  /** Writes the answer as it is generated. Never throws: a late failure is written as STREAM_ERROR_MARK plus a message. */
  run: (write: (chunk: string) => void) => Promise<void>;
};

/**
 * Same checks and limits as askAboutChapter, with the answer arriving in pieces. A failure before
 * the first byte throws like the single path, so the caller can still answer with a normal error.
 */
export async function streamAnswerAboutChapter(input: AskInput, deps: ChapterQaDeps = {}): Promise<StreamedQuestion> {
  const prepared = await prepareQuestion(input);
  const run = async (write: (chunk: string) => void) => {
    let wrote = false;
    try {
      const stream = (deps.client ?? anthropicClient()).messages.stream(prepared.params);
      stream.on("text", (delta) => {
        if (!wrote && !delta.trim()) return;
        wrote = true;
        write(delta);
      });
      const message = await stream.finalMessage();
      await recordTokens(prepared.reservation, { inputTokens: message.usage.input_tokens, outputTokens: message.usage.output_tokens });
      if (message.stop_reason === "refusal" && !wrote) write(DECLINED);
      else if (!wrote) throw new AppError(TRY_LATER, 502, "QA_FAILED");
    } catch (error) {
      await releaseQuestion(prepared.reservation).catch(() => undefined);
      write(STREAM_ERROR_MARK + failure(error, prepared.chapterId).message);
    }
  };
  return { remaining: prepared.remaining, run };
}
