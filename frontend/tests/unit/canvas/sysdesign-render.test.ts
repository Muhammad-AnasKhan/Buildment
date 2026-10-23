import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { InteractiveCanvas } from "@/canvas/InteractiveCanvas";

// The reader renders a canvas's starting state on the server. These check the
// kit canvases render there without errors and show their first step.
describe("system design canvases render on the server", () => {
  it("TrueTime starts at step 1 with its controls and limits", () => {
    const html = renderToString(createElement(InteractiveCanvas, { slug: "sysdesign-truetime-commit-wait" })).replaceAll("<!-- -->", "");
    expect(html).toContain("TrueTime: when a timestamp is a range");
    expect(html).toContain("Step 1 of 7");
    expect(html).toContain("T1 asks to commit");
    expect(html).toContain("Clock uncertainty (epsilon)");
    expect(html).toContain("Limits of the model");
    expect(html).toContain("<svg");
  });

  it("replica lag starts at step 1 with all three routing options", () => {
    const html = renderToString(createElement(InteractiveCanvas, { slug: "sysdesign-replica-lag" })).replaceAll("<!-- -->", "");
    expect(html).toContain("Replica lag: where did my comment go?");
    expect(html).toContain("Step 1 of 6");
    for (const label of ["Any replica", "Leader for own reads", "Replica at my position"]) expect(html).toContain(label);
  });
});
