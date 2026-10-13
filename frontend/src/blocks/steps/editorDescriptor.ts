import type { JsxComponentDescriptor } from "@mdxeditor/editor";
import { GenericJsxEditor } from "@mdxeditor/editor";

export const stepsEditorDescriptor: JsxComponentDescriptor = {
  name: "Steps",
  kind: "flow",
  props: [
    { name: "id", type: "string" },
    { name: "title", type: "string" },
    { name: "steps", type: "expression" },
  ],
  hasChildren: false,
  Editor: GenericJsxEditor,
};
