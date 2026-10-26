import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { LAB_SLUGS } from "@/shared/lab/slugs";
import { getLabSpec, labRegistry } from "@buildment/learning-ui/labs/registry";
import { validateLabSpec } from "@buildment/learning-ui/labs/types";

const LAB_DIR = resolve(process.cwd(), "../packages/learning-ui/src/labs");

describe("lab registry", () => {
  it("has keys exactly equal to LAB_SLUGS", () => {
    expect(Object.keys(labRegistry).sort()).toEqual([...LAB_SLUGS].sort());
  });

  it("returns null for non-slugs including prototype keys", () => {
    expect(getLabSpec("__proto__")).toBeNull();
    expect(getLabSpec("constructor")).toBeNull();
    expect(getLabSpec("not-a-lab")).toBeNull();
  });

  it("resolves every registered slug to its spec", () => {
    for (const slug of LAB_SLUGS) {
      expect(getLabSpec(slug)).toBe(labRegistry[slug]);
    }
  });

  it("registers only valid specs, each with a spec.md", () => {
    for (const slug of LAB_SLUGS) {
      expect(validateLabSpec(labRegistry[slug])).toEqual([]);
      expect(existsSync(resolve(LAB_DIR, slug, "spec.md"))).toBe(true);
    }
  });
});
