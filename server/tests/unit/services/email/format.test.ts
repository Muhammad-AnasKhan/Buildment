import { describe, expect, it } from "vitest";
import { escapeHtml, formatMessagePreview } from "../../../../src/services/email/format.js";

describe("formatMessagePreview", () => {
  it("collapses whitespace and truncates long text", () => {
    const long = "word ".repeat(80).trim();
    const preview = formatMessagePreview(long, 40);
    expect(preview.length).toBeLessThanOrEqual(40);
    expect(preview.endsWith("…")).toBe(true);
  });
});

describe("escapeHtml", () => {
  it("escapes markup characters", () => {
    expect(escapeHtml(`<script>"x"</script>`)).toBe("&lt;script&gt;&quot;x&quot;&lt;/script&gt;");
  });
});
