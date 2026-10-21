// GENERATED from server/src/shared — do not edit here. Run `pnpm sync-shared` in server/.
// Read-time placeholders in chapter text and block prompts. An author writes
// %%product.name%% and each learner reads their own variant's product, for
// example Hamesh on the books variant. Stored source, the publish snapshot and
// Block.config never change: substitution happens per request, so one published
// chapter serves every variant and block hashes stay stable.
//
// %%name%% is inert in Markdown and MDX and the importer's prose escaping leaves
// it alone. {{name}} would not work: MDX parses braces as JavaScript.
//
// The token set is closed. A token outside it is a publish and import error,
// never silently printed to a learner.

import { findCourseFamily, resolveVariant } from "./course-tracks";

export type ContentTokenName = "product.name";
export type ContentTokenValues = Record<ContentTokenName, string>;

/** Used when the course has no family or the family cannot supply a value. */
export const CONTENT_TOKEN_FALLBACKS: ContentTokenValues = {
  "product.name": "FreshMarket",
};

export const CONTENT_TOKEN_NAMES = Object.keys(CONTENT_TOKEN_FALLBACKS) as ContentTokenName[];

// Lower-case dotted names with no spaces, so Mermaid comments (%% note) and
// directives (%%{init: ...}%%) never match.
const TOKEN_PATTERN = /%%([a-z][a-zA-Z0-9]*(?:\.[a-zA-Z0-9]+)+)%%/g;

export function isContentToken(name: string): name is ContentTokenName {
  return (CONTENT_TOKEN_NAMES as string[]).includes(name);
}

/** Every token name in the text, known or not, in order of appearance. */
export function findContentTokens(text: string): string[] {
  return [...text.matchAll(TOKEN_PATTERN)].map((match) => match[1]!);
}

export function hasContentTokens(text: string | null | undefined): boolean {
  return Boolean(text) && findContentTokens(text!).length > 0;
}

/**
 * Values for one learner. The variant they picked wins; a family course without
 * a pick (or with a retired variant) uses the family default; anything else,
 * including anonymous previews of a course without a family, uses the fallbacks.
 */
export function contentTokenValues(familySlug: string | null | undefined, variantSlug: string | null | undefined): ContentTokenValues {
  const family = findCourseFamily(familySlug);
  if (!family) return { ...CONTENT_TOKEN_FALLBACKS };
  const variant = resolveVariant(family, variantSlug);
  return { "product.name": variant.productName || CONTENT_TOKEN_FALLBACKS["product.name"] };
}

/** Replace known tokens. Unknown ones are left as written; publish and import reject them. */
export function applyTokens(text: string, values: ContentTokenValues): string {
  return text.replace(TOKEN_PATTERN, (whole, name: string) => (isContentToken(name) ? values[name] : whole));
}

/** applyTokens on every string inside a JSON-like value, for block configs. */
export function applyTokensDeep<T>(value: T, values: ContentTokenValues): T {
  if (typeof value === "string") return applyTokens(value, values) as T;
  if (Array.isArray(value)) return value.map((item) => applyTokensDeep(item, values)) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, applyTokensDeep(item, values)])) as T;
  }
  return value;
}

/** Problems with tokens in a chapter body: unknown names, and any token in a heading. */
export function collectContentTokenProblems(source: string): string[] {
  const problems: string[] = [];
  const unknown = [...new Set(findContentTokens(source).filter((name) => !isContentToken(name)))];
  for (const name of unknown) {
    problems.push(`Unknown placeholder %%${name}%%. Allowed: ${CONTENT_TOKEN_NAMES.map((n) => `%%${n}%%`).join(", ")}.`);
  }
  for (const heading of headingLinesWithTokens(source)) {
    problems.push(`Placeholders are not allowed in headings, because heading links and notes must be the same for every learner: "${heading}".`);
  }
  return problems;
}

/** A problem line when a title-like field (chapter, module or course metadata) holds a token. */
export function tokenInFieldProblem(label: string, value: string | null | undefined): string | null {
  return hasContentTokens(value) ? `Placeholders are not allowed in the ${label}, which is shown outside the chapter: "${value}".` : null;
}

// ATX (# Title) and setext (Title then === or ---) headings outside fenced code.
function headingLinesWithTokens(source: string): string[] {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const found: string[] = [];
  let fence: string | null = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const fenceMatch = /^\s{0,3}(`{3,}|~{3,})/.exec(line);
    if (fenceMatch) {
      const marker = fenceMatch[1]!;
      if (fence === null) fence = marker;
      else if (marker[0] === fence[0] && marker.length >= fence.length) fence = null;
      continue;
    }
    if (fence !== null) continue;
    const atx = /^\s{0,3}#{1,6}\s/.test(line);
    const next = lines[i + 1];
    const setext = line.trim() !== "" && next !== undefined && /^\s{0,3}(=+|-+)\s*$/.test(next) && !/^\s{0,3}[-*+]\s/.test(line);
    if ((atx || setext) && hasContentTokens(line)) found.push(line.trim());
  }
  return found;
}
