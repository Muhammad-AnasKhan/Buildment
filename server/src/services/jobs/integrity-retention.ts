import { prisma } from "../../db/prisma.js";
import { INTEGRITY_LIMITS } from "../../shared/api/integrity.js";
import { logger } from "../../utils/logger.js";
import { snapshotStorageAvailable, snapshotStore } from "../integrity/snapshot-store.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const BATCH = 200;

/**
 * Deletes quiz camera stills older than the retention window. Snapshot rows stay
 * with `deletedAt` set so mentors still see that a photo existed, and every flag
 * is kept. A final sweep of the storage prefix also removes images whose rows
 * went away with a deleted enrollment or course, so nothing outlives 30 days.
 */
export async function runIntegrityRetention(now = new Date()): Promise<{ deleted: number; swept: number }> {
  if (!snapshotStorageAvailable()) return { deleted: 0, swept: 0 };
  const cutoff = new Date(now.getTime() - INTEGRITY_LIMITS.retentionDays * DAY_MS);
  const store = snapshotStore();

  let deleted = 0;
  for (;;) {
    const due = await prisma.integritySnapshot.findMany({
      where: { deletedAt: null, takenAt: { lt: cutoff } },
      orderBy: { takenAt: "asc" },
      take: BATCH,
      select: { id: true, storageKey: true },
    });
    if (due.length === 0) break;
    await store.remove(due.map((snapshot) => snapshot.storageKey));
    await prisma.integritySnapshot.updateMany({ where: { id: { in: due.map((snapshot) => snapshot.id) } }, data: { deletedAt: now } });
    deleted += due.length;
    if (due.length < BATCH) break;
  }

  let swept = 0;
  try {
    swept = await store.sweep(cutoff);
  } catch (error) {
    logger.warn({ err: error }, "[jobs] integrity snapshot sweep failed; rows were still cleaned up");
  }
  return { deleted, swept };
}
