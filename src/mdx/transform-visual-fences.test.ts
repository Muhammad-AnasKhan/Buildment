import { describe, expect, it } from "vitest";
import { transformVisualFences } from "./transform-visual-fences";

describe("transformVisualFences", () => {
  it("converts ```video code fences into <Video /> component tags", () => {
    const markdown = `
# Lesson 1

Here is a demo:

\`\`\`video
title: Short concept walkthrough
sourceUrl: https://www.youtube.com/watch?v=kox-etGzkzw
caption: Explain what the learner should notice.
\`\`\`

More content.
`;

    const transformed = transformVisualFences(markdown);
    expect(transformed).toContain(
      '<Video src="https://www.youtube.com/watch?v=kox-etGzkzw" title="Short concept walkthrough" caption="Explain what the learner should notice." />'
    );
    expect(transformed).not.toContain("```video");
  });

  it("handles video fence with src and transcriptUrl", () => {
    const markdown = `\`\`\`video
title: Advanced Walkthrough
src: https://player.vimeo.com/video/123456
transcriptUrl: https://example.com/transcript.txt
\`\`\``;

    const transformed = transformVisualFences(markdown);
    expect(transformed).toContain(
      '<Video src="https://player.vimeo.com/video/123456" title="Advanced Walkthrough" transcriptUrl="https://example.com/transcript.txt" />'
    );
  });

  it("leaves standard code fences untouched", () => {
    const code = `
\`\`\`javascript
const x = 10;
console.log(x);
\`\`\`
`;
    expect(transformVisualFences(code)).toBe(code);
  });

  it("handles CRLF newlines smoothly", () => {
    const crlf = "```video\r\ntitle: Windows CRLF\r\nsourceUrl: https://youtu.be/kox-etGzkzw\r\n```";
    const transformed = transformVisualFences(crlf);
    expect(transformed).toContain('<Video src="https://youtu.be/kox-etGzkzw" title="Windows CRLF" />');
  });
});
