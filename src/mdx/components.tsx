import type { MDXComponents } from "next-mdx-remote-client/rsc";
import { blockRegistry } from "@/blocks/registry";
import { MermaidDiagram } from "@/components/learn/mermaid-diagram";
import { Callout } from "@/components/learn/callout";
import { FaqGroup, FaqItem } from "@/components/learn/faq-group";
import { CheckpointIntro } from "@/components/learn/checkpoint-intro";
import { MandatoryReadCard } from "@/components/learn/mandatory-read-card";
import { BigWordAlert } from "@/components/learn/big-word-alert";
import { InterestingRead } from "@/components/learn/interesting-read";
import { RealWorldEvent } from "@/components/learn/real-world-event";
import { ArticleBreak } from "@/components/learn/article-break";
import { ApiRequest, ApiRequestPanel } from "@/components/learn/api-request-panel";
import {
  ArchitectureDiagram,
  ArchNode,
  CompareColumn,
  ComparePanel,
  DiffBlock,
  EntityDiagram,
  FileTree,
  FileTreeItem,
  StateMachine,
  TerminalBlock,
  TerminalLine,
  TraceRequest,
  TraceStep,
} from "@/components/learn/content-blocks";
import { StepsComponent } from "@/blocks/steps/Component";
import { ProjectPreviewComponent } from "@/blocks/project-preview/Component";
import { LearningObjectivesComponent } from "@/blocks/learning-objectives/Component";
import { ChapterRecapComponent } from "@/blocks/chapter-recap/Component";
import { Checklist } from "@/components/learn/checklist";
import { LearningLog } from "@/components/learn/learning-log";
import { cn } from "@/lib/utils";
import { slugify } from "@/lib/mdx-headings";

const cellBorder = "border border-neutral-200";

// The allowlisted component map for the reader route — see
// docs/02-content-authoring.mdx "Rendering pipeline": only components in this
// map are reachable from compiled MDX, so a compromised/careless mentor
// account can add prose, not arbitrary JS.
export const mdxComponents: MDXComponents = {
  Quiz: blockRegistry.QUIZ.Component,
  Predict: blockRegistry.PREDICT.Component,
  OpenQuestion: blockRegistry.OPEN_QUESTION.Component,
  CodeExercise: blockRegistry.CODE.Component,
  Steps: blockRegistry.STEPS.Component,
  ProjectPreview: blockRegistry.PROJECT_PREVIEW.Component,
  LearningObjectives: blockRegistry.LEARNING_OBJECTIVES.Component,
  ChapterRecap: blockRegistry.CHAPTER_RECAP.Component,
  Checklist,
  LearningLog,
  MermaidDiagram,
  Callout,
  FaqGroup,
  FaqItem,
  CheckpointIntro,
  MandatoryReadCard,
  BigWordAlert,
  InterestingRead,
  RealWorldEvent,
  ArticleBreak,
  ApiRequestPanel,
  ApiRequest,
  ComparePanel,
  CompareColumn,
  FileTree,
  FileTreeItem,
  TerminalBlock,
  TerminalLine,
  DiffBlock,
  ArchitectureDiagram,
  ArchNode,
  StateMachine,
  EntityDiagram,
  TraceRequest,
  TraceStep,
  h2: ({ children, ...props }: React.ComponentProps<"h2">) => {
    const text = typeof children === "string" ? children : undefined;
    const id = text ? slugify(text) : undefined;
    return (
      <h2
        id={id}
        className="mt-12 border-b border-neutral-200 pb-2 text-xl font-semibold tracking-tight text-neutral-950 sm:text-2xl"
        {...props}
      >
        {children}
      </h2>
    );
  },
  h3: ({ children, ...props }: React.ComponentProps<"h3">) => {
    const text = typeof children === "string" ? children : undefined;
    const id = text ? slugify(text) : undefined;
    return (
      <h3
        id={id}
        className="mt-8 text-lg font-semibold tracking-tight text-neutral-950"
        {...props}
      >
        {children}
      </h3>
    );
  },
  table: (props: React.ComponentProps<"table">) => (
    <div className="not-prose my-8 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table
          className={cn("w-full border-collapse text-[15px] leading-relaxed", cellBorder)}
          {...props}
        />
      </div>
    </div>
  ),
  thead: (props: React.ComponentProps<"thead">) => (
    <thead className="bg-neutral-100" {...props} />
  ),
  tbody: (props: React.ComponentProps<"tbody">) => (
    <tbody className="bg-white" {...props} />
  ),
  tr: (props: React.ComponentProps<"tr">) => (
    <tr className="transition-colors hover:bg-neutral-50/50" {...props} />
  ),
  th: (props: React.ComponentProps<"th">) => (
    <th
      className={cn(
        cellBorder,
        "px-6 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-neutral-600"
      )}
      {...props}
    />
  ),
  td: (props: React.ComponentProps<"td">) => (
    <td
      className={cn(
        cellBorder,
        "px-6 py-5 align-top text-neutral-700",
        "[&:first-child]:min-w-[7rem] [&:first-child]:font-semibold [&:first-child]:text-neutral-950"
      )}
      {...props}
    />
  ),
  code: ({ className, children, ...props }: React.ComponentProps<"code">) => {
    const isFenced = Boolean(className && /language-/.test(className));

    if (isFenced) {
      return (
        <code
          className={cn(
            "block whitespace-pre font-mono text-[0.875em] font-normal leading-relaxed text-inherit",
            "bg-transparent p-0 before:content-none after:content-none",
            className
          )}
          {...props}
        >
          {children}
        </code>
      );
    }

    return (
      <code
        className="rounded bg-neutral-100 px-1.5 py-0.5 text-[0.85em] font-normal text-neutral-800 before:content-none after:content-none"
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ children, ...props }: React.ComponentProps<"pre">) => {
    // Extract filename from className if present (e.g., language-js:filename.js)
    const className = (props.className as string) ?? "";
    const match = className.match(/filename-([^\s]+)/);
    const filename = match ? match[1] : undefined;

    return (
      <div
        className={cn(
          "not-prose my-6 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 shadow-sm",
          /* Unlabeled fences have no language-* class — style all nested code */
          "[&_code]:block [&_code]:whitespace-pre [&_code]:bg-transparent [&_code]:p-0",
          "[&_code]:font-mono [&_code]:text-[0.875em] [&_code]:font-normal [&_code]:leading-relaxed [&_code]:text-neutral-100"
        )}
      >
        {filename ? (
          <div className="flex items-center border-b border-neutral-800 bg-neutral-900 px-4 py-2">
            <span className="text-xs font-medium text-neutral-400">{decodeURIComponent(filename)}</span>
          </div>
        ) : null}
        <pre className="m-0 overflow-x-auto bg-transparent p-4 font-mono text-[0.875em] leading-relaxed text-neutral-100">
          {children}
        </pre>
      </div>
    );
  },
};
