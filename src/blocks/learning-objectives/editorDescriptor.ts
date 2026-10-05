import type { JsxComponentDescriptor } from "@mdxeditor/editor";
import { GenericJsxEditor } from "@mdxeditor/editor";

// LearningObjectives carries its config in MDX as attributes (objectives array).
// The import pipeline reads these attributes directly — see scripts/import-course.ts
// `transformPresentationBlocks`. The editor must expose all authoring fields.
export const learningObjectivesEditorDescriptor: JsxComponentDescriptor = {
  name: "LearningObjectives",
  kind: "flow",
  props: [
    { name: "id", type: "string" },
    { name: "objectives", type: "expression" },
    { name: "items", type: "expression" },
  ],
  hasChildren: false,
  Editor: GenericJsxEditor,
};
