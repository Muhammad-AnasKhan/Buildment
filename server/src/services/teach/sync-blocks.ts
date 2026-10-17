import { blockDefinitions, isRegisteredBlockType } from "../../shared/blocks/definitions.js";
import { diffBlocks, extractBlocksFromSource } from "../../shared/mdx/extract.js";
import { blockConfigFromSource, extractBlockConfigsFromSource } from "../../shared/mdx/extract-block-config.js";
import { restoreInteractiveBlockTags } from "../../shared/mdx/restore-block-tags.js";
import { prisma } from "../../db/prisma.js";
import type { Prisma } from "../../generated/prisma/index.js";

// Keeps Block rows in step with the ids authored into a chapter's MDX
// (docs/02-content-authoring.mdx "Block extraction and the sync problem"):
//   new id              → create (config from inline props, else schema defaults)
//   id gone from source → archive, responses stay
//   subtree changed     → bump version, refresh order/config
// Runs on every draft save and again on publish.

type BlockUpdate = Prisma.BlockUpdateInput;

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

export async function syncChapterBlocksFromSource(chapterId: string, source: string): Promise<void> {
  const renderable = restoreInteractiveBlockTags(source);
  const extracted = extractBlocksFromSource(renderable);
  const configs = extractBlockConfigsFromSource(renderable);

  const existing = await prisma.block.findMany({
    where: { chapterId, archivedAt: null },
    select: { id: true, type: true, config: true, sourceHash: true },
  });
  const existingById = new Map(existing.map((row) => [row.id, row]));
  const extractedById = new Map(extracted.map((row) => [row.id, row]));
  const diff = diffBlocks(extracted, existing);

  await prisma.$transaction(async (tx) => {
    if (diff.create.length > 0) {
      await tx.block.createMany({
        data: diff.create.map((block) => {
          const type = block.blockType ?? "QUIZ";
          return {
            id: block.id,
            chapterId,
            type,
            order: block.order,
            config: asJson(initialConfig(type, blockConfigFromSource(block, configs))),
            sourceHash: block.sourceHash,
          };
        }),
      });
    }

    if (diff.archiveIds.length > 0) {
      await tx.block.updateMany({
        where: { id: { in: diff.archiveIds }, chapterId },
        data: { archivedAt: new Date() },
      });
    }

    // Changed subtree: new version. Hash never recorded: backfill without a version bump.
    for (const { rows, bumpVersion } of [
      { rows: diff.bump, bumpVersion: true },
      { rows: diff.backfill, bumpVersion: false },
    ]) {
      for (const block of rows) {
        const extractedBlock = extractedById.get(block.id);
        const existingBlock = existingById.get(block.id);
        const data: BlockUpdate = { sourceHash: block.sourceHash };
        if (bumpVersion) data.version = { increment: 1 };
        if (extractedBlock) data.order = extractedBlock.order;
        const inlineConfig = extractedBlock && blockConfigFromSource(extractedBlock, configs);
        if (inlineConfig && existingBlock && isRegisteredBlockType(existingBlock.type)) {
          const parsed = blockDefinitions[existingBlock.type].schema.safeParse(inlineConfig);
          if (parsed.success) data.config = asJson(parsed.data);
        }
        await tx.block.update({ where: { id: block.id }, data });
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
      await tx.block.update({ where: { id: block.id }, data: { config: asJson(parsed.data), order: block.order } });
    }
  });
}
