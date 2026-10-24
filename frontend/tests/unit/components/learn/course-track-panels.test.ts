import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { CourseTrack } from "@/shared/lib/course-tracks";

vi.mock("@/server/actions/course-track", () => ({
  chooseCourseVariantAction: vi.fn(),
  chooseCourseSpecialisationAction: vi.fn(),
}));

const { VariantBanner, VariantDetails } = await import("@/components/learn/course-track-panels");
const { findCourseFamily, findVariant } = await import("@/shared/lib/course-tracks");

const track: CourseTrack = {
  familySlug: "multi-vendor-marketplace",
  variantSlug: "books",
  variantChosen: true,
  variantLocked: false,
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
    const html = render({ variantAssigned: true, variantLocked: true });
    expect(html).toContain("You are building <strong");
    expect(html).toContain("Assigned to you for this course");
    expect(html).not.toContain("/variant");
  });

  it("keeps an earlier learner free to choose after the course mode changes", () => {
    const html = render({ variantSlug: "grocery", variantChosen: false, variantAssigned: false });
    expect(html).toContain("Choose a variant");
  });
});

describe("VariantDetails", () => {
  const capstones = findCourseFamily("ai-engineering-capstones")!;
  const renderVariant = (slug: string) => renderToStaticMarkup(createElement(VariantDetails, { variant: findVariant(capstones, slug)! }));

  it("lists the channels and marks a suggested channel as optional in words", () => {
    const html = renderVariant("runbook-bot");
    expect(html).toContain('aria-label="Channels"');
    expect(html).toContain("Web chat");
    expect(html).toContain("Email");
    expect(html).toMatch(/Team chat(<!-- -->)?<span[^>]*>, optional<\/span>/);
    expect(html).toContain("Hard problem");
    expect(html).toContain("Runbooks go stale");
  });

  it("shows no optional channel when the project has none", () => {
    const html = renderVariant("policy-desk");
    expect(html).toContain("Email");
    expect(html).not.toContain("optional");
  });

  it("leaves out the channel list for a variant without channels", () => {
    const marketplace = findCourseFamily("multi-vendor-marketplace")!;
    const html = renderToStaticMarkup(createElement(VariantDetails, { variant: marketplace.variants[0]! }));
    expect(html).not.toContain('aria-label="Channels"');
    expect(html).toContain("Hard problem");
  });
});
