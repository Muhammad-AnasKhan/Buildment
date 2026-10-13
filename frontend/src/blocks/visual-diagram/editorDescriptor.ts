import type { JsxComponentDescriptor } from "@mdxeditor/editor";
import { GenericJsxEditor } from "@mdxeditor/editor";

// VisualDiagram config (title, imageUrl, alt, caption, kind, legend[]) is stored
// in the DB only. In MDX it is referenced by id - the YAML fence during import
// populates the DB. The editor only needs id to reference the block.
export const visualDiagramEditorDescriptor: JsxComponentDescriptor = {
  name: "VisualDiagram",
  kind: "flow",
  props: [
    { name: "id", type: "string" },
    { name: "title", type: "string" },
    { name: "imageUrl", type: "string" },
    { name: "alt", type: "string" },
    { name: "caption", type: "string" },
    { name: "kind", type: "string" },
  ],
  hasChildren: false,
  Editor: GenericJsxEditor,
};