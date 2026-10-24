import { describe, expect, it } from "vitest";
import type { SequenceSpec } from "@buildment/learning-ui/canvas/renderers/sequence/types";
import { sequenceGeometry } from "@buildment/learning-ui/canvas/renderers/sequence/geometry";
import { hitlInterruptResume } from "@buildment/learning-ui/canvas/hitl-interrupt-resume/data";
import { mcpToolCall } from "@buildment/learning-ui/canvas/mcp-tool-call/data";
import { indirectInjectionTrace } from "@buildment/learning-ui/canvas/indirect-injection-trace/data";

// The label-fit loop from tests/unit/canvas/registry.test.ts, run on these
// three specs until the orchestrator registers them.
const specs: [string, SequenceSpec][] = [
  ["hitl-interrupt-resume", hitlInterruptResume],
  ["mcp-tool-call", mcpToolCall],
  ["indirect-injection-trace", indirectInjectionTrace],
];

describe("module 7 and 8 sequence canvases", () => {
  for (const [slug, spec] of specs) {
    it(`${slug}: steps point at real lanes and fit a phone`, () => {
      expect(spec.actors.length).toBeGreaterThanOrEqual(2);
      expect(spec.actors.length).toBeLessThanOrEqual(4);
      for (const step of spec.steps) {
        expect(step.from).toBeGreaterThanOrEqual(0);
        expect(step.to).toBeLessThan(spec.actors.length);
        expect(step.label.length, step.label).toBeLessThanOrEqual(18);
      }
      for (const layout of ["narrow", "wide"] as const) {
        const g = sequenceGeometry(spec, layout);
        spec.steps.forEach((step, i) => {
          const { label } = g.arrow(step, i);
          const w = step.label.length * g.charW;
          const left = label.anchor === "start" ? label.x : label.anchor === "end" ? label.x - w : label.x - w / 2;
          expect(left, `${layout} ${step.label}`).toBeGreaterThanOrEqual(0);
          expect(left + w, `${layout} ${step.label}`).toBeLessThanOrEqual(g.width);
        });
      }
    });

    it(`${slug}: lane names and subtitles fit a 375px phone, copy is complete`, () => {
      for (const actor of spec.actors) {
        expect(actor.name.length, actor.name).toBeLessThanOrEqual(8);
        expect((actor.sub ?? "").length, actor.sub).toBeLessThanOrEqual(10);
      }
      expect(spec.title).toBeTruthy();
      expect(spec.purpose).toBeTruthy();
      expect(spec.limits.length).toBeGreaterThan(20);
      expect(spec.tryThis?.length).toBe(2);
      for (const step of spec.steps) {
        expect(step.title, step.label).toBeTruthy();
        expect(step.note.length, step.label).toBeGreaterThan(20);
      }
    });
  }

  it("hitl-interrupt-resume uses the chapter's numbers: one thread, two emails", () => {
    const text = JSON.stringify(hitlInterruptResume);
    expect(text).toContain("refund-1042");
    expect(text).toContain("'amount': 24.0");
    const chips = hitlInterruptResume.steps.flatMap((s) => s.chips ?? []);
    expect(chips.filter((c) => c === "emails sent: 2")).toHaveLength(2);
    expect(chips).toContain("emails sent: 1");
  });

  it("mcp-tool-call names only the methods chapter 8.2 teaches", () => {
    const methods = JSON.stringify(mcpToolCall).match(/\b[a-z]+\/[a-z]+\b/g) ?? [];
    expect(new Set(methods)).toEqual(new Set(["tools/list", "tools/call"]));
  });
});
