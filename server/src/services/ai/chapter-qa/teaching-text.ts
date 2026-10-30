// The only chapter text the question model may see: prose and teaching code, with every
// interactive block removed. Quiz, predict, open question and AI interview content holds
// answer keys, explanations and rubrics, so those are cut out whole, fail closed, before
// anything is sent. Stored chapters usually carry only placeholder tags (the config lives
// in the Block table), but raw sources can still hold the authoring fences or inline tags.

const HIDDEN_FENCES = new Set(["quiz", "predict", "openquestion", "aiinterview", "codeexercise", "code"]);
const HIDDEN_TAGS = ["Quiz", "Predict", "OpenQuestion", "AiInterview", "CodeExercise"];

const FENCE_OPEN = /^ {0,3}(`{3,}|~{3,})\s*([^\s`]*)/;

/** Drop hidden fences line by line. An unclosed hidden fence removes everything after it. */
function stripHiddenFences(source: string): string {
  const out: string[] = [];
  let open: { char: string; length: number; hidden: boolean } | null = null;
  for (const line of source.split(/\r?\n/)) {
    if (!open) {
      const match = FENCE_OPEN.exec(line);
      if (match) {
        const marker = match[1]!;
        open = { char: marker[0]!, length: marker.length, hidden: HIDDEN_FENCES.has(match[2]!.toLowerCase()) };
        if (!open.hidden) out.push(line);
        continue;
      }
      out.push(line);
      continue;
    }
    const close = new RegExp("^ {0,3}[" + open.char + "]{" + open.length + ",}\\s*$").test(line);
    if (!open.hidden) out.push(line);
    if (close) open = null;
  }
  return out.join("\n");
}

/** End index (exclusive) of the opening tag that starts at `start`, honouring quotes and braces. */
function openingTagEnd(source: string, start: number): number {
  let quote: string | null = null;
  let depth = 0;
  for (let i = start; i < source.length; i += 1) {
    const char = source[i]!;
    if (quote) {
      if (char === quote) quote = null;
    } else if (depth > 0) {
      if (char === "{") depth += 1;
      else if (char === "}") depth -= 1;
      else if (char === '"' || char === "'" || char === "`") quote = char;
    } else if (char === '"' || char === "'") quote = char;
    else if (char === "{") depth = 1;
    else if (char === ">") return i + 1;
  }
  return -1;
}

/** Drop hidden JSX elements, self-closing or paired. An element that never ends removes the rest. */
function stripHiddenTags(source: string): string {
  const pattern = new RegExp(String.raw`<(${HIDDEN_TAGS.join("|")})(?=[\s/>])`);
  let text = source;
  for (;;) {
    const match = pattern.exec(text);
    if (!match) return text;
    const start = match.index;
    const end = openingTagEnd(text, start + match[0].length);
    if (end === -1) return text.slice(0, start);
    if (text[end - 2] === "/") {
      text = text.slice(0, start) + text.slice(end);
      continue;
    }
    const closing = `</${match[1]}>`;
    const closeAt = text.indexOf(closing, end);
    text = text.slice(0, start) + (closeAt === -1 ? "" : text.slice(closeAt + closing.length));
  }
}

export function teachingText(source: string): string {
  return stripHiddenTags(stripHiddenFences(source))
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
