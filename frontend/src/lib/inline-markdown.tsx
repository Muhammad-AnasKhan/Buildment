import type { ReactNode } from "react";

/**
 * One inline markdown parser for short author strings (objectives, learning log
 * questions, quiz prose). It understands `**bold**`, `*italic*` and `` `code` ``,
 * renders React nodes with theme tokens only, and never injects HTML.
 *
 * Rules:
 * - Code spans win: markers inside backticks stay literal.
 * - Bold may contain italic and code; italic may contain bold and code.
 * - A marker with no partner (a lone `**`, `*` or backtick) stays literal text.
 */
type InlineToken =
  | { kind: "text"; value: string }
  | { kind: "code"; value: string }
  | { kind: "strong"; children: InlineToken[] }
  | { kind: "em"; children: InlineToken[] };

/** Index of the backtick closing a code span opened at `start`, or -1. */
function closingBacktick(text: string, start: number): number {
  for (let i = start + 1; i < text.length; i++) {
    if (text[i] === "\n") return -1;
    if (text[i] === "`") return i > start + 1 ? i : -1;
  }
  return -1;
}

/** Index of the `**` closing a bold run opened at `start`, skipping code spans. */
function closingBold(text: string, start: number): number {
  let i = start + 2;
  while (i < text.length) {
    if (text[i] === "`") {
      const end = closingBacktick(text, i);
      if (end !== -1) {
        i = end + 1;
        continue;
      }
    }
    if (text.startsWith("**", i)) {
      return text.slice(start + 2, i).trim() ? i : -1;
    }
    i += 1;
  }
  return -1;
}

/** Index of the `*` closing an italic run opened at `start`, skipping code spans and bold markers. */
function closingItalic(text: string, start: number): number {
  if (!text[start + 1] || /\s/.test(text[start + 1]!)) return -1;
  let i = start + 1;
  while (i < text.length) {
    if (text[i] === "`") {
      const end = closingBacktick(text, i);
      if (end !== -1) {
        i = end + 1;
        continue;
      }
    }
    if (text.startsWith("**", i)) {
      i += 2;
      continue;
    }
    if (text[i] === "*") {
      return /\s/.test(text[i - 1]!) ? -1 : i;
    }
    i += 1;
  }
  return -1;
}

export function tokenizeInlineMarkdown(text: string, insideBold = false, insideItalic = false): InlineToken[] {
  const tokens: InlineToken[] = [];
  let buffer = "";
  const flush = () => {
    if (buffer) tokens.push({ kind: "text", value: buffer });
    buffer = "";
  };

  let i = 0;
  while (i < text.length) {
    const char = text[i]!;

    if (char === "`") {
      const end = closingBacktick(text, i);
      if (end !== -1) {
        flush();
        tokens.push({ kind: "code", value: text.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
      buffer += char;
      i += 1;
      continue;
    }

    if (text.startsWith("**", i)) {
      const end = insideBold ? -1 : closingBold(text, i);
      if (end !== -1) {
        flush();
        tokens.push({ kind: "strong", children: tokenizeInlineMarkdown(text.slice(i + 2, end), true, insideItalic) });
        i = end + 2;
        continue;
      }
      // An unmatched `**` is literal; it must not fall through to two italic markers.
      buffer += "**";
      i += 2;
      continue;
    }

    if (char === "*") {
      const end = insideItalic ? -1 : closingItalic(text, i);
      if (end !== -1) {
        flush();
        tokens.push({ kind: "em", children: tokenizeInlineMarkdown(text.slice(i + 1, end), insideBold, true) });
        i = end + 1;
        continue;
      }
    }

    buffer += char;
    i += 1;
  }

  flush();
  return tokens;
}

function renderTokens(tokens: InlineToken[], keyPrefix: string): ReactNode[] {
  return tokens.map((token, index) => {
    const key = `${keyPrefix}${index}`;
    switch (token.kind) {
      case "text":
        return token.value;
      case "code":
        return (
          <code key={key} className="rounded bg-muted px-1 py-0.5 font-mono text-[0.9em] text-foreground">
            {token.value}
          </code>
        );
      case "strong":
        return (
          <strong key={key} className="font-semibold text-foreground">
            {renderTokens(token.children, `${key}.`)}
          </strong>
        );
      case "em":
        return <em key={key}>{renderTokens(token.children, `${key}.`)}</em>;
    }
  });
}

/** Inline markdown as React nodes (bold, italic, code). */
export function parseInlineMarkdown(text: string): ReactNode[] {
  return renderTokens(tokenizeInlineMarkdown(text), "");
}

function tokensToText(tokens: InlineToken[]): string {
  return tokens
    .map((token) => {
      if (token.kind === "code") return token.value;
      // Stray markers are noise when read aloud; code span content stays exact.
      if (token.kind === "text") return token.value.replace(/\*\*|`/g, "");
      return tokensToText(token.children);
    })
    .join("");
}

/**
 * The same string with its markdown markers removed, for aria labels and other
 * plain-text uses. Unlike the rendered form, leftover `**` and backticks are dropped too.
 */
export function inlineMarkdownToText(text: string): string {
  return tokensToText(tokenizeInlineMarkdown(text));
}
