import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  bestOrder,
  checkStack,
  markerAt,
  moveBlock,
  moveTo,
  orderBlocks,
  phoneLabelText,
  proofSeen,
  SEEN_SHARE,
  spendable,
  STACK_GEO,
  STACK_LABEL_CHARS,
  stackHeight,
  stackLayout,
  stackRows,
  stackVerdict,
  type StackBlock,
} from "@buildment/learning-ui/canvas/models/budget-stack";
import { careerM1FirstLook, FIRST_LOOK_CONFIG } from "@buildment/learning-ui/canvas/career-m1-first-look/data";

// A fixture for the layout and ordering tests, so the model is pinned whatever the course data says.
// Six blocks, no notes, a 12 unit budget: the first three are seen and both proof blocks sit below.
const phoneBlocks: StackBlock[] = [
  { id: "header", label: "Name and contact line", cost: 3, kind: "context" },
  { id: "objective", label: "Objective paragraph, AI-written", cost: 5, kind: "filler" },
  { id: "skills", label: "Skills: 28 technologies in a block", cost: 4, kind: "context" },
  { id: "duties", label: "Responsible for backend services", cost: 3, kind: "filler" },
  { id: "order-api", label: "Built the order API; it handles 40 requests a second", cost: 3, kind: "proof" },
  { id: "demo", label: "Demo link", cost: 4, kind: "proof" },
];
const phoneConfig = { blocks: phoneBlocks, budget: 12, unit: "s", budgetLabel: "A quick first look", goal: 2 };

const blocks: StackBlock[] = [
  { id: "a", label: "Filler", cost: 4, kind: "filler" },
  { id: "b", label: "Context", cost: 4, kind: "context" },
  { id: "p", label: "Proof one", cost: 2, kind: "proof" },
  { id: "q", label: "Proof two", cost: 4, kind: "proof" },
];
const input = (extra: Partial<Parameters<typeof checkStack>[0]> = {}) => ({ blocks, budget: 9, unit: "s", budgetLabel: "First look", goal: 2, ...extra });
const ids = (bs: StackBlock[]) => bs.map((b) => b.id);

describe("budget stack model", () => {
  it("spends the budget top to bottom and counts a block seen when at least half of it is covered", () => {
    const rows = stackRows(blocks, 9);
    expect(rows.map((r) => [r.start, r.end])).toEqual([[0, 4], [4, 8], [8, 10], [10, 14]]);
    expect(rows.map((r) => r.covered)).toEqual([1, 1, 0.5, 0]);
    expect(rows.map((r) => r.seen)).toEqual([true, true, true, false]);
    expect(SEEN_SHARE).toBe(0.5);
    expect(stackRows(blocks, 8.9).map((r) => r.seen)).toEqual([true, true, false, false]);
  });

  it("gives the verdict against the goal, with its own wording when given", () => {
    const rows = stackRows(blocks, 9);
    expect(proofSeen(rows)).toBe(1);
    expect(stackVerdict(rows, 2)).toEqual({ met: false, text: "Only 1 of 2 proof blocks seen" });
    expect(stackVerdict(rows, 1)).toEqual({ met: true, text: "Goal met: 1 proof block seen" });
    expect(stackVerdict(rows, 2, { met: "{seen} seen", short: "{seen} of {goal}" }).text).toBe("1 of 2");
  });

  it("moves blocks up, down and to an index, and leaves the ends alone", () => {
    const order = ids(blocks);
    expect(moveBlock(order, "p", -1)).toEqual(["a", "p", "b", "q"]);
    expect(moveBlock(order, "a", -1)).toBe(order);
    expect(moveBlock(order, "q", 1)).toBe(order);
    expect(moveBlock(order, "zz", 1)).toBe(order);
    expect(moveTo(order, "q", 0)).toEqual(["q", "a", "b", "p"]);
    expect(moveTo(order, "a", 9)).toEqual(["b", "p", "q", "a"]);
    expect(ids(orderBlocks(blocks, ["q", "p", "nope"]))).toEqual(["q", "p", "a", "b"]);
  });

  it("puts the marker in the right block and stops it at the end of a short stack", () => {
    const rows = stackRows(blocks, 9);
    expect(markerAt(rows, 0)).toEqual({ index: 0, frac: 0 });
    expect(markerAt(rows, 6)).toEqual({ index: 1, frac: 0.5 });
    expect(markerAt(rows, 9)).toEqual({ index: 2, frac: 0.5 });
    expect(markerAt(rows, 99)).toEqual({ index: 3, frac: 1 });
    expect(spendable(rows, 9)).toBe(9);
    expect(spendable(stackRows(blocks, 30), 30)).toBe(14);
    expect(markerAt([], 3)).toEqual({ index: 0, frac: 0 });
  });

  it("orders proof first, cheapest first, for the best case", () => {
    expect(ids(bestOrder(blocks))).toEqual(["p", "q", "a", "b"]);
    expect(proofSeen(stackRows(bestOrder(blocks), 9))).toBe(2);
  });

  it("lays rows out without overlap and wraps labels to the column", () => {
    const rows = stackLayout(phoneBlocks);
    for (let i = 1; i < rows.length; i++) expect(rows[i].y).toBe(rows[i - 1].y + rows[i - 1].h + STACK_GEO.block.gap);
    for (const r of rows) {
      expect(r.lines.length).toBeLessThanOrEqual(2);
      for (const l of r.lines) expect(l.length).toBeLessThanOrEqual(STACK_LABEL_CHARS);
      expect(r.h).toBe(r.lines.length > 1 ? STACK_GEO.block.twoLines : STACK_GEO.block.oneLine);
    }
    const last = rows[rows.length - 1];
    expect(stackHeight(phoneBlocks)).toBe(last.y + last.h + 32);
    expect(stackHeight([...blocks.slice(0, 3), { ...blocks[3], note: "A note." }])).toBe(stackLayout(blocks)[3].y + STACK_GEO.block.oneLine + 70);
  });
});

describe("budget stack data check", () => {
  it("passes good data", () => {
    expect(checkStack(input())).toEqual([]);
  });

  it("finds impossible goals and a start that is already solved", () => {
    expect(checkStack(input({ goal: 3 }))).toContain("goal 3 is more than the 2 proof blocks");
    expect(checkStack(input({ goal: 0 }))).toContain("goal must be a whole number, 1 or more");
    expect(checkStack(input({ budget: 3.9 }))).toContain("goal 2 cannot be met in any order within the budget");
    expect(checkStack(input({ goal: 1, budget: 9 }))).toContain("the starting order already meets the goal: there is nothing to fix");
  });

  it("finds bad blocks: count, duplicate ids, long labels and notes, and costs", () => {
    const bad: StackBlock[] = [
      { id: "a", label: "x ".repeat(40).trim(), cost: 0, kind: "proof", note: "word ".repeat(30) },
      { id: "a", label: "ok", cost: 2, kind: "proof" },
      { id: "c", label: "", cost: Number.NaN, kind: "filler" },
    ];
    const problems = checkStack(input({ blocks: bad, goal: 1 }));
    expect(problems).toContain("3 blocks, use 4 to 8");
    expect(problems).toContain("a: duplicate id");
    expect(problems).toContain("a: label wraps to 3 lines, at most 2");
    expect(problems).toContain("a: cost must be more than 0");
    expect(problems).toContain("a: note wraps to more than 2 lines");
    expect(problems).toContain("c: empty label");
    expect(problems).toContain("c: cost must be more than 0");
  });

  it("checks the budget, unit, labels, prompt and verdict lengths", () => {
    const problems = checkStack(input({ budget: 0, unit: "seconds", budgetLabel: "x".repeat(37), prompt: "x".repeat(39), verdicts: { met: "x".repeat(39), short: "{seen}" } }));
    expect(problems).toContain("budget must be more than 0");
    expect(problems).toContain("unit must be 1 to 6 characters");
    expect(problems).toContain("budgetLabel must be 1 to 36 characters");
    expect(problems).toContain("prompt is 39 characters, at most 38");
    expect(problems.some((p) => p.startsWith("verdict"))).toBe(true);
    expect(phoneLabelText("A quick look", 90, "s")).toBe("A quick look: 90 s");
    expect(checkStack(input({ budgetLabel: "A label that is thirty-three long", unit: "lines" })).some((p) => p.includes("at most 41"))).toBe(true);
  });
});

describe("budget stack with a phone-sized fixture", () => {
  it("passes the data check", () => {
    expect(checkStack(phoneConfig)).toEqual([]);
  });

  it("buries the proof in the starting order and meets the goal with both proof blocks on top", () => {
    const start = stackRows(phoneBlocks, 12);
    expect(start.map((r) => r.seen)).toEqual([true, true, true, false, false, false]);
    expect(stackVerdict(start, 2)).toEqual({ met: false, text: "Only 0 of 2 proof blocks seen" });
    const oneUp = moveTo(ids(phoneBlocks), "order-api", 0);
    expect(proofSeen(stackRows(orderBlocks(phoneBlocks, oneUp), 12))).toBe(1);
    const bothUp = moveTo(oneUp, "demo", 1);
    const end = stackRows(orderBlocks(phoneBlocks, bothUp), 12);
    expect(end.filter((r) => r.seen).map((r) => r.block.id)).toEqual(["order-api", "demo", "header"]);
    expect(stackVerdict(end, 2)).toEqual({ met: true, text: "Goal met: 2 proof blocks seen" });
  });
});

describe("career-m1-first-look data", () => {
  const { blocks: data, budget, goal } = FIRST_LOOK_CONFIG;

  it("passes the data check", () => {
    expect(checkStack(FIRST_LOOK_CONFIG)).toEqual([]);
  });

  it("starts without meeting the goal and meets it with the proof blocks on top", () => {
    const start = stackRows(data, budget);
    expect(proofSeen(start)).toBeLessThan(goal);
    expect(stackVerdict(start, goal).met).toBe(false);
    const proofIds = data.filter((b) => b.kind === "proof").map((b) => b.id);
    expect(proofIds.length).toBeGreaterThanOrEqual(goal);
    const top = [...proofIds, ...ids(data).filter((id) => !proofIds.includes(id))];
    const end = stackRows(orderBlocks(data, top), budget);
    expect(proofSeen(end)).toBeGreaterThanOrEqual(goal);
    expect(stackVerdict(end, goal).met).toBe(true);
  });

  it("renders the final frame on the server: verdict, tags, Replay and one button per block", () => {
    const html = renderToString(createElement(careerM1FirstLook.component, { title: careerM1FirstLook.title, purpose: careerM1FirstLook.purpose, limits: careerM1FirstLook.limits })).replaceAll("<!-- -->", "");
    const start = stackRows(data, budget);
    const seen = start.filter((r) => r.seen).length;
    expect(html).toContain("<svg");
    expect(html).toContain("What this picture leaves out");
    expect(html).toContain(stackVerdict(start, goal).text);
    expect(html).toContain(phoneLabelText(FIRST_LOOK_CONFIG.budgetLabel, budget, FIRST_LOOK_CONFIG.unit));
    expect((html.match(/>not seen</g) ?? []).length).toBe(data.length - seen);
    expect((html.match(/>seen</g) ?? []).length).toBe(seen);
    expect(html).toContain("Replay");
    expect((html.match(/aria-pressed="false"/g) ?? []).length).toBe(data.length);
    for (const word of ["Proof", "Filler", "Context"]) expect(html).toContain(word);
    expect(html).not.toMatch(/#[0-9a-fA-F]{6}/);
    expect(html).not.toMatch(/foreignObject|<animate|<use|<image/);
    expect(html).not.toMatch(/[–—]/);
  });
});
