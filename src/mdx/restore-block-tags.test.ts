import { describe, expect, it } from "vitest";
import { restoreInteractiveBlockTags } from "./restore-block-tags";

describe("restoreInteractiveBlockTags", () => {
  it("restores escaped Quiz and OpenQuestion placeholders", () => {
    const source =
      '&lt;Quiz id="abc123" />\n&lt;OpenQuestion id="def456" />';
    expect(restoreInteractiveBlockTags(source)).toBe(
      '<Quiz id="abc123" />\n<OpenQuestion id="def456" />'
    );
  });
});
