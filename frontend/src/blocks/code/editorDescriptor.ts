import type { JsxComponentDescriptor } from "@mdxeditor/editor";
import { StoredBlockEditor } from "@/components/teach/editor/stored-block-editor";

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
  Editor: StoredBlockEditor,
};