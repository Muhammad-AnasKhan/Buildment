import type { JsxComponentDescriptor } from "@mdxeditor/editor";
import { GenericJsxEditor } from "@mdxeditor/editor";

// Predict config (prompt, options[], correctOptionId, explanation, allowRetry,
// context) is stored in the DB only. Complex nested JSON cannot be represented
// as simple MDX attributes. In MDX a Predict block is referenced by id only.
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
  Editor: GenericJsxEditor,
};