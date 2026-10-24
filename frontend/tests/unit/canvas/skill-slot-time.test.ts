import { describe, expect, it } from "vitest";
import { initialTimeInputs, resolveMondayNine, timeComparison } from "@buildment/learning-ui/canvas/skill-slot-your-time-their-time/model";

describe("SkillSlot time-zone canvas", () => {
  it("moves Berlin's UTC instant when the week crosses its spring clock change", () => {
    expect(resolveMondayNine("2024-03-25", "Europe/Berlin").toISOString()).toBe("2024-03-25T08:00:00.000Z");
    expect(resolveMondayNine("2024-04-01", "Europe/Berlin").toISOString()).toBe("2024-04-01T07:00:00.000Z");
  });

  it("keeps the stored instant when only the viewer changes", () => {
    const qatar = timeComparison(initialTimeInputs);
    const london = timeComparison({ ...initialTimeInputs, viewerZone: "Europe/London" });
    expect(qatar.utc).toBe(london.utc);
    expect(qatar.viewer).not.toBe(london.viewer);
    expect(qatar.provider).toBe(london.provider);
  });

  it("uses the provider zone for resolution and retains a local 09:00", () => {
    const gaza = timeComparison({ ...initialTimeInputs, providerZone: "Asia/Gaza" });
    expect(gaza.provider).toContain("09:00");
    expect(gaza.utc).toBe("2024-03-25T07:00:00.000Z");
  });
});
