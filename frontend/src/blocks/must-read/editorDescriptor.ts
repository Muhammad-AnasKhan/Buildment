import type { JsxComponentDescriptor } from "@mdxeditor/editor";
import { GenericJsxEditor } from "@mdxeditor/editor";

// MustRead carries its config in MDX as attributes (title, url, description etc).
// The import pipeline reads these attributes directly - see scripts/import-course.ts
// transformPresentationBlocks.
export const mustReadEditorDescriptor: JsxComponentDescriptor = {
  name: "MustRead",
  kind: "flow",
  props: [
    { name: "id", type: "string" },
    { name: "title", type: "string", required: true },
    { name: "url", type: "string", required: true },
    { name: "description", type: "string" },
    { name: "summary", type: "string" },
    { name: "href", type: "string" },
    { name: "source", type: "string" },
    { name: "readMinutes", type: "number" },
    { name: "required", type: "expression" },
  ],
  hasChildren: false,
  Editor: GenericJsxEditor,
};