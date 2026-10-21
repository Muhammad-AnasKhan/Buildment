"use client";

import { Popover } from "@base-ui/react/popover";
import { ulid } from "ulid";
import { useId, useState } from "react";
import { NestedLexicalEditor, useLexicalNodeRemove, useMdastNodeUpdater, type JsxEditorProps } from "@mdxeditor/editor";
import type { MdxJsxAttribute } from "mdast-util-mdx-jsx";
import { EditorFields } from "./editor-fields";
import { isVisibleBlockField, blockContentLabels } from "./block-editor-fields";
import { nestedBlockContent, updateNestedBlockContent } from "./nested-block-content";
import { EditorBlockFrame } from "./editor-block-frame";
import { useChapterBlockConfig, useCourseMediaId } from "./chapter-block-configs";
import { StructuredField } from "./stored-block-editor";
import { parseJsxExpressionValue } from "@/shared/mdx/jsx-attribute-value";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { uploadCourseImage } from "@/lib/course-media-upload";

const humanize = (name: string) => name.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, c => c.toUpperCase());
const containers = new Set(["Callout", "ComparePanel", "CompareColumn", "FileTree", "TerminalBlock", "TerminalLine", "ArchitectureDiagram", "ArchNode", "TraceRequest", "FaqGroup", "FaqItem", "CheckpointIntro", "InterestingRead", "ApiRequestPanel", "Steps", "Step"]);
const arrayFields = new Set(["items", "questions", "steps", "milestones", "features", "techStack", "objectives", "bullets", "points", "legend"]);
const booleanFields = new Set(["highlight", "new", "isGate", "requiredWatch", "required"]);
const fieldChoices: Record<string, string[]> = {
  "Checklist.variant": ["inline", "section", "gate"],
  "Callout.type": ["info", "tip", "warning", "success"],
  "TerminalLine.type": ["prompt", "output", "error"],
};

export function CollapsibleJsxEditor(props: JsxEditorProps) {
  return <BlockFields key={JSON.stringify(props.mdastNode.attributes)} {...props} />;
}

function BlockFields({ mdastNode, descriptor }: JsxEditorProps) {
  const courseId = useCourseMediaId();
  const update = useMdastNodeUpdater<JsxEditorProps["mdastNode"]>();
  const remove = useLexicalNodeRemove();
  const formId = useId();
  const id = mdastNode.attributes.find(a => a.type === "mdxJsxAttribute" && a.name === "id");
  const stored = useChapterBlockConfig(id?.type === "mdxJsxAttribute" && typeof id.value === "string" ? id.value : undefined);
  const initial: Record<string, unknown> = stored && typeof stored === "object" ? { ...stored } : {};
  for (const attr of mdastNode.attributes) {
    if (attr.type === "mdxJsxAttribute") initial[attr.name] = typeof attr.value === "string" ? attr.value : attr.value ? parseJsxExpressionValue(attr.value.value) : true;
  }
  const [values, setValues] = useState(initial);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const set = (name: string, value: unknown) => { setValues(v => ({ ...v, [name]: value })); setDirty(true); };
  const apply = () => {
    const invalidChoice = descriptor.props.find(prop => {
      const choices = fieldChoices[`${descriptor.name}.${prop.name}`];
      return choices && values[prop.name] != null && !choices.includes(String(values[prop.name]));
    });
    if (invalidChoice) { setError(`Choose a supported ${humanize(invalidChoice.name).toLowerCase()}.`); return; }
    const missing = descriptor.props.filter(p => isVisibleBlockField(descriptor.name ?? "", p.name, mdastNode.children.length > 0) && p.required && (values[p.name] === undefined || values[p.name] === ""));
    if (missing.length) { setError(`Complete ${missing.map(p => humanize(p.name)).join(", ")}.`); return; }
    // Keep unrecognized attributes and nested content intact.
    const attributes = mdastNode.attributes.filter(a => a.type !== "mdxJsxAttribute" || !(a.name in values));
    const nextValues = { ...values };
    if (descriptor.props.some(p => p.name === "id") && !nextValues.id) nextValues.id = ulid();
    for (const [name, value] of Object.entries(nextValues)) {
      if (value === undefined) continue;
      const attribute: MdxJsxAttribute = { type: "mdxJsxAttribute", name, value: typeof value === "string" ? value : { type: "mdxJsxAttributeValueExpression", value: JSON.stringify(value) } };
      attributes.push(attribute);
    }
    update(descriptor.name === "FaqItem"
      ? updateNestedBlockContent({ ...mdastNode, attributes }, nestedBlockContent(mdastNode) as typeof mdastNode.children)
      : { attributes });
    setDirty(false);
    setError("");
  };
  const title = humanize(descriptor.name ?? "Block");
  const fields = descriptor.props.filter(p => isVisibleBlockField(descriptor.name ?? "", p.name, mdastNode.children.length > 0));
  const child = childTemplates[descriptor.name ?? ""];
  const body = <>
    <EditorFields advanced={["language", "legend", "caption", "transcriptUrl", "requiredWatch", "variant", "isGate", "source", "readMinutes", "required", "highlight", "new", "responseStatus", "headers", "href", "src"]} revealSettings={Boolean(error)}>
      {fields.map(prop => {
        const multiline = /before|after|chart|body|content|description|answer|summary|lesson/i.test(prop.name);
        const choices = fieldChoices[`${descriptor.name}.${prop.name}`];
        const boolean = booleanFields.has(prop.name);
        return <div key={prop.name} data-field={prop.name} className={multiline || (prop.type === "expression" && !boolean) || ["section", "title", "question"].includes(prop.name) ? "space-y-1.5 sm:col-span-2" : "space-y-1.5"}>
          {!boolean && <label htmlFor={formId + prop.name} className="block text-sm font-medium">{humanize(prop.name)}{prop.required ? " *" : ""}</label>}
          {choices ? <select id={formId + prop.name} className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm" value={String(values[prop.name] ?? choices[0])} onChange={event => set(prop.name, event.target.value)}>
            {values[prop.name] != null && !choices.includes(String(values[prop.name])) && <option value={String(values[prop.name])}>Choose a supported value</option>}
            {choices.map(choice => <option key={choice} value={choice}>{humanize(choice)}</option>)}
          </select> : prop.type === "expression" ? <StructuredField allowCustomFields={["headers", "requestBody", "responseBody"].includes(prop.name)} name={prop.name === "isGate" ? "Require completion to continue" : humanize(prop.name)} value={values[prop.name] ?? (arrayFields.has(prop.name) ? [] : boolean ? false : prop.name === "status" ? 200 : {})} onChange={value => set(prop.name, value)} /> : multiline ?
            <Textarea id={formId + prop.name} rows={/before|after|chart/.test(prop.name) ? 7 : 3} className={/before|after|chart/.test(prop.name) ? "font-mono text-sm" : ""} value={String(values[prop.name] ?? "")} onChange={e => set(prop.name, e.target.value)} /> :
            <><Input id={formId + prop.name} type={prop.type === "number" ? "number" : "text"} value={String(values[prop.name] ?? "")} onChange={e => set(prop.name, prop.type === "number" ? (e.target.value === "" ? undefined : Number(e.target.value)) : e.target.value)} />
            {prop.name === "imageUrl" && courseId && <label className="inline-flex cursor-pointer items-center rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted">
              {uploadingField === prop.name ? "Uploading…" : "Upload image"}
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" className="sr-only" disabled={uploadingField !== null} onChange={async event => {
                const file = event.target.files?.[0];
                if (!file) return;
                setUploadingField(prop.name);
                setError("");
                try { set(prop.name, await uploadCourseImage(courseId, "content", file)); }
                catch (cause) { setError(cause instanceof Error ? cause.message : "Could not upload the image."); }
                finally { setUploadingField(null); event.target.value = ""; }
              }} />
            </label>}</>}
        </div>;
      })}
    </EditorFields>
    {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
    {descriptor.kind === "text" && <div className="mt-3 flex items-center justify-between gap-3">
      <span className="text-xs text-muted-foreground">{dirty ? "Apply changes to save these fields." : "Edit fields directly—no source code needed."}</span>
      <div className="flex gap-2"><Button type="button" size="sm" variant="ghost" onClick={remove}>Remove block</Button><Button type="button" size="sm" disabled={!dirty} onClick={apply}>Apply changes</Button></div>
    </div>}
    {(containers.has(descriptor.name ?? "") || descriptor.hasChildren) && <div className="mt-4 rounded-lg border bg-background p-3">
      <div className="mb-2 flex items-center justify-between gap-2"><p className="text-xs font-medium text-muted-foreground">{blockContentLabels[descriptor.name ?? ""] ?? "Content"}</p>
      {child && <Button type="button" variant="outline" size="sm" onClick={() => { if (mdastNode.type !== "mdxJsxFlowElement") return; update({ type: "mdxJsxFlowElement", children: [...mdastNode.children, { type: "mdxJsxFlowElement", name: child.name, attributes: Object.entries(child.props).map(([name, value]) => ({ type: "mdxJsxAttribute" as const, name, value })), children: [] }] }); }}>Add {humanize(child.name)}</Button>}
      </div>
      <NestedLexicalEditor<JsxEditorProps["mdastNode"]> block={mdastNode.type === "mdxJsxFlowElement"} getContent={nestedBlockContent} getUpdatedMdastNode={(node, children) => updateNestedBlockContent(node, children as typeof node.children)} />
    </div>}
  </>;
  if (descriptor.kind === "text") return <Popover.Root>
    <Popover.Trigger className="rounded border border-dashed border-ring/50 bg-muted px-1.5 text-sm text-foreground" contentEditable={false}>{String(values.term || title)}</Popover.Trigger>
    <Popover.Portal><Popover.Positioner sideOffset={8} className="z-50"><Popover.Popup className="w-96 max-w-[90vw] rounded-xl border bg-popover p-4 text-popover-foreground shadow-xl">
      <Popover.Title className="mb-3 text-sm font-semibold">{title}</Popover.Title>{body}
      <Popover.Close className="mt-3 text-xs text-muted-foreground">Close</Popover.Close>
    </Popover.Popup></Popover.Positioner></Popover.Portal>
  </Popover.Root>;
  return <EditorBlockFrame title={title} summary={String(values.title ?? values.prompt ?? values.section ?? "")} detail={dirty ? "Edited" : undefined} dirty={dirty} onSave={apply} onRemove={remove}>{body}</EditorBlockFrame>;
}

const childTemplates: Record<string, { name: string; props: Record<string, string> }> = {
  FaqGroup: { name: "FaqItem", props: { question: "New question" } },
  FileTree: { name: "FileTreeItem", props: { path: "src/new-file.ts" } },
  TerminalBlock: { name: "TerminalLine", props: { type: "prompt", content: "npm run dev" } },
  ArchitectureDiagram: { name: "ArchNode", props: { layer: "API", label: "New service" } },
  TraceRequest: { name: "TraceStep", props: { actor: "API", label: "Next step", detail: "Explain what happens." } },
  ApiRequestPanel: { name: "ApiRequest", props: { method: "GET", url: "/api/resource" } },
  ComparePanel: { name: "CompareColumn", props: { label: "Another approach", content: "Explain the trade-off." } },
  Steps: { name: "Step", props: { title: "Next step", content: "Explain what to do." } },
};
