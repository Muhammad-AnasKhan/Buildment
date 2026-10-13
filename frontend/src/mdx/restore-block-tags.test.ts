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

  it("restores escaped Callout blocks with children", () => {
    const source =
      '&lt;Callout type="info" title="This is the foundation">\nBeginners often **document why**.\n&lt;/Callout>';
    expect(restoreInteractiveBlockTags(source)).toBe(
      '<Callout type="info" title="This is the foundation">\nBeginners often **document why**.\n</Callout>'
    );
  });

  it("restores escaped presentation block placeholders by id", () => {
    const source = '&lt;ChapterRecap id="abc123" />';
    expect(restoreInteractiveBlockTags(source)).toBe('<ChapterRecap id="abc123" />');
  });

  it("restores escaped ApiRequestPanel blocks with children", () => {
    const source =
      '&lt;ApiRequestPanel title="Verify checkout">\n&lt;ApiRequest method="POST" url="/api/checkout" responseStatus={201} />\n&lt;/ApiRequestPanel>';
    expect(restoreInteractiveBlockTags(source)).toBe(
      '<ApiRequestPanel title="Verify checkout">\n<ApiRequest method="POST" url="/api/checkout" responseStatus={201} />\n</ApiRequestPanel>'
    );
  });

  it("restores escaped FileTree blocks with children", () => {
    const source =
      '&lt;FileTree title="Server modules" root="server/src">\n&lt;FileTreeItem path="modules/auth/" highlight />\n&lt;/FileTree>';
    expect(restoreInteractiveBlockTags(source)).toBe(
      '<FileTree title="Server modules" root="server/src">\n<FileTreeItem path="modules/auth/" highlight />\n</FileTree>'
    );
  });

  it("restores escaped DiffBlock self-closing tags", () => {
    const source = '&lt;DiffBlock title="Handler" language="javascript" before="a" after="b" />';
    expect(restoreInteractiveBlockTags(source)).toBe(
      '<DiffBlock title="Handler" language="javascript" before="a" after="b" />'
    );
  });

  it("restores escaped TraceRequest blocks with TraceStep children", () => {
    const source =
      '&lt;TraceRequest title="401 loop">\n&lt;TraceStep actor="React" label="GET /me" />\n&lt;/TraceRequest>';
    expect(restoreInteractiveBlockTags(source)).toBe(
      '<TraceRequest title="401 loop">\n<TraceStep actor="React" label="GET /me" />\n</TraceRequest>'
    );
  });

  it("restores escaped Predict placeholders", () => {
    const source = '&lt;Predict id="pred123" />';
    expect(restoreInteractiveBlockTags(source)).toBe('<Predict id="pred123" />');
  });
});
