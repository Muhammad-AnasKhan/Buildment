import { createElement, type ComponentType, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BeatFrame } from "../../../../packages/learning-ui/src/canvas/primitives/beat-frame";
import { CanvasFrame } from "../../../../packages/learning-ui/src/canvas/primitives/canvas-frame";

const TestCanvasFrame = CanvasFrame as ComponentType<{
  eyebrow: "Walkthrough" | "Explore";
  title: string;
  purpose: string;
  children?: ReactNode;
}>;
const TestBeatFrame = BeatFrame as ComponentType<{
  label: string;
  limits: string;
  children?: ReactNode;
}>;

describe("canvas frame layout", () => {
  it("contains Explore canvas content inside the reader column", () => {
    const html = renderToStaticMarkup(
      createElement(
        TestCanvasFrame,
        { eyebrow: "Explore", title: "Model", purpose: "Change an input." },
        createElement("div", null, "canvas")
      )
    );

    expect(html).toContain("isolate min-w-0 max-w-full overflow-clip");
    expect(html).toContain("min-w-0 max-w-full p-4 sm:p-6");
  });

  it("contains custom beat canvases inside the reader column", () => {
    const html = renderToStaticMarkup(
      createElement(
        TestBeatFrame,
        { label: "Diagram", limits: "A simplified model." },
        createElement("svg", { viewBox: "0 0 420 300" })
      )
    );

    expect(html).toContain("min-w-0 max-w-full overflow-clip");
    expect(html).toContain("min-w-0 max-w-full overflow-hidden");
  });
});
