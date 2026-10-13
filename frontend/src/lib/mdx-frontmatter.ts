import { load as loadYaml } from "js-yaml";

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;

/** Strip YAML frontmatter from chapter MDX (import metadata must not render in the reader). */
export function stripYamlFrontmatter(source: string): {
  frontmatter: Record<string, unknown>;
  body: string;
} {
  const match = source.match(FRONTMATTER_RE);
  if (!match) {
    return { frontmatter: {}, body: source };
  }
  let frontmatter: Record<string, unknown> = {};
  try {
    frontmatter = (loadYaml(match[1]) as Record<string, unknown>) ?? {};
  } catch {
    frontmatter = {};
  }
  return { frontmatter, body: match[2] ?? "" };
}

/** Reader-safe chapter body (no YAML preamble). */
export function chapterBodyForReader(source: string): string {
  return stripYamlFrontmatter(source).body.trimStart();
}
