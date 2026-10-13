import type { JsxComponentDescriptor } from "@mdxeditor/editor";
import { GenericJsxEditor } from "@mdxeditor/editor";

// ProjectPreview carries its config in MDX as attributes.
// The import pipeline reads these attributes directly — see scripts/import-course.ts
// `transformPresentationBlocks`. The editor must expose all authoring fields.
export const projectPreviewEditorDescriptor: JsxComponentDescriptor = {
  name: "ProjectPreview",
  kind: "flow",
  props: [
    { name: "id", type: "string" },
    { name: "title", type: "string", required: true },
    { name: "description", type: "string", required: true },
    { name: "features", type: "expression", required: true },
    { name: "techStack", type: "expression" },
    { name: "imageUrl", type: "string" },
  ],
  hasChildren: false,
  Editor: GenericJsxEditor,
};
