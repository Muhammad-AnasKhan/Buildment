"use client";

import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { SyllabusChapterRow } from "./syllabus-chapter-row";

export type SyllabusChapter = {
  id: string;
  slug: string;
  title: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  blockCount: number;
  blocksCompleted?: number;
  locked?: boolean;
};

export type SyllabusModule = {
  id: string;
  order: number;
  title: string;
  chapters: SyllabusChapter[];
  completedCount: number;
};

type CourseSyllabusProps = {
  courseSlug: string;
  modules: SyllabusModule[];
  defaultOpenModuleId: string | null;
};

function ModuleCard({
  courseSlug,
  module,
  defaultOpen,
}: {
  courseSlug: string;
  module: SyllabusModule;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const total = module.chapters.length;
  const done = module.completedCount;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <article className="overflow-hidden rounded-xl border border-border bg-background">
        <CollapsibleTrigger className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40 font-mono text-xs font-bold tabular-nums text-muted-foreground">
              {String(module.order).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold tracking-tight text-foreground">
                {module.title}
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {done}/{total} lessons complete
              </p>
            </div>
          </div>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </CollapsibleTrigger>

        <CollapsibleContent>
          <ul className="divide-y divide-border border-t border-border">
            {module.chapters.map((chapter) => (
              <li key={chapter.id}>
                <SyllabusChapterRow
                  courseSlug={courseSlug}
                  chapter={chapter}
                  variant="syllabus"
                />
              </li>
            ))}
          </ul>
        </CollapsibleContent>
      </article>
    </Collapsible>
  );
}

export function CourseSyllabus({ courseSlug, modules, defaultOpenModuleId }: CourseSyllabusProps) {
  const totalLessons = modules.reduce((sum, mod) => sum + mod.chapters.length, 0);

  return (
    <section className="rounded-2xl border border-border bg-card p-5 text-card-foreground sm:p-8">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Course content
        </h2>
        <span className="text-sm text-muted-foreground">{totalLessons} lessons</span>
      </div>

      <div className="space-y-3">
        {modules.map((mod) => (
          <ModuleCard
            key={mod.id}
            courseSlug={courseSlug}
            module={mod}
            defaultOpen={mod.id === defaultOpenModuleId}
          />
        ))}
      </div>
    </section>
  );
}
