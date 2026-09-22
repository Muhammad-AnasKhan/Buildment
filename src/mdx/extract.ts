import { createHash } from "node:crypto";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMdx from "remark-mdx";
import { visit } from "unist-util-visit";

// Block extraction and the sync diff — see docs/02-content-authoring.mdx
// "Block extraction and the sync problem". This module is PURE: it turns MDX
// source into block descriptors and diffs them against what the DB already
// knows. Applying the diff to the database happens at publish time (M1
// scaffolding — real block config extraction plugs in during M2, when the
// editor starts authoring blocks).
//
// The join key is the block `id` authored into the MDX. Rules:
//   new id               -> create Block row
//   id missing from MDX  -> soft-delete (archivedAt), keep responses
//   id present, changed  -> bump Block.version

/** MDX JSX tag name -> BlockType. Only registered types are ever created. */
export const BLOCK_TAG_NAMES = {
  Quiz: "QUIZ",
  Test: "TEST",
  MustRead: "MUST_READ",
  OpenQuestion: "OPEN_QUESTION",
  CodeExercise: "CODE",
  CodeBlock: "CODE",
  Predict: "PREDICT",
  Steps: "STEPS",
  ProjectPreview: "PROJECT_PREVIEW",
  LearningObjectives: "LEARNING_OBJECTIVES",
  ChapterRecap: "CHAPTER_RECAP",
} as const;

export interface ExtractedBlock {
  id: string;
  tagName: string;
  /** BlockType if the tag is a known block component, otherwise null. */
  blockType: (typeof BLOCK_TAG_NAMES)[keyof typeof BLOCK_TAG_NAMES] | null;
  /** Document order among id-carrying block elements. */
  order: number;
  /** Stable hash of the element subtree, position-independent. */
  sourceHash: string;
}

interface MdxJsxElement {
  type: "mdxJsxFlowElement" | "mdxJsxTextElement";
  name: string | null;
  attributes: Array<
    | { type: "mdxJsxExpressionAttribute"; value: string }
    | { type: "mdxJsxAttribute"; name: string; value: string | null | undefined }
  >;
  children: unknown[];
}

export function extractBlocksFromSource(source: string): ExtractedBlock[] {
  const tree = parseMdx(source);
  const blocks: ExtractedBlock[] = [];
  visit(tree, ["mdxJsxFlowElement", "mdxJsxTextElement"], (node) => {
    const element = node as unknown as MdxJsxElement;
    if (!element.name) return; // fragments have no name
    const id = attributeValue(element, "id");
    if (!id) return; // only explicit-id elements are blocks
    blocks.push({
      id,
      tagName: element.name,
      blockType:
        BLOCK_TAG_NAMES[element.name as keyof typeof BLOCK_TAG_NAMES] ?? null,
      order: blocks.length,
      sourceHash: hashSubtree(element),
    });
  });
  return blocks;
}

export interface ExistingBlockRef {
  id: string;
  sourceHash: string | null;
}

export interface BlockDiff {
  /** Present in source, absent from DB. */
  create: ExtractedBlock[];
  /** Present in DB, absent from source (archive, keep responses). */
  archiveIds: string[];
  /** Present in both, content changed (bump version). */
  bump: Array<{ id: string; sourceHash: string }>;
  /** Present in both, DB hash never recorded (backfill without bumping). */
  backfill: Array<{ id: string; sourceHash: string }>;
}

export function diffBlocks(
  extracted: ExtractedBlock[],
  existing: ExistingBlockRef[]
): BlockDiff {
  const extractedById = new Map(extracted.map((b) => [b.id, b]));
  const existingById = new Map(existing.map((e) => [e.id, e]));

  const create = extracted.filter((b) => !existingById.has(b.id));
  const archiveIds = existing
    .filter((e) => !extractedById.has(e.id))
    .map((e) => e.id);

  const bump: BlockDiff["bump"] = [];
  const backfill: BlockDiff["backfill"] = [];
  for (const b of extracted) {
    const prev = existingById.get(b.id);
    if (!prev) continue;
    if (prev.sourceHash == null) {
      backfill.push({ id: b.id, sourceHash: b.sourceHash });
    } else if (prev.sourceHash !== b.sourceHash) {
      bump.push({ id: b.id, sourceHash: b.sourceHash });
    }
  }
  return { create, archiveIds, bump, backfill };
}

/**
 * Uppercase JSX tag names not covered by `allowedComponentNames` — publishing
 * them would throw at render time (or worse). Lowercase tags are plain HTML
 * elements and are always allowed. See docs/09-security.mdx allowlist.
 */
export function collectUnknownComponents(
  source: string,
  allowedComponentNames: ReadonlySet<string>
): string[] {
  const tree = parseMdx(source);
  const unknown = new Set<string>();
  visit(tree, ["mdxJsxFlowElement", "mdxJsxTextElement"], (node) => {
    const element = node as unknown as MdxJsxElement;
    const name = element.name;
    if (!name) return;
    const looksLikeComponent = /^[A-Z]/.test(name);
    if (looksLikeComponent && !allowedComponentNames.has(name)) {
      unknown.add(name);
    }
  });
  return [...unknown];
}

function attributeValue(element: MdxJsxElement, name: string): string | null {
  for (const attr of element.attributes ?? []) {
    if (attr.type === "mdxJsxAttribute" && attr.name === name) {
      return typeof attr.value === "string" ? attr.value : null;
    }
  }
  return null;
}

function parseMdx(source: string) {
  return unified().use(remarkParse).use(remarkMdx).parse(source);
}

function hashSubtree(node: unknown): string {
  const normalized = JSON.stringify(stripPositions(node));
  return createHash("sha256").update(normalized).digest("hex");
}

/** Remove `position` recursively so hashes survive blocks moving in the doc. */
function stripPositions(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripPositions);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      if (key === "position") continue;
      out[key] = stripPositions(val);
    }
    return out;
  }
  return value;
}
