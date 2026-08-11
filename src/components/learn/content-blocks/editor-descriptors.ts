import type { JsxComponentDescriptor } from "@mdxeditor/editor";
import { createFlowDescriptor, createTextDescriptor } from "./editor-descriptor-utils";

export const contentBlockDescriptors: JsxComponentDescriptor[] = [
  createFlowDescriptor("ComparePanel", [{ name: "title" }], true),
  createFlowDescriptor("CompareColumn", [{ name: "label", required: true }], true),
  createFlowDescriptor("FileTree", [{ name: "title" }, { name: "root" }], true),
  createFlowDescriptor(
    "FileTreeItem",
    [{ name: "path", required: true }, { name: "highlight" }, { name: "new" }],
    false
  ),
  createFlowDescriptor("TerminalBlock", [{ name: "title" }, { name: "cwd" }], true),
  createFlowDescriptor("TerminalLine", [{ name: "type" }], true),
  createTextDescriptor("DiffBlock", [
    { name: "title" },
    { name: "language" },
    { name: "before" },
    { name: "after" },
  ]),
  createFlowDescriptor("ArchitectureDiagram", [{ name: "title" }], true),
  createFlowDescriptor("ArchNode", [{ name: "layer", required: true }], true),
  createTextDescriptor("StateMachine", [{ name: "title" }, { name: "chart" }]),
  createTextDescriptor("EntityDiagram", [{ name: "title" }, { name: "chart" }, { name: "legend" }]),
  createFlowDescriptor("TraceRequest", [{ name: "title" }], true),
  createFlowDescriptor(
    "TraceStep",
    [
      { name: "actor" },
      { name: "label", required: true },
      { name: "detail" },
      { name: "status", type: "expression" },
    ],
    false
  ),
];
