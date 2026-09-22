"use client";

import Link from "next/link";
import { CheckCircle2, CircleDot, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SyllabusChapter } from "./course-syllabus";

export function ChapterStatusIcon({
  status,
  locked,
}: {
  status: SyllabusChapter["status"];
  locked?: boolean;
}) {
  if (locked) {
    return <Lock className="size-4 shrink-0 text-neutral-400" aria-hidden />;
  }
  if (status === "COMPLETED") {
    return <CheckCircle2 className="size-4 shrink-0 text-emerald-600" aria-hidden />;
  }
  if (status === "IN_PROGRESS") {
    return <CircleDot className="size-4 shrink-0 text-foreground" aria-hidden />;
  }
  return (
    <span
      className="inline-flex size-4 shrink-0 items-center justify-center rounded-full border-[1.5px] border-neutral-300"
      aria-hidden
    />
  );
}

function ChapterMeta({ chapter }: { chapter: SyllabusChapter }) {
  if (chapter.locked) {
    return <span className="shrink-0 text-xs text-neutral-400">Locked</span>;
  }
  if (chapter.blockCount > 0) {
    return (
      <span className="shrink-0 text-xs text-neutral-400">
        {chapter.blocksCompleted ?? 0}/{chapter.blockCount} checkpoints
      </span>
    );
  }
  return null;
}

export function SyllabusChapterRow({
  courseSlug,
  chapter,
  variant,
  isActive,
  linkRef,
}: {
  courseSlug: string;
  chapter: SyllabusChapter;
  variant: "syllabus" | "sidebar";
  isActive?: boolean;
  linkRef?: React.Ref<HTMLAnchorElement>;
}) {
  const href = `/courses/${courseSlug}/${chapter.slug}`;

  if (variant === "syllabus") {
    return (
      <Link
        ref={linkRef}
        href={href}
        className={cn(
          "group flex items-center justify-between gap-3 px-4 py-3.5 text-sm transition-colors hover:bg-muted/60",
          chapter.locked && "opacity-80",
          chapter.status === "COMPLETED" &&
            "border-l-2 border-emerald-500 bg-emerald-500/10"
        )}
      >
        <span className="flex min-w-0 items-center gap-3">
          <ChapterStatusIcon status={chapter.status} locked={chapter.locked} />
          <span
            className={cn(
              "truncate font-medium transition-colors group-hover:text-foreground",
              chapter.locked
                ? "text-neutral-500"
                : chapter.status === "COMPLETED"
                  ? "text-neutral-500"
                  : "text-neutral-800"
            )}
          >
            {chapter.title}
          </span>
        </span>
        <ChapterMeta chapter={chapter} />
      </Link>
    );
  }

  return (
    <Link
      ref={linkRef}
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "relative flex items-center justify-between gap-2 py-2 pl-12 pr-4 text-sm transition-colors",
        isActive
          ? "bg-muted font-medium text-foreground before:absolute before:inset-y-1 before:left-3 before:w-0.5 before:rounded-full before:bg-foreground"
          : chapter.locked
            ? "text-muted-foreground hover:bg-muted/60 hover:text-muted-foreground"
            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
      )}
    >
      <span className="flex min-w-0 flex-1 items-center gap-2.5">
        <ChapterStatusIcon status={chapter.status} locked={chapter.locked} />
        <span className="min-w-0 truncate">{chapter.title}</span>
      </span>
      <span className="hidden shrink-0 sm:inline">
        <ChapterMeta chapter={chapter} />
      </span>
    </Link>
  );
}
