import { describe, expect, it } from "vitest";
import { defaultValues } from "@buildment/learning-ui/canvas/renderers/slider/model";
import { describePowerPlanChange, interviewPowerPlan, powerPlan } from "@buildment/learning-ui/canvas/interview-power-plan/data";

const start = defaultValues(interviewPowerPlan);

describe("interview power plan", () => {
  it("starts at the chapter's prediction: 40% gives 72 minutes, 3 short of 75", () => {
    expect(start).toEqual({ charge: 40, bank: 0, grid: 0 });
    const plan = powerPlan(start);
    expect(plan.batteryMinutes).toBe(72);
    expect(plan.needed).toBe(75);
    expect(plan.short).toBe(3);
    expect(plan.status).toBe("short");
    const result = interviewPowerPlan.compute(start);
    expect(result.stats.map((s) => s.value)).toEqual(["75 min", "72 min", "Short by 3 min"]);
    expect(result.bars!.map((b) => b.display)).toEqual(["75 min", "72 min", "0 min", "72 min"]);
    expect(result.bars![3].tone).toBe("bad");
  });

  it("at the minimums there is no power at all and the backup is needed", () => {
    const plan = powerPlan({ charge: 0, bank: 0, grid: 0 });
    expect(plan.own).toBe(0);
    expect(plan.short).toBe(75);
    expect(interviewPowerPlan.compute({ charge: 0, bank: 0, grid: 0 }).stats[2]).toMatchObject({
      value: "Short by 75 min",
      detail: "backup: take the call from the uncle's shop",
    });
  });

  it("at the maximums the grid covers the whole call and the battery is all spare", () => {
    const plan = powerPlan({ charge: 100, bank: 60, grid: 75 });
    expect(plan.needed).toBe(0);
    expect(plan.batteryMinutes).toBe(180);
    expect(plan.own).toBe(240);
    expect(plan.status).toBe("battery");
    expect(interviewPowerPlan.compute({ charge: 100, bank: 60, grid: 75 }).stats[2].detail).toBe("by the battery alone, 180 min to spare");
  });

  it("an empty battery with the full power bank and 15 minutes of grid is covered exactly, with nothing spare", () => {
    const plan = powerPlan({ charge: 0, bank: 60, grid: 15 });
    expect(plan.needed).toBe(60);
    expect(plan.spare).toBe(0);
    expect(plan.status).toBe("bank");
    expect(interviewPowerPlan.compute({ charge: 0, bank: 60, grid: 15 }).stats[2]).toMatchObject({
      value: "Covered",
      detail: "only with the power bank, 0 min to spare",
    });
  });

  it("keeps the try-this numbers true", () => {
    expect(powerPlan({ ...start, bank: 30 })).toMatchObject({ own: 102, spare: 27, status: "bank" });
    expect(powerPlan({ ...start, charge: 50 })).toMatchObject({ batteryMinutes: 90, spare: 15, status: "battery" });
  });

  it("falls back on non-numbers and never shows NaN", () => {
    const plan = powerPlan({ charge: Number.NaN, bank: Number.POSITIVE_INFINITY, grid: -5 });
    expect(plan).toMatchObject({ charge: 40, bank: 0, grid: 0, batteryMinutes: 72 });
    expect(JSON.stringify(interviewPowerPlan.compute({}))).not.toMatch(/NaN|Infinity|undefined/);
  });

  it("explains each change in words", () => {
    expect(describePowerPlanChange(start, { ...start, bank: 30 })).toBe(
      "Changing the power bank from 0 min to 30 min changed own power from 72 min to 102 min. The plan is now covered only with the power bank, 27 min to spare.",
    );
    expect(describePowerPlanChange(start, { ...start, charge: 50 })).toBe(
      "Changing the charge from 40% to 50% changed the battery from 72 min to 90 min. The plan is now covered by the battery alone, 15 min to spare.",
    );
    expect(describePowerPlanChange(start, { ...start, grid: 75 })).toMatch(/this week nobody knows the grid schedule/);
    expect(describePowerPlanChange(start, start)).toMatch(/^Nothing changed/);
  });
});
