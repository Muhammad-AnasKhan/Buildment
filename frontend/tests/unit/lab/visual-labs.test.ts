import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { runChallenge } from "@buildment/learning-ui/labs/challenge";
import { labRegistry } from "@buildment/learning-ui/labs/registry";
import type { HldLabSpec } from "@buildment/learning-ui/labs/types";
import { validateChallenge, validateLabSpec } from "@buildment/learning-ui/labs/types";

// The bar every visual challenge meets, so a new case-study module cannot ship a
// board that cannot be won, a reference design that does not pass, or a starting
// board that already passes. Each lab's own test file covers its particular failures.

const LAB_DIR = path.resolve(__dirname, "../../../../packages/learning-ui/src/labs");

const challenges = Object.values(labRegistry).filter(
  (spec): spec is HldLabSpec => spec.family === "hld" && Boolean(spec.challenge),
);

describe("every visual challenge", () => {
  it("exists", () => {
    expect(challenges.length).toBeGreaterThan(0);
  });

  describe.each(challenges.map((spec) => [spec.slug, spec] as const))("%s", (slug, spec) => {
    const challenge = spec.challenge!;

    it("is a valid lab spec with a valid challenge and at least one functional check", () => {
      expect(validateLabSpec(spec)).toEqual([]);
      expect(validateChallenge(challenge)).toEqual([]);
      expect(challenge.checks.some((c) => c.kind === "functional")).toBe(true);
    });

    it("has a spec.md and a reference solution", () => {
      expect(fs.existsSync(path.join(LAB_DIR, slug, "spec.md"))).toBe(true);
      expect(spec.solution).toBeDefined();
    });

    it("passes every check with the reference solution", () => {
      const report = runChallenge(spec, spec.solution!.board, challenge.peakLoad);
      const failing = report.checks.filter((c) => !c.pass).map((c) => `${c.id}: ${c.measured} (${c.reason ?? ""})`);
      expect(failing).toEqual([]);
    });

    it("does not pass everything with the starting board", () => {
      const report = runChallenge(spec, spec.startingBoard!, challenge.peakLoad);
      expect(report.allPass).toBe(false);
    });

    it("explains every part of the reference solution and names real checks", () => {
      const ids = new Set(spec.solution!.board.nodes.filter((n) => n.kind !== "client").map((n) => n.id));
      const checkIds = new Set(challenge.checks.map((c) => c.id));
      expect(new Set(Object.keys(spec.solution!.parts))).toEqual(ids);
      for (const part of Object.values(spec.solution!.parts)) {
        for (const id of part.checks) expect(checkIds.has(id), id).toBe(true);
      }
    });
  });
});
