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
    mod.chapters.map((chapter) => ({ ...chapter, moduleTitle: mod.title }))
  );
  const index = flatChapters.findIndex((c) => c.slug === chapterSlug);
  if (index === -1) notFound();

  const chapter = flatChapters[index];
  const prev = flatChapters[index - 1];
  const next = flatChapters[index + 1];

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href={`/courses/${course.slug}`}
        className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
      >
        {chapter.moduleTitle}
      </Link>

      <article className="prose prose-neutral mt-4 max-w-none prose-headings:tracking-tight prose-h1:text-2xl prose-h2:text-xl prose-h2:mt-10 prose-pre:bg-neutral-950">
        <ChapterMdx source={chapter.compiled ?? chapter.source} />
      </article>

      <div className="mt-12 flex items-center justify-between border-t border-border pt-6">
        {prev ? (
          <Link
            href={`/courses/${course.slug}/${prev.slug}`}
            className={cn(buttonVariants({ variant: "ghost" }))}
          >
            <ArrowLeft className="size-4" />
            {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/courses/${course.slug}/${next.slug}`}
            className={cn(buttonVariants({ variant: "ghost" }))}
          >
            {next.title}
            <ArrowRight className="size-4" />
          </Link>
        ) : null}
      </div>
    </div>
  );
}
