import { describe, expect, it } from "vitest";
import { displayLabelForPool } from "../../../../src/services/coupons/pools.js";
import { couponUnlocksContent } from "../../../../src/services/coupons/issue.js";

describe("coupon helpers", () => {
  it("formats a free entitlement label", () => {
    expect(displayLabelForPool("DevWeekends Pathment", 100)).toBe("100% free · DevWeekends Pathment");
  });

  it("formats a partial discount label", () => {
    expect(displayLabelForPool("Partner seat", 50)).toBe("50% off · Partner seat");
  });

  it("treats 100% off as full unlock", () => {
    expect(couponUnlocksContent(100)).toBe(true);
    expect(couponUnlocksContent(99)).toBe(false);
  });
});
