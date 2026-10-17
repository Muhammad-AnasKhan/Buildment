import type { JsxComponentDescriptor } from "@mdxeditor/editor";
import { StoredBlockEditor } from "@/components/teach/editor/stored-block-editor";

export const predictEditorDescriptor: JsxComponentDescriptor = {
  name: "Predict",
  kind: "flow",
  props: [
    { name: "id", type: "string" },
    { name: "prompt", type: "string" },
    { name: "options", type: "expression" },
    { name: "correctOptionId", type: "string" },
    { name: "explanation", type: "string" },
    { name: "context", type: "expression" },
    { name: "allowRetry", type: "expression" },
  ],
  hasChildren: false,
  Editor: StoredBlockEditor,
};