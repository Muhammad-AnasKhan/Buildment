import { prisma } from "../../db/prisma.js";
import type { Prisma } from "../../generated/prisma/index.js";
import {
  INTEGRITY_INFO_EVENTS,
  type IntegrityAttemptDetail,
  type IntegrityAttemptSummary,
  type IntegrityEventType,
} from "../../shared/api/integrity.js";
import type { SessionUser } from "../../types/auth.js";
import { NotFoundError } from "../../utils/errors.js";
import { requireCourseById } from "../teach/access.js";
import { signedSnapshotUrl, verifySnapshotSignature } from "./signed-url.js";
import { snapshotStore } from "./snapshot-store.js";

// The mentor's side of quiz integrity. Callers must have checked course access;
// learners never reach these functions (their API only returns a flag count).

const SUMMARY_LIMIT = 60;

const summarySelect = {
  id: true,
  chapterId: true,
  attempt: true,
  startedAt: true,
  lastSeenAt: true,
  cameraStatus: true,
  droppedEvents: true,
  snapshotCount: true,
  chapter: { select: { title: true } },
} satisfies Prisma.IntegrityAttemptSelect;

type SummaryRow = Prisma.IntegrityAttemptGetPayload<{ select: typeof summarySelect }>;

function toSummary(row: SummaryRow, counts: Partial<Record<IntegrityEventType, number>>): IntegrityAttemptSummary {
  const flagCount = Object.entries(counts).reduce(
    (total, [type, count]) => (INTEGRITY_INFO_EVENTS.has(type as IntegrityEventType) ? total : total + (count ?? 0)),
    0,
  );
  return {
    id: row.id,
    chapterId: row.chapterId,
    chapterTitle: row.chapter.title,
    attempt: row.attempt,
    startedAt: row.startedAt.toISOString(),
    lastSeenAt: row.lastSeenAt.toISOString(),
    cameraStatus: row.cameraStatus,
    flagCount,
    droppedEvents: row.droppedEvents,
    counts,
    snapshotCount: row.snapshotCount,
  };
}

async function countsByAttempt(attemptIds: string[]) {
  const grouped = attemptIds.length
    ? await prisma.integrityEvent.groupBy({ by: ["attemptId", "type"], where: { attemptId: { in: attemptIds } }, _count: { _all: true } })
    : [];
  const byAttempt = new Map<string, Partial<Record<IntegrityEventType, number>>>();
  for (const row of grouped) {
    const counts = byAttempt.get(row.attemptId) ?? {};
    counts[row.type] = row._count._all;
    byAttempt.set(row.attemptId, counts);
  }
  return byAttempt;
}

/** Newest attempts first, optionally for one chapter. Attempts with nothing to report are kept so mentors see clean runs too. */
export async function loadIntegritySummaries(enrollmentId: string, chapterId?: string): Promise<IntegrityAttemptSummary[]> {
  const rows = await prisma.integrityAttempt.findMany({
    where: { enrollmentId, ...(chapterId ? { chapterId } : {}) },
    orderBy: { startedAt: "desc" },
    take: SUMMARY_LIMIT,
    select: summarySelect,
  });
  const counts = await countsByAttempt(rows.map((row) => row.id));
  return rows.map((row) => toSummary(row, counts.get(row.id) ?? {}));
}

/** Every stored event and snapshot of one attempt, for anyone on the course team. */
export async function loadIntegrityAttemptDetail(user: SessionUser, attemptId: string): Promise<IntegrityAttemptDetail> {
  const row = await prisma.integrityAttempt.findUnique({
    where: { id: attemptId },
    select: {
      ...summarySelect,
      enrollment: { select: { courseId: true } },
      events: { orderBy: { at: "asc" }, select: { id: true, type: true, at: true, blockId: true, meta: true } },
      snapshots: { orderBy: { takenAt: "asc" }, select: { id: true, takenAt: true, deletedAt: true } },
    },
  });
  if (!row) throw new NotFoundError("Quiz attempt not found");
  await requireCourseById(user, row.enrollment.courseId, "SUBMISSION_EVALUATOR");

  const counts: Partial<Record<IntegrityEventType, number>> = {};
  for (const event of row.events) counts[event.type] = (counts[event.type] ?? 0) + 1;

  const now = Date.now();
  let expiresAt: Date | null = null;
  const snapshots = row.snapshots.map((snapshot) => {
    if (snapshot.deletedAt) return { id: snapshot.id, takenAt: snapshot.takenAt.toISOString(), url: null };
    const signed = signedSnapshotUrl(snapshot.id, now);
    expiresAt = signed.expiresAt;
    return { id: snapshot.id, takenAt: snapshot.takenAt.toISOString(), url: signed.url };
  });

  return {
    ...toSummary(row, counts),
    events: row.events.map((event) => ({
      id: event.id,
      type: event.type,
      at: event.at.toISOString(),
      blockId: event.blockId,
      meta: (event.meta as Record<string, unknown> | null) ?? null,
    })),
    snapshots,
    snapshotUrlExpiresAt: (expiresAt as Date | null)?.toISOString() ?? null,
  };
}

/** Streams one snapshot for a valid signed link. Anything else is a plain 404. */
export async function readSignedSnapshot(snapshotId: string, exp: unknown, sig: unknown): Promise<Buffer> {
  if (!verifySnapshotSignature(snapshotId, exp, sig)) throw new NotFoundError("Snapshot not found");
  const snapshot = await prisma.integritySnapshot.findUnique({ where: { id: snapshotId }, select: { storageKey: true, deletedAt: true } });
  if (!snapshot || snapshot.deletedAt) throw new NotFoundError("Snapshot not found");
  return snapshotStore().get(snapshot.storageKey);
}

export async function updateCourseIntegritySettings(user: SessionUser, courseId: string, integritySnapshots: boolean) {
  await requireCourseById(user, courseId);
  return prisma.course.update({ where: { id: courseId }, data: { integritySnapshots }, select: { integritySnapshots: true } });
}
