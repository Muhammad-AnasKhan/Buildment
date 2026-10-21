import { prisma } from "../../db/prisma.js";
import { INTEGRITY_LIMITS } from "../../shared/api/integrity.js";
import { logger } from "../../utils/logger.js";
import { snapshotStorageAvailable, snapshotStore, type SnapshotStore } from "../integrity/snapshot-store.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const BATCH = 200;

/**
 * Deletes quiz camera stills older than the retention window. Snapshot rows stay
 * with `deletedAt` set so mentors still see that a photo existed, and every flag
 * is kept. A final sweep of the storage prefix also removes images whose rows
 * went away with a deleted enrollment or course, so nothing outlives 30 days.
 */
export async function runIntegrityRetention(
  now = new Date(),
  store: SnapshotStore | null = snapshotStorageAvailable() ? snapshotStore() : null,
): Promise<{ deleted: number; failed: number; swept: number }> {
  if (!store) return { deleted: 0, failed: 0, swept: 0 };
  const cutoff = new Date(now.getTime() - INTEGRITY_LIMITS.retentionDays * DAY_MS);

  let deleted = 0;
  // Images storage refused to delete keep deletedAt null, so the next run retries them;
  // this run skips them so it cannot loop on the same batch.
  const failedIds: string[] = [];
  for (;;) {
    const due = await prisma.integritySnapshot.findMany({
      where: { deletedAt: null, takenAt: { lt: cutoff }, id: { notIn: failedIds } },
      orderBy: { takenAt: "asc" },
      take: BATCH,
      select: { id: true, storageKey: true },
    });
    if (due.length === 0) break;
    const failedKeys = new Set(await store.remove(due.map((snapshot) => snapshot.storageKey)));
    const done = due.filter((snapshot) => !failedKeys.has(snapshot.storageKey));
    failedIds.push(...due.filter((snapshot) => failedKeys.has(snapshot.storageKey)).map((snapshot) => snapshot.id));
    if (done.length) {
      await prisma.integritySnapshot.updateMany({ where: { id: { in: done.map((snapshot) => snapshot.id) } }, data: { deletedAt: now } });
    }
    deleted += done.length;
    if (due.length < BATCH) break;
  }
  if (failedIds.length) logger.warn({ failed: failedIds.length }, "[jobs] some integrity snapshots could not be deleted; retrying next run");

  let swept = 0;
  try {
    swept = await store.sweep(cutoff);
  } catch (error) {
    logger.warn({ err: error }, "[jobs] integrity snapshot sweep failed; rows were still cleaned up");
  }
  return { deleted, failed: failedIds.length, swept };
}
