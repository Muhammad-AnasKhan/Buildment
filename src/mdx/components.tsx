import type { MDXComponents } from "next-mdx-remote-client/rsc";
import { QuizComponent } from "@/blocks/quiz/Component";
import { PredictComponent } from "@/blocks/predict/Component";
import { OpenQuestionComponent } from "@/blocks/open-question/Component";
import { CodeExerciseComponent } from "@/blocks/code/Component";
import { StepsComponent } from "@/blocks/steps/Component";
import { ProjectPreviewComponent } from "@/blocks/project-preview/Component";
import { LearningObjectivesComponent } from "@/blocks/learning-objectives/Component";
import { ChapterRecapComponent } from "@/blocks/chapter-recap/Component";
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
import { Checklist } from "@/components/learn/checklist";
import { LearningLog } from "@/components/learn/learning-log";
import { Video } from "@/components/learn/video-embed";
import { cn } from "@/lib/utils";
import { slugify } from "@/lib/mdx-headings";
import { MdxCodeElement, MdxCodeFigure, MdxCodePre } from "@/mdx/code-block";

const cellBorder = "border border-border";

// The allowlisted component map for the reader route — see
// docs/02-content-authoring.mdx "Rendering pipeline": only components in this
// map are reachable from compiled MDX, so a compromised/careless mentor
// account can add prose, not arbitrary JS.
export const mdxComponents: MDXComponents = {
  Quiz: QuizComponent,
  Predict: PredictComponent,
  OpenQuestion: OpenQuestionComponent,
  CodeExercise: CodeExerciseComponent,
  Steps: StepsComponent,
  ProjectPreview: ProjectPreviewComponent,
  LearningObjectives: LearningObjectivesComponent,
  ChapterRecap: ChapterRecapComponent,
  Checklist,
  LearningLog,
  Video,
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
        className="mt-12 border-b border-border pb-2 text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
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
        className="mt-8 text-lg font-semibold tracking-tight text-foreground"
        {...props}
      >
        {children}
      </h3>
    );
  },
  table: (props: React.ComponentProps<"table">) => (
    <div className="not-prose my-8 overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
      <div className="overflow-x-auto">
        <table
          className={cn("w-full border-collapse text-[15px] leading-relaxed", cellBorder)}
          {...props}
        />
      </div>
    </div>
  ),
  thead: (props: React.ComponentProps<"thead">) => (
    <thead className="bg-muted" {...props} />
  ),
  tbody: (props: React.ComponentProps<"tbody">) => (
    <tbody className="bg-card" {...props} />
  ),
  tr: (props: React.ComponentProps<"tr">) => (
    <tr className="transition-colors hover:bg-muted/50" {...props} />
  ),
  th: (props: React.ComponentProps<"th">) => (
    <th
      className={cn(
        cellBorder,
        "px-6 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground"
      )}
      {...props}
    />
  ),
  td: (props: React.ComponentProps<"td">) => (
    <td
      className={cn(
        cellBorder,
        "px-6 py-5 align-top text-foreground/85",
        "[&:first-child]:min-w-[7rem] [&:first-child]:font-semibold [&:first-child]:text-foreground"
      )}
      {...props}
    />
  ),
  figure: MdxCodeFigure,
  pre: MdxCodePre,
  code: MdxCodeElement,
};
