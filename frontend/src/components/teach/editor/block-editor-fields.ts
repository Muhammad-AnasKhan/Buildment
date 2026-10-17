// Match the learner components' children-first rendering. Do not offer fields
// that are ignored while the block has nested content.
const overriddenByChildren: Record<string, readonly string[]> = {
  ArchNode: ["label", "name"],
  Callout: ["content"],
  CompareColumn: ["content"],
  ComparePanel: ["leftLabel", "leftContent", "rightLabel", "rightContent"],
  TerminalLine: ["content", "command"],
  CheckpointIntro: ["content"],
  InterestingRead: ["body", "content"],
};

export function isVisibleBlockField(block: string, field: string, hasChildren: boolean) {
  if (field === "id" || (block === "FaqItem" && field === "answer")) return false;
  return !hasChildren || !overriddenByChildren[block]?.includes(field);
}

export const blockContentLabels: Record<string, string> = {
  FaqItem: "Answer",
  ArchNode: "Node content",
  TerminalLine: "Line content",
  CompareColumn: "Column content",
  FaqGroup: "Questions",
  ArchitectureDiagram: "Nodes",
  TraceRequest: "Steps",
  FileTree: "Files",
  TerminalBlock: "Lines",
};
