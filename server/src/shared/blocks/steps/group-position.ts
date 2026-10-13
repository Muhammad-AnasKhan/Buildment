export type StepsGroupPosition = "single" | "first" | "middle" | "last";

type BlockRow = { id: string; type: string };

export function getStepsGroupPosition(
  allBlocks: BlockRow[],
  blockId: string
): { position: StepsGroupPosition; index: number; total: number } {
  const idx = allBlocks.findIndex((b) => b.id === blockId);
  if (idx === -1) {
    return { position: "single", index: 0, total: 1 };
  }

  let start = idx;
  while (start > 0 && allBlocks[start - 1]?.type === "STEPS") {
    start -= 1;
  }

  let end = idx;
  while (end < allBlocks.length - 1 && allBlocks[end + 1]?.type === "STEPS") {
    end += 1;
  }

  const run = allBlocks.slice(start, end + 1).filter((b) => b.type === "STEPS");
  const index = run.findIndex((b) => b.id === blockId);
  const total = run.length;

  if (total <= 1) {
    return { position: "single", index: 0, total: 1 };
  }

  const position: StepsGroupPosition =
    index === 0 ? "first" : index === total - 1 ? "last" : "middle";

  return { position, index, total };
}
