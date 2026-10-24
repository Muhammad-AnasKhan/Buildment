import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  checkDesign,
  describeDesignFrame,
  designFrame,
  flowPacket,
  HOP_SECONDS,
  labelHop,
  nextPhase,
  VERDICT_MAX,
  type DesignSpec,
} from "@buildment/learning-ui/canvas/models/design-stepper";
import { pasteBoxDesign } from "@buildment/learning-ui/canvas/sysdesign-m1-design-loop/pastebox";
import { sysdesignM1DesignLoop } from "@buildment/learning-ui/canvas/sysdesign-m1-design-loop/data";

const ids = (xs: { id: string }[]) => xs.map((x) => x.id).sort();
const step = (id: string) => pasteBoxDesign.steps.findIndex((s) => s.id === id);

describe("design stepper model", () => {
  it("draws PasteBox cleanly at every step and phase", () => {
    expect(checkDesign(pasteBoxDesign)).toEqual([]);
  });

  it("follows the six steps of the chapter", () => {
    expect(pasteBoxDesign.steps.map((s) => s.title)).toEqual(["Clarify", "Estimate", "Sketch", "Deep dive", "Trade-offs", "Failure"]);
  });

  it("carries the design forward: later steps keep what earlier steps added", () => {
    let before = new Set<string>();
    pasteBoxDesign.steps.forEach((_, i) => {
      const f = designFrame(pasteBoxDesign, i);
      const now = new Set([...ids(f.actors), ...ids(f.tags), ...ids(f.links)]);
      for (const id of before) expect(now.has(id), `step ${i + 1} lost ${id}`).toBe(true);
      before = now;
    });
  });

  it("starts with no blocks: only the scope and its three answers", () => {
    const f = designFrame(pasteBoxDesign, step("clarify"));
    expect(ids(f.actors)).toEqual(["scope"]);
    expect(f.tags.map((t) => t.text)).toEqual(["up to 1 MB", "kept 30 days", "no edits"]);
    expect(f.links).toEqual([]);
    expect(f.flows).toEqual([]);
  });

  it("shows the chapter's driving number from the estimate on", () => {
    expect(designFrame(pasteBoxDesign, step("clarify")).tags.some((t) => t.text === "12 reads/s")).toBe(false);
    for (let i = step("estimate"); i < pasteBoxDesign.steps.length; i++) {
      expect(designFrame(pasteBoxDesign, i).tags.some((t) => t.text === "12 reads/s")).toBe(true);
    }
  });

  it("sketches the chapter's blocks and runs requests along lit links", () => {
    const f = designFrame(pasteBoxDesign, step("sketch"));
    expect(ids(f.actors)).toEqual(["app1", "app2", "browser", "db", "lb", "scope"]);
    expect(f.flows.map((x) => x.ids.join(">"))).toEqual(["browser>lb>app1>db", "browser>lb>app2>db"]);
    expect(f.links.every((l) => l.lit)).toBe(true);
    expect(f.actors.filter((a) => a.isNew).map((a) => a.id).sort()).toEqual(["app1", "app2", "browser", "db", "lb"]);
  });

  it("flips the cache: the pill and verdict change, the database stays under 1% busy", () => {
    const i = step("trade-offs");
    const off = designFrame(pasteBoxDesign, i, 0);
    const on = designFrame(pasteBoxDesign, i, 1);
    const cache = (f: typeof off) => f.actors.find((a) => a.id === "cache")!;
    expect(cache(off).ghost).toBe(true);
    expect(off.flows.some((x) => x.ids.includes("cache"))).toBe(false);
    expect(off.action).toMatchObject({ label: "Add a cache", toggle: true, pressed: false, target: "cache" });
    expect(off.verdict.tone).toBe("good");
    expect(cache(on).ghost).toBe(false);
    expect(cache(on).status).toEqual({ text: "+cost, +stale", tone: "warn" });
    expect(on.actors.find((a) => a.id === "db")!.status?.text).toContain("<1% busy");
    expect(on.action).toMatchObject({ label: "Remove the cache", pressed: true });
    expect(on.verdict).not.toEqual(off.verdict);
    expect(nextPhase(pasteBoxDesign, i, 1)).toBe(0);
  });

  it("breaks the database: links go dashed red, requests stop there, then the standby takes over", () => {
    const i = step("failure");
    const calm = designFrame(pasteBoxDesign, i, 0);
    expect(calm.action?.label).toBe("Break the database");
    expect(calm.links.some((l) => l.broken)).toBe(false);

    const down = designFrame(pasteBoxDesign, i, 1);
    expect(down.actors.find((a) => a.id === "db")).toMatchObject({ broken: true, mark: "bad" });
    expect(down.links.filter((l) => l.broken).map((l) => l.id).sort()).toEqual(["app1-db", "app2-db"]);
    expect(down.flows.every((f) => f.cut && f.tone === "bad" && f.ids.at(-1) === "db")).toBe(true);
    expect(down.verdict.tone).toBe("bad");
    expect(down.actors.some((a) => a.id === "standby")).toBe(false);

    const ready = designFrame(pasteBoxDesign, i, 2);
    expect(ready.actors.find((a) => a.id === "standby")?.isNew).toBe(true);
    expect(ready.links.some((l) => l.broken)).toBe(false);

    const over = designFrame(pasteBoxDesign, i, 3);
    expect(over.flows.map((f) => f.ids.at(-1))).toEqual(["standby", "standby"]);
    expect(over.flows.every((f) => !f.cut)).toBe(true);
    expect(over.links.find((l) => l.id === "db-standby")?.broken).toBe(true);
    expect(over.verdict).toEqual({ text: "Standby takes over: users served", tone: "good" });
    expect(nextPhase(pasteBoxDesign, i, 3)).toBe(0);
  });

  it("does not carry a step's action into other steps", () => {
    // Asking for a phase on a step without an action gives phase 0.
    expect(designFrame(pasteBoxDesign, step("sketch"), 3).phase).toBe(0);
    expect(nextPhase(pasteBoxDesign, step("sketch"), 0)).toBe(0);
  });

  it("keeps every verdict short and every frame describable", () => {
    pasteBoxDesign.steps.forEach((s, i) => {
      const n = Math.max(1, s.action?.phases.length ?? 0);
      for (let p = 0; p < n; p++) {
        const f = designFrame(pasteBoxDesign, i, p);
        expect(f.verdict.text.length).toBeLessThanOrEqual(VERDICT_MAX);
        expect(f.says.length).toBeGreaterThan(10);
        expect(describeDesignFrame(f, pasteBoxDesign.steps.length)).toContain(f.verdict.text);
      }
    });
  });

  it("clamps bad step and phase numbers", () => {
    expect(designFrame(pasteBoxDesign, -4).step).toBe(0);
    expect(designFrame(pasteBoxDesign, 99).step).toBe(5);
    expect(designFrame(pasteBoxDesign, Number.NaN).step).toBe(0);
    expect(designFrame(pasteBoxDesign, step("failure"), 42).phase).toBe(3);
  });

  it("moves a request hop by hop, rests between runs, and labels the longest hop", () => {
    const f = designFrame(pasteBoxDesign, step("sketch")).flows[0];
    expect(flowPacket(f, 0)).toMatchObject({ x: 66, y: 165, hop: 0 });
    const mid = flowPacket(f, HOP_SECONDS * 1.5)!;
    expect(mid.hop).toBe(1);
    expect(mid.progress).toBeCloseTo(0.5);
    expect(flowPacket(f, HOP_SECONDS * 3 + 0.1)).toBeNull();
    expect(flowPacket(f, Number.NaN)).toBeNull();
    expect(labelHop(f)).toBe(1);
  });

  it("reports broken design data", () => {
    const bad: DesignSpec = {
      width: 200,
      height: 200,
      steps: [
        {
          id: "x",
          title: "X",
          patch: {
            actors: [
              { id: "a", label: "A", kind: "server", x: 60, y: 80 },
              { id: "b", label: "B", kind: "server", x: 70, y: 90 },
            ],
            links: [{ id: "a-z", from: "a", to: "z" }],
            status: { a: { text: "a very long status pill" } },
            flows: [{ path: ["a", "nope"] }],
          },
          verdict: { text: "This verdict is far too long to read on a phone", tone: "good" },
          says: "Something happened here.",
          hint: "Tap.",
          action: { phases: [{ button: "Only one" }] },
        },
      ],
    };
    const problems = checkDesign(bad).join("\n");
    expect(problems).toMatch(/link a-z joins an unknown actor/);
    expect(problems).toMatch(/flow names unknown nope/);
    expect(problems).toMatch(/verdict/);
    expect(problems).toMatch(/status "a very long status pill"/);
    expect(problems).toMatch(/a overlaps b/);
    expect(problems).toMatch(/at least 2 phases/);
  });
});

describe("sysdesign-m1-design-loop canvas", () => {
  it("server-renders the picture, the six step chips and the limits fold", () => {
    const html = renderToString(
      createElement(sysdesignM1DesignLoop.component, {
        title: sysdesignM1DesignLoop.title,
        purpose: sysdesignM1DesignLoop.purpose,
        limits: sysdesignM1DesignLoop.limits,
      })
    );
    expect(html).toContain("<svg");
    expect(html).toContain("What this picture leaves out");
    for (const t of ["Clarify", "Estimate", "Sketch", "Deep dive", "Trade-offs", "Failure"]) expect(html).toContain(t);
    expect(html).toContain("Scope fixed before any drawing");
  });

  it("states honest limits and no em dashes", () => {
    const text = [sysdesignM1DesignLoop.title, sysdesignM1DesignLoop.purpose, sysdesignM1DesignLoop.limits, JSON.stringify(pasteBoxDesign)].join(" ");
    expect(sysdesignM1DesignLoop.limits).toMatch(/fictional/);
    expect(text).not.toContain(String.fromCharCode(0x2014));
  });
});
