import { blockDefinitions, isRegisteredBlockType } from "../../shared/blocks/definitions.js";
import { QuizConfigSchema } from "../../shared/blocks/quiz/schema.js";
import { diffBlocks, extractBlocksFromSource } from "../../shared/mdx/extract.js";
import { blockConfigFromSource, extractBlockConfigsFromSource } from "../../shared/mdx/extract-block-config.js";
import { restoreInteractiveBlockTags } from "../../shared/mdx/restore-block-tags.js";
import { prisma } from "../../db/prisma.js";
import { Prisma, type Block } from "../../generated/prisma/index.js";
import { ConflictError } from "../../utils/errors.js";

// Keeps Block rows in step with the ids authored into a chapter's MDX
// (docs/02-content-authoring.mdx "Block extraction and the sync problem"):
//   new id              → create (config from inline props, else schema defaults)
//   id gone from source → archive, responses stay
//   subtree changed     → bump version, refresh order/config
// Runs on every draft save and again on publish.

export const BLOCK_SYNC_BATCH_SIZE = 200;
type BlockPatch = { id: string; chapterId: string; order?: number; sourceHash?: string; config?: Prisma.InputJsonValue; bumpVersion?: boolean };

/**
 * Config for a block seen for the first time. A placeholder without inline props
 * is stored as-is so autosave keeps working; publish reports it as incomplete.
 */
function initialConfig(type: string, inlineConfig: unknown): unknown {
  if (!isRegisteredBlockType(type)) return inlineConfig ?? {};
  const parsed = blockDefinitions[type].schema.safeParse(inlineConfig ?? {});
  return parsed.success ? parsed.data : (inlineConfig ?? {});
}

function asJson(config: unknown): Prisma.InputJsonValue {
  return config as Prisma.InputJsonValue;
}

export function prepareChapterBlockSync(source: string) {
  const renderable = restoreInteractiveBlockTags(source);
  return { extracted: extractBlocksFromSource(renderable), configs: extractBlockConfigsFromSource(renderable) };
}

export type ExistingSyncBlock = Pick<Block, "id" | "type" | "config" | "sourceHash">;

/** Prepare writes before opening the publishing transaction. */
export function planChapterBlockSync(
  chapterId: string,
  content: ReturnType<typeof prepareChapterBlockSync>,
  existing: ExistingSyncBlock[],
) {
  const { extracted, configs } = content;
  const existingById = new Map(existing.map((row) => [row.id, row]));
  const extractedById = new Map(extracted.map((row) => [row.id, row]));
  const diff = diffBlocks(extracted, existing);

  const creates: Prisma.BlockCreateManyInput[] = diff.create.map((block) => {
    const type = block.blockType ?? "QUIZ";
    return {
      id: block.id,
      chapterId,
      type,
      order: block.order,
      config: asJson(initialConfig(type, blockConfigFromSource(block, configs))),
      sourceHash: block.sourceHash,
    };
  });
  const updates: BlockPatch[] = [];

  // Repair legacy scalar quiz labels without replacing the activity or its responses.
  for (const block of existing) {
    if (block.type !== "QUIZ" || !extractedById.has(block.id) || configs.has(block.id)) continue;
    const raw = block.config as { options?: { label?: unknown }[] } | null;
    if (!Array.isArray(raw?.options) || !raw.options.some(option => option && (typeof option.label === "number" || typeof option.label === "boolean"))) continue;
    const normalized = QuizConfigSchema.safeParse(block.config);
    if (normalized.success) updates.push({ id: block.id, chapterId, config: asJson(normalized.data) });
  }

  // Changed subtree: new version. Hash never recorded: backfill without a version bump.
  for (const { rows, bumpVersion } of [
    { rows: diff.bump, bumpVersion: true },
    { rows: diff.backfill, bumpVersion: false },
  ]) {
    for (const block of rows) {
      const extractedBlock = extractedById.get(block.id);
      const existingBlock = existingById.get(block.id);
      const data: BlockPatch = { id: block.id, chapterId, sourceHash: block.sourceHash, bumpVersion };
      if (extractedBlock) data.order = extractedBlock.order;
      const inlineConfig = extractedBlock && blockConfigFromSource(extractedBlock, configs);
      if (inlineConfig && existingBlock && isRegisteredBlockType(existingBlock.type)) {
        const parsed = blockDefinitions[existingBlock.type].schema.safeParse(inlineConfig);
        if (parsed.success) data.config = asJson(parsed.data);
      }
      updates.push(data);
    }
  }

  // Inline edits that leave the subtree hash unchanged (e.g. an option label) still refresh config.
  const touched = new Set([...diff.create, ...diff.bump, ...diff.backfill].map((row) => row.id));
  for (const block of extracted) {
    if (touched.has(block.id)) continue;
    const inlineConfig = blockConfigFromSource(block, configs);
    const existingBlock = existingById.get(block.id);
    if (!inlineConfig || !existingBlock || !isRegisteredBlockType(existingBlock.type)) continue;
    const parsed = blockDefinitions[existingBlock.type].schema.safeParse(inlineConfig);
    if (!parsed.success) continue;
    updates.push({ id: block.id, chapterId, config: asJson(parsed.data), order: block.order });
  }
  // A label repair and a hash backfill can target the same row; combine them into one update.
  const merged = new Map<string, BlockPatch>();
  for (const update of updates) merged.set(update.id, { ...merged.get(update.id), ...update });
  return { creates, archives: diff.archiveIds.map(id => ({ id, chapterId })), updates: [...merged.values()] };
}

function* batches<T>(rows: T[]) {
  for (let index = 0; index < rows.length; index += BLOCK_SYNC_BATCH_SIZE) yield rows.slice(index, index + BLOCK_SYNC_BATCH_SIZE);
}

/** Batch across chapters, retaining activity IDs, responses and per-activity version semantics. */
export async function applyBlockSyncPlans(tx: Prisma.TransactionClient, plans: ReturnType<typeof planChapterBlockSync>[]) {
  for (const data of batches(plans.flatMap(plan => plan.creates))) await tx.block.createMany({ data });
  const archivedAt = new Date();
  for (const rows of batches(plans.flatMap(plan => plan.archives))) {
    await tx.block.updateMany({ where: { OR: rows, archivedAt: null }, data: { archivedAt } });
  }
  for (const rows of batches(plans.flatMap(plan => plan.updates))) {
    const payload = rows.map(row => ({ ...row, hasSourceHash: row.sourceHash !== undefined, hasConfig: row.config !== undefined, bumpVersion: row.bumpVersion ?? false }));
    // Parameterized JSON keeps independently configured rows in one bounded database update.
    const count = await tx.$executeRaw(Prisma.sql`
      UPDATE "Block" AS block
      SET "order" = COALESCE(patch."order", block."order"),
          "sourceHash" = CASE WHEN patch."hasSourceHash" THEN patch."sourceHash" ELSE block."sourceHash" END,
          "config" = CASE WHEN patch."hasConfig" THEN patch."config" ELSE block."config" END,
          "version" = block."version" + CASE WHEN patch."bumpVersion" THEN 1 ELSE 0 END
      FROM jsonb_to_recordset(${JSON.stringify(payload)}::jsonb) AS patch(
        "id" text, "chapterId" text, "order" integer, "sourceHash" text, "config" jsonb,
        "hasSourceHash" boolean, "hasConfig" boolean, "bumpVersion" boolean
      )
      WHERE block."id" = patch."id" AND block."chapterId" = patch."chapterId" AND block."archivedAt" IS NULL
    `);
    if (count !== rows.length) throw new ConflictError("Chapter activities changed during publishing. Please try again.");
  }
}

export async function syncChapterBlocksFromSource(chapterId: string, source: string, transaction?: Prisma.TransactionClient): Promise<void> {
  const content = prepareChapterBlockSync(source);
  const db = transaction ?? prisma;
  const existing = await db.block.findMany({
    where: { chapterId, archivedAt: null },
    select: { id: true, type: true, config: true, sourceHash: true },
  });
  const plan = planChapterBlockSync(chapterId, content, existing);
  if (transaction) await applyBlockSyncPlans(transaction, [plan]);
  else await prisma.$transaction(tx => applyBlockSyncPlans(tx, [plan]), { timeout: 60000 });
}
