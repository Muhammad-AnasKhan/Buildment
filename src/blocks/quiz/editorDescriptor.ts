import type { JsxComponentDescriptor } from "@mdxeditor/editor";
import { GenericJsxEditor } from "@mdxeditor/editor";

// Quiz config (quizType, prompt, options[], correctOptionIds[], explanation,
// allowRetry) is stored in the DB only. Config is complex nested JSON that
// cannot be represented as simple MDX attributes. In MDX a Quiz is referenced
// by its id only.
export const quizEditorDescriptor: JsxComponentDescriptor = {
  name: "Quiz",
  kind: "flow",
  props: [
    { name: "id", type: "string" },
    { name: "prompt", type: "string" },
    { name: "question", type: "string" },
    { name: "quizType", type: "string" },
    { name: "options", type: "expression" },
    { name: "correctOptionIds", type: "expression" },
    { name: "explanation", type: "string" },
    { name: "allowRetry", type: "expression" },
  ],
  hasChildren: false,
  Editor: GenericJsxEditor,
};