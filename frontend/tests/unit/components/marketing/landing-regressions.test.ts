import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HeroStats } from "@/components/marketing/hero-stats";
import { CourseCatalog, type CatalogCourse } from "@/components/marketing/course-catalog";

const courses: CatalogCourse[] = Array.from({ length: 7 }, (_, index) => ({
  id: `id-${index}`, slug: `course-${index}`, title: `Course ${index}`,
  description: null, coverUrl: null, difficulty: "Beginner", estimatedHours: 10,
  moduleCount: 6, chapterCount: 28,
}));

describe("landing page regressions", () => {
  it("includes accurate, visible totals in server HTML without running animation frames", () => {
    const html = renderToStaticMarkup(createElement(HeroStats, { stats: [
      { value: 620, label: "chapters" }, { value: 344, suffix: "h", label: "estimated study" },
    ] }));
    expect(html).toMatch(/<dd[^>]*>620<\/dd>/);
    expect(html).toMatch(/<dd[^>]*>344h<\/dd>/);
    expect(html).not.toContain("aria-hidden");
    expect(renderToStaticMarkup(createElement(HeroStats, { stats: [] }))).toBe("");
  });

  it("keeps every catalog course reachable without hidden carousel pages", () => {
    const html = renderToStaticMarkup(createElement(CourseCatalog, { courses }));
    for (const course of courses) expect(html).toContain(encodeURIComponent(`/courses/${course.slug}`));
    expect(html.match(/<article /g)).toHaveLength(7);
    expect(html).not.toMatch(/inert|translateX|carousel|<button/);
  });

  it("gives all seven generated covers different colors, even with identical titles", () => {
    const html = renderToStaticMarkup(createElement(CourseCatalog, {
      courses: courses.map(course => ({ ...course, title: "Same title" })),
    }));
    const colors = [...html.matchAll(/<div[^>]*style="background-color:([^";]+)/g)].map(match => match[1]);
    expect(colors).toHaveLength(7);
    expect(new Set(colors).size).toBe(7);
  });
});
