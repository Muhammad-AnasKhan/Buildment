import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  checkWordSampler,
  draw,
  resetContext,
  shares,
  startSampler,
  topDrawn,
  totalDraws,
  type SamplerContext,
  type WordSamplerConfig,
} from "@buildment/learning-ui/canvas/models/word-sampler";
import { makeWordSamplerCanvas } from "@buildment/learning-ui/canvas/primitives/canvas-factories";

const plain: SamplerContext = {
  id: "plain",
  label: "No context",
  prompt: "The best store is ___.",
  words: [{ word: "Redis", weight: 6 }, { word: "Postgres", weight: 3 }, { word: "Kafka", weight: 1 }],
};
const rich: SamplerContext = {
  id: "rich",
  label: "With facts",
  prompt: "For a huge log, the best store is ___.",
  words: [{ word: "Kafka", weight: 8 }, { word: "Redis", weight: 1 }],
};
const config: WordSamplerConfig = { contexts: [plain, rich], manyCount: 20, hint: "Ask a few times.", seed: 7 };

describe("word sampler model", () => {
  it("turns weights into shares that sum to 1", () => {
    const s = shares(plain);
    expect(s.Redis).toBeCloseTo(0.6);
    expect(s.Postgres).toBeCloseTo(0.3);
    expect(Object.values(s).reduce((a, b) => a + b, 0)).toBeCloseTo(1);
    expect(shares({ ...plain, words: [{ word: "A", weight: 0 }, { word: "B", weight: 0 }] })).toEqual({ A: 0.5, B: 0.5 });
  });

  it("starts with empty tallies for every word and no last word", () => {
    const s = startSampler(config);
    expect(s.tally.plain).toEqual({ Redis: 0, Postgres: 0, Kafka: 0 });
    expect(s.last).toEqual({ plain: null, rich: null });
  });

  it("gives the same draws for the same seed, and different draws for another", () => {
    const a = draw(startSampler(config), config, "plain", 40);
    const b = draw(startSampler(config), config, "plain", 40);
    expect(a).toEqual(b);
    const other = { ...config, seed: 99 };
    const c = draw(startSampler(other), other, "plain", 40);
    expect(c.tally.plain).not.toEqual(a.tally.plain);
  });

  it("is the same whether you draw in one batch or one at a time", () => {
    let one = startSampler(config);
    for (let i = 0; i < 12; i++) one = draw(one, config, "plain", 1);
    expect(one).toEqual(draw(startSampler(config), config, "plain", 12));
  });

  it("counts every draw, remembers the last word and leaves other contexts alone", () => {
    const s = draw(startSampler(config), config, "plain", 25);
    expect(totalDraws(s, "plain")).toBe(25);
    expect(totalDraws(s, "rich")).toBe(0);
    expect(Object.keys(s.tally.plain)).toContain(s.last.plain);
    expect(s.last.rich).toBeNull();
  });

  it("follows the weights over many draws: the common word wins most of the time", () => {
    const s = draw(startSampler(config), config, "plain", 3000);
    const t = s.tally.plain;
    expect(t.Redis / 3000).toBeGreaterThan(0.55);
    expect(t.Redis / 3000).toBeLessThan(0.65);
    expect(t.Redis).toBeGreaterThan(t.Postgres);
    expect(t.Postgres).toBeGreaterThan(t.Kafka);
    expect(topDrawn(s, plain)).toMatchObject({ word: "Redis", total: 3000 });
  });

  it("changes the odds with the context", () => {
    const s = draw(startSampler(config), config, "rich", 500);
    expect(topDrawn(s, rich)?.word).toBe("Kafka");
  });

  it("ignores unknown contexts and non-positive counts", () => {
    const s = startSampler(config);
    expect(draw(s, config, "nope", 5)).toBe(s);
    expect(draw(s, config, "plain", 0)).toBe(s);
    expect(draw(s, config, "plain", -3)).toBe(s);
    expect(topDrawn(s, plain)).toBeNull();
  });

  it("clears one context only", () => {
    let s = draw(draw(startSampler(config), config, "plain", 10), config, "rich", 10);
    s = resetContext(s, "plain");
    expect(totalDraws(s, "plain")).toBe(0);
    expect(s.last.plain).toBeNull();
    expect(totalDraws(s, "rich")).toBe(10);
    expect(resetContext(s, "ghost")).toBe(s);
  });
});

describe("checkWordSampler", () => {
  it("accepts a good config", () => {
    expect(checkWordSampler(config)).toEqual([]);
  });

  it("flags a missing blank, bad weights and duplicate words", () => {
    const bad: WordSamplerConfig = {
      ...config,
      contexts: [{ ...plain, prompt: "No blank here.", words: [{ word: "A", weight: 0 }, { word: "A", weight: -1 }, { word: "B", weight: Number.NaN }] }],
    };
    const problems = checkWordSampler(bad).join("\n");
    expect(problems).toContain("prompt has no ___ blank");
    expect(problems).toContain("duplicate word A");
    expect(problems).toContain("weight of A is 0");
    expect(problems).toContain("weight of A is -1");
    expect(problems).toContain("weight of B is NaN");
  });

  it("flags counts out of range", () => {
    const one = { ...plain, words: [plain.words[0]] };
    const problems = checkWordSampler({ contexts: [one, one, one, { ...one, id: "d" }], manyCount: 9, hint: "h", seed: 0 }).join("\n");
    expect(problems).toContain("4 contexts, need 1 to 3");
    expect(problems).toContain("manyCount 9");
    expect(problems).toContain("seed 0");
    expect(problems).toContain("1 words, need 2 to 6");
    expect(problems).toContain("context plain: duplicate id");
    expect(checkWordSampler({ ...config, manyCount: 51 }).join()).toContain("manyCount 51");
  });
});

describe("word sampler canvas", () => {
  it("server-renders the prompt, one bar per word, both buttons and the context tabs", () => {
    const Canvas = makeWordSamplerCanvas(config);
    const html = renderToString(createElement(Canvas, { title: "Ask a model", purpose: "p", limits: "Made-up odds." })).replaceAll("<!-- -->", "");
    expect(html).toContain("<svg");
    expect(html).toContain("The best store is");
    expect(html).toContain("Redis");
    expect(html).toContain("60%");
    expect(html).toContain("Illustrative numbers");
    expect(html).toContain("Ask once");
    expect(html).toContain("Ask 20 times");
    expect(html).toContain("No context");
    expect(html).toContain("With facts");
    expect(html).toContain("What this picture leaves out");
    expect(html.match(/role="radio"/g)?.length).toBe(2);
  });

  it("shows no context tabs for a single context", () => {
    const Canvas = makeWordSamplerCanvas({ ...config, contexts: [plain] });
    const html = renderToString(createElement(Canvas, { title: "t", purpose: "p", limits: "l" }));
    expect(html).not.toContain('role="radio"');
    expect(html.match(/<button/g)?.length).toBe(2);
  });
});
