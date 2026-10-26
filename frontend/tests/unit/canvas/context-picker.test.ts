import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  allContexts,
  checkContextConfig,
  resolveContext,
  startContext,
  type ContextPickerConfig,
} from "@buildment/learning-ui/canvas/models/context-picker";
import { makeContextPickerCanvas } from "@buildment/learning-ui/canvas/primitives/canvas-factories";

const config: ContextPickerConfig = {
  question: "Which store is fastest here?",
  factors: [
    { id: "load", label: "Workload", choices: [{ id: "read", label: "Read-heavy" }, { id: "write", label: "Write-heavy" }] },
    { id: "size", label: "Data size", choices: [{ id: "small", label: "Small" }, { id: "mid", label: "Medium" }, { id: "big", label: "Huge" }] },
  ],
  options: [
    { id: "cache", label: "Cache", sub: "memory" },
    { id: "sql", label: "SQL", sub: "row store" },
    { id: "log", label: "Log store", sub: "append only" },
  ],
  rules: [
    { when: { load: "read", size: "small" }, pick: "cache", why: "Small and read often: keep it all in memory." },
    { when: { load: "read" }, pick: "sql", why: "Read often, but too big for memory: indexes help." },
    { when: { load: "write", size: "big" }, pick: "log", why: "Huge writes are cheapest when appended." },
  ],
  fallback: { pick: "sql", why: "Nothing special: the general choice holds." },
  start: { load: "read", size: "small" },
  hint: "Tap a pill to change the context.",
};

describe("context picker model", () => {
  it("picks the first rule whose facts all match", () => {
    expect(resolveContext(config, { load: "read", size: "small" })).toMatchObject({ pick: "cache", rule: 0 });
    expect(resolveContext(config, { load: "read", size: "big" })).toMatchObject({ pick: "sql", rule: 1 });
    expect(resolveContext(config, { load: "write", size: "big" })).toMatchObject({ pick: "log", rule: 2, why: "Huge writes are cheapest when appended." });
  });

  it("falls back with rule -1 when nothing matches", () => {
    expect(resolveContext(config, { load: "write", size: "small" })).toEqual({ pick: "sql", why: "Nothing special: the general choice holds.", rule: -1 });
    expect(resolveContext(config, {}).rule).toBe(-1);
  });

  it("lists every combination in factor order, first factor slowest", () => {
    const all = allContexts(config);
    expect(all).toHaveLength(6);
    expect(all[0].context).toEqual({ load: "read", size: "small" });
    expect(all[1].context).toEqual({ load: "read", size: "mid" });
    expect(all[3].context).toEqual({ load: "write", size: "small" });
    expect(new Set(all.map((a) => a.result.pick))).toEqual(new Set(["cache", "sql", "log"]));
  });

  it("starts from the start context, or the first choices when it is incomplete", () => {
    expect(startContext(config)).toEqual({ load: "read", size: "small" });
    expect(startContext({ ...config, start: { load: "nope" } })).toEqual({ load: "read", size: "small" });
  });

  it("accepts a good config", () => {
    expect(checkContextConfig(config)).toEqual([]);
  });

  it("flags unknown ids in rules, start and fallback", () => {
    const bad: ContextPickerConfig = {
      ...config,
      rules: [
        { when: { colour: "red" }, pick: "cache", why: "x" },
        { when: { load: "sideways" }, pick: "cache", why: "x" },
        { when: { load: "read" }, pick: "ghost", why: "x" },
      ],
      fallback: { pick: "phantom", why: "x" },
      start: { load: "read", size: "tiny", extra: "a" },
    };
    const problems = checkContextConfig(bad).join("\n");
    expect(problems).toContain("rule 0: unknown factor colour");
    expect(problems).toContain("rule 1: unknown choice sideways");
    expect(problems).toContain("rule 2: unknown option ghost");
    expect(problems).toContain("fallback: unknown option phantom");
    expect(problems).toContain("start: unknown choice tiny");
    expect(problems).toContain("start: unknown factor extra");
  });

  it("flags a start that misses a factor and an option no context reaches", () => {
    const problems = checkContextConfig({ ...config, start: { load: "read" }, options: [...config.options, { id: "lonely", label: "Lonely" }] });
    expect(problems).toContain("start: missing factor size");
    expect(problems).toContain("option lonely: no context picks it");
  });

  it("flags more than 4 factors, 3 choices or 5 options", () => {
    const choice = (n: number) => Array.from({ length: n }, (_, i) => ({ id: `c${i}`, label: `C${i}` }));
    const many = Array.from({ length: 5 }, (_, i) => ({ id: `f${i}`, label: `F${i}`, choices: choice(2) }));
    const opts = Array.from({ length: 6 }, (_, i) => ({ id: `o${i}`, label: `O${i}` }));
    const problems = checkContextConfig({ ...config, factors: [...many, { id: "wide", label: "Wide", choices: choice(4) }], options: opts }).join("\n");
    expect(problems).toContain("6 factors, at most 4");
    expect(problems).toContain("factor wide: 4 choices, at most 3");
    expect(problems).toContain("6 options, at most 5");
  });
});

describe("context picker canvas", () => {
  it("server-renders the question, pills, options, reason and limits fold", () => {
    const Canvas = makeContextPickerCanvas(config);
    const html = renderToString(createElement(Canvas, { title: "Pick a store", purpose: "p", limits: "Only three facts." })).replaceAll("<!-- -->", "");
    expect(html).toContain("<svg");
    expect(html).toContain("Which store is fastest here?");
    expect(html).toContain("Read-heavy");
    expect(html).toContain("Huge");
    expect(html).toContain("row store");
    expect(html).toContain("Small and read often: keep it all in memory.");
    expect(html).toContain("What this picture leaves out");
    expect(html.match(/role="button"/g)?.length).toBe(5);
    expect(html.match(/aria-pressed="true"/g)?.length).toBe(2);
    expect(html).toContain("Reset");
  });

  it("renders the largest allowed picture: 4 factors, 3 choices, 5 options", () => {
    const factors = Array.from({ length: 4 }, (_, i) => ({ id: `f${i}`, label: `Factor ${i}`, choices: ["a", "b", "c"].map((c) => ({ id: c, label: `Choice ${c}` })) }));
    const options = Array.from({ length: 5 }, (_, i) => ({ id: `o${i}`, label: `Option ${i} name`, sub: "a longer second line" }));
    const big: ContextPickerConfig = {
      question: "A question",
      factors,
      options,
      rules: options.map((o, i) => ({ when: { f0: ["a", "b", "c"][i % 3], f1: i < 3 ? "a" : "b" }, pick: o.id, why: `Reason ${i}` })),
      fallback: { pick: "o0", why: "none" },
      start: { f0: "a", f1: "a", f2: "a", f3: "a" },
      hint: "hint",
    };
    const Canvas = makeContextPickerCanvas(big);
    const html = renderToString(createElement(Canvas, { title: "t", purpose: "p", limits: "l" }));
    expect(html.match(/role="button"/g)?.length).toBe(12);
  });
});
