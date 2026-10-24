import { describe, expect, it } from "vitest";
import {
  computeWave,
  describeWaveChange,
  habitDays,
  listDays,
  motivationSeries,
  motivationWaveHabitSize,
} from "@/canvas/motivation-wave-habit-size/data";
import { defaultValues } from "@/canvas/renderers/slider/model";

const start = defaultValues(motivationWaveHabitSize);

describe("motivation-wave-habit-size model", () => {
  it("starts with chapter 2.2's big plan: effort 7 happens on days 1, 2 and 8, then a gap of 6", () => {
    expect(start).toEqual({ effort: 7, hardWeek: 0 });
    const r = habitDays({ effort: 7, hardWeek: 0 });
    expect(r.doneDays).toEqual([1, 2, 8]);
    expect(r.longestGap).toEqual({ length: 6, from: 9, to: 14 });
    expect(computeWave(start).stats.map((s) => s.value)).toEqual(["3 of 14", "6 days", "7 or more"]);
    expect(computeWave(start).stats[0]!.detail).toBe("days 1, 2 and 8");
  });

  it("matches the try-this values", () => {
    expect(habitDays({ effort: 2, hardWeek: 0 }).doneDays).toHaveLength(14);
    expect(computeWave({ effort: 2, hardWeek: 0 }).stats[1]!.value).toBe("none");
    expect(habitDays({ effort: 2, hardWeek: 2 }).doneDays).toHaveLength(12);
    expect(habitDays({ effort: 7, hardWeek: 2 }).doneDays).toEqual([1, 2]);
    expect(habitDays({ effort: 4, hardWeek: 0 }).doneDays).toHaveLength(11);
    expect(habitDays({ effort: 5, hardWeek: 0 }).doneDays).toHaveLength(8);
  });

  it("lowers only the second week, and never below zero", () => {
    expect(motivationSeries(3)).toEqual([9, 8, 6, 5, 3, 4, 6, 4, 2, 1, 0, 0, 1, 2]);
    const bars = computeWave({ effort: 2, hardWeek: 3 }).bars!.map((b) => b.display);
    expect(bars).toEqual(["7 of 7", "3 of 7", "7 of 7", "3 of 7"]);
  });

  it("handles the edges: effort 1 with a hard week, and effort 10", () => {
    expect(habitDays({ effort: 1, hardWeek: 3 }).doneDays).toHaveLength(12);
    const top = computeWave({ effort: 10, hardWeek: 3 });
    expect(top.stats[0]!.value).toBe("0 of 14");
    expect(top.stats[0]!.detail).toBe("no days");
    expect(top.stats[1]!.detail).toBe("days 1 to 14");
    expect(listDays([5])).toBe("day 5");
  });

  it("describes a change in words", () => {
    expect(describeWaveChange(start, { ...start, effort: 2 })).toBe(
      "Changing the effort from 7 to 2: the habit now happens on 14 of 14 days instead of 3. A smaller habit fits the low days too, not only the high ones.",
    );
    expect(describeWaveChange({ effort: 2, hardWeek: 0 }, { effort: 2, hardWeek: 2 })).toBe(
      "A harder second week (motivation 2 lower on days 8 to 14): the habit now happens on 12 of 14 days instead of 14. A hard week hurts a big habit far more than a small one.",
    );
    expect(describeWaveChange(start, start)).toBe("Nothing changed.");
  });
});
