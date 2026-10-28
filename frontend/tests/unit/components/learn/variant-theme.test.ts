import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { variantForTrack, variantThemeStyle } from "../../../../src/components/learn/variant-theme";

const here = path.dirname(fileURLToPath(import.meta.url));
const globals = readFileSync(path.resolve(here, "../../../../src/app/globals.css"), "utf8");

const track = {
  familySlug: "multi-vendor-marketplace",
  variantSlug: "books",
  variantChosen: true,
  variantLocked: false,
  variantAssigned: false,
  specialisationSlug: null,
  specialisationOpen: false,
};

describe("variantForTrack", () => {
  it("resolves the learner's variant", () => {
    expect(variantForTrack(track)?.productName).toBe("Hamesh");
  });

  it("falls back to the family default for an unknown variant", () => {
    expect(variantForTrack({ ...track, variantSlug: "retired" })?.slug).toBe("grocery");
  });

  it("returns null for ordinary courses", () => {
    expect(variantForTrack(null)).toBeNull();
    expect(variantForTrack({ ...track, familySlug: "unknown" })).toBeNull();
  });

  it("uses a creator-defined variant from the course API", () => {
    const family = { slug: "grid-market", label: "Grid market", defaultVariantSlug: "food", specialisations: [], variants: [
      { slug: "food", label: "Food", productName: "FreshMarket", summary: "Food", hardestConstraint: "Stock", specialisationSlug: "", theme: variantForTrack(track)!.theme },
      { slug: "electricity", label: "Electricity", productName: "GridMarket", summary: "Power", hardestConstraint: "Matching", specialisationSlug: "", theme: variantForTrack(track)!.theme },
    ] };
    expect(variantForTrack({ ...track, familySlug: family.slug, family, variantSlug: "electricity" })?.productName).toBe("GridMarket");
  });
});

describe("variant theme tokens", () => {
  it("sets the four colours the stylesheet reads", () => {
    expect(variantThemeStyle(variantForTrack(track)!)).toEqual({
      "--variant-accent-light": "#1E40AF",
      "--variant-on-accent-light": "#FFFFFF",
      "--variant-accent-dark": "#93C5FD",
      "--variant-on-accent-dark": "#0B1B3A",
    });
  });

  it("exposes the accent as a marker colour and leaves the primary token on Edorax cobalt", () => {
    const light = globals.match(/\n\[data-variant\] \{([^}]*)\}/)?.[1] ?? "";
    const dark = globals.match(/\n\.dark \[data-variant\] \{([^}]*)\}/)?.[1] ?? "";
    for (const [block, mode] of [
      [light, "light"],
      [dark, "dark"],
    ] as const) {
      expect(block).toContain(`--variant-accent: var(--variant-accent-${mode})`);
      expect(block).not.toContain("--primary");
      expect(block).not.toContain("--ring");
    }
  });
});
