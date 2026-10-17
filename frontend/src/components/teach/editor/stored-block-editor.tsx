"use client";

import { useId, useState } from "react";
import { Plus, X } from "lucide-react";
import { useLexicalNodeRemove, useMdastNodeUpdater, type JsxEditorProps } from "@mdxeditor/editor";
import { ulid } from "ulid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { EditorFields } from "./editor-fields";
import { EditorBlockFrame } from "./editor-block-frame";
import { useChapterBlockConfig } from "./chapter-block-configs";
import { PredictConfigSchema } from "@/shared/blocks/predict/schema";
import { OpenQuestionConfigSchema } from "@/shared/blocks/open-question/schema";
import { CodeConfigSchema } from "@/shared/blocks/code/schema";
import { parseJsxExpressionValue } from "@/shared/mdx/jsx-attribute-value";

const schemas = { Predict: PredictConfigSchema, OpenQuestion: OpenQuestionConfigSchema, CodeExercise: CodeConfigSchema };
const label = (name: string) => name.replace(/([A-Z])/g, " $1").replace(/^./, c => c.toUpperCase());

export function StoredBlockEditor(props: JsxEditorProps) {
  return <StoredBlockForm key={JSON.stringify(props.mdastNode.attributes)} {...props} />;
}

function StoredBlockForm({ mdastNode, descriptor }: JsxEditorProps) {
  const update = useMdastNodeUpdater();
  const remove = useLexicalNodeRemove();
  const formId = useId();
  const idAttribute = mdastNode.attributes.find(a => a.type === "mdxJsxAttribute" && a.name === "id");
  const blockId = idAttribute?.type === "mdxJsxAttribute" && typeof idAttribute.value === "string" ? idAttribute.value : undefined;
  const stored = useChapterBlockConfig(blockId);
  let initial: Record<string, unknown> = stored && typeof stored === "object" ? { ...stored } : {};
  for (const attr of mdastNode.attributes) {
    if (attr.type !== "mdxJsxAttribute" || attr.name === "id") continue;
    initial[attr.name] = typeof attr.value === "string" ? attr.value : attr.value ? parseJsxExpressionValue(attr.value.value) : true;
  }
  const parsedInitial = schemas[descriptor.name as keyof typeof schemas].safeParse(initial);
  if (parsedInitial.success) initial = parsedInitial.data;
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(descriptor.props.filter(p => p.name !== "id").map(p => [p.name, initial[p.name] === undefined ? "" : p.type === "string" ? String(initial[p.name]) : JSON.stringify(initial[p.name], null, 2)])));
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);
  const apply = () => {
    try {
      const config = { ...initial };
      for (const prop of descriptor.props) {
        if (prop.name === "id") continue;
        const value = values[prop.name];
        if (value === "" && prop.name !== "starterCode") { delete config[prop.name]; continue; }
        config[prop.name] = prop.type === "string" ? value : JSON.parse(value);
      }
      if (descriptor.name === "Predict" && Array.isArray(config.options) && !config.options.some(option => option.id === config.correctOptionId)) {
        setError("Choose a correct answer from the current options.");
        return;
      }
      const schema = schemas[descriptor.name as keyof typeof schemas];
      const result = schema.safeParse(config);
      if (!result.success) {
        setError(result.error.issues.map(i => label(i.path.join(".")) + ": " + i.message).join(". "));
        return;
      }
      update({ attributes: [
        { type: "mdxJsxAttribute", name: "id", value: blockId || ulid() },
        ...Object.entries(result.data).map(([name, value]) => ({ type: "mdxJsxAttribute" as const, name, value: typeof value === "string" ? value : { type: "mdxJsxAttributeValueExpression" as const, value: JSON.stringify(value) } })),
      ] });
      setDirty(false);
      setError("");
    } catch {
      setError("Check that all numeric fields contain valid numbers.");
    }
  };
  return <EditorBlockFrame title={label(descriptor.name ?? "Block")} summary={values.prompt} detail={dirty ? "Edited" : undefined} dirty={dirty} onSave={apply} onRemove={remove}>
    <EditorFields advanced={["language", "mode", "filename", "solution", "explanation", "hints", "allowRetry", "minWords", "maxWords", "sampleAnswer", "rubric", "allowSpeechInput", "speechPrimary", "allowUrl", "urlLabel", "urlRequired", "urlHint", "context"]} revealSettings={Boolean(error)}>
      {descriptor.props.filter(p => p.name !== "id").map(prop => <div key={prop.name} data-field={prop.name} className={["prompt", "starterCode", "solution", "options", "tests", "rubric"].includes(prop.name) ? "space-y-2 sm:col-span-2" : "space-y-2"}>
        <Label htmlFor={formId + prop.name}>{label(prop.name)}</Label>
        {prop.name === "submissionMode" ? <select id={formId + prop.name} className="h-9 w-full rounded-lg border bg-background px-2 text-sm" value={values[prop.name] || "text"} onChange={event => { setValues(v => ({ ...v, [prop.name]: event.target.value })); setDirty(true); }}>
          <option value="text">Written answer</option>
          <option value="url">Link (optional)</option>
          <option value="url_required">Link (required)</option>
          <option value="article">Article link</option>
          <option value="video_demo">Video demo link</option>
        </select> : descriptor.name === "CodeExercise" && (prop.name === "language" || prop.name === "mode") ? <select id={formId + prop.name} className="h-9 w-full rounded-lg border bg-background px-2 text-sm" value={values[prop.name] || (prop.name === "language" ? "javascript" : "implement")} onChange={event => { setValues(v => ({ ...v, [prop.name]: event.target.value })); setDirty(true); }}>
          {prop.name === "language" ? <option value="javascript">JavaScript</option> : <><option value="implement">Implement the solution</option><option value="complete">Complete the starter code</option></>}
        </select> : prop.name === "correctOptionId" ? <select id={formId + prop.name} className="h-9 w-full rounded-lg border bg-background px-2 text-sm" value={values[prop.name] ?? ""} onChange={event => { setValues(v => ({ ...v, [prop.name]: event.target.value })); setDirty(true); }}>
          <option value="">Choose the correct answer</option>
          {readOptions(values.options).map(option => <option key={option.id} value={option.id}>{option.label || "Untitled option"}</option>)}
        </select> : prop.type === "number" ? <Input id={formId + prop.name} type="number" min={0} value={values[prop.name] ?? ""} onChange={event => { setValues(v => ({ ...v, [prop.name]: event.target.value })); setDirty(true); }} /> : prop.type === "expression" ? <StructuredField name={label(prop.name)} value={values[prop.name] ? parseJsxExpressionValue(values[prop.name]) : defaults[prop.name]} onChange={value => { setValues(v => ({ ...v, [prop.name]: JSON.stringify(value) })); setDirty(true); }} /> : <Textarea id={formId + prop.name} value={values[prop.name] ?? ""} rows={["starterCode", "solution"].includes(prop.name) ? 7 : 2} className={["starterCode", "solution"].includes(prop.name) ? "font-mono text-sm" : ""}
          placeholder={label(prop.name)}
          onChange={event => { setValues(v => ({ ...v, [prop.name]: event.target.value })); setDirty(true); }} />}
      </div>)}
    </EditorFields>
    {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
  </EditorBlockFrame>;
}

const defaults: Record<string, unknown> = { options: [], tests: [], hints: [], context: { method: "", url: "", responseHint: "" }, allowRetry: true, allowSpeechInput: false, speechPrimary: false, allowUrl: false, urlRequired: false };
export function StructuredField({ name, value, onChange, allowCustomFields = false }: { name: string; value: unknown; onChange: (value: unknown) => void; allowCustomFields?: boolean }) {
  if (typeof value === "boolean") return <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={value} onChange={e => onChange(e.target.checked)} />{name}</label>;
  if (Array.isArray(value)) return <div className="space-y-2">
    {value.map((item, index) => <div key={typeof item?.id === "string" ? item.id : index} className="flex items-start gap-2 rounded-lg border bg-muted/10 p-2">
      <span className="flex h-9 w-6 shrink-0 items-center justify-center text-xs tabular-nums text-muted-foreground">{index + 1}</span>
      <div className="min-w-0 flex-1">{item && typeof item === "object" && typeof item.label === "string" && Object.keys(item).every(key => key === "id" || key === "label") ?
        <Input aria-label={name + " " + (index + 1)} placeholder="Write an item…" value={item.label} onChange={event => onChange(value.map((v, i) => i === index ? { ...item, label: event.target.value } : v))} /> :
        <StructuredField allowCustomFields={allowCustomFields} name={name + " " + (index + 1)} value={item} onChange={next => onChange(value.map((v, i) => i === index ? next : v))} />}</div>
      <Button type="button" size="icon-sm" variant="ghost" className="shrink-0 text-muted-foreground hover:text-destructive" aria-label={"Remove " + name + " " + (index + 1)} onClick={() => onChange(value.filter((_, i) => i !== index))}><X className="size-4" /></Button>
    </div>)}
    <Button type="button" size="sm" variant="outline" onClick={() => onChange([...value, name === "Options" ? { id: ulid(), label: "" } : name === "Tests" ? { name: "", code: "" } : name === "Items" ? { id: ulid(), label: "" } : name === "Questions" ? { id: ulid(), title: "", hint: "" } : name === "Steps" ? { id: ulid(), title: "", description: "", imageUrl: "", alt: "" } : name === "Milestones" ? { id: ulid(), title: "", description: "", state: "upcoming" } : ""])}><Plus className="size-4" />Add {name.toLowerCase().replace(/s$/, "")}</Button>
  </div>;
  if (value && typeof value === "object") return <ObjectFields allowCustomFields={allowCustomFields} name={name} value={value as Record<string, unknown>} onChange={onChange} />;
  if (typeof value === "number") return <Input aria-label={name} type="number" value={value} onChange={e => onChange(Number(e.target.value))} />;
  if (/\b(label|title|name|url|alt|method|state)$/i.test(name)) return <Input aria-label={name} value={String(value ?? "")} onChange={e => onChange(e.target.value)} />;
  return <Textarea aria-label={name} value={String(value ?? "")} rows={/\bcode$/i.test(name) ? 5 : 2} className={/\bcode$/i.test(name) ? "font-mono text-sm" : undefined} onChange={e => onChange(e.target.value)} />;
}

function readOptions(value: string | undefined): Array<{ id: string; label: string }> {
  const options = parseJsxExpressionValue(value || "[]");
  return Array.isArray(options) ? options : [];
}

function ObjectFields({ name, value, onChange, allowCustomFields }: { name: string; value: Record<string, unknown>; onChange: (value: unknown) => void; allowCustomFields: boolean }) {
  const [field, setField] = useState("");
  return <div className="space-y-3">
    {Object.entries(value).filter(([key]) => key !== "id").map(([key, item]) => <div key={key} className="space-y-1">
      <span className="text-xs text-muted-foreground">{label(key)}</span>
      <StructuredField allowCustomFields={allowCustomFields} name={name + " " + label(key)} value={item} onChange={next => onChange({ ...value, [key]: next })} />
    </div>)}
    {allowCustomFields && <div className="flex gap-2"><Input aria-label={name + " new field"} placeholder="New field name" value={field} onChange={e => setField(e.target.value)} /><Button type="button" size="sm" variant="outline" disabled={!field.trim() || field.trim() in value || ["__proto__", "constructor", "prototype"].includes(field.trim())} onClick={() => { onChange({ ...value, [field.trim()]: "" }); setField(""); }}>Add field</Button></div>}
  </div>;
}
