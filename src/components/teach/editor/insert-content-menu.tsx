"use client";

import {
  insertMarkdown$,
  usePublisher,
} from "@mdxeditor/editor";
import {
  BetweenHorizontalStart,
  BookOpenCheck,
  Braces,
  ChevronDown,
  CircleHelp,
  FileCode2,
  FolderTree,
  GitCompareArrows,
  GitFork,
  Heading2,
  ListChecks,
  MessageSquareText,
  NotebookPen,
  Plus,
  Sparkles,
  SquareCode,
  TerminalSquare,
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
    id: "callout",
    label: "Callout",
    description: "Highlight a tip, warning, or key idea",
    icon: MessageSquareText,
  },
  {
    id: "checklist",
    label: "Task checklist",
    description: "A saved, interactive to-do list",
    icon: ListChecks,
  },
  {
    id: "gate-checklist",
    label: "Milestone checklist",
    description: "Evidence to verify at a chapter gate",
    icon: BookOpenCheck,
  },
  {
    id: "learning-log",
    label: "Learning log",
    description: "Private reflection that saves automatically",
    icon: NotebookPen,
  },
];

const VISUAL_ITEMS: InsertableItem[] = [
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
    description: "Explain lifecycle and transitions",
    icon: BetweenHorizontalStart,
  },
  {
    id: "file-tree",
    label: "File tree",
    description: "Orient learners inside a project",
    icon: FolderTree,
  },
  {
    id: "terminal",
    label: "Terminal steps",
    description: "Show commands and their output",
    icon: TerminalSquare,
  },
];

const PLANNED_ITEMS = [
  { label: "Predict", icon: Sparkles },
  { label: "Quiz", icon: CircleHelp },
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
      <DropdownMenuContent align="start" className="w-80">
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
          <DropdownMenuLabel className="flex items-center justify-between px-2 py-1.5">
            Assessed activities
            <span className="font-normal text-muted-foreground">Builder required</span>
          </DropdownMenuLabel>
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
          Switch to Source for full MDX control. Correct answers are never stored in chapter source.
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
