import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("@/server/actions/course-track", () => ({
  chooseCourseVariantAction: vi.fn(),
  chooseCourseSpecialisationAction: vi.fn(),
}));

const { VariantPicker } = await import("@/components/learn/variant-picker");
const { findCourseFamily } = await import("@/shared/lib/course-tracks");

const family = findCourseFamily("ai-engineering-capstones")!;
const choices = family.variants.map((variant) => ({
  slug: variant.slug,
  productName: variant.productName,
  label: variant.label,
  summary: variant.summary,
  hardestConstraint: variant.hardestConstraint,
  channels: (variant.channels ?? []).map((channel) => ({ label: channel.label, optional: channel.optional })),
  accentLight: variant.theme.accentLight,
  onAccentLight: variant.theme.onAccentLight,
  accentDark: variant.theme.accentDark,
  onAccentDark: variant.theme.onAccentDark,
  unavailable: false,
}));

const render = (initialSlug: string | null, list = choices) =>
  renderToStaticMarkup(createElement(VariantPicker, { courseSlug: "ai-interview", choices: list, initialSlug }));

describe("VariantPicker", () => {
  it("renders one real radio per product in one named group", () => {
    const html = render(null);
    expect(html.match(/type="radio"/g)).toHaveLength(choices.length);
    expect(html.match(/name="variantSlug"/g)).toHaveLength(choices.length);
    expect(html).toContain('name="courseSlug" value="ai-interview"');
  });

  it("starts with nothing picked and the action off", () => {
    const html = render(null);
    expect(html).not.toContain("checked");
    expect(html).toContain("Pick one to continue.");
    expect(html).toMatch(/<button[^>]*\sdisabled=""/);
  });

  it("names the pick on the action when one is selected", () => {
    const html = render("field-reports");
    expect(html).toContain("Build with Marj Reports");
    expect(html).not.toMatch(/<button[^>]*\sdisabled=""/);
  });

  it("keeps the hard problem behind a disclosure", () => {
    const html = render(null);
    expect(html.match(/See the hard problem/g)).toHaveLength(choices.length);
    expect(html).toContain("<details");
  });

  it("does not let an earlier pick without lessons be chosen", () => {
    const html = render(null, choices.map((choice, index) => (index === 0 ? { ...choice, unavailable: true } : choice)));
    expect(html).toContain("No lessons yet.");
    expect(html.match(/type="radio"[^>]*disabled/g)).toHaveLength(1);
  });
});
