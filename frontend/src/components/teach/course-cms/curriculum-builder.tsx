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
  Layers3,
  Pencil,
  Plus,
  ScrollText,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { PendingSubmitButton } from "@/components/ui/pending-submit-button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { MARKETPLACE_WEEKS } from "@/lib/marketplace-weeks";
import { ModuleDisclosure } from "./module-disclosure";
import { createChapter, moveChapter, removeChapter } from "@/server/actions/chapters";
import { createModule, moveModule, renameModule } from "@/server/actions/modules";
import type {
  CourseBuilderChapter,
  CourseBuilderCourse,
  CourseBuilderModule,
} from "@/shared/api/teach";

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
  const indexedModules = course.modules.map((module, index) => ({ module, index }));
  const showWeeks = course.slug === "multi-vendor-marketplace";
  const weekGroups = showWeeks ? MARKETPLACE_WEEKS.map((week) => ({
    title: `Week ${week.number} - ${week.title}`,
    modules: indexedModules.filter(({ module }) => module.order >= week.from && module.order <= week.to),
  })) : [];
  const closingModules = showWeeks ? indexedModules.filter(({ module }) => module.order === 99) : [];
  const additionalModules = showWeeks ? indexedModules.filter(({ module }) => module.order !== 99 && !MARKETPLACE_WEEKS.some((week) => module.order >= week.from && module.order <= week.to)) : [];

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
        {showWeeks ? (
          <>
            {weekGroups.map((group, index) => (
              <ModuleGroup key={group.title} title={group.title} modules={group.modules} course={course} defaultOpen={index === 0} />
            ))}
            {closingModules.length > 0 && <ModuleGroup title="Finish and present" modules={closingModules} course={course} />}
            {additionalModules.length > 0 && <ModuleGroup title="Additional modules" modules={additionalModules} course={course} />}
          </>
        ) : course.modules.map((module, moduleIndex) => (
          <ModuleCard key={module.id} courseId={course.id} courseSlug={course.slug} module={module} moduleIndex={moduleIndex} moduleCount={course.modules.length} />
        ))}

        {looseChapters.length > 0 ? (
          <section className="rounded-xl border border-dashed bg-card">
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

function ModuleGroup({ title, modules, course, defaultOpen = false }: {
  title: string;
  modules: Array<{ module: CourseBuilderModule; index: number }>;
  course: CourseBuilderCourse;
  defaultOpen?: boolean;
}) {
  const chapterCount = modules.reduce((total, { module }) => total + module.chapters.length, 0);
  const publishedCount = modules.reduce((total, { module }) => total + module.chapters.filter((chapter) => chapter.publishedAt).length, 0);

  return (
    <details className="group/week overflow-hidden rounded-xl border bg-card shadow-xs" open={defaultOpen ? true : undefined}>
      <summary className="flex min-h-20 cursor-pointer list-none items-center gap-4 px-4 py-4 transition-colors hover:bg-muted/25 sm:px-6 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0 flex-1">
          <span className="block text-base font-semibold tracking-tight">{title}</span>
          <span className="mt-1 block text-xs text-muted-foreground">{modules.length} module{modules.length === 1 ? "" : "s"} · {chapterCount} chapter{chapterCount === 1 ? "" : "s"} · {publishedCount} published</span>
        </span>
        <span className="shrink-0 text-xs font-medium text-muted-foreground group-open/week:hidden">Show modules</span>
        <span className="hidden shrink-0 text-xs font-medium text-muted-foreground group-open/week:inline">Hide modules</span>
      </summary>
      <div className="space-y-3 border-t bg-muted/10 p-3 sm:p-4">
        {modules.length ? modules.map(({ module, index }) => (
          <ModuleCard key={module.id} courseId={course.id} courseSlug={course.slug} module={module} moduleIndex={index} moduleCount={course.modules.length} />
        )) : <p className="rounded-lg border border-dashed bg-background p-4 text-sm text-muted-foreground">No modules in this week yet.</p>}
      </div>
    </details>
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
    <ModuleDisclosure
      moduleId={module.id}
      number={moduleIndex + 1}
      title={module.title}
      chapterCount={module.chapters.length}
      publishedCount={publishedCount}
      actions={
        <>
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
              <PendingSubmitButton className="w-full" pendingLabel="Opening editor…">
                Create and open editor
              </PendingSubmitButton>
            </form>
          </details>
        </>
      }
    >

      {module.chapters.length > 0 ? (
        <ChapterList courseSlug={courseSlug} chapters={module.chapters} />
      ) : (
        <div className="flex flex-col items-center px-4 py-8 text-center">
          <BookOpen className="size-6 text-muted-foreground/60" />
          <p className="mt-2 text-sm font-medium">No chapters in this module</p>
          <p className="mt-1 text-xs text-muted-foreground">Use “Add chapter” to create the first lesson.</p>
        </div>
      )}
    </ModuleDisclosure>
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
              <details className="relative">
                <summary
                  aria-label={`Remove ${chapter.title}`}
                  title={`Remove ${chapter.title}`}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon-sm" }),
                    "cursor-pointer list-none text-muted-foreground hover:text-destructive [&::-webkit-details-marker]:hidden"
                  )}
                >
                  <Trash2 />
                </summary>
                <form
                  className="absolute right-0 z-20 mt-2 w-72 space-y-3 rounded-xl border bg-popover p-4 text-popover-foreground shadow-lg"
                  action={async () => {
                    "use server";
                    const result = await removeChapter({ chapterId: chapter.id, confirmedWithProgress: true });
                    if (!result.ok) {
                      redirect(
                        `/courses/${courseSlug}/edit?publishError=${encodeURIComponent(result.errors.join(" "))}`
                      );
                    }
                  }}
                >
                  <div>
                    <p className="text-sm font-medium">Remove chapter?</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      “{chapter.title}” and its content will be permanently deleted, along with any
                      learner progress and submissions.
                    </p>
                  </div>
                  <Button type="submit" variant="destructive" size="sm" className="w-full">
                    <Trash2 /> Remove chapter
                  </Button>
                </form>
              </details>
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
