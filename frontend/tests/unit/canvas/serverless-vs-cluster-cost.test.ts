import { describe, expect, it } from "vitest";
import { cheaper, computeCost, dailyCost, describeCostChange, serverlessVsClusterCost } from "@/canvas/serverless-vs-cluster-cost/data";
import { defaultValues } from "@/canvas/renderers/slider/model";

const start = defaultValues(serverlessVsClusterCost);

describe("serverless-vs-cluster-cost model", () => {
  it("matches chapter 10.4 at 2,000 questions: $0.80 serverless against $1.20 for one copy", () => {
    expect(start).toEqual({ questionsPerDay: 2000, secondsPerQuestion: 4, memoryGb: 1 });
    const o = dailyCost({ questionsPerDay: 2000, secondsPerQuestion: 4, memoryGb: 1 });
    expect(o.serverlessPerDay).toBeCloseTo(0.8);
    expect(o.copies).toBe(1);
    expect(o.containersPerDay).toBeCloseTo(1.2);
    expect(o.breakEvenQuestions).toBeCloseTo(3000);
    expect(cheaper(o)).toEqual({ winner: "serverless", by: 0.4 });
    const result = computeCost(start);
    expect(result.stats.map((s) => s.value)).toEqual(["$0.80", "$1.20", "Serverless"]);
    expect(result.stats[2]!.detail).toBe("by $0.40; equal near 3,000 a day");
  });

  it("matches chapter 10.4 at 100,000 questions: $40 serverless against 3 copies at $3.60", () => {
    const o = dailyCost({ questionsPerDay: 100000, secondsPerQuestion: 4, memoryGb: 1 });
    expect(o.serverlessPerDay).toBeCloseTo(40);
    expect(o.copies).toBe(3);
    expect(o.containersPerDay).toBeCloseTo(3.6);
    expect(cheaper(o)).toEqual({ winner: "containers", by: 36.4 });
  });

  it("handles the minimum inputs", () => {
    const o = dailyCost({ questionsPerDay: 1000, secondsPerQuestion: 1, memoryGb: 0.5 });
    expect(o.serverlessPerDay).toBeCloseTo(0.05);
    expect(o.copies).toBe(1);
    expect(o.breakEvenQuestions).toBeCloseTo(24000);
  });

  it("handles the maximum inputs", () => {
    const o = dailyCost({ questionsPerDay: 150000, secondsPerQuestion: 30, memoryGb: 4 });
    expect(o.serverlessPerDay).toBeCloseTo(1800);
    // 52.1 in progress on average, 260.4 in the busy hour: 14 copies for the peak plus 1 spare.
    expect(o.copies).toBe(15);
    expect(o.containersPerDay).toBeCloseTo(18);
  });

  it("calls a tie a tie at the break-even point", () => {
    expect(cheaper(dailyCost({ questionsPerDay: 3000, secondsPerQuestion: 4, memoryGb: 1 }))).toEqual({ winner: "same", by: 0 });
  });

  it("keeps the break-even inside the one-copy range for every corner of the sliders", () => {
    for (const memoryGb of [0.5, 1, 2, 4]) {
      for (const secondsPerQuestion of [1, 4, 30]) {
        const { breakEvenQuestions } = dailyCost({ questionsPerDay: 1000, secondsPerQuestion, memoryGb });
        expect(dailyCost({ questionsPerDay: breakEvenQuestions, secondsPerQuestion, memoryGb }).copies).toBe(1);
      }
    }
  });

  it("describes a change in words", () => {
    expect(describeCostChange(start, { ...start, questionsPerDay: 100000 })).toBe(
      "Changing traffic moved serverless from $0.80 to $40.00 a day, since it bills every second of waiting. Containers went from $1.20 to $3.60 as copies went from 1 to 3. The cheaper option flipped to containers, by $36.40 a day.",
    );
    expect(describeCostChange(start, { ...start, secondsPerQuestion: 8 })).toBe(
      "Changing the time per question moved serverless from $0.80 to $1.60 a day, since it bills every second of waiting. Containers stayed at $1.20, because one copy still covers the busy hour. The cheaper option flipped to containers, by $0.40 a day.",
    );
  });
});
