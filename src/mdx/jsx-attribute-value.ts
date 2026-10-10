/** Parse MDX JSX expression attribute text (JSON or simple JS literals). */
export function parseJsxExpressionValue(raw: string): unknown {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  try {
    return JSON.parse(trimmed);
  } catch {
    // fall through
  }
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
  if (/^(\[|\{)/.test(trimmed)) {
    try {
      // Server-side publish path only — authored expressions are JSON-like arrays/objects.
      return new Function(`"use strict"; return (${trimmed});`)();
    } catch {
      return undefined;
    }
  }
  return trimmed;
}

export function stringifyJsxExpressionValue(value: unknown): string {
  if (typeof value === "string") return JSON.stringify(value);
  return JSON.stringify(value);
}
