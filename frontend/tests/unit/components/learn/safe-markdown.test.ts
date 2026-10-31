import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SafeMarkdown } from "@/components/learn/safe-markdown";
import { markdownToPlainText, parseInline, parseMarkdown } from "@/lib/safe-markdown";

const render = (source: string) => renderToStaticMarkup(createElement(SafeMarkdown, { source }));

describe("parseMarkdown", () => {
  it("reads paragraphs, bullet lists, numbered lists, bold and inline code", () => {
    const blocks = parseMarkdown("A **key** idea with `code`.\n\n- one\n- two\n\n1. first\n2. second");
    expect(blocks).toEqual([
      {
        kind: "paragraph",
        inlines: [
          { kind: "text", text: "A " },
          { kind: "bold", text: "key" },
          { kind: "text", text: " idea with " },
          { kind: "code", text: "code" },
          { kind: "text", text: "." },
        ],
      },
      { kind: "list", ordered: false, items: [[{ kind: "text", text: "one" }], [{ kind: "text", text: "two" }]] },
      { kind: "list", ordered: true, items: [[{ kind: "text", text: "first" }], [{ kind: "text", text: "second" }]] },
    ]);
  });

  it("joins wrapped lines into one paragraph and shows a heading as a bold line", () => {
    expect(parseMarkdown("one\ntwo")).toEqual([{ kind: "paragraph", inlines: [{ kind: "text", text: "one two" }] }]);
    expect(parseMarkdown("## Title")).toEqual([{ kind: "paragraph", inlines: [{ kind: "bold", text: "Title" }] }]);
  });

  it("keeps half-written marks as plain text while an answer is still streaming", () => {
    expect(parseInline("a **bold that never ends")).toEqual([{ kind: "text", text: "a **bold that never ends" }]);
    expect(parseMarkdown("```\nlet x = 1")).toEqual([{ kind: "code", text: "let x = 1" }]);
  });
});

describe("SafeMarkdown never emits raw HTML", () => {
  const attacks = [
    "<script>alert(1)</script>",
    "<img src=x onerror=alert(1)>",
    "**<b onmouseover=alert(1)>bold</b>**",
    "`<iframe src=javascript:alert(1)></iframe>`",
    "- <a href=\"javascript:alert(1)\">click</a>",
    "[click](javascript:alert(1))",
    "![x](https://example.com/x.png)",
    "```html\n<script>alert(1)</script>\n```",
    "## <svg onload=alert(1)>",
    "<!-- comment --> &lt;already escaped&gt; &amp;",
  ];

  for (const attack of attacks) {
    it(`escapes: ${attack.slice(0, 40).replace(/\n/g, " ")}`, () => {
      const html = render(attack);
      // Any angle bracket the model wrote must come out as an entity, so no tag from the answer reaches the page.
      const withoutOurTags = html.replace(/<\/?(div|p|ul|ol|li|strong|code|pre)(\s[^<>]*)?>/g, "");
      expect(withoutOurTags).not.toContain("<");
      expect(withoutOurTags).not.toContain(">");
      expect(html).not.toMatch(/<(script|img|iframe|svg|a|b)[\s>]/i);
    });
  }

  it("shows links and images as the characters they are", () => {
    expect(render("[click](javascript:alert(1))")).toContain("[click](javascript:alert(1))");
    expect(render("![x](https://example.com/x.png)")).not.toContain("<img");
  });

  it("renders bold, code and lists as ordinary elements", () => {
    const html = render("**bold** and `code`\n\n- item");
    expect(html).toContain("<strong");
    expect(html).toContain("<code");
    expect(html).toContain("<li>item</li>");
  });
});

describe("markdownToPlainText", () => {
  it("drops the marks and keeps lists readable for copying", () => {
    expect(markdownToPlainText("A **key** idea.\n\n- one\n- two\n\n1. first")).toBe("A key idea.\n\n- one\n- two\n\n1. first");
  });
});
