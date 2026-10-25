import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  blockIds,
  layoutScreen,
  overflowingText,
  textWidth,
  wrapText,
  type SpecScreen,
} from "@buildment/learning-ui/canvas/models/ui-specimen";
import {
  SpecimenCompare,
  SpecimenLadder,
  SpecimenSkim,
  SpecimenSpot,
  spotTap,
  SPOT_DEFAULT_FINE,
  type SpotTarget,
} from "@buildment/learning-ui/canvas/primitives/specimen-beats";

const card: SpecScreen = {
  alt: "A sign-up card.",
  blocks: [
    { kind: "nav", title: "Tabeeb", action: "Help" },
    { kind: "text", id: "title", text: "Book a clinic visit in under a minute", size: 22, weight: 700 },
    { kind: "text", text: "Pick a day, a time and a doctor. We send a reminder the night before.", tone: "muted" },
    { kind: "field", id: "phone", label: "Phone number", placeholder: "059 123 4567" },
    { kind: "button", id: "go", label: "Book a visit", full: true },
    { kind: "row", children: [{ kind: "stat", value: "3", label: "doctors today" }, { kind: "stat", value: "12", label: "free slots" }] },
  ],
};

describe("ui specimen layout", () => {
  it("wraps text to the column and never lets a line run past it", () => {
    const lines = wrapText("Pick a day, a time and a doctor. We send a reminder the night before.", 120, 13);
    expect(lines.length).toBeGreaterThan(2);
    for (const l of lines) expect(textWidth(l, 13)).toBeLessThanOrEqual(120);
    expect(overflowingText(layoutScreen(card))).toEqual([]);
  });

  it("places every block with an id as a region inside the page", () => {
    const layout = layoutScreen(card);
    expect(layout.regions.map((r) => r.id)).toEqual(["title", "phone", "go"]);
    for (const r of layout.regions) {
      expect(r.x).toBeGreaterThanOrEqual(layout.page.x);
      expect(r.x + r.w).toBeLessThanOrEqual(layout.page.x + layout.page.w + 0.5);
      expect(r.y + r.h).toBeLessThanOrEqual(layout.page.y + layout.page.h + 0.5);
    }
    expect(blockIds(card.blocks)).toEqual(["title", "phone", "go"]);
  });

  it("grows the screen when the gap grows, and keeps the order of blocks", () => {
    const tight = layoutScreen({ ...card, gap: 4 });
    const loose = layoutScreen({ ...card, gap: 24 });
    expect(loose.height - tight.height).toBe(20 * (card.blocks.length - 1));
    const ys = loose.regions.map((r) => r.y);
    expect([...ys].sort((a, b) => a - b)).toEqual(ys);
  });

  it("sizes boxes around their children and draws the box under them", () => {
    const layout = layoutScreen({ alt: "A box.", frame: "none", pad: 0, blocks: [{ kind: "box", id: "b", pad: 10, children: [{ kind: "text", text: "Hello" }] }] });
    const first = layout.items[0];
    expect(first.type).toBe("rect");
    expect(first.type === "rect" && first.h).toBe(layout.regions[0].h);
  });
});

describe("spot game rules", () => {
  const targets: SpotTarget[] = [
    { id: "a", label: "Glow", why: "It decorates." },
    { id: "b", label: "Pills", why: "They shout." },
  ];
  it("counts a new find once and explains it", () => {
    const one = spotTap([], targets, undefined, "a");
    expect(one.found).toEqual(["a"]);
    expect(one.message).toBe("1 of 2. Glow: It decorates.");
    expect(spotTap(one.found, targets, undefined, "a").found).toEqual(["a"]);
  });
  it("explains a part that is fine, with a fallback", () => {
    expect(spotTap([], targets, { c: "The price is real content." }, "c")).toEqual({ found: [], message: "The price is real content.", right: false });
    expect(spotTap([], targets, undefined, "z").message).toBe(SPOT_DEFAULT_FINE);
  });
});

describe("specimen beats render on the server", () => {
  const base = { title: "T", limits: "L" };
  it("draws the first frame of each beat", () => {
    const compare = renderToString(
      createElement(SpecimenCompare, {
        ...base,
        choiceLabel: "Version",
        hint: "Switch versions.",
        versions: [
          { id: "a", label: "Before", screen: card, verdict: { text: "Hard to scan", tone: "bad" } },
          { id: "b", label: "After", screen: { ...card, gap: 20 }, verdict: { text: "One thing first", tone: "good" } },
        ],
      })
    );
    expect(compare).toContain("Hard to scan");
    const ladder = renderToString(
      createElement(SpecimenLadder, {
        ...base,
        label: "Spacing",
        ends: ["tight", "loose"],
        caption: "Drag to change spacing",
        hint: "Drag the picture.",
        steps: [4, 12, 24].map((g) => ({ screen: { ...card, gap: g }, verdict: { text: `Gap ${g}`, tone: "accent" as const }, valueText: `Gap ${g}` })),
        start: 1,
      })
    );
    expect(ladder).toContain("Gap 12");
    const spot = renderToString(
      createElement(SpecimenSpot, { ...base, screen: card, targets: [{ id: "go", label: "Button", why: "x" }], hint: "Tap problems.", startVerdict: "Find 1 problem", doneVerdict: "All found" })
    );
    expect(spot).toContain("Find 1 problem");
    const skim = renderToString(
      createElement(SpecimenSkim, { ...base, screen: card, seconds: 10, question: "Q?", options: [{ id: "x", label: "X" }], answer: "x", why: { x: "y" }, hint: "Press Start." })
    );
    expect(skim).toContain("You get 10 seconds");
  });
});
