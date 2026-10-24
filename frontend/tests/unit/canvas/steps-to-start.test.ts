import { describe, expect, it } from "vitest";
import { computeSteps, describeStepsChange, ENERGY, stepsOutcome, stepsToStart } from "@/canvas/steps-to-start/data";
import { defaultValues } from "@/canvas/renderers/slider/model";

const start = defaultValues(stepsToStart);

describe("steps-to-start model", () => {
  it("starts in chapter 3.3's old flat: 6 steps to study, 0 to scroll, study on 2 of 10 evenings", () => {
    expect(start).toEqual({ studySteps: 6, scrollSteps: 0 });
    expect(ENERGY).toHaveLength(10);
    const out = stepsOutcome({ studySteps: 6, scrollSteps: 0 });
    expect(out.gap).toBe(6);
    expect(out.studyEvenings).toBe(2);
    expect(out.tiredEvenings).toBe(6);
    expect(out.tiredStudyEvenings).toBe(0);
    expect(computeSteps(start).stats.map((s) => s.value)).toEqual(["2 of 10", "0 of 6", "6"]);
  });

  it("matches the 'try this' values: book on the table, phone in the bedroom, both", () => {
    const book = stepsOutcome({ studySteps: 2, scrollSteps: 0 });
    expect(book.studyEvenings).toBe(9);
    expect(book.tiredStudyEvenings).toBe(5);
    const phone = stepsOutcome({ studySteps: 6, scrollSteps: 3 });
    expect(phone.studyEvenings).toBe(8);
    expect(phone.tiredStudyEvenings).toBe(4);
    const both = stepsOutcome({ studySteps: 2, scrollSteps: 3 });
    expect(both.gap).toBe(-1);
    expect(both.studyEvenings).toBe(10);
  });

  it("handles the edges: no study evening at 10 and 0, every evening at 0 and 10", () => {
    expect(stepsOutcome({ studySteps: 10, scrollSteps: 0 }).studyEvenings).toBe(0);
    expect(stepsOutcome({ studySteps: 0, scrollSteps: 10 }).studyEvenings).toBe(10);
    expect(stepsOutcome({ studySteps: 0, scrollSteps: 0 }).studyEvenings).toBe(10);
    expect(computeSteps({ studySteps: 10, scrollSteps: 0 }).stats[1]!.value).toBe("0 of 6");
  });

  it("keeps every bar on the 10-evening scale", () => {
    const result = computeSteps({ studySteps: 2, scrollSteps: 3 });
    expect(result.barMax).toBe(10);
    expect(result.bars!.map((b) => b.value)).toEqual([10, 2, 9, 8]);
  });

  it("describes a change in words", () => {
    expect(describeStepsChange(start, { ...start, studySteps: 2 })).toBe(
      "Making study easier shrinks the gap from 6 to 2 steps, so study evenings rise from 2 to 9 of 10, and tired evenings with study go from 0 to 5 of 6.",
    );
    expect(describeStepsChange(start, { ...start, scrollSteps: 3 })).toBe(
      "Making scrolling harder shrinks the gap from 6 to 3 steps, so study evenings rise from 2 to 8 of 10, and tired evenings with study go from 0 to 4 of 6.",
    );
    expect(describeStepsChange(start, { studySteps: 7, scrollSteps: 1 })).toBe(
      "Making study harder and making scrolling harder keeps the gap at 6, but no evening changes: he still studies on 2 of 10.",
    );
    expect(describeStepsChange(start, start)).toBe("Nothing changed.");
  });
});
