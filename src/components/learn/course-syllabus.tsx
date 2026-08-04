"use client";

import Link from "next/link";
import { CheckCircle2, ChevronDown, CircleDot, Sparkles } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useState } from "react";

export type SyllabusChapter = {
  id: string;
  slug: string;
  title: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  blockCount: number;
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

function StatusIcon({ status }: { status: SyllabusChapter["status"] }) {
  if (status === "COMPLETED") {
    return <CheckCircle2 className="size-4 shrink-0 text-indigo-600" aria-hidden />;
  }
  if (status === "IN_PROGRESS") {
    return <CircleDot className="size-4 shrink-0 text-neutral-600" aria-hidden />;
  }
  return (
    <span
      className="inline-flex size-4 shrink-0 items-center justify-center rounded-full border-[1.5px] border-neutral-300"
      aria-hidden
    />
  );
}

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
  const isActive = done > 0 && done < total;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <article
        className={cn(
          "overflow-hidden rounded-2xl border bg-white transition-colors",
          isActive ? "border-indigo-200" : "border-neutral-200 hover:border-neutral-300"
        )}
      >
        <CollapsibleTrigger
          className={cn(
            "flex w-full items-center justify-between gap-4 px-4 py-4 text-left sm:px-5",
            isActive && "bg-indigo-50/40"
          )}
        >
          <div className="flex min-w-0 items-center gap-3">
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold tabular-nums",
                isActive
                  ? "bg-indigo-600 text-white"
                  : "border border-neutral-200 bg-neutral-50 text-neutral-600"
              )}
            >
              {String(module.order).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold tracking-tight text-neutral-950">
                {module.title}
              </h2>
              <p className="mt-0.5 text-xs text-neutral-500">
                {done}/{total} lessons complete
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="hidden rounded-md bg-neutral-100 px-2 py-1 text-[11px] font-medium text-neutral-500 sm:inline-block">
              {total} lessons
            </span>
            <ChevronDown
              className={cn(
                "size-4 text-neutral-400 transition-transform duration-200",
                open && "rotate-180"
              )}
            />
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <ul className="divide-y divide-neutral-100 border-t border-neutral-100">
            {module.chapters.map((chapter) => (
              <li key={chapter.id}>
                <Link
                  href={`/courses/${courseSlug}/${chapter.slug}`}
                  className="group flex items-center justify-between gap-3 px-4 py-3.5 text-sm transition-colors hover:bg-neutral-50 sm:px-5"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <StatusIcon status={chapter.status} />
                    <span
                      className={cn(
                        "truncate font-medium transition-colors group-hover:text-neutral-950",
                        chapter.status === "COMPLETED" ? "text-neutral-500" : "text-neutral-800"
                      )}
                    >
                      {chapter.title}
                    </span>
                  </span>
                  {chapter.blockCount > 0 ? (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-700">
                      <Sparkles className="size-2.5" aria-hidden />
                      {chapter.blockCount}
                    </span>
                  ) : null}
                </Link>
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
    <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600">
            Curriculum
          </p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-neutral-950">
            Course syllabus
          </h2>
        </div>
        <span className="text-xs font-medium text-neutral-400">{totalLessons} lessons</span>
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
