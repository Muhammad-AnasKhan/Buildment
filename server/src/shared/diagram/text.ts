/**
 * Text sizes estimated from character classes, so the server, the reader and
 * the SVG export all lay a diagram out the same way without measuring fonts.
 * The numbers are DM Sans Bold advance widths in em, rounded up a little so
 * a system fallback font still fits.
 */

const NARROW = new Set("iljtfrI.,:;'!|()[] ");
const WIDE = new Set("mwMW@%");

export function textWidth(text: string, fontSize: number): number {
  let em = 0;
  for (const char of text) {
    if (char === " ") em += 0.27;
    else if (NARROW.has(char)) em += 0.33;
    else if (WIDE.has(char)) em += 0.88;
    else if (char >= "A" && char <= "Z") em += 0.68;
    else if (char >= "0" && char <= "9") em += 0.6;
    else em += 0.58;
  }
  return em * fontSize;
}

/** Greedy word wrap to `maxWidth`; a single word longer than the width keeps its own line. */
export function wrapText(text: string, fontSize: number, maxWidth: number, maxLines = 3): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (current && textWidth(candidate, fontSize) > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  if (lines.length <= maxLines) return lines;
  // Over the line budget: keep the budget and join the rest onto the last line.
  return [...lines.slice(0, maxLines - 1), lines.slice(maxLines - 1).join(" ")];
}

export function linesWidth(lines: string[], fontSize: number): number {
  return Math.max(0, ...lines.map((line) => textWidth(line, fontSize)));
}
