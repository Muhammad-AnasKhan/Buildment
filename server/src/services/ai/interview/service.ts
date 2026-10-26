import { blockDefinitions } from "../../../shared/blocks/definitions.js";
import {
  AI_INTERVIEW_LIMITS,
  contextFields,
  interviewContext,
  AiInterviewFeedbackSchema,
  AiInterviewFlagSchema,
  AiInterviewTranscriptSchema,
  AiInterviewFocusSchema,
  type AiInterviewConfig,
  type AiInterviewFeedback,
  type AiInterviewPayload,
  type AiInterviewTurn,
} from "../../../shared/blocks/ai-interview/schema.js";
import type { AiInterviewInitialState, AiInterviewSessionView } from "../../../shared/api/ai.js";
import { prisma } from "../../../db/prisma.js";
import type { AiInterviewSession, Prisma } from "../../../generated/prisma/index.js";
import type { SessionUser } from "../../../types/auth.js";
import { BadRequestError, ConflictError, NotFoundError } from "../../../utils/errors.js";
import { assertEnrollmentChapter } from "../../courses/releases.js";
import { loadBlockForSubmission } from "../../blocks/access.js";
import { lockEnrollmentVariant, recomputeChapterProgress, recordBlockStats } from "../../progress/compute.js";
import { env } from "../../../config/env.js";
import { parseEncryptionKey } from "../credential-crypto.js";
import { loadAiKeyForUse } from "../credentials.js";
import { AiError, createChatCompletion, defaultInterviewModel } from "../openrouter.js";
import {
  buildFeedbackMessages,
  buildInterviewMessages,
  buildInterviewSystemPrompt,
  hasPromptContext,
  NO_PROMPT_CONTEXT,
  cleanQuestion,
  extractJsonObject,
  fallbackQuestion,
  feedbackJsonSchema,
  leaksPrivateText,
  planNextQuestion,
  type PromptContext,
} from "./prompts.js";

// The AI interview: start, answer, finish and abandon one session of an
// AI_INTERVIEW block. Each model call uses the learner's own decrypted
// OpenRouter key for that one request. Errors are AiError (stable code, plain
// message) and never carry the key, a prompt or a provider reply.

export type InterviewDeps = { fetchImpl?: typeof fetch; encryptionKey?: Buffer | null };

const QUESTION_MAX_TOKENS = 220;
const FEEDBACK_MAX_TOKENS = 1500;
const FEEDBACK_TIMEOUT_MS = 60_000;

function serverKeyReady(deps: InterviewDeps): boolean {
  const key = deps.encryptionKey !== undefined ? deps.encryptionKey : parseEncryptionKey(env.AI_KEY_ENCRYPTION_KEY);
  return key !== null;
}

// ---- Views ---------------------------------------------------------------------

function readTranscript(value: unknown): AiInterviewTurn[] {
  const parsed = AiInterviewTranscriptSchema.safeParse(value);
  return parsed.success ? parsed.data : [];
}

function readFeedback(value: unknown): AiInterviewFeedback | null {
  const parsed = AiInterviewFeedbackSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export function toSessionView(row: AiInterviewSession, config: Pick<AiInterviewConfig, "maxTurns">): AiInterviewSessionView {
  return {
    id: row.id,
    status: row.status,
    context: row.context,
    contextWork: row.contextWork,
    transcript: readTranscript(row.transcript),
    turnCount: row.turnCount,
    maxTurns: config.maxTurns,
    limitReached: row.turnCount >= config.maxTurns,
    canFinish: row.status === "ACTIVE" && row.turnCount >= 1,
    feedback: readFeedback(row.feedback),
    startedAt: row.createdAt.toISOString(),
    finishedAt: row.finishedAt?.toISOString() ?? null,
  };
}

/** Key and server readiness plus the latest session, for the block's first render. */
export async function loadAiInterviewInitialState(
  userId: string | undefined,
  blockId: string,
  config: Pick<AiInterviewConfig, "maxTurns">,
  deps: InterviewDeps = {}
): Promise<AiInterviewInitialState> {
  const configured = serverKeyReady(deps);
  if (!userId) return { configured, hasKey: false, session: null };
  const [credential, active] = await Promise.all([
    prisma.aiCredential.findUnique({ where: { userId }, select: { id: true } }),
    prisma.aiInterviewSession.findFirst({ where: { userId, blockId, status: "ACTIVE" }, orderBy: { createdAt: "desc" } }),
  ]);
  const session =
    active ?? (await prisma.aiInterviewSession.findFirst({ where: { userId, blockId, status: "FINISHED" }, orderBy: { finishedAt: "desc" } }));
  return { configured, hasKey: Boolean(credential), session: session ? toSessionView(session, config) : null };
}

// ---- Shared loading --------------------------------------------------------------

async function loadInterviewBlock(blockId: string, user: SessionUser | undefined) {
  const loaded = await loadBlockForSubmission(blockId, user);
  if (loaded.block.type !== "AI_INTERVIEW") throw new NotFoundError("Block not found");
  const config = blockDefinitions.AI_INTERVIEW.schema.parse(loaded.block.config);
  return { ...loaded, config };
}

async function loadActiveSession(sessionId: string, userId: string, blockId: string): Promise<AiInterviewSession> {
  const session = await prisma.aiInterviewSession.findFirst({ where: { id: sessionId, userId, blockId } });
  if (!session) throw new NotFoundError("Interview not found", "AI_INTERVIEW_NOT_FOUND");
  return session;
}

function requireActive(session: AiInterviewSession) {
  if (session.status !== "ACTIVE") {
    throw new ConflictError("This interview is already over. Start a new one.", "AI_INTERVIEW_NOT_ACTIVE");
  }
}

function conflict(): never {
  throw new ConflictError("This interview changed in another tab. Reload the page and carry on.", "AI_INTERVIEW_CONFLICT");
}

// ---- Start -----------------------------------------------------------------------

export async function startAiInterview(
  input: { blockId: string; user: SessionUser | undefined; context?: string | null; contextWork?: string | null },
  deps: InterviewDeps = {}
): Promise<AiInterviewSessionView> {
  const { config, learner } = await loadInterviewBlock(input.blockId, input.user);
  if (!serverKeyReady(deps)) throw new AiError("AI_NOT_CONFIGURED");
  const credential = await prisma.aiCredential.findUnique({ where: { userId: learner.id }, select: { model: true } });
  if (!credential) throw new AiError("AI_KEY_REQUIRED");

  // Resume instead of starting a second session after a reload.
  const existing = await prisma.aiInterviewSession.findFirst({
    where: { userId: learner.id, blockId: input.blockId, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
  });
  if (existing) return toSessionView(existing, config);

  // One box per field the block asks for, each with its own length limits.
  const values: Record<"context" | "contextWork", string | null> = { context: null, contextWork: null };
  for (const box of contextFields(config.context)) {
    const text = (input[box.field] ?? "").trim();
    const what = box.label.replace(/^Your /, "");
    if (text.length < box.min) {
      throw new BadRequestError(`Paste your ${what} first. It needs at least ${box.min} characters.`, "AI_INTERVIEW_CONTEXT_REQUIRED");
    }
    if (text.length > box.max) {
      throw new BadRequestError(`Your ${what} is too long. Keep it under ${box.max} characters.`, "AI_INTERVIEW_CONTEXT_TOO_LONG");
    }
    values[box.field] = text;
  }

  const opening: AiInterviewTurn = {
    role: "interviewer",
    content: config.opening,
    focus: config.focus[0]!,
    depth: 0,
    at: new Date().toISOString(),
  };
  const created = await prisma.aiInterviewSession.create({
    data: {
      userId: learner.id,
      blockId: input.blockId,
      context: values.context,
      contextWork: values.contextWork,
      transcript: [opening] as unknown as Prisma.InputJsonValue,
      model: credential.model ?? defaultInterviewModel(),
    },
  });
  return toSessionView(created, config);
}

// ---- Answer ----------------------------------------------------------------------

export async function answerAiInterview(
  input: { blockId: string; user: SessionUser | undefined; sessionId: string; answer: string },
  deps: InterviewDeps = {}
): Promise<AiInterviewSessionView> {
  const answer = input.answer.trim();
  if (!answer) throw new BadRequestError("Write an answer first.", "AI_INTERVIEW_ANSWER_EMPTY");
  if (answer.length > AI_INTERVIEW_LIMITS.answerMaxChars) {
    throw new BadRequestError(`Keep your answer under ${AI_INTERVIEW_LIMITS.answerMaxChars} characters.`, "AI_INTERVIEW_ANSWER_TOO_LONG");
  }

  const { config, learner } = await loadInterviewBlock(input.blockId, input.user);
  const session = await loadActiveSession(input.sessionId, learner.id, input.blockId);
  requireActive(session);
  if (session.turnCount >= config.maxTurns) {
    throw new ConflictError("That was the last question. Finish the interview to get your feedback.", "AI_INTERVIEW_LIMIT");
  }

  const transcript = readTranscript(session.transcript);
  const now = new Date().toISOString();
  const withAnswer: AiInterviewTurn[] = [...transcript, { role: "candidate", content: answer, at: now }];
  const turnCount = session.turnCount + 1;
  let next = withAnswer;
  let model = session.model;

  // The last allowed answer needs no further question, so it costs nothing.
  if (turnCount < config.maxTurns) {
    const { apiKey, model: chosen } = await loadAiKeyForUse(learner.id, deps);
    model = chosen;
    const plan = planNextQuestion(config, withAnswer);
    const messages = buildInterviewMessages(config, plan, withAnswer, interviewContext(config.context, session));
    const reply = await createChatCompletion({
      apiKey,
      model: chosen,
      messages,
      maxTokens: QUESTION_MAX_TOKENS,
      temperature: 0.6,
      fetchImpl: deps.fetchImpl,
    });
    const cleaned = cleanQuestion(reply);
    const unusable = !cleaned || leaksPrivateText(cleaned, [config.rubric, buildInterviewSystemPrompt(config, plan, hasPromptContext(interviewContext(config.context, session)))]);
    next = [
      ...withAnswer,
      {
        role: "interviewer",
        content: unusable ? fallbackQuestion(plan) : cleaned,
        focus: plan.focus,
        depth: plan.depth,
        at: new Date().toISOString(),
      },
    ];
  }

  // Compare-and-set on the turn count, so two tabs cannot both add the same answer.
  const saved = await prisma.aiInterviewSession.updateMany({
    where: { id: session.id, status: "ACTIVE", turnCount: session.turnCount },
    data: { transcript: next as unknown as Prisma.InputJsonValue, turnCount, model },
  });
  if (saved.count !== 1) conflict();
  const fresh = await prisma.aiInterviewSession.findUniqueOrThrow({ where: { id: session.id } });
  return toSessionView(fresh, config);
}

// ---- Finish ----------------------------------------------------------------------

function squash(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

/**
 * Keep what the model returned that we can use; the Zod schema then decides if it is enough.
 * A flag stays only when its quote really is the learner's words, so a made-up quote never
 * reaches the learner or a mentor.
 */
function normaliseFeedback(raw: unknown, config: AiInterviewConfig, transcript: AiInterviewTurn[]): unknown {
  if (!raw || typeof raw !== "object") return raw;
  const value = raw as Record<string, unknown>;
  const focusNotes = Array.isArray(value.focusNotes)
    ? value.focusNotes.filter((item) => {
        const focus = (item as { focus?: unknown } | null)?.focus;
        return AiInterviewFocusSchema.safeParse(focus).success && config.focus.includes(focus as AiInterviewConfig["focus"][number]);
      })
    : [];
  const said = transcript.filter((turn) => turn.role === "candidate").map((turn) => squash(turn.content));
  const flags = Array.isArray(value.flags)
    ? value.flags.filter((item) => {
        const flag = item as { name?: unknown; quote?: unknown } | null;
        if (typeof flag?.quote !== "string" || !AiInterviewFlagSchema.shape.name.safeParse(flag.name).success) return false;
        const quote = squash(flag.quote);
        return quote.length > 0 && said.some((answer) => answer.includes(quote));
      }).map((item) => ({ name: (item as { name: unknown }).name, quote: String((item as { quote: string }).quote).trim().slice(0, 300) }))
    : [];
  return { ...value, focusNotes, flags };
}

async function requestFeedback(
  apiKey: string,
  model: string,
  config: AiInterviewConfig,
  transcript: AiInterviewTurn[],
  context: PromptContext,
  fetchImpl: typeof fetch | undefined
): Promise<AiInterviewFeedback> {
  const messages = buildFeedbackMessages(config, transcript, context);
  const base = { apiKey, model, messages, maxTokens: FEEDBACK_MAX_TOKENS, temperature: 0.3, timeoutMs: FEEDBACK_TIMEOUT_MS, fetchImpl };
  let reply: string;
  try {
    reply = await createChatCompletion({
      ...base,
      responseFormat: { type: "json_schema", json_schema: feedbackJsonSchema(config.focus) },
    });
  } catch (error) {
    // Some models cannot return structured output. The prompt asks for JSON anyway, so try once without the format.
    if (!(error instanceof AiError) || error.code !== "AI_MODEL_UNAVAILABLE") throw error;
    reply = await createChatCompletion(base);
  }
  const parsed = AiInterviewFeedbackSchema.safeParse(normaliseFeedback(extractJsonObject(reply), config, transcript));
  if (!parsed.success) throw new AiError("AI_BAD_OUTPUT");
  const systemPrompt = buildFeedbackMessages(config, [], NO_PROMPT_CONTEXT)[0]!.content;
  if (leaksPrivateText(JSON.stringify(parsed.data), [config.rubric, systemPrompt])) throw new AiError("AI_BAD_OUTPUT");
  return parsed.data;
}

export async function finishAiInterview(
  input: { blockId: string; user: SessionUser | undefined; sessionId: string },
  deps: InterviewDeps = {}
): Promise<AiInterviewSessionView> {
  const { block, enrollment, config, learner } = await loadInterviewBlock(input.blockId, input.user);
  const session = await loadActiveSession(input.sessionId, learner.id, input.blockId);
  // Finishing twice (a double click, a second tab) returns the saved result.
  if (session.status === "FINISHED") return toSessionView(session, config);
  requireActive(session);
  if (session.turnCount < 1) {
    throw new BadRequestError("Answer at least one question before you finish.", "AI_INTERVIEW_TOO_EARLY");
  }

  const transcript = readTranscript(session.transcript);
  const { apiKey, model } = await loadAiKeyForUse(learner.id, deps);
  const feedback = await requestFeedback(apiKey, model, config, transcript, interviewContext(config.context, session), deps.fetchImpl);

  const finishedAt = new Date();
  const payload: AiInterviewPayload = { sessionId: session.id, turns: session.turnCount, transcript, feedback };
  await prisma.$transaction(async (tx) => {
    await lockEnrollmentVariant(tx, enrollment.id);
    await assertEnrollmentChapter(tx, enrollment.id, block.chapter.id);
    const saved = await tx.aiInterviewSession.updateMany({
      where: { id: session.id, status: "ACTIVE", turnCount: session.turnCount },
      data: { status: "FINISHED", feedback: feedback as unknown as Prisma.InputJsonValue, finishedAt, model },
    });
    if (saved.count !== 1) conflict();
    const previousAttempts = await tx.response.count({ where: { blockId: block.id, userId: learner.id } });
    const graded = blockDefinitions.AI_INTERVIEW.grade(config, payload);
    await tx.response.create({
      data: {
        blockId: block.id,
        userId: learner.id,
        enrollmentId: enrollment.id,
        attempt: previousAttempts + 1,
        status: graded.status,
        payload: payload as unknown as Prisma.InputJsonValue,
        score: graded.score,
        maxScore: graded.maxScore,
        isCorrect: graded.isCorrect,
      },
    });
    await recordBlockStats(tx, { blockId: block.id, status: graded.status, isCorrect: graded.isCorrect });
    await recomputeChapterProgress(tx, enrollment.id, block.chapter.id);
  });

  const fresh = await prisma.aiInterviewSession.findUniqueOrThrow({ where: { id: session.id } });
  return toSessionView(fresh, config);
}

// ---- Abandon ---------------------------------------------------------------------

/** Drop the active session so the learner can start over. Nothing is counted as complete. */
export async function abandonAiInterview(
  input: { blockId: string; user: SessionUser | undefined; sessionId: string }
): Promise<AiInterviewSessionView> {
  const { config, learner } = await loadInterviewBlock(input.blockId, input.user);
  const session = await loadActiveSession(input.sessionId, learner.id, input.blockId);
  if (session.status === "ACTIVE") {
    await prisma.aiInterviewSession.updateMany({ where: { id: session.id, status: "ACTIVE" }, data: { status: "ABANDONED" } });
  }
  const fresh = await prisma.aiInterviewSession.findUniqueOrThrow({ where: { id: session.id } });
  return toSessionView(fresh, config);
}
