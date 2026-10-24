import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { checkDesign, designFrame, nextPhase, STATUS_MAX, VERDICT_MAX } from "@/canvas/models/design-stepper";
import { BOXES, diveMinutes, interviewDesign, minuteAt, ROUND_MINUTES } from "@/canvas/models/interview-plan";
import {
  appServers,
  copyReads,
  dbOps,
  hotReads,
  oneNodeEmptyOps,
  PARTITION_CYCLE,
  perPartition,
  probeDesign,
  sharePercent,
  timesText,
} from "@/canvas/models/probe-design";
import { placeCard, startSort } from "@/canvas/models/sorter";
import { sysdesignM28InterviewStepper } from "@/canvas/sysdesign-m28-interview-stepper/data";
import { sysdesignM28ProbeStepper } from "@/canvas/sysdesign-m28-probe-stepper/data";
import { ANSWER_BUCKETS, ANSWER_CARDS, sysdesignM28AnswerSorter } from "@/canvas/sysdesign-m28-answer-sorter/data";

describe("m28 interview plan (28.2)", () => {
  it("fills 45 minutes with six boxes", () => {
    expect(BOXES.map((b) => b.minutes)).toEqual([5, 5, 10, 15, 7, 3]);
    expect(BOXES.reduce((s, b) => s + b.minutes, 0)).toBe(ROUND_MINUTES);
    expect([0, 1, 2, 3, 4, 5].map((i) => minuteAt(i))).toEqual([5, 10, 20, 35, 42, 45]);
  });

  it("takes the extra sketch minutes from the deep dive", () => {
    expect(minuteAt(2, true)).toBe(28);
    expect(diveMinutes(false)).toBe(15);
    expect(diveMinutes(true)).toBe(7);
  });

  it("draws cleanly at every step and phase", () => {
    expect(checkDesign(interviewDesign())).toEqual([]);
  });

  it("shows the spec's pills and verdicts", () => {
    const d = interviewDesign();
    const pill = (step: number, phase: number, id: string) => designFrame(d, step, phase).actors.find((a) => a.id === id)?.status?.text;
    expect([0, 1, 2, 3, 4, 5].map((i) => pill(i, 0, "clock"))).toEqual(["minute 5", "minute 10", "minute 20", "minute 35", "minute 42", "minute 45"]);
    expect([0, 1, 2, 3, 4, 5].map((i) => pill(i, 0, "board"))).toEqual(["scope", "numbers", "4 boxes", "1 deep dive", "cost + failure", "done"]);
    expect([0, 1, 2, 3, 4, 5].map((i) => pill(i, 0, "ask"))).toEqual(["listening", undefined, undefined, undefined, "asks why", "can score it"]);
    expect(designFrame(d, 2, 1).actors.find((a) => a.id === "clock")?.status).toEqual({ text: "minute 28", tone: "bad" });
    expect(designFrame(d, 2, 1).verdict).toEqual({ text: "Sketch ran long: dive gets 7 min", tone: "bad" });
    expect(designFrame(d, 5, 0).verdict.text).toBe("Minute 45: three-sentence summary");
  });

  it("adds one chip to the board per step and keeps it", () => {
    const d = interviewDesign();
    const column = (step: number) => designFrame(d, step, 0).tags.filter((t) => t.x === 210).map((t) => t.text);
    expect(column(0)).toHaveLength(1);
    expect(column(4)).toEqual(["create + open, no edits", "100,000 opens/s, 9 TB", "app > cache > store", "dive: cache, 90% hits", "302 costs a hop; cache restart"]);
    expect(column(5)).toHaveLength(5);
  });

  it("has a two-state action in step 3 that does not carry to step 4", () => {
    const d = interviewDesign();
    const f = designFrame(d, 2, 0);
    expect(f.action).toMatchObject({ label: "Draw 8 min longer", toggle: true, pressed: false, target: "clock" });
    expect(designFrame(d, 2, 1).action).toMatchObject({ label: "Back to 10 min", pressed: true });
    expect(nextPhase(d, 2, 1)).toBe(0);
    expect(designFrame(d, 3, 1).phase).toBe(0);
    expect(designFrame(d, 3, 0).verdict.text).toBe("Minute 35: one dive, done");
  });
});

describe("m28 probe model (28.3)", () => {
  it("matches the spec's table", () => {
    expect(dbOps(100_000, 1_000, 90)).toBe(11_000);
    expect(perPartition(11_000, 5)).toBe(2_200);
    expect(sharePercent(11_000, 5)).toBe(88);
    expect(dbOps(1_000_000, 10_000, 90)).toBe(110_000);
    expect(perPartition(110_000, 5)).toBe(22_000);
    expect(timesText(110_000, 5)).toBe("8.8x");
    expect(dbOps(1_000_000, 10_000, 99)).toBe(20_000);
    expect(PARTITION_CYCLE.map((k) => sharePercent(20_000, k))).toEqual([160, 100, 80]);
    expect(PARTITION_CYCLE.map((k) => perPartition(20_000, k))).toEqual([4_000, 2_500, 2_000]);
    expect(dbOps(1_000_000, 10_000, 0)).toBe(1_010_000);
    expect(perPartition(1_010_000, 8)).toBe(126_250);
    expect(timesText(1_010_000, 8)).toBe("50x");
    expect(oneNodeEmptyOps(1_000_000, 10_000, 99, 10)).toBe(119_000);
    expect(perPartition(119_000, 8)).toBe(14_875);
    expect(timesText(119_000, 8)).toBe("6x");
    expect(hotReads(1_000_000, 10)).toBe(100_000);
    expect(copyReads(appServers(1_000_000), 5)).toBe(40);
    expect(appServers(100_000)).toBe(20);
  });

  it("draws cleanly at every step and phase", () => {
    expect(checkDesign(probeDesign())).toEqual([]);
  });

  it("keeps every verdict and pill short", () => {
    const d = probeDesign();
    d.steps.forEach((step, i) => {
      for (let p = 0; p < Math.max(1, step.action?.phases.length ?? 0); p++) {
        const f = designFrame(d, i, p);
        expect(f.verdict.text.length, f.verdict.text).toBeLessThanOrEqual(VERDICT_MAX);
        for (const a of f.actors) expect((a.status?.text ?? "").length, a.status?.text).toBeLessThanOrEqual(STATUS_MAX);
      }
    });
  });

  it("gives the spec's verdicts", () => {
    const d = probeDesign();
    const v = (s: number, p = 0) => designFrame(d, s, p).verdict;
    expect(v(0)).toEqual({ text: "Today: every part inside its plan", tone: "good" });
    expect(v(1)).toEqual({ text: "10x: database at 8.8x its plan", tone: "bad" });
    expect(v(2, 0)).toEqual({ text: "99% hits: database at 160% of plan", tone: "bad" });
    expect(v(2, 1)).toEqual({ text: "8 partitions: each at 100% of plan", tone: "good" });
    expect(v(2, 2)).toEqual({ text: "10 partitions: each at 80% of plan", tone: "good" });
    expect(v(3, 0)).toEqual({ text: "Empty cache: database at 50x plan", tone: "bad" });
    expect(v(3, 1)).toEqual({ text: "One node empty: database at 6x plan", tone: "warn" });
    expect(v(4, 0)).toEqual({ text: "One cache node takes 100,000 reads/s", tone: "bad" });
    expect(v(4, 1)).toEqual({ text: "App copies cut it to 40 reads/s", tone: "good" });
    expect(v(5)).toEqual({ text: "Name the cost before they ask", tone: "good" });
  });

  it("cycles the partition button 5, 8, 10 and back", () => {
    const d = probeDesign();
    expect(designFrame(d, 2, 0).action?.label).toBe("Try 8 partitions");
    expect(designFrame(d, 2, 1).action?.label).toBe("Try 10 partitions");
    expect(designFrame(d, 2, 2).action?.label).toBe("Back to 5 partitions");
    expect(designFrame(d, 2, 0).action?.toggle).toBe(false);
    expect([0, 1, 2].map((p) => designFrame(d, 2, p).actors.find((a) => a.id === "db")?.status?.text)).toEqual(["160% of plan", "100% of plan", "80% of plan"]);
    expect(nextPhase(d, 2, 2)).toBe(0);
  });

  it("does not carry an action to the next step", () => {
    const d = probeDesign();
    expect(designFrame(d, 3, 1).actors.find((a) => a.id === "cache")?.status?.text).toBe("10 nodes");
    expect(designFrame(d, 4, 0).actors.find((a) => a.id === "cache")?.status?.text).toBe("1 hot code");
    expect(designFrame(d, 4, 0).actors.find((a) => a.id === "apps")?.status?.text).toBe("200 servers");
    expect(designFrame(d, 5, 0).actors.every((a) => !a.status)).toBe(true);
  });
});

describe("m28 answer sorter (28.3)", () => {
  it("has three buckets and eight cards with a reason for each wrong bucket", () => {
    expect(ANSWER_BUCKETS.map((b) => b.id)).toEqual(["claim", "cost", "strong"]);
    expect(ANSWER_CARDS).toHaveLength(8);
    expect(ANSWER_CARDS.map((c) => c.answer)).toEqual(["claim", "cost", "strong", "claim", "cost", "strong", "claim", "strong"]);
    for (const c of ANSWER_CARDS) {
      expect(c.text.length, c.text).toBeLessThan(100);
      const wrong = ANSWER_BUCKETS.filter((b) => b.id !== c.answer).map((b) => b.id);
      expect(Object.keys(c.why).sort(), c.id).toEqual([...wrong].sort());
      for (const reason of Object.values(c.why)) expect(reason.length, reason).toBeLessThanOrEqual(60);
    }
  });

  it("accepts the right bucket and gives a reason for a wrong one", () => {
    const s = startSort(ANSWER_CARDS, ANSWER_BUCKETS);
    const wrong = placeCard(s, ANSWER_CARDS, "strong");
    expect(wrong.outcome.kind).toBe("wrong");
    expect(wrong.outcome.kind === "wrong" ? wrong.outcome.reason : "").toBe("It has no number and no switch point.");
    expect(placeCard(s, ANSWER_CARDS, "claim").outcome.kind).toBe("right");
  });
});

describe("m28 playable canvases render on the server", () => {
  const specs = [sysdesignM28InterviewStepper, sysdesignM28ProbeStepper, sysdesignM28AnswerSorter];
  const html = (s: (typeof specs)[number]) => renderToString(createElement(s.component, { title: s.title, purpose: s.purpose, limits: s.limits })).replaceAll("<!-- -->", "");

  it("draws an svg and the limits fold, with no hex colours", () => {
    for (const spec of specs) {
      const out = html(spec);
      expect(out, spec.title).toContain("<svg");
      expect(out, spec.title).toContain("What this picture leaves out");
      expect(out, spec.title).not.toMatch(/#[0-9a-fA-F]{6}\b/);
      expect(out, spec.title).not.toMatch(/foreignObject|<animate|<use|<image/);
      expect(out, spec.title).not.toContain("—");
    }
  });

  it("shows the first verdicts and the step controls", () => {
    const a = html(sysdesignM28InterviewStepper);
    expect(a).toContain("Minute 5: scope agreed");
    expect((a.match(/aria-current="step"/g) ?? []).length).toBe(1);
    expect(a).toContain("Next");
    const b = html(sysdesignM28ProbeStepper);
    expect(b).toContain("Today: every part inside its plan");
    expect(b).toContain("88% of plan");
    expect(html(sysdesignM28AnswerSorter)).toContain("Which bucket does this answer go in?");
  });
});
