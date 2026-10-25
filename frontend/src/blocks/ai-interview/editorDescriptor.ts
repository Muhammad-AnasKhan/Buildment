import type { JsxComponentDescriptor } from "@mdxeditor/editor";
import { GenericJsxEditor } from "@mdxeditor/editor";

// An AI interview is authored with the ```aiinterview fence on import. In the
// rich editor it stays a reference to its stored block (the id only): the
// rubric lives on the server and is never loaded into the browser.
export const aiInterviewEditorDescriptor: JsxComponentDescriptor = {
  name: "AiInterview",
  kind: "flow",
  props: [{ name: "id", type: "string" }],
  hasChildren: false,
  Editor: GenericJsxEditor,
};
