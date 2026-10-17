"use client";

import "@mdxeditor/editor/style.css";
import { useTheme } from "next-themes";
import "./editor/editor-theme.css";
import {
  GenericJsxEditor,
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
  jsxPlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
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
import { EditorQuickInsert, EditorMoreTools } from "@/components/teach/editor/editor-quick-tools";
import { InsertContentMenu } from "@/components/teach/editor/insert-content-menu";
import { normalizeLearningLogQuestionProps } from "@/shared/lib/learning-log";
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
import { CollapsibleJsxEditor } from "@/components/teach/editor/collapsible-jsx-editor";
import { EditorSlashMenu } from "@/components/teach/editor/editor-slash-menu";

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
].map(descriptor => descriptor.Editor === GenericJsxEditor
  ? { ...descriptor, Editor: CollapsibleJsxEditor }
  : descriptor);

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
  readerMode = "DEFAULT",
}: {
  initialMarkdown: string;
  diffMarkdown?: string;
  onChange: (markdown: string) => void;
  readerMode?: "DEFAULT" | "QUIZ";
  blockConfigs?: Record<string, unknown>;
}) {
  const { resolvedTheme } = useTheme();
  return (
    <ChapterBlockConfigsProvider configs={blockConfigs} quizEnabled={readerMode === "QUIZ"}>
    <div className="chapter-mdx-editor overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
      <MDXEditor
        className={`buildment-editor ${resolvedTheme === "dark" ? "dark-theme" : ""}`}
        contentEditableClassName="editor-prose"
        markdown={initialMarkdown}
        onChange={(markdown) => onChange(normalizeLearningLogQuestionProps(markdown))}
        placeholder={readerMode === "QUIZ" ? "Type / to add a quiz, open question, prediction, or code exercise…" : "Start writing, or type / to add an activity or visual…"}
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
                <EditorQuickInsert />
                <EditorSlashMenu />
                <Separator />
                {readerMode !== "QUIZ" && <>
                <BoldItalicUnderlineToggles />
                <Separator />
                <BlockTypeSelect />
                <Separator />
                <CreateLink />
                <EditorMoreTools />
                </>}
              </DiffSourceToggleWrapper>
            ),
          }),
        ]}
      />
    </div>
    </ChapterBlockConfigsProvider>
  );
}
