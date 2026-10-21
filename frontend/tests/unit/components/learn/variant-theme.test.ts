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

  it("maps them onto the primary and ring tokens in light and dark mode", () => {
    const light = globals.match(/\n\[data-variant\] \{([^}]*)\}/)?.[1] ?? "";
    const dark = globals.match(/\n\.dark \[data-variant\] \{([^}]*)\}/)?.[1] ?? "";
    for (const [block, mode] of [
      [light, "light"],
      [dark, "dark"],
    ] as const) {
      expect(block).toContain(`--primary: var(--variant-accent-${mode})`);
      expect(block).toContain(`--primary-foreground: var(--variant-on-accent-${mode})`);
      expect(block).toContain(`--ring: var(--variant-accent-${mode})`);
    }
  });
});
