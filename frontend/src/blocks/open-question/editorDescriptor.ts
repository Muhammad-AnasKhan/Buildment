import type { JsxComponentDescriptor } from "@mdxeditor/editor";
import { GenericJsxEditor } from "@mdxeditor/editor";

// OpenQuestion config (prompt, minWords, maxWords, submissionMode, allowUrl,
// urlLabel, urlRequired, urlHint, rubric, sampleAnswer) is stored in the DB
// only. Complex config cannot be represented as simple MDX attributes.
// In MDX an OpenQuestion block is referenced by id only.
export const openQuestionEditorDescriptor: JsxComponentDescriptor = {
  name: "OpenQuestion",
  kind: "flow",
  props: [
    { name: "id", type: "string" },
    { name: "prompt", type: "string" },
    { name: "minWords", type: "number" },
    { name: "maxWords", type: "number" },
    { name: "sampleAnswer", type: "string" },
    { name: "submissionMode", type: "string" },
    { name: "allowSpeechInput", type: "expression" },
    { name: "allowUrl", type: "expression" },
    { name: "urlLabel", type: "string" },
    { name: "urlRequired", type: "expression" },
    { name: "urlHint", type: "string" },
  ],
  hasChildren: false,
  Editor: GenericJsxEditor,
};