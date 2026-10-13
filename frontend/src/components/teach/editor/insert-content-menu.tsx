"use client";

import {
  insertMarkdown$,
  usePublisher,
} from "@mdxeditor/editor";
import {
  BetweenHorizontalStart,
  Bookmark,
  BookMarked,
  BookOpenCheck,
  Braces,
  ChevronDown,
  CircleHelp,
  Database,
  FileCheck,
  FileCode2,
  FileDiff,
  Flag,
  FolderTree,
  GitCompareArrows,
  GitFork,
  Globe,
  Heading2,
  HelpCircle,
  Image,
  Layers,
  ListChecks,
  Map,
  MessageSquareText,
  Network,
  NotebookPen,
  Plus,
  Sparkles,
  SquareCode,
  Target,
  TerminalSquare,
  Video,
  Workflow,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  createContentTemplate,
  type ContentTemplateId,
} from "@/components/teach/editor/content-templates";

type InsertableItem = {
  id: ContentTemplateId;
  label: string;
  description: string;
  icon: LucideIcon;
};

const STRUCTURE_ITEMS: InsertableItem[] = [
  {
    id: "section",
    label: "Section",
    description: "Heading and explanatory prose",
    icon: Heading2,
  },
  {
    id: "learning-objectives",
    label: "Learning objectives",
    description: "Key outcomes and capabilities gained in this chapter",
    icon: Target,
  },
  {
    id: "callout",
    label: "Callout",
    description: "Highlight a tip, warning, or key idea",
    icon: MessageSquareText,
  },
  {
    id: "checkpoint-intro",
    label: "Checkpoint intro",
    description: "Orient learner before an assessment or hands-on task",
    icon: Flag,
  },
  {
    id: "faq",
    label: "FAQ group",
    description: "Collapsible questions and answers for common confusions",
    icon: HelpCircle,
  },
  {
    id: "big-word",
    label: "Big word alert",
    description: "Demystify complex technical jargon in plain English",
    icon: BookMarked,
  },
  {
    id: "must-read",
    label: "Must read",
    description: "Required external documentation or reference reading",
    icon: Bookmark,
  },
  {
    id: "interesting-read",
    label: "Interesting read",
    description: "Curiosity-sparking deep dive or engineering backstory",
    icon: Sparkles,
  },
  {
    id: "real-world",
    label: "Real-world event",
    description: "Industry case study, production outage, or historical lesson",
    icon: Globe,
  },
  {
    id: "glossary",
    label: "Explain a term",
    description: "Add a hover, keyboard, and tap-friendly definition",
    icon: CircleHelp,
  },
  {
    id: "checklist",
    label: "Task checklist",
    description: "A saved, interactive to-do list",
    icon: ListChecks,
  },
  {
    id: "evidence-checklist",
    label: "Show your work",
    description: "Evidence you can demonstrate or explain",
    icon: BookOpenCheck,
  },
  {
    id: "learning-log",
    label: "What you learned",
    description: "Private notes on your decisions and discoveries",
    icon: NotebookPen,
  },
  {
    id: "chapter-recap",
    label: "Chapter recap",
    description: "Summary bullet points of accomplishments",
    icon: FileCheck,
  },
];

const VISUAL_ITEMS: InsertableItem[] = [
  {
    id: "video",
    label: "Video",
    description: "Embed YouTube, Vimeo, Loom, or a direct video link",
    icon: Video,
  },
  {
    id: "walkthrough",
    label: "Image walkthrough",
    description: "Explain a process with linked images and steps",
    icon: Image,
  },
  {
    id: "diagram",
    label: "Diagram image",
    description: "Embed a system, concept, or Excalidraw export",
    icon: Image,
  },
  {
    id: "project-preview",
    label: "Project preview",
    description: "Showcase the final project features and tech stack",
    icon: Layers,
  },
  {
    id: "roadmap",
    label: "Roadmap",
    description: "Show milestones, the current step, and the goal",
    icon: Map,
  },
  {
    id: "compare",
    label: "Comparison",
    description: "Show two approaches side by side",
    icon: GitCompareArrows,
  },
  {
    id: "architecture",
    label: "Architecture flow",
    description: "Map client, API, and data layers",
    icon: GitFork,
  },
  {
    id: "state-machine",
    label: "State diagram",
    description: "Explain lifecycle and transitions with Mermaid",
    icon: BetweenHorizontalStart,
  },
  {
    id: "entity-diagram",
    label: "Entity ER diagram",
    description: "Map database relationships with Mermaid",
    icon: Database,
  },
  {
    id: "file-tree",
    label: "File tree",
    description: "Orient learners inside a project repo",
    icon: FolderTree,
  },
  {
    id: "terminal",
    label: "Terminal steps",
    description: "Show commands and their output",
    icon: TerminalSquare,
  },
  {
    id: "api-request",
    label: "API request panel",
    description: "HTTP endpoints, methods, and contract details",
    icon: Network,
  },
  {
    id: "diff",
    label: "Code diff",
    description: "Before and after code modifications",
    icon: FileDiff,
  },
  {
    id: "trace-request",
    label: "Request trace",
    description: "Stepped request lifecycle and middleware trace",
    icon: Workflow,
  },
];

const ASSESSED_ITEMS: InsertableItem[] = [
  {
    id: "quiz",
    label: "Quiz",
    description: "Multiple-choice checkpoint with feedback",
    icon: CircleHelp,
  },
];

const PLANNED_ITEMS = [
  { label: "Predict", icon: Sparkles },
  { label: "Open question", icon: Braces },
  { label: "Code exercise", icon: SquareCode },
] satisfies Array<{ label: string; icon: LucideIcon }>;

function MenuItem({ item, onInsert }: { item: InsertableItem; onInsert: (id: ContentTemplateId) => void }) {
  const Icon = item.icon;
  return (
    <DropdownMenuItem className="items-start gap-2.5 px-2 py-2" onClick={() => onInsert(item.id)}>
      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <Icon className="size-3.5" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block font-medium text-foreground">{item.label}</span>
        <span className="block text-xs leading-snug text-muted-foreground">{item.description}</span>
      </span>
    </DropdownMenuItem>
  );
}

export function InsertContentMenu() {
  const insertMarkdown = usePublisher(insertMarkdown$);
  const onInsert = (id: ContentTemplateId) => insertMarkdown(createContentTemplate(id));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="secondary"
            size="sm"
            aria-label="Insert learning content"
            className="mx-1"
          />
        }
      >
        <Plus className="size-3.5" aria-hidden />
        Insert
        <ChevronDown className="size-3.5 opacity-60" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-80 max-h-[85vh] overflow-y-auto">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2 py-1.5">Structure and activities</DropdownMenuLabel>
          {STRUCTURE_ITEMS.map((item) => (
            <MenuItem key={item.id} item={item} onInsert={onInsert} />
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2 py-1.5">Visual explainers</DropdownMenuLabel>
          {VISUAL_ITEMS.map((item) => (
            <MenuItem key={item.id} item={item} onInsert={onInsert} />
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2 py-1.5">Assessed activities</DropdownMenuLabel>
          {ASSESSED_ITEMS.map((item) => (
            <MenuItem key={item.id} item={item} onInsert={onInsert} />
          ))}
          {PLANNED_ITEMS.map(({ label, icon: Icon }) => (
            <DropdownMenuItem key={label} disabled className="gap-2.5 px-2 py-2">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <Icon className="size-3.5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{label}</span>
                <span className="block text-xs leading-snug">Coming with the secure question builder</span>
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <div className="flex items-start gap-2 px-2 py-2 text-xs leading-relaxed text-muted-foreground">
          <FileCode2 className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          Switch to Source for full MDX control. Learners never receive correct answers in the rendered page.
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
