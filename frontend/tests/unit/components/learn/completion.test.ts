import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ChapterCompleteCelebrationModal } from "@/components/learn/chapter-complete-celebration-modal";
import { fireMiniConfetti } from "@/components/learn/mini-confetti";

function renderProgress(completed: number, total: number) {
  return renderToStaticMarkup(createElement(ChapterCompleteCelebrationModal, {
    open: true, onClose: () => {}, courseCompleted: completed, courseTotal: total,
  }));
}

describe("confirmed chapter completion", () => {
  it("shows the confirmed total without adding another chapter", () => {
    const html = renderProgress(2, 4);
    expect(html).toContain("2 of 4");
    expect(html).toContain("50% complete");
    expect(html).toContain("One more chapter complete");
    expect(html).not.toContain("You completed the course");
  });

  it("acknowledges the course only when every chapter is complete", () => {
    expect(renderProgress(3, 4)).not.toContain("You completed the course");
    const html = renderProgress(4, 4);
    expect(html).toContain("You completed the course");
    expect(html).toContain("100% complete");
    expect(html).toContain('href="/my-courses"');
  });

  it("does not claim course completion when no chapters are available", () => {
    const html = renderProgress(0, 0);
    expect(html).not.toContain("You completed the course");
    expect(html).not.toContain("NaN");
    expect(html).not.toContain("Course progress");
  });

  it("does not create confetti for reduced motion", () => {
    const getBoundingClientRect = vi.fn();
    vi.stubGlobal("window", { matchMedia: () => ({ matches: true }) });
    try {
      fireMiniConfetti({ getBoundingClientRect } as unknown as HTMLElement);
      expect(getBoundingClientRect).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
