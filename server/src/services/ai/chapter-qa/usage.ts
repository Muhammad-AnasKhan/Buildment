import { env } from "../../../config/env.js";
import { prisma } from "../../../db/prisma.js";
import { AppError, TooManyRequestsError } from "../../../utils/errors.js";

// Chapter question limits, counted from LearnerQuestion rows so they survive restarts
// and hold across replicas. A row is reserved before the model is called and released if
// the call fails, so a learner is not charged a question for an outage.

const MINUTE_LIMIT = 5;
const MINUTE_MS = 60_000;

export const QA_PAUSED_MESSAGE = "Questions are paused for today.";

export function startOfUtcDay(now: Date): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export async function remainingToday(userId: string, now = new Date()): Promise<{ remaining: number; dailyLimit: number }> {
  const used = await prisma.learnerQuestion.count({ where: { userId, createdAt: { gte: startOfUtcDay(now) } } });
  return { remaining: Math.max(0, env.LEARNER_QA_DAILY_LIMIT - used), dailyLimit: env.LEARNER_QA_DAILY_LIMIT };
}

/** Check the three limits and record the question in one step. Returns the row id. */
export async function reserveQuestion(input: { userId: string; courseId: string; chapterId: string }, now = new Date()): Promise<string> {
  return prisma.$transaction(async (tx) => {
    // One lock for every reservation keeps the platform-wide count exact; the work under it is three counts and an insert.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('learner-qa'))`;
    const dayStart = startOfUtcDay(now);
    const today = await tx.learnerQuestion.count({ where: { createdAt: { gte: dayStart } } });
    const perUser = await tx.learnerQuestion.count({ where: { userId: input.userId, createdAt: { gte: dayStart } } });
    const lastMinute = await tx.learnerQuestion.count({
      where: { userId: input.userId, createdAt: { gte: new Date(now.getTime() - MINUTE_MS) } },
    });
    if (today >= env.LEARNER_QA_GLOBAL_DAILY_LIMIT) {
      throw new AppError(QA_PAUSED_MESSAGE, 503, "QA_PAUSED");
    }
    if (perUser >= env.LEARNER_QA_DAILY_LIMIT) {
      throw new TooManyRequestsError(`You have used your ${env.LEARNER_QA_DAILY_LIMIT} questions for today. Try again tomorrow.`);
    }
    if (lastMinute >= MINUTE_LIMIT) {
      throw new TooManyRequestsError("You are asking quickly. Wait a minute and try again.");
    }
    const row = await tx.learnerQuestion.create({ data: input, select: { id: true } });
    return row.id;
  });
}

export async function recordTokens(id: string, usage: { inputTokens: number; outputTokens: number }): Promise<void> {
  await prisma.learnerQuestion.update({ where: { id }, data: usage });
}

export async function releaseQuestion(id: string): Promise<void> {
  await prisma.learnerQuestion.deleteMany({ where: { id } });
}
