import { randomUUID } from "node:crypto";
import { prisma } from "../../db/prisma.js";
import type { Prisma } from "../../generated/prisma/index.js";
import {
  INTEGRITY_INFO_EVENTS,
  INTEGRITY_LIMITS,
  type IntegrityAttemptSession,
  type IntegrityCameraStatus,
  type IntegrityEventInput,
  type IntegrityEventsResult,
} from "../../shared/api/integrity.js";
import type { SessionUser } from "../../types/auth.js";
import { BadRequestError, ForbiddenError, NotFoundError, TooManyRequestsError } from "../../utils/errors.js";
import { requireBlockSubmissionAccess } from "../enrollment/api-learn-access.js";
import { cameraPhotosAvailable, snapshotStore, SNAPSHOT_PREFIX } from "./snapshot-store.js";

// The learner's side of quiz integrity. Every call here is best effort from the
// browser's point of view: a failure must never stop the quiz, so the client
// ignores errors and the server keeps each write small and idempotent.

const FLAG_TYPES = { notIn: [...INTEGRITY_INFO_EVENTS] };
/** Browser clocks drift and events are buffered offline, so `at` is clamped to the attempt. */
const CLOCK_SLACK_MS = 2 * 60 * 1000;

async function countFlags(attemptId: string): Promise<number> {
  return prisma.integrityEvent.count({ where: { attemptId, type: FLAG_TYPES } });
}

/**
 * The attempt a learner is on now: 1 + their highest multiple-choice attempt in the
 * chapter. Only quiz answers count, so submitting an open question or code exercise
 * in the same chapter does not start a new proctored attempt.
 */
async function currentAttemptNumber(enrollmentId: string, chapterId: string): Promise<number> {
  const submitted = await prisma.response.aggregate({
    _max: { attempt: true },
    where: { enrollmentId, status: { not: "DRAFT" }, block: { chapterId, type: "QUIZ" } },
  });
  return (submitted._max.attempt ?? 0) + 1;
}

/** Opens (or resumes, after a reload or power cut) the proctored attempt for a quiz chapter. */
export async function openIntegrityAttempt(user: SessionUser | undefined, chapterId: string): Promise<IntegrityAttemptSession> {
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    select: { id: true, courseId: true, readerMode: true, course: { select: { integritySnapshots: true } } },
  });
  if (!chapter || chapter.readerMode !== "QUIZ") throw new NotFoundError("Quiz chapter not found");
  const enrollment = await requireBlockSubmissionAccess(chapter.courseId, user);

  const attemptNumber = await currentAttemptNumber(enrollment.id, chapterId);
  const cameraEnabled = chapter.course.integritySnapshots && cameraPhotosAvailable();

  const attempt = await prisma.integrityAttempt.upsert({
    where: { enrollmentId_chapterId_attempt: { enrollmentId: enrollment.id, chapterId, attempt: attemptNumber } },
    create: { enrollmentId: enrollment.id, chapterId, attempt: attemptNumber },
    update: { lastSeenAt: new Date() },
    select: { id: true, attempt: true, cameraStatus: true, startedAt: true },
  });

  return {
    attemptId: attempt.id,
    attempt: attempt.attempt,
    startedAt: attempt.startedAt.toISOString(),
    flagCount: await countFlags(attempt.id),
    camera: {
      enabled: cameraEnabled,
      status: attempt.cameraStatus,
      intervalSeconds: INTEGRITY_LIMITS.snapshotIntervalSeconds,
      width: INTEGRITY_LIMITS.snapshotWidth,
      height: INTEGRITY_LIMITS.snapshotHeight,
      retentionDays: INTEGRITY_LIMITS.retentionDays,
    },
  };
}

async function requireOwnAttempt(user: SessionUser | undefined, attemptId: string) {
  if (!user) throw new ForbiddenError("Sign in to continue.");
  const attempt = await prisma.integrityAttempt.findUnique({
    where: { id: attemptId },
    select: {
      id: true,
      startedAt: true,
      cameraStatus: true,
      enrollment: { select: { userId: true, course: { select: { integritySnapshots: true } } } },
    },
  });
  if (!attempt || attempt.enrollment.userId !== user.id) throw new NotFoundError("Quiz attempt not found");
  return attempt;
}

function clampTime(value: string, earliest: Date, now: Date): Date {
  const at = new Date(value);
  if (Number.isNaN(at.getTime())) return now;
  if (at.getTime() < earliest.getTime() - CLOCK_SLACK_MS || at.getTime() > now.getTime() + CLOCK_SLACK_MS) return now;
  return at;
}

/**
 * Appends a batch of events. Rows are inserted, never rewritten, so concurrent
 * flushes cannot lose each other's events. The attempt row is locked while the
 * cap is checked, and `clientId` makes a retried batch a no-op.
 */
export async function recordIntegrityEvents(
  user: SessionUser | undefined,
  attemptId: string,
  events: IntegrityEventInput[],
): Promise<IntegrityEventsResult> {
  const attempt = await requireOwnAttempt(user, attemptId);
  const now = new Date();

  const accepted = await prisma.$transaction(async (tx) => {
    const [locked] = await tx.$queryRaw<Array<{ eventCount: number }>>`
      SELECT "eventCount" FROM "IntegrityAttempt" WHERE id = ${attemptId} FOR UPDATE`;
    const room = Math.max(0, INTEGRITY_LIMITS.eventsPerAttempt - (locked?.eventCount ?? 0));
    // A second screen is a state, not an action: one row per attempt, whatever the browser sends.
    let hasSecondScreen = events.some((event) => event.type === "SECOND_SCREEN")
      && (await tx.integrityEvent.count({ where: { attemptId, type: "SECOND_SCREEN" } })) > 0;
    const deduped = events.filter((event) => {
      if (event.type !== "SECOND_SCREEN") return true;
      if (hasSecondScreen) return false;
      hasSecondScreen = true;
      return true;
    });
    const kept = deduped.slice(0, room);
    const created = kept.length
      ? await tx.integrityEvent.createMany({
          data: kept.map((event) => ({
            attemptId,
            clientId: event.id,
            type: event.type,
            at: clampTime(event.at, attempt.startedAt, now),
            blockId: event.blockId ?? null,
            meta: (event.meta ?? undefined) as Prisma.InputJsonValue | undefined,
          })),
          skipDuplicates: true,
        })
      : { count: 0 };
    await tx.integrityAttempt.update({
      where: { id: attemptId },
      data: {
        eventCount: { increment: created.count },
        droppedEvents: { increment: deduped.length - kept.length },
        lastSeenAt: now,
      },
    });
    return created.count;
  });

  return { accepted, flagCount: await countFlags(attemptId) };
}

/** Records the learner's camera choice. Ignored when the course has snapshots off. */
export async function setIntegrityCamera(
  user: SessionUser | undefined,
  attemptId: string,
  status: Exclude<IntegrityCameraStatus, "NOT_REQUESTED">,
): Promise<{ status: IntegrityCameraStatus }> {
  const attempt = await requireOwnAttempt(user, attemptId);
  if (!attempt.enrollment.course.integritySnapshots) return { status: "NOT_REQUESTED" };
  const updated = await prisma.integrityAttempt.update({
    where: { id: attemptId },
    data: { cameraStatus: status, lastSeenAt: new Date() },
    select: { cameraStatus: true },
  });
  return { status: updated.cameraStatus };
}

function isJpeg(bytes: Buffer): boolean {
  return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
}

/** Stores one low-resolution camera still in private storage. */
export async function saveIntegritySnapshot(
  user: SessionUser | undefined,
  attemptId: string,
  bytes: Buffer,
): Promise<{ id: string; takenAt: string }> {
  const attempt = await requireOwnAttempt(user, attemptId);
  if (!attempt.enrollment.course.integritySnapshots || !cameraPhotosAvailable()) {
    throw new ForbiddenError("Camera snapshots are off for this course.", "SNAPSHOTS_DISABLED");
  }
  if (attempt.cameraStatus !== "ON") throw new ForbiddenError("Turn the camera on first.", "CAMERA_NOT_ON");
  if (!bytes.length || bytes.length > INTEGRITY_LIMITS.snapshotMaxBytes || !isJpeg(bytes)) {
    throw new BadRequestError("Send one small JPEG image.", "INVALID_SNAPSHOT");
  }

  const latest = await prisma.integritySnapshot.findFirst({
    where: { attemptId },
    orderBy: { takenAt: "desc" },
    select: { takenAt: true },
  });
  const tooSoon = latest && Date.now() - latest.takenAt.getTime() < INTEGRITY_LIMITS.snapshotMinGapSeconds * 1000;
  const count = await prisma.integritySnapshot.count({ where: { attemptId } });
  if (tooSoon || count >= INTEGRITY_LIMITS.snapshotsPerAttempt) {
    throw new TooManyRequestsError("Snapshot skipped. The next one is due later.");
  }

  const takenAt = new Date();
  const key = `${SNAPSHOT_PREFIX}${takenAt.toISOString().slice(0, 10)}/${attemptId}/${randomUUID().replaceAll("-", "")}.jpg`;
  await snapshotStore().put(key, bytes);
  const [snapshot] = await prisma.$transaction([
    prisma.integritySnapshot.create({ data: { attemptId, storageKey: key, bytes: bytes.length, takenAt }, select: { id: true } }),
    prisma.integrityAttempt.update({ where: { id: attemptId }, data: { snapshotCount: { increment: 1 }, lastSeenAt: takenAt } }),
  ]);
  return { id: snapshot.id, takenAt: takenAt.toISOString() };
}
