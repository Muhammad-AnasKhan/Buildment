import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMdx from "remark-mdx";
import { visit } from "unist-util-visit";
import { QuizConfigSchema } from "@/blocks/quiz/schema";
import {
  normalizeCorrectOptionIds,
  normalizeQuizOptions,
  quizDraftToConfig,
  quizDraftFromJsxProperties,
} from "@/blocks/quiz/quiz-editor-utils";
import { parseJsxExpressionValue } from "@/mdx/jsx-attribute-value";
import type { ExtractedBlock } from "@/mdx/extract";

type MdxJsxElement = {
  type: "mdxJsxFlowElement" | "mdxJsxTextElement";
  name: string | null;
  attributes: Array<
    | { type: "mdxJsxExpressionAttribute"; value: string }
    | {
        type: "mdxJsxAttribute";
        name: string;
        value: string | null | undefined | { type: string; value: string };
      }
  >;
};

function parseMdx(source: string) {
  return unified().use(remarkParse).use(remarkMdx).parse(source);
}

function readJsxProperties(element: MdxJsxElement): Record<string, string> {
  const out: Record<string, string> = {};
  for (const attr of element.attributes ?? []) {
    if (attr.type === "mdxJsxAttribute") {
      const value = attr.value;
      if (typeof value === "string") {
        out[attr.name] = value;
      } else if (value && typeof value === "object" && "value" in value && typeof value.value === "string") {
        out[attr.name] = value.value;
      }
    }
  }
  return out;
}

function readExpressionProperties(element: MdxJsxElement): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const attr of element.attributes ?? []) {
    if (attr.type === "mdxJsxAttribute" && attr.name) {
      const value = attr.value;
      if (value && typeof value === "object" && "value" in value && typeof value.value === "string") {
        out[attr.name] = parseJsxExpressionValue(value.value);
      }
    }
  }
  return out;
}

export function extractQuizConfigFromElement(element: MdxJsxElement): ReturnType<typeof QuizConfigSchema.parse> | null {
  const props = readJsxProperties(element);
  const expressions = readExpressionProperties(element);
  const prompt = props.prompt || props.question || (typeof expressions.prompt === "string" ? expressions.prompt : "");
  const hasInline =
    Boolean(String(prompt).trim()) ||
    expressions.options !== undefined ||
    props.options !== undefined;

  if (!hasInline) return null;

  const draft = quizDraftFromJsxProperties({
    ...props,
    options: props.options ?? JSON.stringify(expressions.options ?? []),
    correctOptionIds:
      props.correctOptionIds ?? JSON.stringify(expressions.correctOptionIds ?? []),
    allowRetry:
      props.allowRetry ??
      (expressions.allowRetry !== undefined ? JSON.stringify(expressions.allowRetry) : "true"),
  });
  if (expressions.options) {
    draft.options = normalizeQuizOptions(expressions.options);
  }
  if (expressions.correctOptionIds) {
    draft.correctOptionIds = normalizeCorrectOptionIds(expressions.correctOptionIds, draft.options);
  }
  if (typeof prompt === "string" && prompt.trim()) draft.prompt = prompt.trim();
  if (expressions.quizType === "single" || expressions.quizType === "multiple" || expressions.quizType === "true-false") {
    draft.quizType = expressions.quizType;
  }

  const parsed = QuizConfigSchema.safeParse(quizDraftToConfig(draft));
  return parsed.success ? parsed.data : null;
}

/** Map block id -> parsed config extracted from MDX source (inline Quiz props). */
export function extractBlockConfigsFromSource(source: string): Map<string, unknown> {
  const tree = parseMdx(source);
  const configs = new Map<string, unknown>();

  visit(tree, ["mdxJsxFlowElement", "mdxJsxTextElement"], (node) => {
    const element = node as unknown as MdxJsxElement;
    if (element.name !== "Quiz") return;
    const props = readJsxProperties(element);
    const id = props.id?.trim();
    if (!id) return;
    const config = extractQuizConfigFromElement(element);
    if (config) configs.set(id, config);
  });

  return configs;
}

export function blockConfigFromSource(
  block: ExtractedBlock,
  configs: Map<string, unknown>
): unknown | undefined {
  if (block.blockType === "QUIZ") {
    return configs.get(block.id);
  }
  return configs.get(block.id);
}
