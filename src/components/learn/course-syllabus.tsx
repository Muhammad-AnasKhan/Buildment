"use client";

import Link from "next/link";
import { CheckCircle2, ChevronDown, CircleDot } from "lucide-react";
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
    return <CheckCircle2 className="size-4 shrink-0 text-emerald-600" aria-hidden />;
  }
  if (status === "IN_PROGRESS") {
    return <CircleDot className="size-4 shrink-0 text-indigo-600" aria-hidden />;
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

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <article className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
        <CollapsibleTrigger className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 font-mono text-xs font-bold tabular-nums text-neutral-600">
              {String(module.order).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold tracking-tight text-neutral-900">
                {module.title}
              </h3>
              <p className="mt-0.5 text-xs text-neutral-500">
                {done}/{total} lessons complete
              </p>
            </div>
          </div>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-neutral-400 transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </CollapsibleTrigger>

        <CollapsibleContent>
          <ul className="divide-y divide-neutral-100 border-t border-neutral-100">
            {module.chapters.map((chapter) => (
              <li key={chapter.id}>
                <Link
                  href={`/courses/${courseSlug}/${chapter.slug}`}
                  className="group flex items-center justify-between gap-3 px-4 py-3.5 text-sm transition-colors hover:bg-neutral-50"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <StatusIcon status={chapter.status} />
                    <span
                      className={cn(
                        "truncate font-medium transition-colors group-hover:text-neutral-900",
                        chapter.status === "COMPLETED"
                          ? "text-neutral-500"
                          : "text-neutral-800"
                      )}
                    >
                      {chapter.title}
                    </span>
                  </span>
                  {chapter.blockCount > 0 ? (
                    <span className="shrink-0 text-xs text-neutral-400">
                      {chapter.blockCount} exercises
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
    <section className="rounded-xl border border-neutral-200 bg-white p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight text-neutral-900">
          Course content
        </h2>
        <span className="text-sm text-neutral-400">{totalLessons} lessons</span>
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
