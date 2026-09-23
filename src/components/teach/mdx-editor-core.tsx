"use client";

import "@mdxeditor/editor/style.css";
import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  codeBlockPlugin,
  codeMirrorPlugin,
  CreateLink,
  DiffSourceToggleWrapper,
  diffSourcePlugin,
  headingsPlugin,
  InsertCodeBlock,
  InsertTable,
  InsertThematicBreak,
  jsxPlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  ListsToggle,
  MDXEditor,
  quotePlugin,
  Separator,
  tablePlugin,
  toolbarPlugin,
  UndoRedo,
} from "@mdxeditor/editor";

import { contentBlockDescriptors } from "@/components/learn/content-blocks/editor-descriptors";
import { predictEditorDescriptor } from "@/blocks/predict/editorDescriptor";
import { GenericJsxEditor } from "@mdxeditor/editor";
import type { JsxComponentDescriptor } from "@mdxeditor/editor";
import { authoringComponentDescriptors } from "@/components/teach/editor/authoring-descriptors";
import { InsertContentMenu } from "@/components/teach/editor/insert-content-menu";

const blockRegistryDescriptors: JsxComponentDescriptor[] = [
  { name: "Quiz", kind: "text", props: [{ name: "id", type: "string", required: true }], hasChildren: false, Editor: GenericJsxEditor },
  predictEditorDescriptor,
  { name: "OpenQuestion", kind: "text", props: [{ name: "id", type: "string", required: true }], hasChildren: false, Editor: GenericJsxEditor },
  { name: "CodeExercise", kind: "text", props: [{ name: "id", type: "string", required: true }], hasChildren: false, Editor: GenericJsxEditor },
  { name: "ChapterRecap", kind: "text", props: [{ name: "id", type: "string", required: true }], hasChildren: false, Editor: GenericJsxEditor },
  { name: "ProjectPreview", kind: "text", props: [{ name: "id", type: "string", required: true }], hasChildren: false, Editor: GenericJsxEditor },
  { name: "LearningObjectives", kind: "text", props: [{ name: "id", type: "string", required: true }], hasChildren: false, Editor: GenericJsxEditor },
];

const jsxComponentDescriptors = [
  ...contentBlockDescriptors,
  ...authoringComponentDescriptors,
  ...blockRegistryDescriptors,
];

// The actual MDXEditor instance, lazy-loaded with ssr:false by
// chapter-editor.tsx. Plugin set per docs/phases/m1-content-pipeline.mdx:
// headings, lists, links, quotes, fenced code (CodeMirror-backed) and the
// Rich Text / Source toggle via diffSourcePlugin. jsxPlugin runs with no
// descriptors yet — each block type registers its own from M2 onward
// (src/blocks/<type>/editorDescriptor.ts).

export default function MdxEditorCore({
  initialMarkdown,
  diffMarkdown,
  onChange,
}: {
  initialMarkdown: string;
  diffMarkdown?: string;
  onChange: (markdown: string) => void;
}) {
  return (
    <div className="chapter-mdx-editor overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
      <MDXEditor
        markdown={initialMarkdown}
        onChange={onChange}
        placeholder="Write the chapter in Markdown…"
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          linkPlugin(),
          linkDialogPlugin(),
          quotePlugin(),
          tablePlugin(),
          codeBlockPlugin({ defaultCodeBlockLanguage: "js" }),
          codeMirrorPlugin({
            codeBlockLanguages: {
              js: "JavaScript",
              ts: "TypeScript",
              tsx: "TSX",
              py: "Python",
              json: "JSON",
              css: "CSS",
              html: "HTML",
              bash: "Bash",
              sql: "SQL",
            },
          }),
          // Block JSX round-trips through the editor untouched in M1; M2
          // swaps the empty descriptor list for the block registry's
          // editor descriptors.
          jsxPlugin({ jsxComponentDescriptors }),
          diffSourcePlugin({
            viewMode: "rich-text",
            ...(diffMarkdown ? { diffMarkdown } : {}),
          }),
          toolbarPlugin({
            toolbarContents: () => (
              <DiffSourceToggleWrapper>
                <UndoRedo />
                <Separator />
                <InsertContentMenu />
                <Separator />
                <BoldItalicUnderlineToggles />
                <Separator />
                <BlockTypeSelect />
                <ListsToggle />
                <Separator />
                <CreateLink />
                <InsertCodeBlock />
                <InsertTable />
                <InsertThematicBreak />
              </DiffSourceToggleWrapper>
            ),
          }),
        ]}
      />
    </div>
  );
}
