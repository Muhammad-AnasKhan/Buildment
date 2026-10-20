import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CANVAS_SLUGS } from "@/shared/canvas/slugs";
import { canvasRegistry, getCanvasSpec } from "@/canvas/registry";
import { sequenceGeometry } from "@/canvas/renderers/sequence/geometry";
import { machineGeometry } from "@/canvas/renderers/state-machine/geometry";

const specs = Object.entries(canvasRegistry);

describe("canvas registry", () => {
  it("has exactly the slugs the API accepts", () => {
    expect(Object.keys(canvasRegistry).sort()).toEqual([...CANVAS_SLUGS].sort());
  });

  it("returns null for anything that is not a registered slug", () => {
    expect(getCanvasSpec("weighted-matrix-two-offers")).not.toBeNull();
    for (const bad of ["nope", "__proto__", "constructor", "toString", undefined, null, 1, {}]) {
      expect(getCanvasSpec(bad)).toBeNull();
    }
  });

  it("states its limits and gives every canvas a title and purpose", () => {
    for (const [slug, spec] of specs) {
      expect(spec.title, slug).toBeTruthy();
      expect(spec.purpose, slug).toBeTruthy();
      expect(spec.limits.length, slug).toBeGreaterThan(20);
    }
  });

  it("has a spec.md next to every canvas", () => {
    for (const slug of CANVAS_SLUGS) {
      expect(fs.existsSync(path.join("src/canvas", slug, "spec.md")), slug).toBe(true);
    }
  });
});

describe("canvas data is internally consistent", () => {
  for (const [slug, spec] of specs) {
    if (spec.kind === "sequence") {
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
    }
    if (spec.kind === "state-machine") {
      it(`${slug}: edges and steps point at real states and fit a phone`, () => {
        const ids = new Set(spec.states.map((s) => s.id));
        for (const s of spec.states) {
          expect(s.col).toBeLessThanOrEqual(2);
          expect(s.row).toBeLessThanOrEqual(2);
        }
        for (const e of spec.edges) {
          expect(ids.has(e.from), e.from).toBe(true);
          expect(ids.has(e.to), e.to).toBe(true);
        }
        for (const step of spec.steps) {
          expect(ids.has(step.state), step.state).toBe(true);
          if (step.edge !== undefined) expect(spec.edges[step.edge]).toBeDefined();
        }
        for (const layout of ["narrow", "wide"] as const) {
          const g = machineGeometry(spec, layout);
          for (const placed of g.byId.values()) {
            expect(placed.at[0] - g.halfW).toBeGreaterThanOrEqual(0);
            expect(placed.at[0] + g.halfW).toBeLessThanOrEqual(g.width);
          }
          for (const e of spec.edges) {
            const shape = g.edge(e);
            expect(shape).not.toBeNull();
            const box = g.labelBox(e, shape!);
            expect(box.x, `${layout} ${e.label}`).toBeGreaterThanOrEqual(0);
            expect(box.x + box.w, `${layout} ${e.label}`).toBeLessThanOrEqual(g.width);
            expect(box.y).toBeGreaterThanOrEqual(0);
            expect(box.y + box.h).toBeLessThanOrEqual(g.height);
          }
        }
      });
    }
    if (spec.kind === "factor") {
      it(`${slug}: weights and scores are on their scales`, () => {
        expect(spec.options.length).toBeGreaterThanOrEqual(2);
        expect(spec.options.length).toBeLessThanOrEqual(3);
        expect(spec.criteria.length).toBeGreaterThanOrEqual(3);
        expect(spec.criteria.length).toBeLessThanOrEqual(5);
        const levels = spec.weightLevels.map((l) => l.value);
        for (const c of spec.criteria) {
          expect(levels).toContain(c.weight);
          for (const o of spec.options) {
            const score = c.scores[o.id];
            expect(score, `${c.id} ${o.id}`).toBeGreaterThanOrEqual(spec.scoreScale.min);
            expect(score, `${c.id} ${o.id}`).toBeLessThanOrEqual(spec.scoreScale.max);
          }
        }
      });
    }
  }
});

describe("canvas source stays inside the SVG rules", () => {
  // agent-ip/10-interactive-canvases.md "SVG rules" and "SVG security".
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(ts|tsx)$/.test(entry.name)) files.push(full);
    }
  };
  walk("src/canvas");

  it("finds the canvas source", () => {
    expect(files.length).toBeGreaterThan(5);
  });

  for (const file of files) {
    it(`${file.replace(/\\/g, "/")}`, () => {
      const source = fs.readFileSync(file, "utf8");
      expect(source, "hex colour: use theme tokens").not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
      expect(source).not.toMatch(/dangerouslySetInnerHTML/);
      expect(source).not.toMatch(/foreignObject|<script|<animate|javascript:|xlinkHref|<image\b/);
      expect(source, "SVG <use> can pull in outside content").not.toMatch(/<use\b/);
    });
  }
});
