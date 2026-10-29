import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Lab } from "@buildment/learning-ui/labs/Lab";
import { hldM4ThreeTiers } from "@buildment/learning-ui/labs/hld-m4-three-tiers/data";

describe("course lab launcher", () => {
  it("keeps the large board out of the lesson until the learner starts it", () => {
    const html = renderToStaticMarkup(createElement(Lab, { spec: hldM4ThreeTiers, courseMode: true }));

    expect(html).toContain("Hands-on lab");
    expect(html).toContain("Open full-screen lab");
    expect(html).toContain("Focused workspace");
    expect(html).toContain("10,000 req/s");
    expect(html).toContain("p99 &lt; 200 ms");
    expect(html).toContain("Load balancer");
    expect(html).not.toContain('data-testid="run-button"');
    expect(html).not.toContain('data-testid="fullscreen-button"');
  });
});
