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
import { ANSWER_MAX_TOKENS, buildSystemPrompt, buildUserMessage } from "./prompt.js";
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
      course: { select: { title: true, familySlug: true, variantFamily: true } },
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
  if (!learnerQaAvailable) return { available: false, remaining: 0, dailyLimit: env.LEARNER_QA_DAILY_LIMIT };
  const { learner } = await loadAskableChapter(chapterId, user);
  return { available: true, ...(await remainingToday(learner.id)) };
}

export async function askAboutChapter(
  input: { chapterId: string; user: SessionUser | undefined; question: string },
  deps: ChapterQaDeps = {}
): Promise<ChapterQuestionAnswer> {
  if (!learnerQaAvailable) throw new AppError(NOT_AVAILABLE, 503, "QA_UNAVAILABLE");
  const { chapter, enrollment, learner } = await loadAskableChapter(input.chapterId, input.user);

  const family = resolveCourseFamily(chapter.course.familySlug, chapter.course.variantFamily);
  const source = applyTokens(chapter.compiled ?? chapter.source, contentTokenValues(family, enrollment.variantSlug));

  const reservation = await reserveQuestion({ userId: learner.id, courseId: chapter.courseId, chapterId: chapter.id });
  try {
    const client = deps.client ?? anthropicClient();
    const message = await client.messages.create({
      model: env.LEARNER_QA_MODEL,
      max_tokens: ANSWER_MAX_TOKENS,
      // Low effort with thinking off keeps the whole token budget for the answer itself.
      thinking: { type: "disabled" },
      output_config: { effort: "low" },
      system: buildSystemPrompt({ courseTitle: chapter.course.title, chapterTitle: chapter.title, source }),
      messages: [{ role: "user", content: buildUserMessage(input.question) }],
    });
    await recordTokens(reservation, { inputTokens: message.usage.input_tokens, outputTokens: message.usage.output_tokens });

    const text = message.content
      .flatMap((block) => (block.type === "text" ? [block.text] : []))
      .join("")
      .trim();
    const answer = message.stop_reason === "refusal" ? DECLINED : text;
    if (!answer) throw new AppError(TRY_LATER, 502, "QA_FAILED");
    return { answer, ...(await remainingToday(learner.id)) };
  } catch (error) {
    await releaseQuestion(reservation).catch(() => undefined);
    if (error instanceof AppError) throw error;
    // Status only: the error text can echo request details.
    logger.error(
      { status: error instanceof Anthropic.APIError ? error.status : undefined, chapterId: chapter.id },
      "chapter question failed"
    );
    throw new AppError(TRY_LATER, 502, "QA_FAILED");
  }
}
