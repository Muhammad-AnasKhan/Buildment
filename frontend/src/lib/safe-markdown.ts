// A deliberately small Markdown reader for tutor answers: paragraphs, bullet and numbered lists,
// **bold**, `inline code` and fenced code. It produces plain data, and every piece of text ends up
// in the page as a text node, so nothing the model writes can become markup. Links, images and
// raw HTML are not recognised and simply show as the characters they are.

export type Inline = { kind: "text" | "bold" | "code"; text: string };
export type MarkdownBlock =
  | { kind: "paragraph"; inlines: Inline[] }
  | { kind: "list"; ordered: boolean; items: Inline[][] }
  | { kind: "code"; text: string };

const INLINE = /(\*\*[^*\n]+\*\*|`[^`\n]+`)/;

export function parseInline(text: string): Inline[] {
  const out: Inline[] = [];
  for (const part of text.split(INLINE)) {
    if (!part) continue;
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) out.push({ kind: "bold", text: part.slice(2, -2) });
    else if (part.startsWith("`") && part.endsWith("`") && part.length > 2) out.push({ kind: "code", text: part.slice(1, -1) });
    else out.push({ kind: "text", text: part });
  }
  return out;
}

const BULLET = /^\s{0,3}[-*+]\s+(.*)$/;
const NUMBERED = /^\s{0,3}\d{1,3}[.)]\s+(.*)$/;
const HEADING = /^\s{0,3}#{1,6}\s+(.*)$/;
const FENCE = /^\s{0,3}(`{3,}|~{3,})/;

/** Reads the answer so far; text that is still arriving (an open ** or fence) just shows as it is. */
export function parseMarkdown(source: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  let paragraph: string[] = [];
  let list: { ordered: boolean; items: Inline[][] } | null = null;
  let code: string[] | null = null;

  const flushParagraph = () => {
    if (paragraph.length) blocks.push({ kind: "paragraph", inlines: parseInline(paragraph.join(" ")) });
    paragraph = [];
  };
  const flushList = () => {
    if (list) blocks.push({ kind: "list", ordered: list.ordered, items: list.items });
    list = null;
  };

  for (const line of source.replace(/\r\n?/g, "\n").split("\n")) {
    if (code) {
      if (FENCE.test(line)) {
        blocks.push({ kind: "code", text: code.join("\n") });
        code = null;
      } else code.push(line);
      continue;
    }
    if (FENCE.test(line)) {
      flushParagraph();
      flushList();
      code = [];
      continue;
    }
    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }
    const heading = HEADING.exec(line);
    if (heading) {
      // The tutor is told not to use headings; if one slips through it reads as a bold line.
      flushParagraph();
      flushList();
      blocks.push({ kind: "paragraph", inlines: [{ kind: "bold", text: heading[1]!.replace(/\*\*/g, "").trim() }] });
      continue;
    }
    const bullet = BULLET.exec(line);
    const numbered = bullet ? null : NUMBERED.exec(line);
    const item = bullet ?? numbered;
    if (item) {
      flushParagraph();
      const ordered = Boolean(numbered);
      if (list && list.ordered !== ordered) flushList();
      list ??= { ordered, items: [] };
      list.items.push(parseInline(item[1]!));
      continue;
    }
    // A plain line after a list item continues that item; otherwise it joins the paragraph.
    if (list) list.items[list.items.length - 1]!.push(...parseInline(` ${line.trim()}`));
    else paragraph.push(line.trim());
  }
  // An unfinished fence while streaming still shows its text.
  if (code) blocks.push({ kind: "code", text: code.join("\n") });
  flushParagraph();
  flushList();
  return blocks;
}

/** The answer as plain text, for copying: Markdown marks removed, lists kept readable. */
export function markdownToPlainText(source: string): string {
  const text = (inlines: Inline[]) => inlines.map((inline) => inline.text).join("");
  return parseMarkdown(source)
    .map((block) => {
      if (block.kind === "paragraph") return text(block.inlines);
      if (block.kind === "code") return block.text;
      return block.items.map((item, index) => `${block.ordered ? `${index + 1}.` : "-"} ${text(item)}`).join("\n");
    })
    .join("\n\n");
}
