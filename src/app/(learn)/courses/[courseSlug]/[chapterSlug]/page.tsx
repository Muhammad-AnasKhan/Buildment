import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { prisma } from "@/server/db";
import { requireEnrolledMentee } from "@/server/auth/guards";
import { ChapterMdx } from "@/mdx/compile";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function ChapterReaderPage({
  params,
}: {
  params: Promise<{ courseSlug: string; chapterSlug: string }>;
}) {
  const { courseSlug, chapterSlug } = await params;

  const course = await prisma.course.findUnique({
    where: { slug: courseSlug },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: { chapters: { orderBy: { order: "asc" } } },
      },
    },
  });
  if (!course) notFound();

  await requireEnrolledMentee(course.id);

  const flatChapters = course.modules.flatMap((mod) =>
    mod.chapters.map((chapter) => ({
      ...chapter,
      moduleTitle: mod.title,
      moduleOrder: mod.order,
    }))
  );
  const index = flatChapters.findIndex((c) => c.slug === chapterSlug);
  if (index === -1) notFound();

  const chapter = flatChapters[index]!;
  const prev = flatChapters[index - 1];
  const next = flatChapters[index + 1];
  const lessonLabel = `${String(chapter.moduleOrder).padStart(2, "0")}.${String(chapter.order).padStart(2, "0")}`;

  return (
    <div className="mx-auto max-w-3xl pb-12">
      <nav className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
        <Link href={`/courses/${course.slug}`} className="transition-colors hover:text-neutral-950">
          {course.title}
        </Link>
        <span aria-hidden>/</span>
        <span className="font-mono text-neutral-400">{lessonLabel}</span>
      </nav>

      <header className="mt-5 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
          {chapter.moduleTitle}
        </p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl">
          {chapter.title}
        </h1>
        {chapter.summary ? (
          <p className="mt-4 text-[15px] leading-relaxed text-neutral-600">{chapter.summary}</p>
        ) : null}
      </header>

      <article
        className={cn(
          "prose prose-neutral mt-8 max-w-none",
          "prose-headings:scroll-mt-20 prose-headings:font-semibold prose-headings:tracking-tight",
          "prose-h2:mt-12 prose-h2:border-b prose-h2:border-neutral-200 prose-h2:pb-2 prose-h2:text-xl prose-h2:first:mt-0",
          "prose-h3:mt-8 prose-h3:text-lg",
          "prose-p:leading-[1.75] prose-p:text-neutral-700",
          "prose-li:text-neutral-700 prose-li:leading-relaxed",
          "prose-strong:text-neutral-900 prose-strong:font-semibold",
          "prose-code:rounded prose-code:bg-neutral-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[0.85em] prose-code:font-normal prose-code:text-neutral-800 prose-code:before:content-none prose-code:after:content-none",
          "prose-pre:overflow-x-auto prose-pre:rounded-xl prose-pre:border prose-pre:border-neutral-800 prose-pre:bg-neutral-950 prose-pre:p-4 prose-pre:text-neutral-100",
          "prose-pre:code:bg-transparent prose-pre:code:p-0 prose-pre:code:text-[0.875em] prose-pre:code:font-normal prose-pre:code:text-neutral-100 prose-pre:code:before:content-none prose-pre:code:after:content-none",
          "prose-blockquote:rounded-r-lg prose-blockquote:border-l-4 prose-blockquote:border-neutral-300 prose-blockquote:bg-neutral-50 prose-blockquote:px-4 prose-blockquote:py-3 prose-blockquote:not-italic prose-blockquote:text-neutral-700",
          "prose-table:text-sm prose-th:bg-neutral-50 prose-th:font-semibold",
          "prose-hr:border-neutral-200"
        )}
      >
        <ChapterMdx source={chapter.compiled ?? chapter.source} />
      </article>

      <div className="mt-12 flex flex-col gap-3 border-t border-neutral-200 pt-8 sm:flex-row sm:items-stretch sm:justify-between">
        {prev ? (
          <Link
            href={`/courses/${course.slug}/${prev.slug}`}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-auto flex-1 flex-col items-start gap-1 rounded-xl border-neutral-200 px-4 py-3 text-left whitespace-normal"
            )}
          >
            <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-neutral-400">
              <ArrowLeft className="size-3" />
              Previous
            </span>
            <span className="text-sm font-medium text-neutral-900">{prev.title}</span>
          </Link>
        ) : (
          <span className="hidden flex-1 sm:block" />
        )}
        {next ? (
          <Link
            href={`/courses/${course.slug}/${next.slug}`}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-auto flex-1 flex-col items-end gap-1 rounded-xl border-neutral-200 px-4 py-3 text-right whitespace-normal"
            )}
          >
            <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-neutral-400">
              Next
              <ArrowRight className="size-3" />
            </span>
            <span className="text-sm font-medium text-neutral-900">{next.title}</span>
          </Link>
        ) : null}
      </div>
    </div>
  );
}
