import { describe, expect, it } from "vitest";
import { patchMermaidSvgForDarkMode } from "../../../src/lib/mermaid-dark-patch";

describe("patchMermaidSvgForDarkMode", () => {
  it("remaps semantic success and warning fills from course flowcharts", () => {
    const svg =
      '<rect style="fill:#ecfdf5;stroke:#10b981"/><rect style="fill:#fff7ed;stroke:#f59e0b"/>';
    const patched = patchMermaidSvgForDarkMode(svg);
    expect(patched).toContain("fill:#1a2e24");
    expect(patched).toContain("stroke:#34d399");
    expect(patched).toContain("fill:#2a2218");
    expect(patched).toContain("stroke:#fbbf24");
  });
});
