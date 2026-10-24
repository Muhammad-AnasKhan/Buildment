import { describe, expect, it } from "vitest";
import { CourseManifestSchema } from "../../scripts/course-source.js";

const manifest = {
  slug: "freshmarket-multi-vendor-marketplace-v2",
  title: "FreshMarket",
  description: "A grocery marketplace.",
  projectGoal: "Ship it.",
  difficulty: "Medium",
  estimatedHours: 240,
  modules: [{ dir: "01-introduction", title: "Introduction", lessons: [{ file: "01.01-start.md", title: "Start", goal: "Begin" }] }],
};

describe("course.yaml family", () => {
  it("is optional", () => {
    expect(CourseManifestSchema.safeParse(manifest).success).toBe(true);
  });

  it("accepts a known course family", () => {
    const parsed = CourseManifestSchema.parse({ ...manifest, family: "multi-vendor-marketplace" });
    expect(parsed.family).toBe("multi-vendor-marketplace");
  });

  it("rejects an unknown family so a typo cannot silently drop the variants", () => {
    const result = CourseManifestSchema.safeParse({ ...manifest, family: "multi-vendor-marketplce" });
    expect(result.success).toBe(false);
  });

  it("accepts a creator-defined family and checks its default variant", () => {
    const custom = { ...manifest, family: "marketplace-lab", variantFamily: {
      slug: "marketplace-lab", label: "Marketplace lab", defaultVariantSlug: "food",
      variants: [
        { slug: "food", label: "Food", productName: "FreshMarket", summary: "Sell food", hardestConstraint: "Inventory" },
        { slug: "electricity", label: "Electricity", productName: "GridMarket", summary: "Trade power", hardestConstraint: "Matching" },
      ],
    } };
    expect(CourseManifestSchema.safeParse(custom).success).toBe(true);
    expect(CourseManifestSchema.safeParse({ ...custom, variantFamily: { ...custom.variantFamily, defaultVariantSlug: "missing" } }).success).toBe(false);
    expect(CourseManifestSchema.safeParse({ ...custom, variantFamily: { ...custom.variantFamily,
      variants: [{ ...custom.variantFamily.variants[0], productName: 'Bad" onClick="alert(1)' }, custom.variantFamily.variants[1]] } }).success).toBe(false);
  });

  it("accepts variant channels and rejects an empty channel label", () => {
    const variants = [
      { slug: "food", label: "Food", productName: "FreshMarket", summary: "Sell food", hardestConstraint: "Inventory",
        channels: [{ label: "Web chat" }, { label: "Email" }, { label: "Team chat", optional: true }] },
      { slug: "electricity", label: "Electricity", productName: "GridMarket", summary: "Trade power", hardestConstraint: "Matching" },
    ];
    const custom = { ...manifest, family: "marketplace-lab", variantFamily: { slug: "marketplace-lab", label: "Marketplace lab", defaultVariantSlug: "food", variants } };
    expect(CourseManifestSchema.safeParse(custom).success).toBe(true);
    expect(CourseManifestSchema.safeParse({ ...custom, variantFamily: { ...custom.variantFamily,
      variants: [{ ...variants[0], channels: [{ label: "" }] }, variants[1]] } }).success).toBe(false);
  });

  it("accepts stable keys and rejects duplicates across modules", () => {
    const keyed = { ...manifest, modules: [
      { ...manifest.modules[0], key: "intro", lessons: [{ ...manifest.modules[0].lessons[0], key: "first-lesson" }] },
      { dir: "02-next", key: "next", title: "Next", lessons: [{ file: "02.01-next.md", key: "first-lesson", title: "Next", goal: "Continue" }] },
    ] };
    expect(CourseManifestSchema.safeParse({ ...keyed, modules: keyed.modules.slice(0, 1) }).success).toBe(true);
    expect(CourseManifestSchema.safeParse(keyed).success).toBe(false);
  });

  it("rejects duplicate removal keys before publication", () => {
    expect(CourseManifestSchema.safeParse({ ...manifest, publication: "update", modules: [],
      remove: { moduleKeys: [], lessonKeys: ["old-lesson", "old-lesson"] } }).success).toBe(false);
  });
});
