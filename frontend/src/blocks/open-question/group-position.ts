export type OpenQuestionGroupPosition = "single" | "first" | "middle" | "last";

type BlockRow = { id: string; type: string };

export function getOpenQuestionGroupPosition(
  allBlocks: BlockRow[],
  blockId: string
): { position: OpenQuestionGroupPosition; index: number; total: number } {
  const idx = allBlocks.findIndex((b) => b.id === blockId);
  if (idx === -1) {
    return { position: "single", index: 0, total: 1 };
  }

  let start = idx;
  while (start > 0 && allBlocks[start - 1]?.type === "OPEN_QUESTION") {
    start -= 1;
  }

  let end = idx;
  while (end < allBlocks.length - 1 && allBlocks[end + 1]?.type === "OPEN_QUESTION") {
    end += 1;
  }

  const run = allBlocks.slice(start, end + 1).filter((b) => b.type === "OPEN_QUESTION");
  const index = run.findIndex((b) => b.id === blockId);
  const total = run.length;

  if (total <= 1) {
    return { position: "single", index: 0, total: 1 };
  }

  const position: OpenQuestionGroupPosition =
    index === 0 ? "first" : index === total - 1 ? "last" : "middle";

  return { position, index, total };
}
