import { describe, expect, it } from "vitest";
import {
  COURSE_FAMILIES,
  buildCourseTrack,
  contrastRatio,
  findCourseFamily,
  pickBalancedVariant,
  resolveVariant,
  specialisationsFor,
  summarizeLearnerTrack,
} from "../../../../src/shared/lib/course-tracks.js";

// Reader surfaces from frontend/src/app/globals.css: background and muted in
// light mode, then background, card and muted in dark mode (oklch converted to hex).
const LIGHT_SURFACES = ["#FFFFFF", "#F5F5F5"];
const DARK_SURFACES = ["#0F0C07", "#1A1611", "#25211B"];
const AA_TEXT = 4.5;

const marketplace = findCourseFamily("multi-vendor-marketplace")!;
const enrollment = { variantSlug: null, specialisationSlug: null, status: "IN_PROGRESS", percentComplete: 40 };

describe("course family catalogue", () => {
  it("keeps slugs unique and every reference valid", () => {
    for (const family of COURSE_FAMILIES) {
      const variantSlugs = family.variants.map((variant) => variant.slug);
      const specialisationSlugs = family.specialisations.map((item) => item.slug);
      expect(new Set(variantSlugs).size).toBe(variantSlugs.length);
      expect(new Set(specialisationSlugs).size).toBe(specialisationSlugs.length);
      expect(variantSlugs).toContain(family.defaultVariantSlug);
      for (const variant of family.variants) expect(specialisationSlugs).toContain(variant.specialisationSlug);
    }
  });

  it("offers the six marketplace products", () => {
    expect(marketplace.variants.map((variant) => variant.productName)).toEqual([
      "FreshMarket",
      "SkillSlot",
      "Ghurza",
      "Sufra",
      "Midad",
      "Hamesh",
    ]);
  });

  it.each(COURSE_FAMILIES.flatMap((family) => family.variants))("$slug accents pass WCAG AA in light and dark mode", ({ theme }) => {
    for (const surface of LIGHT_SURFACES) expect(contrastRatio(theme.accentLight, surface)).toBeGreaterThanOrEqual(AA_TEXT);
    for (const surface of DARK_SURFACES) expect(contrastRatio(theme.accentDark, surface)).toBeGreaterThanOrEqual(AA_TEXT);
    expect(contrastRatio(theme.onAccentLight, theme.accentLight)).toBeGreaterThanOrEqual(AA_TEXT);
    expect(contrastRatio(theme.onAccentDark, theme.accentDark)).toBeGreaterThanOrEqual(AA_TEXT);
  });
});

describe("contrastRatio", () => {
  it("matches the WCAG reference values", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 5);
    expect(contrastRatio("#FFFFFF", "#FFFFFF")).toBeCloseTo(1, 5);
    expect(contrastRatio("#2563EB", "#FFFFFF")).toBeCloseTo(5.17, 1);
  });
});

describe("buildCourseTrack", () => {
  it("is null for courses without a known family", () => {
    expect(buildCourseTrack(null, enrollment)).toBeNull();
    expect(buildCourseTrack("not-a-family", enrollment)).toBeNull();
  });

  it("falls back to the default variant until the learner picks", () => {
    expect(buildCourseTrack("multi-vendor-marketplace", enrollment)).toEqual({
      familySlug: "multi-vendor-marketplace",
      variantSlug: "grocery",
      variantChosen: false,
      variantAssigned: false,
      specialisationSlug: null,
      specialisationOpen: false,
    });
    expect(buildCourseTrack("multi-vendor-marketplace", { ...enrollment, variantSlug: "retired" })).toMatchObject({
      variantSlug: "grocery",
      variantChosen: false,
    });
  });

  it("reports the chosen variant and opens specialisation once the course is complete", () => {
    expect(
      buildCourseTrack("multi-vendor-marketplace", { ...enrollment, variantSlug: "books", percentComplete: 100 })
    ).toMatchObject({ variantSlug: "books", variantChosen: true, specialisationOpen: true });
    expect(buildCourseTrack("multi-vendor-marketplace", { ...enrollment, status: "COMPLETED" })?.specialisationOpen).toBe(true);
  });

  it("marks a variant the platform assigned", () => {
    expect(buildCourseTrack("multi-vendor-marketplace", { ...enrollment, variantSlug: "books" }, { variantAssigned: true })).toMatchObject({
      variantSlug: "books",
      variantChosen: true,
      variantAssigned: true,
    });
  });
});

describe("pickBalancedVariant", () => {
  const slugs = marketplace.variants.map((variant) => variant.slug);

  it("picks the variant fewest learners have", () => {
    const counts = Object.fromEntries(slugs.map((slug) => [slug, 3]));
    counts.handmade = 1;
    expect(pickBalancedVariant(marketplace, counts).slug).toBe("handmade");
  });

  it("counts a variant nobody has yet as zero", () => {
    const counts = Object.fromEntries(slugs.filter((slug) => slug !== "digital-goods").map((slug) => [slug, 1]));
    expect(pickBalancedVariant(marketplace, counts).slug).toBe("digital-goods");
  });

  it("breaks ties at random among the least used", () => {
    const counts = { grocery: 2, services: 2, handmade: 2, "home-kitchens": 2 };
    expect(pickBalancedVariant(marketplace, counts, () => 0).slug).toBe("digital-goods");
    expect(pickBalancedVariant(marketplace, counts, () => 0.99).slug).toBe("books");
    expect(pickBalancedVariant(marketplace, {}, () => 0).slug).toBe(slugs[0]);
    expect(pickBalancedVariant(marketplace, {}, () => 0.999999).slug).toBe(slugs.at(-1));
  });

  it("ignores retired slugs in the counts", () => {
    expect(pickBalancedVariant(marketplace, { retired: 0, ...Object.fromEntries(slugs.map((slug) => [slug, 1])) }, () => 0).slug).toBe(slugs[0]);
  });

  it("spreads a cohort evenly whatever the random source", () => {
    for (const random of [() => 0, () => 0.5, () => 0.999, Math.random]) {
      const counts: Record<string, number> = {};
      for (let i = 0; i < slugs.length * 5; i += 1) {
        const slug = pickBalancedVariant(marketplace, counts, random).slug;
        counts[slug] = (counts[slug] ?? 0) + 1;
      }
      expect(Object.values(counts)).toEqual(slugs.map(() => 5));
    }
  });
});

describe("specialisationsFor", () => {
  it("lists the variant's own follow-up first and marks it recommended", () => {
    const list = specialisationsFor(marketplace, resolveVariant(marketplace, "services"));
    expect(list).toHaveLength(marketplace.specialisations.length);
    expect(list[0]).toMatchObject({ slug: "scheduling-systems", recommended: true });
    expect(list.slice(1).every((item) => !item.recommended)).toBe(true);
  });
});

describe("summarizeLearnerTrack", () => {
  it("labels the learner's choices for mentors", () => {
    expect(
      summarizeLearnerTrack("multi-vendor-marketplace", { variantSlug: "home-kitchens", specialisationSlug: "real-time-delivery" })
    ).toEqual({
      variant: { slug: "home-kitchens", label: "Home kitchens", productName: "Sufra" },
      specialisation: { slug: "real-time-delivery", label: "Real-time scheduling and delivery" },
    });
    expect(summarizeLearnerTrack("multi-vendor-marketplace", { variantSlug: null, specialisationSlug: null })).toEqual({
      variant: null,
      specialisation: null,
    });
    expect(summarizeLearnerTrack(null, { variantSlug: "books", specialisationSlug: null })).toBeNull();
  });
});
