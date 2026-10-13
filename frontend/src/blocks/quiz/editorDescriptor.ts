import type { JsxComponentDescriptor } from "@mdxeditor/editor";
import { QuizJsxEditor } from "./QuizJsxEditor";

// Quiz content is authored inline in MDX (prompt, options, correct answers,
// feedback) and synced to Block.config on draft save / publish. Learners still
// receive a sanitized projection without correctOptionIds at render time.
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
  Editor: QuizJsxEditor,
};