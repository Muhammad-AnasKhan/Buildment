import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  checkFlipDeck,
  chooseVerdict,
  isFlipDone,
  nextCard,
  startFlip,
  type FlipCard,
  type FlipDeckConfig,
} from "@buildment/learning-ui/canvas/models/flip-deck";
import { makeFlipDeckCanvas } from "@buildment/learning-ui/canvas/primitives/canvas-factories";

const cards: FlipCard[] = ["a", "b", "c", "d"].map((id, i) => ({
  id,
  front: `Claim number ${id}`,
  answer: ["yes", "part", "no", "yes"][i],
  back: `What the evidence says about ${id}.`,
  source: `Source ${id}, checked 2026-10-25`,
}));
const config: FlipDeckConfig = {
  verdicts: [
    { id: "yes", label: "Supports it" },
    { id: "part", label: "Partly" },
    { id: "no", label: "Does not" },
  ],
  cards,
  deckLabel: "Claim you may hear",
  prompt: "Pick a verdict, then flip",
  hint: "Choose what you think the evidence says.",
  endNote: "Claims are cheap; evidence has a source.",
};

describe("flip deck model", () => {
  it("starts on the first card with nothing chosen", () => {
    expect(startFlip()).toEqual({ index: 0, chosen: null, matched: [] });
    expect(isFlipDone(startFlip(), cards)).toBe(false);
  });

  it("records a match only when the first choice equals the answer", () => {
    expect(chooseVerdict(startFlip(), cards, "yes")).toEqual({ index: 0, chosen: "yes", matched: ["a"] });
    expect(chooseVerdict(startFlip(), cards, "no")).toEqual({ index: 0, chosen: "no", matched: [] });
  });

  it("ignores a second choice on the same card, so a changed mind never counts", () => {
    const miss = chooseVerdict(startFlip(), cards, "no");
    expect(chooseVerdict(miss, cards, "yes")).toBe(miss);
  });

  it("moves on only after a verdict, and is done after the last card", () => {
    const s0 = startFlip();
    expect(nextCard(s0, cards)).toBe(s0);
    let s = s0;
    for (const c of cards) s = nextCard(chooseVerdict(s, cards, c.answer), cards);
    expect(isFlipDone(s, cards)).toBe(true);
    expect(s.matched).toEqual(["a", "b", "c", "d"]);
    expect(chooseVerdict(s, cards, "yes")).toBe(s);
    expect(nextCard(s, cards)).toBe(s);
  });

  it("counts a mixed round", () => {
    let s = startFlip();
    for (const [i, c] of cards.entries()) s = nextCard(chooseVerdict(s, cards, i % 2 === 0 ? c.answer : "zzz"), cards);
    expect(s.matched).toEqual(["a", "c"]);
  });
});

describe("checkFlipDeck", () => {
  it("accepts a good deck", () => {
    expect(checkFlipDeck(config)).toEqual([]);
  });

  it("flags unknown answers, duplicate ids and empty text", () => {
    const bad: FlipDeckConfig = {
      ...config,
      cards: [{ ...cards[0], answer: "maybe" }, { ...cards[1], id: "a" }, { ...cards[2], front: " " }, cards[3]],
    };
    const problems = checkFlipDeck(bad).join("\n");
    expect(problems).toContain("card a: unknown answer maybe");
    expect(problems).toContain("card a: duplicate id");
    expect(problems).toContain("card c front: empty");
  });

  it("flags text over the limits and counts out of range", () => {
    const long = "x".repeat(200);
    const problems = checkFlipDeck({
      ...config,
      verdicts: [config.verdicts[0]],
      cards: [{ ...cards[0], front: long, back: long, source: long }],
      prompt: long,
      endNote: long,
    }).join("\n");
    expect(problems).toContain("1 verdicts, need 2 or 3");
    expect(problems).toContain("1 cards, need 4 to 8");
    expect(problems).toContain("card a front: 200 characters, at most 90");
    expect(problems).toContain("card a back: 200 characters, at most 170");
    expect(problems).toContain("card a source: 200 characters, at most 44");
    expect(problems).toContain("prompt: 200 characters, at most 38");
    expect(problems).toContain("endNote: 200 characters, at most 120");
  });
});

describe("flip deck canvas", () => {
  it("server-renders the first card, the verdict buttons and the limits fold", () => {
    const Canvas = makeFlipDeckCanvas(config);
    const html = renderToString(createElement(Canvas, { title: "Claims", purpose: "p", limits: "Four claims only." })).replaceAll("<!-- -->", "");
    expect(html).toContain("<svg");
    expect(html).toContain("Claim number a");
    expect(html).toContain("Card 1 of 4");
    expect(html).toContain("Claim you may hear");
    expect(html).toContain("Pick a verdict, then flip");
    expect(html).toContain("What this picture leaves out");
    expect(html.match(/<button/g)?.length).toBe(3);
    expect(html).not.toContain("Source a");
  });
});
