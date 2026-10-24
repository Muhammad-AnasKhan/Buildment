import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { InteractiveCanvas } from "@/canvas/InteractiveCanvas";
import { BOUNDS, DEFAULT_INPUT, WINDOW_START, dishCutoff, simulateWindow } from "@/canvas/sufra-window-fill-and-cutoff/model";

describe("Sufra window fill and cutoff", () => {
  it("renders through the reader registry with visible limits and text decisions", () => {
    const html = renderToString(createElement(InteractiveCanvas, { slug: "sufra-window-fill-and-cutoff" })).replaceAll("<!-- -->", "");
    expect(html).toContain("Which orders fit this kitchen window?");
    expect(html).toContain("Maqluba cutoff");
    expect(html).toContain("11:10");
    expect(html).toContain("Past cutoff");
    expect(html).toContain("No capacity");
    expect(html).toContain("Limits of the model");
    expect(html).toContain("aria-label=\"Maqluba accepts arrivals before 11:10\"");
  });

  it("matches the chapter case and distinguishes late food from full capacity", () => {
    const run = simulateWindow(DEFAULT_INPUT);
    expect(run.generalCutoff).toBe(12 * 60);
    expect(run.slowCutoff).toBe(11 * 60 + 10);
    expect(run.fastCutoff).toBe(12 * 60);
    expect(run.results.map((row) => row.decision)).toEqual(["accepted", "cutoff", "accepted", "capacity"]);
    expect(run.results[1].remainingBefore).toBe(2);
    expect(run.used).toBe(5);
  });

  it("closes at the exact dish cutoff, and allows one minute earlier when space remains", () => {
    const before = simulateWindow({ ...DEFAULT_INPUT, capacity: 12, arrivals: [{ id: "a", dish: "slow", minute: 11 * 60 + 9 }] });
    const at = simulateWindow({ ...DEFAULT_INPUT, capacity: 12, arrivals: [{ id: "a", dish: "slow", minute: 11 * 60 + 10 }] });
    expect(before.results[0].decision).toBe("accepted");
    expect(at.results[0].decision).toBe("cutoff");
    expect(at.remaining).toBe(12);
  });

  it("a general cutoff can move earlier than the fast dish lead", () => {
    const run = simulateWindow({ ...DEFAULT_INPUT, generalLead: 90, capacity: 12, arrivals: [{ id: "f", dish: "fast", minute: 11 * 60 + 31 }] });
    expect(run.fastCutoff).toBe(11 * 60 + 30);
    expect(run.results[0].decision).toBe("cutoff");
    expect(dishCutoff(WINDOW_START, 60, 90)).toBe(11 * 60 + 10);
  });

  it("more capacity can admit fast food without reopening a late slow dish", () => {
    const run = simulateWindow({ ...DEFAULT_INPUT, capacity: 7 });
    expect(run.results.map((row) => row.decision)).toEqual(["accepted", "cutoff", "accepted", "accepted"]);
    expect(run.used).toBe(7);
  });

  it("processes equal-time arrivals in displayed input order", () => {
    const run = simulateWindow({ ...DEFAULT_INPUT, capacity: 3, arrivals: [
      { id: "fast", dish: "fast", minute: 11 * 60 },
      { id: "slow", dish: "slow", minute: 11 * 60 },
    ] });
    expect(run.results.map((row) => [row.id, row.decision])).toEqual([["fast", "accepted"], ["slow", "capacity"]]);
  });

  it("clamps invalid values and never spends capacity on a rejected arrival", () => {
    const run = simulateWindow({ ...DEFAULT_INPUT, capacity: -9, fastLoad: 99, generalLead: Number.NaN, arrivals: [
      { id: "late", dish: "fast", minute: 10000 },
      { id: "early", dish: "fast", minute: -100 },
    ] });
    expect(run.input.capacity).toBe(BOUNDS.capacity.min);
    expect(run.input.fastLoad).toBe(BOUNDS.fastLoad.max);
    expect(run.generalCutoff).toBe(12 * 60);
    expect(run.results.map((row) => row.decision)).toEqual(["capacity", "cutoff"]);
    expect(run.remaining).toBe(2);
  });
});
