import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CANVAS_SLUGS } from "@/shared/canvas/slugs";
import { canvasRegistry } from "@buildment/learning-ui/canvas/registry";
import { checkDeck, wrapWords } from "@buildment/learning-ui/canvas/models/sorter";
import { STACK_BUCKETS, STACK_CARDS, seM1StackNames } from "@buildment/learning-ui/canvas/se-m1-stack-names/data";
import { seM1RequestLayers } from "@buildment/learning-ui/canvas/se-m1-request-layers/data";
import { seM1TaskShapes } from "@buildment/learning-ui/canvas/se-m1-task-shapes/data";

// Software Engineering Concepts, module 1 (chapters 1.3 to 1.5): the data of the
// three canvases is well formed and no learner-facing string carries a long dash.

const LONG_DASH = /[–—]/;

/** Every string inside a value. Functions and components are skipped. */
function strings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => strings(v, out));
  else if (typeof value === "object" && value !== null) Object.values(value).forEach((v) => strings(v, out));
  return out;
}

describe("software-engineering-concepts module 1 canvases", () => {
  it("are registered under their slugs", () => {
    for (const slug of ["se-m1-request-layers", "se-m1-task-shapes", "se-m1-stack-names"]) {
      expect(CANVAS_SLUGS as readonly string[]).toContain(slug);
      expect(canvasRegistry[slug as keyof typeof canvasRegistry], slug).toBeDefined();
    }
  });

  for (const [name, spec] of [
    ["se-m1-request-layers", seM1RequestLayers],
    ["se-m1-task-shapes", seM1TaskShapes],
  ] as const) {
    it(`${name}: lanes, labels and tones are well formed`, () => {
      expect(spec.actors.length).toBeLessThanOrEqual(4);
      expect(spec.tryThis?.length).toBeGreaterThanOrEqual(2);
      for (const step of spec.steps) {
        expect(step.label.length, step.label).toBeLessThanOrEqual(18);
        expect(step.title.length, step.title).toBeLessThanOrEqual(40);
        // A warning or good tone always comes with a text badge, so colour is never the only signal.
        if (step.tone === "warn" || step.tone === "good") expect(step.outcome, step.title).toBeTruthy();
      }
      expect(spec.steps.filter((s) => s.tone === "warn")).toHaveLength(1);
      expect(spec.steps.at(-1)?.tone).toBe("warn");
    });
  }

  it("se-m1-request-layers: one POST /tasks request goes down and back", () => {
    expect(seM1RequestLayers.steps[0].label).toBe("POST /tasks");
    expect(seM1RequestLayers.actors.map((a) => a.name)).toEqual(["Browser", "Controller", "Service", "Repository"]);
  });

  it("se-m1-task-shapes: the five shapes appear in order, then the leak", () => {
    const titles = seM1TaskShapes.steps.map((s) => s.title);
    const order = ["request body", "DTO", "domain model", "database row", "view model"];
    let at = -1;
    for (const shape of order) {
      const next = titles.findIndex((t, i) => i > at && t.startsWith("Shape") && t.toLowerCase().includes(shape.toLowerCase()));
      expect(next, shape).toBeGreaterThan(at);
      at = next;
    }
    expect(seM1TaskShapes.steps.at(-1)?.chips).toContain("owner_id");
  });

  it("se-m1-task-shapes: one leak story, and the DTO refuses isAdmin on a side road", () => {
    const steps = seM1TaskShapes.steps;
    // The clean walk-through never carries isAdmin forward; only the side road holds it.
    const holders = steps.filter((s) => s.chips?.some((c) => c.includes("isAdmin")));
    expect(holders).toHaveLength(1);
    expect(holders[0].outcome).toBe("400 names isAdmin");
    expect(holders[0].note).toContain("unknown field: isAdmin");
    // The leaked example is a task row (owner_id), not a password_hash column.
    const leak = steps.at(-1)!;
    expect(leak.chips).toEqual(["owner_id", "status", "created_at"]);
    expect(strings(leak).some((t) => t.includes("password_hash"))).toBe(false);
    // The view model step lists the real fields, with dueIn added and no owner.
    const view = steps.find((s) => s.title.startsWith("Shape 5"))!;
    expect(view.chips).toContain("id");
    expect(view.chips?.some((c) => c.startsWith("dueIn"))).toBe(true);
    expect(view.chips?.some((c) => c.toLowerCase().includes("owner"))).toBe(false);
  });

  it("se-m1-request-layers: one column rename everywhere, and the controller sends the view model", () => {
    const all = strings(seM1RequestLayers).join(" ");
    expect(all).not.toContain("Rename the table");
    expect(all).not.toContain("the table is renamed");
    expect(all).toContain("due_at");
    const last = seM1RequestLayers.steps.at(-1)!;
    expect(last.note).toContain("column");
    const send = seM1RequestLayers.steps.find((s) => s.outcome === "view model only")!;
    expect(send.from).toBe(1); // Controller
    expect(send.to).toBe(0); // Browser
    expect(send.note).toContain("mapping function");
  });

  it("se-m1-stack-names: a clean deck of 8 cards using every bucket, with short text", () => {
    expect(checkDeck(STACK_CARDS, STACK_BUCKETS)).toEqual([]);
    expect(STACK_CARDS.length).toBeLessThanOrEqual(8);
    for (const b of STACK_BUCKETS) expect(STACK_CARDS.some((c) => c.answer === b.id), b.id).toBe(true);
    for (const c of STACK_CARDS) {
      expect(wrapWords(c.text, 40).length, c.id).toBeLessThanOrEqual(3);
      for (const reason of Object.values(c.why)) expect(wrapWords(reason, 60).length, reason).toBeLessThanOrEqual(2);
    }
    for (const b of STACK_BUCKETS) expect(`Right: ${b.label}`.length).toBeLessThanOrEqual(38);
    // Fowler's original DTO is filed as a different meaning, not as Errand's DTO.
    expect(STACK_CARDS.find((c) => c.id === "fowler-pattern")?.answer).toBe("other");
  });

  it("se-m1-stack-names: no card text holds the label of its own bucket, so the job decides and not the word", () => {
    for (const c of STACK_CARDS) {
      const label = STACK_BUCKETS.find((b) => b.id === c.answer)!.label.toLowerCase();
      expect(c.text.toLowerCase(), c.id).not.toContain(label);
      expect(c.text.toLowerCase(), c.id).not.toContain("dto");
    }
    // The bucket for the stored row is gone: no sourced stack name matches it.
    expect(STACK_BUCKETS.map((b) => b.id)).toEqual(["dto", "domain", "view", "other"]);
  });

  it("se-m1-stack-names: server-renders the picture, the buckets and the limits fold", () => {
    const { component: Canvas, title, purpose, limits } = seM1StackNames;
    const html = renderToString(createElement(Canvas, { title, purpose, limits })).replaceAll("<!-- -->", "");
    expect(html).toContain("<svg");
    expect(html).toContain("What this picture leaves out");
    expect(html).toContain("Domain model");
    expect(html.match(/<button/g)?.length).toBe(STACK_BUCKETS.length);
  });

  it("carry no long dash", () => {
    const all = [...strings(seM1RequestLayers), ...strings(seM1TaskShapes), ...strings(STACK_BUCKETS), ...strings(STACK_CARDS), seM1StackNames.title, seM1StackNames.purpose, seM1StackNames.limits];
    for (const s of all) expect(LONG_DASH.test(s), s).toBe(false);
  });
});
