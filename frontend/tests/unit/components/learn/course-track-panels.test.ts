import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { CourseTrack } from "@/shared/lib/course-tracks";

vi.mock("@/server/actions/course-track", () => ({
  chooseCourseVariantAction: vi.fn(),
  chooseCourseSpecialisationAction: vi.fn(),
}));

const { VariantBanner } = await import("@/components/learn/course-track-panels");

const track: CourseTrack = {
  familySlug: "multi-vendor-marketplace",
  variantSlug: "books",
  variantChosen: true,
  variantAssigned: false,
  specialisationSlug: null,
  specialisationOpen: false,
};

const render = (overrides: Partial<CourseTrack>) =>
  renderToStaticMarkup(createElement(VariantBanner, { courseSlug: "freshmarket", track: { ...track, ...overrides } }));

describe("VariantBanner", () => {
  it("offers the picker while the learner chooses their own variant", () => {
    const html = render({});
    expect(html).toContain("Hamesh");
    expect(html).toContain('href="/courses/freshmarket/variant"');
    expect(html).toContain("Change");
  });

  it("hides the picker and says the variant was assigned when the course assigns it", () => {
    const html = render({ variantAssigned: true });
    expect(html).toContain("You are building <strong");
    expect(html).toContain("Assigned to you for this course");
    expect(html).not.toContain("/variant");
  });

  it("treats a learner from before the switch as settled on the general course", () => {
    const html = render({ variantSlug: "grocery", variantChosen: false, variantAssigned: true });
    expect(html).toContain("FreshMarket");
    expect(html).not.toContain("You can pick a different product");
    expect(html).not.toContain("/variant");
  });
});
