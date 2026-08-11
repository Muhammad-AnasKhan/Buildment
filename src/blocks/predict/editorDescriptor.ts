import type { JsxComponentDescriptor } from "@mdxeditor/editor";
import { GenericJsxEditor } from "@mdxeditor/editor";

export const predictEditorDescriptor: JsxComponentDescriptor = {
  name: "Predict",
  kind: "text",
  props: [{ name: "id", type: "string", required: true }],
  hasChildren: false,
  Editor: GenericJsxEditor,
};
