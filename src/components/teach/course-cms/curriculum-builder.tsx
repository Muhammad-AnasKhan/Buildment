import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  CheckSquare,
  ChevronRight,
  ClipboardCheck,
  FileText,
  Flag,
  GripVertical,
  Layers3,
  Pencil,
  Plus,
  ScrollText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { createChapter, moveChapter } from "@/server/actions/chapters";
import { createModule, moveModule, renameModule } from "@/server/actions/modules";
import type {
  CourseBuilderChapter,
  CourseBuilderCourse,
  CourseBuilderModule,
} from "./types";

export function CurriculumBuilder({
  course,
  looseChapters,
}: {
  course: CourseBuilderCourse;
  looseChapters: CourseBuilderChapter[];
}) {
  const chapterCount =
    looseChapters.length +
    course.modules.reduce((total, module) => total + module.chapters.length, 0);

  return (
    <main className="min-w-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Curriculum
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">Course structure</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {chapterCount} chapter{chapterCount === 1 ? "" : "s"} across {course.modules.length}{" "}
            module{course.modules.length === 1 ? "" : "s"}.
          </p>
        </div>

        <details className="group relative">
          <summary className={cn(buttonVariants({ size: "lg" }), "cursor-pointer list-none [&::-webkit-details-marker]:hidden") }>
            <Plus /> New module
          </summary>
          <form
            className="absolute right-0 z-20 mt-2 w-[min(22rem,calc(100vw-2rem))] space-y-3 rounded-xl border bg-popover p-4 text-popover-foreground shadow-lg"
            action={async (formData) => {
              "use server";
              await createModule({
                courseId: course.id,
                title: String(formData.get("title") ?? ""),
              });
            }}
          >
            <div>
              <label htmlFor="new-module-title" className="text-sm font-medium">Module title</label>
              <p className="mt-0.5 text-xs text-muted-foreground">Group related chapters into a clear learning stage.</p>
            </div>
            <Input id="new-module-title" name="title" required maxLength={120} placeholder="e.g. Multiplayer foundations" autoFocus />
            <Button type="submit" className="w-full">Create module</Button>
          </form>
        </details>
      </div>

      <div className="mt-5 space-y-4">
        {course.modules.map((module, moduleIndex) => (
          <ModuleCard
            key={module.id}
            courseId={course.id}
            courseSlug={course.slug}
            module={module}
            moduleIndex={moduleIndex}
            moduleCount={course.modules.length}
          />
        ))}

        {looseChapters.length > 0 ? (
          <section className="overflow-hidden rounded-xl border border-dashed bg-card">
            <div className="border-b bg-muted/35 px-4 py-3">
              <h3 className="text-sm font-medium">Unsectioned chapters</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Legacy chapters without a module. Open them to preserve or move their content.
              </p>
            </div>
            <ChapterList courseSlug={course.slug} chapters={looseChapters} />
          </section>
        ) : null}

        {course.modules.length === 0 && looseChapters.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 p-8 text-center">
            <span className="grid size-12 place-items-center rounded-xl border bg-background">
              <Layers3 className="size-6 text-muted-foreground" />
            </span>
            <h3 className="mt-4 font-medium">Start with your first module</h3>
            <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">
              Modules create the top-level course structure. Add one, then add chapters inside it.
            </p>
          </div>
        ) : null}
      </div>
    </main>
  );
}

function ModuleCard({
  courseId,
  courseSlug,
  module,
  moduleIndex,
  moduleCount,
}: {
  courseId: string;
  courseSlug: string;
  module: CourseBuilderModule;
  moduleIndex: number;
  moduleCount: number;
}) {
  const publishedCount = module.chapters.filter((chapter) => chapter.publishedAt).length;

  return (
    <section className="rounded-xl border bg-card shadow-xs">
      <div className="flex flex-col gap-3 border-b bg-muted/25 px-3 py-3 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="hidden text-muted-foreground sm:block" aria-hidden="true">
            <GripVertical className="size-4" />
          </span>
          <span className="grid size-8 shrink-0 place-items-center rounded-lg border bg-background font-mono text-xs font-medium text-muted-foreground">
            {String(moduleIndex + 1).padStart(2, "0")}
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold">{module.title}</h3>
            <p className="text-xs text-muted-foreground">
              {module.chapters.length} chapter{module.chapters.length === 1 ? "" : "s"} ·{" "}
              {publishedCount} published
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1 sm:justify-end">
          <MoveButton
            label={`Move ${module.title} up`}
            disabled={moduleIndex === 0}
            action={async () => {
              "use server";
              await moveModule({ moduleId: module.id, direction: "up" });
            }}
          >
            <ArrowUp />
          </MoveButton>
          <MoveButton
            label={`Move ${module.title} down`}
            disabled={moduleIndex === moduleCount - 1}
            action={async () => {
              "use server";
              await moveModule({ moduleId: module.id, direction: "down" });
            }}
          >
            <ArrowDown />
          </MoveButton>

          <details className="group relative">
            <summary className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "cursor-pointer list-none [&::-webkit-details-marker]:hidden") }>
              <Pencil /> Rename
            </summary>
            <form
              className="absolute right-0 z-20 mt-2 w-72 space-y-3 rounded-xl border bg-popover p-4 shadow-lg"
              action={async (formData) => {
                "use server";
                await renameModule({
                  moduleId: module.id,
                  title: String(formData.get("title") ?? ""),
                });
              }}
            >
              <label htmlFor={`rename-${module.id}`} className="text-sm font-medium">Rename module</label>
              <Input id={`rename-${module.id}`} name="title" defaultValue={module.title} required maxLength={120} />
              <Button type="submit" className="w-full">Save name</Button>
            </form>
          </details>

          <details className="group relative ml-auto sm:ml-1">
            <summary className={cn(buttonVariants({ size: "sm" }), "cursor-pointer list-none [&::-webkit-details-marker]:hidden") }>
              <Plus /> Add chapter
            </summary>
            <form
              className="absolute right-0 z-20 mt-2 w-[min(22rem,calc(100vw-2rem))] space-y-3 rounded-xl border bg-popover p-4 shadow-lg"
              action={async (formData) => {
                "use server";
                const result = await createChapter({
                  courseId,
                  moduleId: module.id,
                  title: String(formData.get("title") ?? ""),
                });
                if (result.ok) {
                  redirect(`/courses/${courseSlug}/chapters/${result.chapterId}/edit`);
                }
              }}
            >
              <div>
                <label htmlFor={`chapter-${module.id}`} className="text-sm font-medium">Chapter title</label>
                <p className="mt-0.5 text-xs text-muted-foreground">You will choose content blocks in the chapter editor.</p>
              </div>
              <Input id={`chapter-${module.id}`} name="title" required maxLength={120} placeholder="e.g. Synchronize player movement" autoFocus />
              <Button type="submit" className="w-full">Create and open editor</Button>
            </form>
          </details>
        </div>
      </div>

      {module.chapters.length > 0 ? (
        <ChapterList courseSlug={courseSlug} chapters={module.chapters} />
      ) : (
        <div className="flex flex-col items-center px-4 py-8 text-center">
          <BookOpen className="size-6 text-muted-foreground/60" />
          <p className="mt-2 text-sm font-medium">No chapters in this module</p>
          <p className="mt-1 text-xs text-muted-foreground">Use “Add chapter” to create the first lesson.</p>
        </div>
      )}
    </section>
  );
}

function ChapterList({
  courseSlug,
  chapters,
}: {
  courseSlug: string;
  chapters: CourseBuilderChapter[];
}) {
  return (
    <ol className="divide-y">
      {chapters.map((chapter, index) => {
        const activityTypes = [...new Set(chapter.blocks.map((block) => block.type))];
        return (
          <li key={chapter.id} className="group flex flex-col gap-3 px-3 py-3 transition-colors hover:bg-muted/25 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <span className="mt-0.5 w-7 shrink-0 text-right font-mono text-xs text-muted-foreground">
                {String(index + 1).padStart(2, "0")}
              </span>
              <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/courses/${courseSlug}/chapters/${chapter.id}/edit`}
                    className="truncate text-sm font-medium hover:underline"
                  >
                    {chapter.title}
                  </Link>
                  <Badge variant={chapter.publishedAt ? "outline" : "secondary"}>
                    {chapter.publishedAt ? "Published" : "Draft"}
                  </Badge>
                  {chapter.isMilestone ? (
                    <Badge variant="outline"><Flag /> Milestone</Badge>
                  ) : null}
                  {chapter.readerMode === "QUIZ" ? (
                    <Badge variant="outline"><ClipboardCheck /> Quiz</Badge>
                  ) : null}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  {chapter.estimatedMinutes ? <span>{chapter.estimatedMinutes} min</span> : null}
                  {activityTypes.length > 0 ? (
                    <span className="inline-flex items-center gap-1">
                      <CheckSquare className="size-3" />
                      {chapter.blocks.length} activit{chapter.blocks.length === 1 ? "y" : "ies"}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1"><ScrollText className="size-3" /> Content only</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 pl-[4.75rem] sm:pl-0">
              <MoveButton
                label={`Move ${chapter.title} up`}
                disabled={index === 0}
                action={async () => {
                  "use server";
                  await moveChapter({ chapterId: chapter.id, direction: "up" });
                }}
              >
                <ArrowUp />
              </MoveButton>
              <MoveButton
                label={`Move ${chapter.title} down`}
                disabled={index === chapters.length - 1}
                action={async () => {
                  "use server";
                  await moveChapter({ chapterId: chapter.id, direction: "down" });
                }}
              >
                <ArrowDown />
              </MoveButton>
              <Link
                href={`/courses/${courseSlug}/chapters/${chapter.id}/edit`}
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "ml-auto sm:ml-1")}
              >
                Edit <ChevronRight />
              </Link>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function MoveButton({
  label,
  disabled,
  action,
  children,
}: {
  label: string;
  disabled: boolean;
  action: () => Promise<void>;
  children: React.ReactNode;
}) {
  return (
    <form action={action}>
      <Button type="submit" variant="ghost" size="icon-sm" disabled={disabled} aria-label={label} title={label}>
        {children}
      </Button>
    </form>
  );
}
