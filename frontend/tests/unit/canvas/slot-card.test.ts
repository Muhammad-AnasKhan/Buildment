import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  checkSlots,
  counterLabel,
  filledCount,
  isComplete,
  isPlaced,
  placeChip,
  poolLayout,
  poolRows,
  selectChip,
  SLOT_CHARS,
  SLOT_GEO,
  slotFrame,
  slotVerdict,
  startSlots,
  type CardSlot,
  type SlotChip,
} from "@buildment/learning-ui/canvas/models/slot-card";
import { wrapWords } from "@buildment/learning-ui/canvas/models/sorter";
import { careerM3ClaimCard, CLAIM_CARD_CONFIG, CLAIM_CHIPS, CLAIM_SLOTS } from "@buildment/learning-ui/canvas/career-m3-claim-card/data";

const slots: CardSlot[] = [
  { id: "m", label: "Metric" },
  { id: "b", label: "Before" },
  { id: "a", label: "After" },
];
const chips: SlotChip[] = [
  { id: "m", text: "Page load time", slot: "m", why: "This is the Metric." },
  { id: "b", text: "4 s", slot: "b", why: "This is the Before value." },
  { id: "a", text: "1 s", slot: "a", why: "This is the After value." },
  { id: "x", text: "Much snappier", slot: null, why: "A feeling is not a measurement." },
  { id: "y", text: "Best ever", slot: null, why: "No one can check this." },
];
// A fixture for the pool and frame tests, so the model is pinned whatever the course data says:
// six slots, six right chips (the last one long enough to go wide) and three that fit nowhere.
const bigSlots: CardSlot[] = [
  { id: "metric", label: "Metric" },
  { id: "before", label: "Before" },
  { id: "after", label: "After" },
  { id: "window", label: "Window" },
  { id: "source", label: "Source" },
  { id: "share", label: "Your share" },
];
const bigChips: SlotChip[] = [
  { id: "metric", text: "Run time of the join step", slot: "metric", why: "This names what was measured." },
  { id: "before", text: "50 minutes", slot: "before", why: "This is the run time before." },
  { id: "after", text: "20 minutes", slot: "after", why: "This is the run time after." },
  { id: "window", text: "The nights before and after my change", slot: "window", why: "This says how long it was measured." },
  { id: "source", text: "The nightly job logs", slot: "source", why: "This says where the numbers come from." },
  { id: "share", text: "I rewrote the join step; new machines helped", slot: "share", why: "This says who did what." },
  { id: "team", text: "70 percent, 5 hours down to 1.5 hours", slot: null, why: "New machines helped too." },
  { id: "felt", text: "It felt much faster", slot: null, why: "A feeling is not a measurement." },
  { id: "guess", text: "About 70 percent, the AI estimated", slot: null, why: "A tool's guess is not a source." },
];
const input = (extra: Partial<Parameters<typeof checkSlots>[0]> = {}) => ({ slots, chips, cardTitle: "Claim", assembled: "Cut page load time from 4 s to 1 s.", endNote: "Done.", ...extra });

describe("slot card model", () => {
  it("deals the pool in a stable shuffled order that holds every chip", () => {
    const s = startSlots(slots, chips, 1);
    expect(s.order).toEqual(startSlots(slots, chips, 1).order);
    expect([...s.order].sort()).toEqual(chips.map((c) => c.id).sort());
    expect(Object.values(s.filled)).toEqual([null, null, null]);
    expect(startSlots(slots, chips, 0).order).toEqual(chips.map((c) => c.id));
  });

  it("picks a chip up and puts it down again", () => {
    const s0 = startSlots(slots, chips);
    const s1 = selectChip(s0, "m");
    expect(s1.selected).toBe("m");
    expect(selectChip(s1, "m").selected).toBeNull();
    expect(selectChip(s1, "b").selected).toBe("b");
    expect(selectChip(s0, "nope")).toBe(s0);
  });

  it("snaps a right chip into its slot and clears the selection", () => {
    const s0 = selectChip(startSlots(slots, chips), "b");
    const { state, outcome } = placeChip(s0, chips, slots, "b");
    expect(outcome).toMatchObject({ kind: "right" });
    expect(state.filled.b).toBe("b");
    expect(state.selected).toBeNull();
    expect(isPlaced(state, "b")).toBe(true);
    expect(filledCount(state)).toBe(1);
    expect(counterLabel(state, slots)).toBe("Checkable parts: 1 of 3");
    expect(selectChip(state, "b")).toBe(state);
  });

  it("refuses a chip with no slot, or one tried in another slot, with its reason", () => {
    const s0 = startSlots(slots, chips);
    const guess = placeChip(s0, chips, slots, "m", "x");
    expect(guess.outcome).toMatchObject({ kind: "wrong", reason: "A feeling is not a measurement." });
    expect(guess.state.misses).toBe(1);
    expect(isPlaced(guess.state, "x")).toBe(false);
    const swapped = placeChip(guess.state, chips, slots, "a", "b");
    expect(swapped.outcome).toMatchObject({ kind: "wrong", reason: "This is the Before value." });
    expect(swapped.state.misses).toBe(2);
  });

  it("ignores a full slot, an unknown slot, a placed chip and no chip", () => {
    const s1 = placeChip(startSlots(slots, chips), chips, slots, "m", "m").state;
    expect(placeChip(s1, chips, slots, "m", "x").outcome.kind).toBe("ignored");
    expect(placeChip(s1, chips, slots, "zz", "b").outcome.kind).toBe("ignored");
    expect(placeChip(s1, chips, slots, "b", "m").outcome.kind).toBe("ignored");
    expect(placeChip(s1, chips, slots, "b").outcome.kind).toBe("ignored");
  });

  it("completes when every slot is full and gives the verdict", () => {
    let s = startSlots(slots, chips);
    s = placeChip(s, chips, slots, "m", "y").state;
    for (const id of ["m", "b", "a"]) s = placeChip(s, chips, slots, id, id).state;
    expect(isComplete(s)).toBe(true);
    expect(slotVerdict(s)).toBe("Every part checkable, 1 wrong try");
    expect(slotVerdict({ ...s, misses: 0 })).toBe("Every part checkable, first try");
    expect(slotVerdict({ ...s, misses: 3 })).toBe("Every part checkable, 3 wrong tries");
    expect(slotVerdict({ ...s, misses: 3 }, { clean: "c", one: "o", many: "{n} misses" })).toBe("3 misses");
  });

  it("lays the pool out in two columns with long chips on their own row, inside the picture", () => {
    const order = startSlots(bigSlots, bigChips, 1).order;
    const boxes = poolLayout(order, bigChips, 500);
    expect(boxes).toHaveLength(bigChips.length);
    expect(boxes.find((b) => b.id === "share")?.wide).toBe(true);
    for (const b of boxes) {
      expect(b.x).toBeGreaterThanOrEqual(0);
      expect(b.x + b.w).toBeLessThanOrEqual(SLOT_GEO.width);
      expect(b.lines.length).toBeLessThanOrEqual(2);
    }
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i];
        const c = boxes[j];
        const overlap = a.x < c.x + c.w && c.x < a.x + a.w && a.y < c.y + SLOT_GEO.chip.h && c.y < a.y + SLOT_GEO.chip.h;
        expect(overlap, `${a.id} ${c.id}`).toBe(false);
      }
    }
    const rows = new Set(boxes.map((b) => b.y)).size;
    expect(rows).toBe(poolRows(bigChips));
    for (let seed = 1; seed < 20; seed++) {
      const bs = poolLayout(startSlots(bigSlots, bigChips, seed).order, bigChips, 0);
      expect(Math.max(...bs.map((b) => b.y)) + SLOT_GEO.chip.h, String(seed)).toBeLessThanOrEqual(poolRows(bigChips) * SLOT_GEO.chip.pitch);
    }
  });

  it("stacks the card, the strip and the pool without overlap", () => {
    const f = slotFrame(bigSlots, bigChips, true);
    expect(f.stripTop).toBeGreaterThan(f.cardBottom);
    expect(f.poolTop).toBeGreaterThanOrEqual(f.stripTop + SLOT_GEO.stripH);
    expect(f.height).toBe(f.poolTop + poolRows(bigChips) * SLOT_GEO.chip.pitch + 6);
    expect(slotFrame(slots, chips, false).cardBottom).toBeLessThan(slotFrame(slots, chips, true).cardBottom);
  });
});

describe("slot card data check", () => {
  it("passes good data", () => {
    expect(checkSlots(input())).toEqual([]);
  });

  it("finds slots with no right chip or two, unknown slots, and duplicate ids", () => {
    const bad: SlotChip[] = [
      { id: "m", text: "One", slot: "m", why: "Metric." },
      { id: "m", text: "Two", slot: "m", why: "Metric." },
      { id: "z", text: "Three", slot: "nowhere", why: "Why." },
      { id: "x", text: "Four", slot: null, why: "" },
      { id: "y", text: "Five", slot: null, why: "x".repeat(61) },
    ];
    const problems = checkSlots(input({ chips: bad }));
    expect(problems).toContain("slot m: 2 chips fill it, it needs exactly 1");
    expect(problems).toContain("slot b: 0 chips fill it, it needs exactly 1");
    expect(problems).toContain("chip m: duplicate id");
    expect(problems).toContain("chip z: unknown slot nowhere");
    expect(problems).toContain("chip x: no why");
    expect(problems).toContain("chip y: why is 61 characters, at most 60");
  });

  it("checks counts, labels, chip text, the title, the claim and the prompt", () => {
    const long = { id: "m", text: "word ".repeat(22).trim(), slot: "m", why: "Metric." };
    const problems = checkSlots(
      input({ slots: [...slots.slice(0, 2), { id: "a", label: "A label too long" }], chips: [long, ...chips.slice(1, 4)], cardTitle: "x".repeat(25), claim: "x".repeat(45), prompt: "x".repeat(39) })
    );
    expect(problems).toContain("4 chips, use 5 to 10");
    expect(problems).toContain("slot a: label must be 1 to 11 characters");
    expect(problems).toContain("chip m: text is too long for a chip");
    expect(problems).toContain("chip m: text is too long for its slot");
    expect(problems).toContain("cardTitle must be 1 to 24 characters");
    expect(problems).toContain("claim must be 1 to 44 characters");
    expect(problems).toContain("prompt is 39 characters, at most 38");
    expect(checkSlots(input({ slots: slots.slice(0, 2) }))).toContain("2 slots, use 3 to 6");
  });

  it("checks the assembled sentence fits the card and the verdicts fit the banner", () => {
    const problems = checkSlots(input({ assembled: "word ".repeat(60).trim(), endNote: "word ".repeat(200), verdicts: { clean: "x".repeat(39), one: "o", many: "{n}" } }));
    expect(problems.some((p) => p.startsWith("assembled wraps to"))).toBe(true);
    expect(problems.some((p) => p.startsWith("endNote wraps to"))).toBe(true);
    expect(problems.some((p) => p.startsWith("verdict"))).toBe(true);
    expect(checkSlots(input({ assembled: " " }))).toContain("assembled is empty");
  });
});

describe("career-m3-claim-card data", () => {
  it("passes the data check", () => {
    expect(checkSlots(CLAIM_CARD_CONFIG)).toEqual([]);
  });

  it("has one right chip for each slot, some that fit nowhere, and chips that fit their slots", () => {
    expect(CLAIM_SLOTS.length).toBeGreaterThanOrEqual(3);
    for (const slot of CLAIM_SLOTS) expect(CLAIM_CHIPS.filter((c) => c.slot === slot.id), slot.id).toHaveLength(1);
    expect(CLAIM_CHIPS.filter((c) => c.slot === null).length).toBeGreaterThan(0);
    for (const c of CLAIM_CHIPS) {
      expect(c.why.length, c.id).toBeLessThanOrEqual(60);
      if (c.slot) expect(wrapWords(c.text, SLOT_CHARS).length, c.id).toBeLessThanOrEqual(2);
    }
    expect(CLAIM_CARD_CONFIG.assembled.trim().length).toBeGreaterThan(0);
  });

  it("fills completely when every right chip goes to its slot", () => {
    let s = startSlots(CLAIM_SLOTS, CLAIM_CHIPS);
    for (const c of CLAIM_CHIPS) if (c.slot) s = placeChip(selectChip(s, c.id), CLAIM_CHIPS, CLAIM_SLOTS, c.slot).state;
    expect(isComplete(s)).toBe(true);
    expect(counterLabel(s, CLAIM_SLOTS)).toBe(`Checkable parts: ${CLAIM_SLOTS.length} of ${CLAIM_SLOTS.length}`);
  });

  it("renders on the server with the counter, the claim, and a button per slot and chip", () => {
    const html = renderToString(createElement(careerM3ClaimCard.component, { title: careerM3ClaimCard.title, purpose: careerM3ClaimCard.purpose, limits: careerM3ClaimCard.limits })).replaceAll("<!-- -->", "");
    expect(html).toContain("<svg");
    expect(html).toContain("What this picture leaves out");
    expect(html).toContain("Fill every slot with a checkable part");
    expect(html).toContain(`Checkable parts: 0 of ${CLAIM_SLOTS.length}`);
    if (CLAIM_CARD_CONFIG.claim) expect(html).toContain(CLAIM_CARD_CONFIG.claim);
    expect((html.match(/<button/g) ?? []).length).toBe(CLAIM_SLOTS.length + CLAIM_CHIPS.length);
    expect(html).not.toMatch(/#[0-9a-fA-F]{6}/);
    expect(html).not.toMatch(/foreignObject|<animate|<use|<image/);
    expect(html).not.toMatch(/[–—]/);
  });
});
