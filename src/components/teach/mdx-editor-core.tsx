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
  toolbarPlugin,
  UndoRedo,
} from "@mdxeditor/editor";

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
          jsxPlugin({ jsxComponentDescriptors: [] }),
          diffSourcePlugin({
            viewMode: "rich-text",
            ...(diffMarkdown ? { diffMarkdown } : {}),
          }),
          toolbarPlugin({
            toolbarContents: () => (
              <DiffSourceToggleWrapper>
                <UndoRedo />
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
