import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavChapter = {
  slug: string;
  title: string;
  moduleOrder: number;
  order: number;
};

type ChapterNavProps = {
  courseSlug: string;
  prev: NavChapter | undefined;
  next: NavChapter | undefined;
};

function lessonLabel(chapter: NavChapter) {
  return `${String(chapter.moduleOrder).padStart(2, "0")}.${String(chapter.order).padStart(2, "0")}`;
}

function PrevLink({
  href,
  chapter,
  bordered,
}: {
  href: string;
  chapter: NavChapter;
  bordered?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex min-h-[4.75rem] flex-col justify-center px-5 py-4 transition-colors sm:px-6",
        "hover:bg-neutral-50/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-neutral-300",
        bordered && "border-t border-neutral-200 sm:border-t-0 sm:border-r"
      )}
    >
      <span className="flex items-center gap-1.5 text-xs text-neutral-500">
        <ArrowLeft
          className="size-3.5 transition-transform group-hover:-translate-x-0.5"
          aria-hidden
        />
        Previous
      </span>
      <span className="mt-1 font-mono text-[11px] text-neutral-400">{lessonLabel(chapter)}</span>
      <span className="mt-0.5 line-clamp-2 text-[15px] font-medium leading-snug text-neutral-950 group-hover:text-neutral-950">
        {chapter.title}
      </span>
    </Link>
  );
}

function NextLink({
  href,
  chapter,
  bordered,
  align = "start",
}: {
  href: string;
  chapter: NavChapter;
  bordered?: boolean;
  align?: "start" | "end";
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex min-h-[4.75rem] flex-col justify-center px-5 py-4 transition-colors sm:px-6",
        "hover:bg-neutral-50/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-neutral-300",
        bordered && "border-t border-neutral-200 sm:border-t-0",
        align === "end" && "sm:items-end sm:text-right"
      )}
    >
      <span
        className={cn(
          "flex items-center gap-1.5 text-xs text-neutral-500",
          align === "end" && "sm:flex-row-reverse"
        )}
      >
        Next
        <ArrowRight
          className="size-3.5 transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </span>
      <span className="mt-1 font-mono text-[11px] text-neutral-400">{lessonLabel(chapter)}</span>
      <span className="mt-0.5 line-clamp-2 text-[15px] font-medium leading-snug text-neutral-950 group-hover:text-neutral-950">
        {chapter.title}
      </span>
    </Link>
  );
}

function NextPrimary({ href, chapter }: { href: string; chapter: NavChapter }) {
  return (
    <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6">
      <div className="min-w-0">
        <p className="font-mono text-[11px] text-neutral-400">{lessonLabel(chapter)}</p>
        <p className="mt-1 text-[15px] font-medium leading-snug text-neutral-950 sm:text-base">
          {chapter.title}
        </p>
      </div>
      <Link
        href={href}
        className={cn(
          buttonVariants({ size: "sm" }),
          "h-11 shrink-0 gap-2 self-start rounded-lg bg-neutral-900 px-6 text-sm font-medium text-white hover:bg-neutral-800 sm:self-center"
        )}
      >
        Continue
        <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}

export function ChapterNav({ courseSlug, prev, next }: ChapterNavProps) {
  if (!prev && !next) return null;

  const hasBoth = Boolean(prev && next);

  return (
    <nav aria-label="Chapter navigation" className="mt-12 border-t border-neutral-200 pt-8">
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
        {hasBoth ? (
          <div className="grid sm:grid-cols-2">
            <PrevLink
              href={`/courses/${courseSlug}/${prev!.slug}`}
              chapter={prev!}
              bordered
            />
            <NextLink
              href={`/courses/${courseSlug}/${next!.slug}`}
              chapter={next!}
              align="end"
            />
          </div>
        ) : prev ? (
          <PrevLink href={`/courses/${courseSlug}/${prev.slug}`} chapter={prev} />
        ) : next ? (
          <NextPrimary href={`/courses/${courseSlug}/${next.slug}`} chapter={next} />
        ) : null}
      </div>

      {/* Chapter completion indicator */}
      <div className="mt-6 flex items-center gap-2 text-xs text-neutral-400">
        <CheckCircle2 className="size-3.5 text-neutral-300" />
        <span>Mark this chapter as complete in your learning log after finishing all checkpoints.</span>
      </div>
    </nav>
  );
}
