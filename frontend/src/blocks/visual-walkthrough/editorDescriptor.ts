import type { JsxComponentDescriptor } from "@mdxeditor/editor";
import { GenericJsxEditor } from "@mdxeditor/editor";

// VisualWalkthrough config (title, steps[]) is stored in the DB only.
// In MDX it is referenced by id only - the YAML fence during import populates
// the DB. The editor only needs id to reference the block.
export const visualWalkthroughEditorDescriptor: JsxComponentDescriptor = {
  name: "VisualWalkthrough",
  kind: "flow",
  props: [
    { name: "id", type: "string" },
    { name: "title", type: "string" },
    { name: "steps", type: "expression" },
  ],
  hasChildren: false,
  Editor: GenericJsxEditor,
};