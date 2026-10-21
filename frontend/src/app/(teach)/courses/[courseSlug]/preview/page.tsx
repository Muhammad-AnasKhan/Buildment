import Link from "next/link";
import { ArrowLeft, Eye, Pencil } from "lucide-react";
import type { CourseDraftPreview } from "@/shared/api/teach";
import { ChapterMdx } from "@/mdx/compile";
import { requireTeachSurface } from "@/server/auth/guards";
import { serverApiFetchOrNotFound } from "@/lib/api-server";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function CourseDraftPreviewPage({ params }: { params: Promise<{ courseSlug: string }> }) {
  const { courseSlug } = await params;
  await requireTeachSurface();
  const preview = await serverApiFetchOrNotFound<CourseDraftPreview>(
    `/api/v1/teach/courses/${encodeURIComponent(courseSlug)}/preview`,
  );
  const { course, modules } = preview;

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-5 py-8 sm:px-8">
      <header className="space-y-5">
        <Link href={`/courses/${course.slug}/edit`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back to course editor
        </Link>
        <div className="rounded-2xl border bg-card p-6 sm:p-9">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Eye className="size-4" /> Mentor preview · {course.status === "PUBLISHED" ? "live course with current saved drafts" : "draft course"}
          </div>
          {course.coverUrl ? <img src={course.coverUrl} alt="" className="mt-5 max-h-64 w-full rounded-xl object-cover" /> : null}
          <h1 className="mt-5 text-3xl font-semibold tracking-tight">{course.title}</h1>
          {course.description ? <p className="mt-3 max-w-3xl text-muted-foreground">{course.description}</p> : null}
          {course.projectGoal ? <p className="mt-3 text-sm"><span className="font-medium">Project:</span> {course.projectGoal}</p> : null}
          <Link href={`/courses/${course.slug}/edit`} className={cn(buttonVariants({ variant: "outline" }), "mt-5")}>
            <Pencil /> Edit course
          </Link>
        </div>
        <nav aria-label="Course contents" className="rounded-xl border bg-card p-5">
          <h2 className="font-semibold">Course contents</h2>
          <ol className="mt-3 space-y-2 text-sm">
            {modules.flatMap((module) => [
              <li key={module.id} className="pt-2 font-medium">{module.title}</li>,
              ...module.chapters.map((chapter) => (
                <li key={chapter.id} className="pl-4">
                  <a className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline" href={`#${chapter.id}`}>
                    {chapter.title}{chapter.publishedAt ? " · published" : " · draft"}
                  </a>
                </li>
              )),
            ])}
          </ol>
        </nav>
      </header>

      {modules.length === 0 || modules.every((module) => module.chapters.length === 0) ? (
        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">No chapters are available to preview yet.</p>
      ) : null}
      {modules.flatMap((module) => module.chapters.map((chapter) => (
        <article id={chapter.id} key={chapter.id} className="scroll-mt-8 rounded-2xl border bg-card p-6 sm:p-9">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{module.title} · {chapter.readerMode === "QUIZ" ? "Quiz" : "Lesson"} · {chapter.publishedAt ? "Published" : "Draft"}</p>
          <h2 className="mt-2 text-2xl font-semibold">{chapter.title}</h2>
          <div className="prose prose-neutral mt-6 max-w-none dark:prose-invert">
            <ChapterMdx source={chapter.source} preview />
          </div>
          <div className="mt-6 border-t pt-4 text-xs text-muted-foreground">Preview only. Learner progress and submissions are not recorded here.</div>
        </article>
      )))}
    </main>
  );
}
