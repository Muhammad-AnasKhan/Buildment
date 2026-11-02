import { describe, expect, it } from "vitest";
import { CAREER_TIERS, careerTierForMastery, nextCareerTier } from "../../../../src/shared/gamification/career.js";

describe("careerTierForMastery", () => {
  it("starts everyone at Intern with no completed courses", () => {
    expect(careerTierForMastery({ completedCourses: 0, avgScore: 0 })).toBe("INTERN");
  });

  it("gates on quiz quality, not raw course count", () => {
    // Four completed courses but a weak average score stays Intern (no tier's score gate passes).
    expect(careerTierForMastery({ completedCourses: 4, avgScore: 60 })).toBe("INTERN");
    // Ten courses but a sub-70 average still cannot reach Junior.
    expect(careerTierForMastery({ completedCourses: 10, avgScore: 65 })).toBe("INTERN");
  });

  it("promotes with completed courses and a passing quiz quality", () => {
    expect(careerTierForMastery({ completedCourses: 2, avgScore: 80 })).toBe("JUNIOR");
    expect(careerTierForMastery({ completedCourses: 5, avgScore: 75 })).toBe("MID");
    expect(careerTierForMastery({ completedCourses: 10, avgScore: 80 })).toBe("SENIOR");
    expect(careerTierForMastery({ completedCourses: 15, avgScore: 78 })).toBe("STAFF");
    expect(careerTierForMastery({ completedCourses: 20, avgScore: 85 })).toBe("PRINCIPAL");
  });

  it("raises the quality bar as tiers climb", () => {
    expect(careerTierForMastery({ completedCourses: 10, avgScore: 74 })).toBe("MID"); // senior needs 75
    expect(careerTierForMastery({ completedCourses: 10, avgScore: 75 })).toBe("SENIOR");
    expect(careerTierForMastery({ completedCourses: 20, avgScore: 78 })).toBe("STAFF"); // 20 courses & 78 avg reach Staff; 80 avg needed for Principal
  });
});

describe("nextCareerTier", () => {
  it("walks the ladder and returns null at the top", () => {
    for (let i = 0; i < CAREER_TIERS.length - 1; i += 1) {
      expect(nextCareerTier(CAREER_TIERS[i]!)).toBe(CAREER_TIERS[i + 1]!);
    }
    expect(nextCareerTier("PRINCIPAL")).toBeNull();
  });
});