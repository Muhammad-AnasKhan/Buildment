import { describe, expect, it, vi } from "vitest";
import { consumeEnrollmentSlot } from "./allocation";

describe("consumeEnrollmentSlot", () => {
  it("throws when the atomic update affects zero rows", async () => {
    const tx = {
      $executeRaw: vi.fn().mockResolvedValue(0),
    };
    await expect(consumeEnrollmentSlot(tx as never, "oc_1")).rejects.toMatchObject({
      code: "CAPACITY",
    });
  });

  it("succeeds when one row is updated", async () => {
    const tx = {
      $executeRaw: vi.fn().mockResolvedValue(1),
    };
    await expect(consumeEnrollmentSlot(tx as never, "oc_1")).resolves.toBeUndefined();
  });
});
