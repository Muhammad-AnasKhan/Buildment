import type { JsxComponentDescriptor } from "@mdxeditor/editor";
import { GenericJsxEditor } from "@mdxeditor/editor";

// VideoBlock config matches VideoConfigSchema: title,
// sourceUrl / src, caption, transcriptUrl, requiredWatch.
export const videoEditorDescriptor: JsxComponentDescriptor = {
  name: "VideoBlock",
  kind: "flow",
  props: [
    { name: "id", type: "string" },
    { name: "title", type: "string" },
    { name: "sourceUrl", type: "string" },
    { name: "src", type: "string" },
    { name: "caption", type: "string" },
    { name: "transcriptUrl", type: "string" },
    { name: "requiredWatch", type: "expression" },
  ],
  hasChildren: false,
  Editor: GenericJsxEditor,
};