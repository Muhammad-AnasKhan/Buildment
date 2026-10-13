import type { JsxComponentDescriptor } from "@mdxeditor/editor";
import { GenericJsxEditor } from "@mdxeditor/editor";

// Roadmap config (title, milestones[]) is stored in the DB only.
// In MDX it is referenced by id - the YAML fence during import populates the DB.
// The editor only needs id to reference the block.
export const roadmapEditorDescriptor: JsxComponentDescriptor = {
  name: "Roadmap",
  kind: "flow",
  props: [
    { name: "id", type: "string" },
    { name: "title", type: "string" },
    { name: "milestones", type: "expression" },
  ],
  hasChildren: false,
  Editor: GenericJsxEditor,
};