import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  checkableFacts,
  checkPhrase,
  DEFAULT_FINE_WHY,
  factsLabel,
  foundLabel,
  layoutPhrase,
  originalText,
  PHRASE_LIMITS,
  PHRASE_LINE_CHARS,
  phraseVerdict,
  rewriteText,
  showRewrite,
  startPhrase,
  tagNumber,
  tapSegment,
  type PhraseSegment,
} from "@buildment/learning-ui/canvas/models/phrase-fixer";
import { careerM6EmptyPhrases, EMPTY_PHRASE_SEGMENTS, EMPTY_PHRASES_CONFIG } from "@buildment/learning-ui/canvas/career-m6-empty-phrases/data";

const segs: PhraseSegment[] = [
  { id: "a", text: "Hard-working", weak: { why: "Anyone can say it.", fix: "Shipped 3 releases" } },
  { id: "b", text: "and" },
  { id: "c", text: "a team player", weak: { why: "No team is named.", fix: "with a team of 4" }, fineWhy: "unused" },
  { id: "d", text: "who likes", fineWhy: "Plain words, fine here." },
  { id: "e", text: "synergy.", weak: { why: "Empty word.", fix: "in 2024." } },
];
const input = (segments: PhraseSegment[], extra: Partial<Parameters<typeof checkPhrase>[0]> = {}) => ({ segments, cardLabel: "Bio", endNote: "Done.", checkableBefore: 0, ...extra });

describe("phrase fixer model", () => {
  it("marks a weak segment once and numbers it in the order found", () => {
    const s0 = startPhrase();
    const one = tapSegment(s0, segs, "c");
    expect(one.outcome).toMatchObject({ kind: "weak", fresh: true });
    const two = tapSegment(one.state, segs, "c");
    expect(two.outcome).toMatchObject({ kind: "weak", fresh: false });
    expect(two.state.found).toEqual(["c"]);
    const three = tapSegment(two.state, segs, "a");
    expect(tagNumber(three.state, "c")).toBe(1);
    expect(tagNumber(three.state, "a")).toBe(2);
    expect(tagNumber(three.state, "e")).toBeNull();
    expect(foundLabel(three.state, segs)).toBe("Found 2 of 3");
  });

  it("gives a fine segment its reason (or the default) and does not mark it", () => {
    const s0 = startPhrase();
    expect(tapSegment(s0, segs, "d").outcome).toMatchObject({ kind: "fine", why: "Plain words, fine here." });
    const b = tapSegment(s0, segs, "b");
    expect(b.outcome).toMatchObject({ kind: "fine", why: DEFAULT_FINE_WHY });
    expect(b.state.found).toEqual([]);
    expect(b.state.last).toBe("b");
    expect(tapSegment(s0, segs, "nope").outcome.kind).toBe("ignored");
  });

  it("shows the rewrite when the last weak segment is found, and ignores taps after", () => {
    let s = startPhrase();
    for (const id of ["a", "c", "e"]) s = tapSegment(s, segs, id).state;
    expect(s.revealed).toBe(true);
    expect(s.skipped).toBe(false);
    expect(phraseVerdict(s, segs)).toBe("All 3 found. Now a reader can check it");
    expect(tapSegment(s, segs, "b").outcome.kind).toBe("ignored");
  });

  it("lets the learner skip, and the verdict still counts what was found", () => {
    const s = showRewrite(tapSegment(startPhrase(), segs, "a").state, segs);
    expect(s).toMatchObject({ revealed: true, skipped: true });
    expect(phraseVerdict(s, segs)).toBe("You found 1 of 3. Here is the rewrite");
    expect(phraseVerdict(s, segs, { found: "All {total}", skipped: "{found} of {total} found" })).toBe("1 of 3 found");
    expect(showRewrite(s, segs)).toBe(s);
  });

  it("counts facts a reader can check: fixed segments plus the starting count", () => {
    const s0 = startPhrase();
    expect(checkableFacts(s0, segs, 2)).toBe(2);
    const s1 = tapSegment(s0, segs, "a").state;
    expect(factsLabel(s1, segs, 2)).toBe("Facts a reader can check: 3");
    expect(checkableFacts(showRewrite(s1, segs), segs, 2)).toBe(5);
  });

  it("builds the original and the rewrite from the segments", () => {
    expect(originalText(segs)).toBe("Hard-working and a team player who likes synergy.");
    expect(rewriteText(segs)).toBe("Shipped 3 releases and with a team of 4 who likes in 2024.");
  });

  it("wraps into lines that fit, keeps every word, and reserves a tag slot only before the rewrite", () => {
    for (const mode of ["before", "after"] as const) {
      const lines = layoutPhrase(segs, mode, 16);
      for (const line of lines) {
        const used = line.reduce((n, p, i) => n + (i ? 1 : 0) + p.text.length + (p.tagged ? 1 : 0), 0);
        expect(used).toBeLessThanOrEqual(16);
      }
      const text = lines.map((l) => l.map((p) => p.text).join(" ")).join(" ");
      expect(text).toBe(mode === "before" ? originalText(segs) : rewriteText(segs));
      const tagged = lines.flat().filter((p) => p.tagged).map((p) => p.segment);
      expect(tagged).toEqual(mode === "before" ? ["a", "b", "c", "d", "e"] : []);
    }
    expect(layoutPhrase(segs, "after").flat().filter((p) => p.fixed).map((p) => p.segment)).toEqual(["a", "c", "e"]);
  });

  it("lays out 3 to 6 weak segments in a 320-character text within the card", () => {
    const word = "measured";
    for (let weak = 3; weak <= 6; weak++) {
      const segments: PhraseSegment[] = [];
      for (let i = 0; i < weak; i++) {
        segments.push({ id: `w${i}`, text: `${word} phrase number ${i} that says little`, weak: { why: "No fact.", fix: `cut time by ${i} hours from the log` } });
        segments.push({ id: `f${i}`, text: "and then" });
      }
      const problems = checkPhrase(input(segments));
      expect(problems, String(weak)).toEqual([]);
      expect(layoutPhrase(segments, "before").length).toBeLessThanOrEqual(PHRASE_LIMITS.lines);
    }
  });
});

describe("phrase fixer data check", () => {
  it("passes good data", () => {
    expect(checkPhrase(input(segs))).toEqual([]);
  });

  it("finds duplicate ids, missing reasons and fixes, and long whys", () => {
    const bad: PhraseSegment[] = [
      { id: "a", text: "one", weak: { why: "", fix: "x" } },
      { id: "a", text: "two", weak: { why: "x".repeat(61), fix: " " } },
    ];
    const problems = checkPhrase(input(bad));
    expect(problems).toContain("a: duplicate id");
    expect(problems).toContain("a: weak segment with no why");
    expect(problems).toContain("a: why is 61 characters, at most 60");
    expect(problems).toContain("a: weak segment with no fix");
  });

  it("refuses a text with nothing to find, too many weak segments, or too long a text", () => {
    expect(checkPhrase(input([{ id: "a", text: "fine" }]))).toContain("no weak segments: there is nothing to find");
    const seven = Array.from({ length: 7 }, (_, i) => ({ id: `w${i}`, text: "empty", weak: { why: "No fact.", fix: "a fact" } }));
    expect(checkPhrase(input(seven))).toContain("7 weak segments, at most 6");
    const long = [{ id: "a", text: "word ".repeat(70).trim(), weak: { why: "No fact.", fix: "short" } }];
    expect(checkPhrase(input(long)).some((p) => p.startsWith("before: 349 characters"))).toBe(true);
  });

  it("checks the label, the note, the starting count, the prompt and the verdicts", () => {
    const problems = checkPhrase(input(segs, { cardLabel: "", endNote: "word ".repeat(60), checkableBefore: -1, prompt: "x".repeat(39), verdicts: { found: "x".repeat(39), skipped: "ok {found}" } }));
    expect(problems).toContain("cardLabel must be 1 to 28 characters");
    expect(problems).toContain("endNote wraps to more than 5 lines");
    expect(problems).toContain("checkableBefore must be a whole number, 0 or more");
    expect(problems).toContain("prompt is 39 characters, at most 38");
    expect(problems.some((p) => p.startsWith("verdict"))).toBe(true);
  });

  it("refuses a fix that does not fit the strip", () => {
    const wordy = [{ id: "a", text: "empty", weak: { why: "No fact.", fix: "word ".repeat(40).trim() } }];
    expect(checkPhrase(input(wordy)).some((p) => p.includes("fix wraps to"))).toBe(true);
  });
});

describe("career-m6-empty-phrases data", () => {
  const segments = EMPTY_PHRASE_SEGMENTS;
  const weak = segments.filter((s) => s.weak);

  it("passes the data check", () => {
    expect(checkPhrase(EMPTY_PHRASES_CONFIG)).toEqual([]);
  });

  it("has weak phrases to find, a rewrite that differs from the original, and lines that fit", () => {
    expect(weak.length).toBeGreaterThan(0);
    expect(new Set(segments.map((s) => s.id)).size).toBe(segments.length);
    expect(rewriteText(segments)).not.toBe(originalText(segments));
    expect(EMPTY_PHRASES_CONFIG.checkableBefore).toBe(0);
    for (const line of layoutPhrase(segments, "before")) expect(line.map((p) => p.text).join(" ").length).toBeLessThanOrEqual(PHRASE_LINE_CHARS);
    for (const line of layoutPhrase(segments, "after")) expect(line.map((p) => p.text).join(" ").length).toBeLessThanOrEqual(PHRASE_LINE_CHARS);
  });

  it("renders on the server with the counters, one button per segment, and no hex or long dashes", () => {
    const html = renderToString(createElement(careerM6EmptyPhrases.component, { title: careerM6EmptyPhrases.title, purpose: careerM6EmptyPhrases.purpose, limits: careerM6EmptyPhrases.limits })).replaceAll("<!-- -->", "");
    const s0 = startPhrase();
    expect(html).toContain("<svg");
    expect(html).toContain("What this picture leaves out");
    expect(html).toContain("Tap the phrases a reader cannot check");
    expect(html).toContain(foundLabel(s0, segments));
    expect(html).toContain(`Found 0 of ${weak.length}`);
    expect(html).toContain(factsLabel(s0, segments, EMPTY_PHRASES_CONFIG.checkableBefore));
    expect(html).toContain("Show the rewrite");
    expect((html.match(/role="button"/g) ?? []).length).toBe(segments.length);
    expect(html).not.toMatch(/#[0-9a-fA-F]{6}/);
    expect(html).not.toMatch(/foreignObject|<animate|<use|<image/);
    expect(html).not.toMatch(/[–—]/);
  });
});
