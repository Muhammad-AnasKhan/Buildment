import { wrapWords } from "./sorter";

// A phrase fixer as a pure model: a short text (a resume bullet, a headline,
// an outreach message) is an ordered list of segments. Some are weak: they
// say nothing a reader can check. The learner taps the ones they think are
// weak; each weak one, once found, shows why and a fix. When every weak
// segment is found (or the learner asks for the rewrite), the text becomes
// the rewrite: each weak segment replaced by its fix. No React here, so the
// rules and the layout are tested on their own.

export type PhraseSegment = {
  id: string;
  /** The words as written. Segments are joined with one space, so leave the spaces out. */
  text: string;
  /** Set for a weak segment: why it is weak (at most 60 characters) and the words that replace it. */
  weak?: { why: string; fix: string };
  /** What a tap on a fine segment says. A default is used when it is missing. */
  fineWhy?: string;
};

/** Own wording for the end banner. `{found}` and `{total}` are filled in; each result at most 38 characters. */
export type PhraseVerdicts = {
  /** Every weak segment found by tapping. */
  found: string;
  /** The learner asked for the rewrite before finding them all. */
  skipped: string;
};

export type PhraseState = {
  /** Ids of weak segments found, in the order they were found. A segment's tag number is its place here plus one. */
  found: string[];
  /** The segment tapped last, for the reason strip. */
  last: string | null;
  /** True once the rewrite is showing. */
  revealed: boolean;
  /** True when the rewrite was asked for before every weak segment was found. */
  skipped: boolean;
};

export type PhraseOutcome =
  | { kind: "weak"; segment: PhraseSegment; fresh: boolean }
  | { kind: "fine"; segment: PhraseSegment; why: string }
  | { kind: "ignored" };

export const DEFAULT_FINE_WHY = "This part is fine. A reader does not need a fact here.";

/** The layout and wording limits the data check holds a text to. */
export const PHRASE_LIMITS = {
  /** Characters of the text before or after the rewrite. */
  text: 320,
  /** Lines of the card. */
  lines: 10,
  why: 60,
  weakMin: 1,
  weakMax: 6,
  verdict: 38,
  cardLabel: 28,
  /** Lines of the reason strip: two for why, three for the fix. */
  whyLines: 2,
  fixLines: 3,
  stripLines: 5,
} as const;

/** Characters per line of the card text (15 units at about 8.8 units a character, inside 352 units). */
export const PHRASE_LINE_CHARS = 40;
/** Characters per line of the reason strip (13.5 units, inside 372 units). */
export const STRIP_CHARS = 50;

export function startPhrase(): PhraseState {
  return { found: [], last: null, revealed: false, skipped: false };
}

export function weakSegments(segments: PhraseSegment[]): PhraseSegment[] {
  return segments.filter((s) => s.weak);
}

/** Tap a segment. A weak one is marked (once); a fine one only gets its reason. Taps after the rewrite are ignored. */
export function tapSegment(state: PhraseState, segments: PhraseSegment[], id: string): { state: PhraseState; outcome: PhraseOutcome } {
  const segment = segments.find((s) => s.id === id);
  if (!segment || state.revealed) return { state, outcome: { kind: "ignored" } };
  if (!segment.weak) return { state: { ...state, last: id }, outcome: { kind: "fine", segment, why: segment.fineWhy ?? DEFAULT_FINE_WHY } };
  const fresh = !state.found.includes(id);
  const found = fresh ? [...state.found, id] : state.found;
  const revealed = found.length === weakSegments(segments).length;
  return { state: { ...state, found, last: id, revealed }, outcome: { kind: "weak", segment, fresh } };
}

/** Skip the finding: show the rewrite now. The verdict still says how many were found. */
export function showRewrite(state: PhraseState, segments: PhraseSegment[]): PhraseState {
  if (state.revealed) return state;
  return { ...state, revealed: true, skipped: state.found.length < weakSegments(segments).length };
}

/** The tag number of a found weak segment (1 for the first found), or null. */
export function tagNumber(state: PhraseState, id: string): number | null {
  const i = state.found.indexOf(id);
  return i < 0 ? null : i + 1;
}

/** Facts a reader can check: every fixed weak segment adds one, on top of the facts the text already had. */
export function checkableFacts(state: PhraseState, segments: PhraseSegment[], checkableBefore: number): number {
  const fixed = state.revealed ? weakSegments(segments).length : state.found.length;
  return checkableBefore + fixed;
}

export function foundLabel(state: PhraseState, segments: PhraseSegment[]): string {
  return `Found ${state.found.length} of ${weakSegments(segments).length}`;
}

export function factsLabel(state: PhraseState, segments: PhraseSegment[], checkableBefore: number): string {
  return `Facts a reader can check: ${checkableFacts(state, segments, checkableBefore)}`;
}

const fill = (template: string, found: number, total: number) => template.replace("{found}", String(found)).replace("{total}", String(total));

/** The end banner, at most 38 characters with the default wording. */
export function phraseVerdict(state: PhraseState, segments: PhraseSegment[], words?: PhraseVerdicts): string {
  const total = weakSegments(segments).length;
  const n = state.found.length;
  if (words) return fill(state.skipped ? words.skipped : words.found, n, total);
  return state.skipped ? `You found ${n} of ${total}. Here is the rewrite` : `All ${total} found. Now a reader can check it`;
}

export function originalText(segments: PhraseSegment[]): string {
  return segments.map((s) => s.text.trim()).join(" ");
}

export function rewriteText(segments: PhraseSegment[]): string {
  return segments.map((s) => (s.weak ? s.weak.fix : s.text).trim()).join(" ");
}

/** A run of one segment's words on one line. `tagged` means the segment ends here and its tag slot follows. */
export type PhrasePiece = { segment: string; text: string; tagged: boolean; fixed: boolean };

/**
 * Wrap the text into lines of pieces. Before the rewrite, every segment ends
 * in a one-character tag slot (a figure space until it is found, then its
 * number), so marking a segment never reflows the text. After the rewrite,
 * weak segments are replaced by their fixes and there are no tag slots.
 */
export function layoutPhrase(segments: PhraseSegment[], mode: "before" | "after", maxChars = PHRASE_LINE_CHARS): PhrasePiece[][] {
  type Token = { segment: string; word: string; width: number; last: boolean; fixed: boolean };
  const tokens: Token[] = [];
  for (const s of segments) {
    const fixed = mode === "after" && !!s.weak;
    const words = (fixed ? s.weak!.fix : s.text).split(/\s+/).filter(Boolean);
    words.forEach((word, i) => {
      const last = i === words.length - 1;
      tokens.push({ segment: s.id, word, width: word.length + (mode === "before" && last ? 1 : 0), last, fixed });
    });
  }
  const lines: Token[][] = [];
  let line: Token[] = [];
  let used = 0;
  for (const t of tokens) {
    const add = line.length ? used + 1 + t.width : t.width;
    if (line.length && add > maxChars) {
      lines.push(line);
      line = [t];
      used = t.width;
    } else {
      line.push(t);
      used = add;
    }
  }
  if (line.length) lines.push(line);
  return lines.map((ts) => {
    const pieces: PhrasePiece[] = [];
    for (const t of ts) {
      const prev = pieces[pieces.length - 1];
      if (prev && prev.segment === t.segment) {
        prev.text += ` ${t.word}`;
        prev.tagged = mode === "before" && t.last;
      } else {
        pieces.push({ segment: t.segment, text: t.word, tagged: mode === "before" && t.last, fixed: t.fixed });
      }
    }
    return pieces;
  });
}

/** Where a piece of text starts on its line and how wide it is, in picture units. */
export type PhraseBox = { x: number; w: number };

/** True when every box in `next` is already in `old` within a quarter unit, so a re-measure need not re-render. */
export function sameBoxes(old: Record<string, PhraseBox>, next: Record<string, PhraseBox>): boolean {
  return Object.entries(next).every(([key, b]) => {
    const o = old[key];
    return !!o && Math.abs(o.x - b.x) < 0.25 && Math.abs(o.w - b.w) < 0.25;
  });
}

/** Lines of the reason strip for a weak segment: why (bad tone) then the fix. */
export function weakStrip(segment: PhraseSegment): { why: string[]; fix: string[] } {
  return { why: wrapWords(`Weak: ${segment.weak?.why ?? ""}`, STRIP_CHARS), fix: wrapWords(`Fix: ${segment.weak?.fix ?? ""}`, STRIP_CHARS) };
}

export type PhraseCheckInput = {
  segments: PhraseSegment[];
  cardLabel: string;
  endNote: string;
  checkableBefore: number;
  prompt?: string;
  verdicts?: PhraseVerdicts;
};

/** Problems in a phrase that would break the game or the layout. An empty list means the data is fine. */
export function checkPhrase({ segments, cardLabel, endNote, checkableBefore, prompt, verdicts }: PhraseCheckInput): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();
  for (const s of segments) {
    if (seen.has(s.id)) problems.push(`${s.id}: duplicate id`);
    seen.add(s.id);
    if (!s.text.trim()) problems.push(`${s.id}: empty text`);
    if (s.weak) {
      if (!s.weak.why.trim()) problems.push(`${s.id}: weak segment with no why`);
      if (s.weak.why.length > PHRASE_LIMITS.why) problems.push(`${s.id}: why is ${s.weak.why.length} characters, at most ${PHRASE_LIMITS.why}`);
      if (!s.weak.fix.trim()) problems.push(`${s.id}: weak segment with no fix`);
      const strip = weakStrip(s);
      if (strip.why.length > PHRASE_LIMITS.whyLines) problems.push(`${s.id}: why wraps to ${strip.why.length} lines, at most ${PHRASE_LIMITS.whyLines}`);
      if (strip.fix.length > PHRASE_LIMITS.fixLines) problems.push(`${s.id}: fix wraps to ${strip.fix.length} lines in the strip, at most ${PHRASE_LIMITS.fixLines}`);
    } else if (s.fineWhy && wrapWords(`Fine: ${s.fineWhy}`, STRIP_CHARS).length > PHRASE_LIMITS.stripLines) {
      problems.push(`${s.id}: fineWhy is too long for the strip`);
    }
  }
  const weak = weakSegments(segments).length;
  if (weak < PHRASE_LIMITS.weakMin) problems.push("no weak segments: there is nothing to find");
  if (weak > PHRASE_LIMITS.weakMax) problems.push(`${weak} weak segments, at most ${PHRASE_LIMITS.weakMax}`);
  for (const [name, text, mode] of [["before", originalText(segments), "before"], ["after", rewriteText(segments), "after"]] as const) {
    if (text.length > PHRASE_LIMITS.text) problems.push(`${name}: ${text.length} characters, at most ${PHRASE_LIMITS.text}`);
    const lines = layoutPhrase(segments, mode).length;
    if (lines > PHRASE_LIMITS.lines) problems.push(`${name}: ${lines} lines, at most ${PHRASE_LIMITS.lines}`);
  }
  if (layoutPhrase(segments, "before").some((l) => l.some((p) => p.text.length > PHRASE_LINE_CHARS))) problems.push("a word is longer than a line");
  if (!cardLabel.trim() || cardLabel.length > PHRASE_LIMITS.cardLabel) problems.push(`cardLabel must be 1 to ${PHRASE_LIMITS.cardLabel} characters`);
  if (wrapWords(endNote, STRIP_CHARS).length > PHRASE_LIMITS.stripLines) problems.push(`endNote wraps to more than ${PHRASE_LIMITS.stripLines} lines`);
  if (prompt !== undefined && prompt.length > PHRASE_LIMITS.verdict) problems.push(`prompt is ${prompt.length} characters, at most ${PHRASE_LIMITS.verdict}`);
  if (!Number.isInteger(checkableBefore) || checkableBefore < 0) problems.push("checkableBefore must be a whole number, 0 or more");
  for (let n = 0; n <= weak; n++) {
    const state: PhraseState = { found: segments.filter((s) => s.weak).slice(0, n).map((s) => s.id), last: null, revealed: true, skipped: n < weak };
    const text = phraseVerdict(state, segments, verdicts);
    if (text.length > PHRASE_LIMITS.verdict) problems.push(`verdict "${text}" is ${text.length} characters, at most ${PHRASE_LIMITS.verdict}`);
  }
  return problems;
}
