import type { JsxComponentDescriptor } from "@mdxeditor/editor";
import { GenericJsxEditor } from "@mdxeditor/editor";

// CodeExercise config (mode, language, prompt, starterCode, tests[], hints[],
// explanation, solution, allowRetry) is stored in the DB only. Cannot be
// represented as simple MDX attributes. In MDX a CodeExercise is referenced
// by id only.
export const codeEditorDescriptor: JsxComponentDescriptor = {
  name: "CodeExercise",
  kind: "flow",
  props: [
    { name: "id", type: "string" },
    { name: "prompt", type: "string" },
    { name: "language", type: "string" },
    { name: "mode", type: "string" },
    { name: "filename", type: "string" },
    { name: "starterCode", type: "string" },
    { name: "solution", type: "string" },
    { name: "explanation", type: "string" },
    { name: "hints", type: "expression" },
    { name: "tests", type: "expression" },
    { name: "allowRetry", type: "expression" },
  ],
  hasChildren: false,
  Editor: GenericJsxEditor,
};