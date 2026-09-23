import { compile } from "@mdx-js/mdx";
import { describe, expect, it } from "vitest";

import {
  createContentTemplate,
  type ContentTemplateId,
} from "./content-templates";

const TEMPLATE_IDS: ContentTemplateId[] = [
  "section",
  "callout",
  "checklist",
  "gate-checklist",
  "learning-log",
  "compare",
  "file-tree",
  "terminal",
  "architecture",
  "state-machine",
];

describe("mentor content templates", () => {
  it.each(TEMPLATE_IDS)("creates valid MDX for %s", async (templateId) => {
    await expect(compile(createContentTemplate(templateId))).resolves.toBeDefined();
  });

  it("uses stable ULIDs for saved checklist and learning-log fields", () => {
    const markdown = [
      createContentTemplate("checklist"),
      createContentTemplate("gate-checklist"),
      createContentTemplate("learning-log"),
    ].join("\n");
    const ids = [...markdown.matchAll(/\"id\":\"([^\"]+)\"/g)].map((match) => match[1]);

    expect(ids).toHaveLength(8);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.every((id) => /^[0-9A-HJKMNP-TV-Z]{26}$/.test(id ?? ""))).toBe(true);
  });
});
