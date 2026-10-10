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
  frontmatterPlugin,
  headingsPlugin,
  imagePlugin,
  InsertCodeBlock,
  InsertImage,
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
  thematicBreakPlugin,
  toolbarPlugin,
  UndoRedo,
} from "@mdxeditor/editor";

import { contentBlockDescriptors } from "@/components/learn/content-blocks/editor-descriptors";
import { authoringComponentDescriptors } from "@/components/teach/editor/authoring-descriptors";
import { InsertContentMenu } from "@/components/teach/editor/insert-content-menu";
import { normalizeLearningLogQuestionProps } from "@/lib/learning-log";
// Per-block editor descriptors — each block folder owns its own descriptor.
import { quizEditorDescriptor } from "@/blocks/quiz/editorDescriptor";
import { predictEditorDescriptor } from "@/blocks/predict/editorDescriptor";
import { openQuestionEditorDescriptor } from "@/blocks/open-question/editorDescriptor";
import { codeEditorDescriptor } from "@/blocks/code/editorDescriptor";
import { mustReadEditorDescriptor } from "@/blocks/must-read/editorDescriptor";
import { stepsEditorDescriptor } from "@/blocks/steps/editorDescriptor";
import { projectPreviewEditorDescriptor } from "@/blocks/project-preview/editorDescriptor";
import { learningObjectivesEditorDescriptor } from "@/blocks/learning-objectives/editorDescriptor";
import { chapterRecapEditorDescriptor } from "@/blocks/chapter-recap/editorDescriptor";
import { videoEditorDescriptor } from "@/blocks/video/editorDescriptor";
import { visualWalkthroughEditorDescriptor } from "@/blocks/visual-walkthrough/editorDescriptor";
import { visualDiagramEditorDescriptor } from "@/blocks/visual-diagram/editorDescriptor";
import { roadmapEditorDescriptor } from "@/blocks/roadmap/editorDescriptor";
import { ChapterBlockConfigsProvider } from "@/components/teach/editor/chapter-block-configs";

// All registered block types, each sourced from its own editorDescriptor.ts.
const blockRegistryDescriptors = [
  quizEditorDescriptor,
  predictEditorDescriptor,
  openQuestionEditorDescriptor,
  codeEditorDescriptor,
  mustReadEditorDescriptor,
  stepsEditorDescriptor,
  projectPreviewEditorDescriptor,
  learningObjectivesEditorDescriptor,
  chapterRecapEditorDescriptor,
  videoEditorDescriptor,
  visualWalkthroughEditorDescriptor,
  visualDiagramEditorDescriptor,
  roadmapEditorDescriptor,
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
  blockConfigs = {},
}: {
  initialMarkdown: string;
  diffMarkdown?: string;
  onChange: (markdown: string) => void;
  blockConfigs?: Record<string, unknown>;
}) {
  return (
    <ChapterBlockConfigsProvider configs={blockConfigs}>
    <div className="chapter-mdx-editor overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
      <MDXEditor
        markdown={initialMarkdown}
        onChange={(markdown) => onChange(normalizeLearningLogQuestionProps(markdown))}
        placeholder="Write the chapter in Markdown…"
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          linkPlugin(),
          linkDialogPlugin(),
          quotePlugin(),
          tablePlugin(),
          thematicBreakPlugin(),
          frontmatterPlugin(),
          imagePlugin(),
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
                <InsertImage />
                <InsertCodeBlock />
                <InsertTable />
                <InsertThematicBreak />
              </DiffSourceToggleWrapper>
            ),
          }),
        ]}
      />
    </div>
    </ChapterBlockConfigsProvider>
  );
}
