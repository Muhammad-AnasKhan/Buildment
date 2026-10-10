import "server-only";

import { prisma } from "@/server/db";
import { blockRegistry, isRegisteredBlockType } from "@/blocks/registry";
import { restoreInteractiveBlockTags } from "@/mdx/restore-block-tags";
import { diffBlocks, extractBlocksFromSource } from "@/mdx/extract";
import { blockConfigFromSource, extractBlockConfigsFromSource } from "@/mdx/extract-block-config";

type BlockUpdateData = Parameters<typeof prisma.block.update>[0]["data"];
type BlockCreateManyData = NonNullable<Parameters<typeof prisma.block.createMany>[0]>["data"];
type BlockCreateManyRow = BlockCreateManyData extends readonly (infer Row)[]
  ? Row
  : BlockCreateManyData extends (infer Row)[]
    ? Row
    : BlockCreateManyData;

function asBlockConfigJson(
  config: unknown
): BlockCreateManyRow extends { config?: infer C } ? C : never {
  return config as BlockCreateManyRow extends { config?: infer C } ? C : never;
}

export async function syncChapterBlocksFromSource(chapterId: string, source: string) {
  const renderable = restoreInteractiveBlockTags(source);
  const extracted = extractBlocksFromSource(renderable);
  const configs = extractBlockConfigsFromSource(renderable);

  const existing = await prisma.block.findMany({
    where: { chapterId, archivedAt: null },
    select: { id: true, type: true, config: true, sourceHash: true },
  });
  const diff = diffBlocks(extracted, existing);

  await prisma.$transaction(async (tx) => {
    if (diff.create.length > 0) {
      await tx.block.createMany({
        data: diff.create.map((block) => {
          const inlineConfig = blockConfigFromSource(block, configs);
          const type = block.blockType ?? "QUIZ";
          const fallback = isRegisteredBlockType(type)
            ? blockRegistry[type].schema.parse({})
            : {};
          const config =
            inlineConfig && isRegisteredBlockType(type)
              ? blockRegistry[type].schema.parse(inlineConfig)
              : fallback;
          return {
            id: block.id,
            chapterId,
            type,
            order: block.order,
            config: asBlockConfigJson(config),
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

    for (const block of diff.bump) {
      const extractedBlock = extracted.find((row) => row.id === block.id);
      const inlineConfig =
        extractedBlock && blockConfigFromSource(extractedBlock, configs);
      const existingBlock = existing.find((row) => row.id === block.id);
      const data: BlockUpdateData = {
        version: { increment: 1 },
        sourceHash: block.sourceHash,
      };
      if (extractedBlock) data.order = extractedBlock.order;
      if (inlineConfig && existingBlock && isRegisteredBlockType(existingBlock.type)) {
        data.config = asBlockConfigJson(
          blockRegistry[existingBlock.type].schema.parse(inlineConfig)
        );
      }
      await tx.block.update({ where: { id: block.id }, data });
    }

    for (const block of diff.backfill) {
      const extractedBlock = extracted.find((row) => row.id === block.id);
      const inlineConfig =
        extractedBlock && blockConfigFromSource(extractedBlock, configs);
      const existingBlock = existing.find((row) => row.id === block.id);
      const data: BlockUpdateData = {
        sourceHash: block.sourceHash,
      };
      if (extractedBlock) data.order = extractedBlock.order;
      if (inlineConfig && existingBlock && isRegisteredBlockType(existingBlock.type)) {
        data.config = asBlockConfigJson(
          blockRegistry[existingBlock.type].schema.parse(inlineConfig)
        );
      }
      await tx.block.update({ where: { id: block.id }, data });
    }

    // Inline edits that did not change subtree hash still need config refresh (e.g. option label).
    for (const block of extracted) {
      if (diff.create.some((row) => row.id === block.id)) continue;
      if (diff.bump.some((row) => row.id === block.id)) continue;
      if (diff.backfill.some((row) => row.id === block.id)) continue;
      const inlineConfig = blockConfigFromSource(block, configs);
      if (!inlineConfig) continue;
      const existingBlock = existing.find((row) => row.id === block.id);
      if (!existingBlock || !isRegisteredBlockType(existingBlock.type)) continue;
      const parsed = blockRegistry[existingBlock.type].schema.safeParse(inlineConfig);
      if (!parsed.success) continue;
      await tx.block.update({
        where: { id: block.id },
        data: { config: asBlockConfigJson(parsed.data), order: block.order },
      });
    }
  });
}
