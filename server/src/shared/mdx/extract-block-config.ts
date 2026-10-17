import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMdx from "remark-mdx";
import { visit } from "unist-util-visit";
import { QuizConfigSchema } from "../blocks/quiz/schema.js";
import {
  normalizeCorrectOptionIds,
  normalizeQuizOptions,
  quizDraftToConfig,
  quizDraftFromJsxProperties,
} from "../blocks/quiz/editor-utils.js";
import { parseJsxExpressionValue } from "./jsx-attribute-value.js";
import type { ExtractedBlock } from "./extract.js";

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

/** Map block id -> config extracted from assessment attributes. */
export function extractBlockConfigsFromSource(source: string): Map<string, unknown> {
  const tree = parseMdx(source);
  const configs = new Map<string, unknown>();

  visit(tree, ["mdxJsxFlowElement", "mdxJsxTextElement"], (node) => {
    const element = node as unknown as MdxJsxElement;
    if (!["Quiz", "Predict", "OpenQuestion", "CodeExercise", "MustRead", "Steps", "ProjectPreview", "LearningObjectives", "ChapterRecap", "VideoBlock", "VisualWalkthrough", "VisualDiagram", "Roadmap"].includes(element.name ?? "")) return;
    const props = readJsxProperties(element);
    const id = props.id?.trim();
    if (!id) return;
    const { id: _id, ...strings } = props;
    const inline = { ...strings, ...readExpressionProperties(element) };
    if (Object.keys(inline).length === 0) return;
    // Preserve incomplete inline edits so publish validation cannot fall back to
    // an older stored answer. Draft saves keep these edits in chapter.source.
    const config = element.name === "Quiz"
      ? extractQuizConfigFromElement(element) ?? inline
      : inline;
    configs.set(id, config);
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

/** Detect quiz JSX and authoring fences, including blocks without IDs. */
export function hasQuizBlocks(source: string): boolean {
  let found = false;
  visit(parseMdx(source), node => {
    if ((node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") && (node as unknown as MdxJsxElement).name === "Quiz") found = true;
    if (node.type === "code" && "lang" in node && node.lang === "quiz") found = true;
  });
  return found;
}

/** Quiz flow is a sequence of activities, without lesson prose or presentation blocks. */
export function isActivityOnlySource(source: string): boolean {
  const allowed = new Set(["Quiz", "OpenQuestion", "Predict", "CodeExercise"]);
  return parseMdx(source).children.every(node =>
    node.type === "mdxJsxFlowElement" && allowed.has((node as unknown as MdxJsxElement).name ?? "")
  );
}
