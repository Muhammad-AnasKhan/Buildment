import type { JsxComponentDescriptor } from "@mdxeditor/editor";
import { StoredBlockEditor } from "@/components/teach/editor/stored-block-editor";

export const openQuestionEditorDescriptor: JsxComponentDescriptor = {
  name: "OpenQuestion",
  kind: "flow",
  props: [
    { name: "id", type: "string" },
    { name: "rubric", type: "string" },
    { name: "speechPrimary", type: "expression" },
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
  Editor: StoredBlockEditor,
};