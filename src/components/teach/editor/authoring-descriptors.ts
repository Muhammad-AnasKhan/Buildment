import type { JsxComponentDescriptor } from "@mdxeditor/editor";
import { GenericJsxEditor } from "@mdxeditor/editor";

export const authoringComponentDescriptors: JsxComponentDescriptor[] = [
  {
    name: "Callout",
    kind: "flow",
    props: [
      { name: "type", type: "string" },
      { name: "title", type: "string" },
    ],
    hasChildren: true,
    Editor: GenericJsxEditor,
  },
  {
    name: "Checklist",
    kind: "flow",
    props: [
      { name: "section", type: "string" },
      { name: "variant", type: "string" },
      { name: "isGate", type: "expression" },
      { name: "items", type: "expression", required: true },
    ],
    hasChildren: false,
    Editor: GenericJsxEditor,
  },
  {
    name: "LearningLog",
    kind: "flow",
    props: [
      { name: "title", type: "string", required: true },
      { name: "instruction", type: "string" },
      { name: "questions", type: "expression", required: true },
      { name: "variant", type: "string" },
    ],
    hasChildren: false,
    Editor: GenericJsxEditor,
  },
];
