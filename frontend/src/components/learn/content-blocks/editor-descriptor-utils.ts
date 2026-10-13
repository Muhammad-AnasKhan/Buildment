import type { JsxComponentDescriptor } from "@mdxeditor/editor";
import { GenericJsxEditor } from "@mdxeditor/editor";

type PropSpec = {
  name: string;
  type?: "string" | "number" | "expression";
  required?: boolean;
};

export function createFlowDescriptor(
  name: string,
  props: PropSpec[],
  hasChildren = false
): JsxComponentDescriptor {
  return {
    name,
    kind: "flow",
    props: props.map((p) => ({
      name: p.name,
      type: p.type ?? "string",
      required: p.required,
    })),
    hasChildren,
    Editor: GenericJsxEditor,
  };
}

export function createTextDescriptor(
  name: string,
  props: PropSpec[],
  hasChildren = false
): JsxComponentDescriptor {
  return {
    name,
    kind: "text",
    props: props.map((p) => ({
      name: p.name,
      type: p.type ?? "string",
      required: p.required,
    })),
    hasChildren,
    Editor: GenericJsxEditor,
  };
}
