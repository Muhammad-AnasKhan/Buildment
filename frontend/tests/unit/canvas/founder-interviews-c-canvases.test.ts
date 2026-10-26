import { describe, expect, it } from "vitest";
import { chooseTechnicalStory } from "@buildment/learning-ui/canvas/choose-technical-story/data";
import { weaknessAnswerChoice } from "@buildment/learning-ui/canvas/weakness-answer-choice/data";
import { founderVersionFirst } from "@buildment/learning-ui/canvas/founder-version-first/data";
import { timeToThink } from "@buildment/learning-ui/canvas/time-to-think/data";
import { engineerDepthLadder } from "@buildment/learning-ui/canvas/engineer-depth-ladder/data";
import { broadToNarrowStrength } from "@buildment/learning-ui/canvas/broad-to-narrow-strength/data";
import { defaultWeights, describeChange, scoreOptions, standing } from "@buildment/learning-ui/canvas/renderers/factor/model";
import { sequenceGeometry } from "@buildment/learning-ui/canvas/renderers/sequence/geometry";
import { machineGeometry } from "@buildment/learning-ui/canvas/renderers/state-machine/geometry";
import type { FactorSpec } from "@buildment/learning-ui/canvas/renderers/factor/types";

function totalsWith(spec: FactorSpec, changes: Record<string, number>) {
  const weights = { ...defaultWeights(spec), ...changes };
  const scored = scoreOptions(spec, weights);
  return { totals: scored.totals, lead: standing(spec, scored.totals), weights };
}

describe("choose-technical-story (factor)", () => {
  it("starts with the report job in front: 36, 31 and 27", () => {
    const { totals, lead } = totalsWith(chooseTechnicalStory, {});
    expect(totals).toEqual({ "report-job": 36, "team-project": 31, "weekend-app": 27 });
    expect(lead.leaders).toEqual(["report-job"]);
  });

  it("lets the team project win only when impressive tools are very important", () => {
    expect(totalsWith(chooseTechnicalStory, { tools: 2 }).lead.leaders).toEqual(["report-job"]);
    const high = totalsWith(chooseTechnicalStory, { tools: 3 });
    expect(high.totals).toEqual({ "report-job": 38, "team-project": 41, "weekend-app": 33 });
    expect(high.lead.leaders).toEqual(["team-project"]);
  });

  it("puts the report job back in front when five whys matter most and tools matter little", () => {
    const { totals, lead } = totalsWith(chooseTechnicalStory, { "five-whys": 3 });
    expect(totals).toEqual({ "report-job": 41, "team-project": 34, "weekend-app": 30 });
    expect(lead.margin).toBe(7);
  });

  it("describes the change in words and handles the lowest weights", () => {
    const before = defaultWeights(chooseTechnicalStory);
    const after = { ...before, tools: 3 };
    expect(describeChange(chooseTechnicalStory, before, after)).toContain("The result changed.");
    const lowest = Object.fromEntries(chooseTechnicalStory.criteria.map((c) => [c.id, 1]));
    expect(Object.values(scoreOptions(chooseTechnicalStory, lowest).totals).every(Number.isFinite)).toBe(true);
  });
});

describe("weakness-answer-choice (factor)", () => {
  it("starts with all weights equal and the real weakness with a plan in front: 11, 11 and 16", () => {
    const { totals, lead } = totalsWith(weaknessAnswerChoice, {});
    expect(totals).toEqual({ humblebrag: 11, "real-no-plan": 11, "real-plan": 16 });
    expect(lead.leaders).toEqual(["real-plan"]);
  });

  it("lets the humblebrag win when feeling safe matters a lot", () => {
    const { totals, lead } = totalsWith(weaknessAnswerChoice, { safe: 3 });
    expect(totals).toEqual({ humblebrag: 21, "real-no-plan": 13, "real-plan": 20 });
    expect(lead.leaders).toEqual(["humblebrag"]);
  });

  it("puts the real weakness with a plan back in front when honesty matters a lot too", () => {
    const { totals, lead } = totalsWith(weaknessAnswerChoice, { safe: 3, honest: 3 });
    expect(totals).toEqual({ humblebrag: 25, "real-no-plan": 23, "real-plan": 30 });
    expect(lead.leaders).toEqual(["real-plan"]);
  });

  it("describes the flip in words", () => {
    const before = defaultWeights(weaknessAnswerChoice);
    expect(describeChange(weaknessAnswerChoice, before, { ...before, safe: 3 })).toContain("The result changed.");
  });
});

describe("factor specs are on their scales", () => {
  for (const spec of [chooseTechnicalStory, weaknessAnswerChoice]) {
    it(`${spec.title}: two or three options, three to five criteria, scores 1 to 5`, () => {
      expect(spec.options.length).toBeGreaterThanOrEqual(2);
      expect(spec.options.length).toBeLessThanOrEqual(3);
      expect(spec.criteria.length).toBeGreaterThanOrEqual(3);
      expect(spec.criteria.length).toBeLessThanOrEqual(5);
      const levels = spec.weightLevels.map((l) => l.value);
      expect(levels.length).toBeLessThanOrEqual(4);
      for (const c of spec.criteria) {
        expect(levels).toContain(c.weight);
        for (const o of spec.options) {
          expect(c.scores[o.id]).toBeGreaterThanOrEqual(spec.scoreScale.min);
          expect(c.scores[o.id]).toBeLessThanOrEqual(spec.scoreScale.max);
        }
      }
      for (const o of spec.options) expect(o.name.length).toBeLessThanOrEqual(18);
    });
  }
});

describe("sequence canvases fit a phone", () => {
  for (const spec of [founderVersionFirst, timeToThink]) {
    it(`${spec.title}: two to four lanes, labels up to 18 characters, inside the picture`, () => {
      expect(spec.actors.length).toBeGreaterThanOrEqual(2);
      expect(spec.actors.length).toBeLessThanOrEqual(4);
      for (const layout of ["narrow", "wide"] as const) {
        const g = sequenceGeometry(spec, layout);
        spec.steps.forEach((step, i) => {
          expect(step.from).toBeGreaterThanOrEqual(0);
          expect(step.to).toBeLessThan(spec.actors.length);
          expect(step.label.length, step.label).toBeLessThanOrEqual(18);
          const { label } = g.arrow(step, i);
          const w = step.label.length * g.charW;
          const left = label.anchor === "start" ? label.x : label.anchor === "end" ? label.x - w : label.x - w / 2;
          expect(left, `${layout} ${step.label}`).toBeGreaterThanOrEqual(0);
          expect(left + w, `${layout} ${step.label}`).toBeLessThanOrEqual(g.width);
        });
      }
    });
  }
});

describe("state machine canvases fit a phone", () => {
  for (const spec of [engineerDepthLadder, broadToNarrowStrength]) {
    it(`${spec.title}: names, labels and layout`, () => {
      const ids = new Set(spec.states.map((s) => s.id));
      for (const s of spec.states) {
        expect(s.name.length, s.name).toBeLessThanOrEqual(18);
        expect(s.col).toBeLessThanOrEqual(2);
        expect(s.row).toBeLessThanOrEqual(1);
      }
      for (const e of spec.edges) {
        expect(ids.has(e.from)).toBe(true);
        expect(ids.has(e.to)).toBe(true);
        expect(e.label.length, e.label).toBeLessThanOrEqual(14);
        const a = spec.states.find((s) => s.id === e.from)!;
        const b = spec.states.find((s) => s.id === e.to)!;
        if (a.col === b.col && a.id !== b.id) expect(e.label.length, e.label).toBeLessThanOrEqual(3);
      }
      for (const step of spec.steps) {
        expect(ids.has(step.state)).toBe(true);
        if (step.edge !== undefined) expect(spec.edges[step.edge]).toBeDefined();
      }
      for (const layout of ["narrow", "wide"] as const) {
        const g = machineGeometry(spec, layout);
        for (const placed of g.byId.values()) {
          expect(placed.at[0] - g.halfW).toBeGreaterThanOrEqual(0);
          expect(placed.at[0] + g.halfW).toBeLessThanOrEqual(g.width);
        }
        const boxes = spec.edges.map((e) => ({ label: e.label, ...g.labelBox(e, g.edge(e)!) }));
        for (const b of boxes) {
          expect(b.x, `${layout} ${b.label}`).toBeGreaterThanOrEqual(0);
          expect(b.x + b.w, `${layout} ${b.label}`).toBeLessThanOrEqual(g.width);
        }
        for (let i = 0; i < boxes.length; i++) {
          for (let j = i + 1; j < boxes.length; j++) {
            const a = boxes[i]!;
            const b = boxes[j]!;
            const overlap = a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
            expect(overlap, `${layout}: "${a.label}" overlaps "${b.label}"`).toBe(false);
          }
        }
      }
    });
  }
});

describe("think-first step-throughs", () => {
  for (const spec of [founderVersionFirst, timeToThink, broadToNarrowStrength]) {
    it(`${spec.title}: every step but the last ends with a question for the next step`, () => {
      spec.steps.slice(0, -1).forEach((step, i) => {
        expect(step.note.trim().endsWith("?"), `step ${i + 1}: ${step.title}`).toBe(true);
      });
    });
  }
});

describe("course wording", () => {
  it("names the option the chapter calls the events project", () => {
    expect(chooseTechnicalStory.options.map((o) => o.name)).toEqual(["Report job", "Events project", "Weekend app"]);
  });
  it("says in the factor canvases that the scores are this example's", () => {
    expect(chooseTechnicalStory.whatThisShows).toContain("this example");
    expect(weaknessAnswerChoice.whatThisShows).toContain("this example");
  });
  it("matches 5.1: the founder leads an invoicing team", () => {
    expect(founderVersionFirst.steps[0]!.note).toContain("invoicing");
  });
  it("uses steps, not rungs, in the engineer follow-ups", () => {
    expect(JSON.stringify(engineerDepthLadder)).not.toMatch(/rung|ladder/i);
  });
});

// The technical-founder canvases (chapters 5.5 and 5.7). Relative imports: their package export lines are added at registration.
import { whyNotThatChoice } from "@buildment/learning-ui/canvas/why-not-that-choice/data";
import { demoTheyCanOpen } from "@buildment/learning-ui/canvas/demo-they-can-open/data";

describe("technical founder sequence canvases fit a phone and make the learner think first", () => {
  for (const spec of [whyNotThatChoice, demoTheyCanOpen]) {
    it(`${spec.title}: lanes, labels and questions`, () => {
      expect(spec.actors.length).toBeGreaterThanOrEqual(2);
      expect(spec.actors.length).toBeLessThanOrEqual(4);
      for (const layout of ["narrow", "wide"] as const) {
        const g = sequenceGeometry(spec, layout);
        spec.steps.forEach((step, i) => {
          expect(step.from).toBeGreaterThanOrEqual(0);
          expect(step.to).toBeLessThan(spec.actors.length);
          expect(step.label.length, step.label).toBeLessThanOrEqual(18);
          const { label } = g.arrow(step, i);
          const w = step.label.length * g.charW;
          const left = label.anchor === "start" ? label.x : label.anchor === "end" ? label.x - w : label.x - w / 2;
          expect(left, `${layout} ${step.label}`).toBeGreaterThanOrEqual(0);
          expect(left + w, `${layout} ${step.label}`).toBeLessThanOrEqual(g.width);
        });
      }
      spec.steps.slice(0, -1).forEach((step, i) => {
        expect(step.note.trim().endsWith("?"), `step ${i + 1}: ${step.title}`).toBe(true);
      });
    });
  }
  it("tells the weak path from the strong one with tones", () => {
    expect(whyNotThatChoice.steps.some((s) => s.tone === "bad")).toBe(true);
    expect(whyNotThatChoice.steps.at(-1)!.outcome).toBe("the choice holds");
    expect(demoTheyCanOpen.steps.some((s) => s.tone === "bad")).toBe(true);
    expect(demoTheyCanOpen.steps.some((s) => s.tone === "good")).toBe(true);
  });
  it("has no dashes and no product names in its text", () => {
    const text = JSON.stringify([whyNotThatChoice, demoTheyCanOpen]);
    expect(text.includes(String.fromCharCode(0x2013)) || text.includes(String.fromCharCode(0x2014))).toBe(false);
  });
});

describe("canvas text has no em or en dashes", () => {
  it("is plain", () => {
    const all = JSON.stringify([chooseTechnicalStory, weaknessAnswerChoice, founderVersionFirst, timeToThink, engineerDepthLadder, broadToNarrowStrength]);
    expect(all.includes(String.fromCharCode(0x2013)) || all.includes(String.fromCharCode(0x2014))).toBe(false);
  });
});
