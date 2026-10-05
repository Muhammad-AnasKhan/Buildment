import type { JsxComponentDescriptor } from "@mdxeditor/editor";
import { GenericJsxEditor } from "@mdxeditor/editor";

// ChapterRecap carries its config in MDX as attributes (points array).
// The import pipeline reads these attributes directly — see scripts/import-course.ts
// `transformPresentationBlocks`. The editor must expose all authoring fields.
export const chapterRecapEditorDescriptor: JsxComponentDescriptor = {
  name: "ChapterRecap",
  kind: "flow",
  props: [
    { name: "id", type: "string", required: true },
    { name: "points", type: "expression", required: true },
  ],
  hasChildren: false,
  Editor: GenericJsxEditor,
};
