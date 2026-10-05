import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMdx from "remark-mdx";
import remarkGfm from "remark-gfm";
import { visit } from "unist-util-visit";
import { remarkChecklist } from "@/mdx/remark-checklist";
import { remarkLearningLog } from "@/mdx/remark-learning-log";
import { parseLearningLog, type LearningLogData } from "@/lib/learning-log";

export type ReflectionRequirements = {
  checklistIds: string[];
  questionIds: string[];
};

type JsxAttribute = {
  name?: string;
  value?: string | { value?: string } | null;
};

function expressionSource(attribute: JsxAttribute | undefined): string | null {
  if (!attribute || attribute.value == null) return null;
  if (typeof attribute.value === "string") return attribute.value;
  if (typeof attribute.value.value === "string") return attribute.value.value;
  return null;
}

function idsFromJson(raw: string): string[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item) => {
      if (!item || typeof item !== "object" || !("id" in item)) return [];
      const id = (item as { id?: unknown }).id;
      return typeof id === "string" && id.length > 0 ? [id] : [];
    });
  } catch {
    return [];
  }
}

/** Checklist item ids and learning-log question ids, using the same transforms as the reader. */
export function extractReflectionRequirements(source: string): ReflectionRequirements {
  let tree: ReturnType<ReturnType<typeof unified>["parse"]>;
  try {
    const processor = unified()
      .use(remarkParse)
      .use(remarkMdx)
      .use(remarkGfm)
      .use(remarkChecklist)
      .use(remarkLearningLog);
    tree = processor.runSync(processor.parse(source));
  } catch {
    return { checklistIds: [], questionIds: [] };
  }

  const checklistIds: string[] = [];
  const questionIds: string[] = [];

  visit(tree, (node) => {
    if (!node || typeof node !== "object" || !("type" in node)) return;
    const type = (node as { type?: string }).type;
    if (type !== "mdxJsxFlowElement" && type !== "mdxJsxTextElement") return;
    const element = node as { name?: string; attributes?: JsxAttribute[] };
    const field = element.name === "Checklist" ? "items" : element.name === "LearningLog" ? "questions" : null;
    if (!field) return;
    const raw = expressionSource(element.attributes?.find((attribute) => attribute.name === field));
    if (!raw) return;
    const ids = idsFromJson(raw);
    if (field === "items") checklistIds.push(...ids);
    else questionIds.push(...ids);
  });

  return { checklistIds, questionIds };
}

export function reflectionSatisfied(requirements: ReflectionRequirements, log: LearningLogData): boolean {
  for (const id of requirements.checklistIds) {
    if (log.checklist?.[id]?.checked !== true) return false;
  }
  for (const id of requirements.questionIds) {
    if (!(log.answers[id]?.text ?? "").trim()) return false;
  }
  return true;
}

export function milestoneReflectionBlocked(source: string, learningLog: unknown): boolean {
  return !reflectionSatisfied(extractReflectionRequirements(source), parseLearningLog(learningLog));
}
