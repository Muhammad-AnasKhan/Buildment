"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChapterSidebar, SidebarToggle } from "@/components/learn/chapter-sidebar";
import { CheckpointHeaderLabel } from "@/components/learn/checkpoint-header-label";
import { ReaderShellFade, ReaderShellSkeleton } from "@/components/learn/reader-shell-skeleton";
import { UserMenuDropdown } from "@/components/user-menu-dropdown";
import { useReaderLayout } from "@/lib/use-reader-layout";
import type { SyllabusModule } from "@/components/learn/course-syllabus";

export function LockedChapterView({
  courseSlug,
  courseTitle,
  lessonLabel,
  chapterTitle,
  previous,
  modules,
  currentChapterSlug,
  user,
  signOutAction,
  checkpointsCompleted,
  checkpointsTotal,
  chapterComplete,
}: {
  courseSlug: string;
  courseTitle: string;
  lessonLabel: string;
  chapterTitle: string;
  previous: { slug: string; title: string } | null;
  modules: SyllabusModule[];
  currentChapterSlug: string;
  user: { name?: string | null; email?: string | null; image?: string | null };
  signOutAction: () => Promise<void>;
  checkpointsCompleted: number;
  checkpointsTotal: number;
  chapterComplete: boolean;
}) {
  const {
    isMobile,
    leftCollapsed: collapsed,
    setLeftCollapsed: setCollapsed,
    visible,
    skipSkeleton,
  } = useReaderLayout(courseSlug);
  const [showSkeleton, setShowSkeleton] = useState(!skipSkeleton);

  useEffect(() => {
    if (!visible) return;
    const timer = window.setTimeout(() => setShowSkeleton(false), 320);
    return () => window.clearTimeout(timer);
  }, [visible]);

  return (
    <div className="relative h-[100dvh] bg-background text-foreground">
      {showSkeleton && (
        <div
          className={cn(
            "absolute inset-0 z-10",
            visible && "pointer-events-none"
          )}
          aria-hidden={visible}
        >
          <ReaderShellSkeleton visible={visible} />
        </div>
      )}

      <ReaderShellFade visible={visible}>
        <header className="flex shrink-0 items-center gap-2 border-b border-border bg-background px-3 py-2 sm:px-4">
          <SidebarToggle collapsed={collapsed} onClick={() => setCollapsed(!collapsed)} />
          <nav aria-label="Breadcrumb" className="flex min-w-0 flex-1 items-center gap-1.5 text-xs text-muted-foreground">
            <Link href="/dashboard" className="shrink-0 transition-colors hover:text-foreground">
              Dashboard
            </Link>
            <span aria-hidden className="shrink-0 text-border">/</span>
            <Link href={`/courses/${courseSlug}`} className="truncate transition-colors hover:text-foreground">
              {courseTitle}
            </Link>
            <span aria-hidden className="hidden shrink-0 text-border sm:inline">/</span>
            <span className="hidden truncate text-foreground sm:inline">{chapterTitle}</span>
            <span className="shrink-0 font-mono tabular-nums text-muted-foreground sm:hidden">{lessonLabel}</span>
          </nav>
          <CheckpointHeaderLabel
            completed={checkpointsCompleted}
            total={checkpointsTotal}
            chapterComplete={chapterComplete}
          />
          <UserMenuDropdown user={user} compact signOutAction={signOutAction} />
        </header>

        <div className="flex min-h-0 flex-1">
          <ChapterSidebar
            courseSlug={courseSlug}
            modules={modules}
            currentChapterSlug={currentChapterSlug}
            collapsed={collapsed}
            onToggle={() => setCollapsed(!collapsed)}
            mobileSheet={isMobile}
          />
          <main className="flex-1 overflow-y-auto px-4 py-16 sm:px-6 lg:px-10">
            <div className="mx-auto max-w-lg text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <Lock className="size-5" aria-hidden />
              </div>
              <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
                {chapterTitle} is locked
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {previous
                  ? `Finish ${previous.title} to unlock this lesson.`
                  : "Finish the previous lesson to unlock this one."}
              </p>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                {previous ? (
                  <Link
                    href={`/courses/${courseSlug}/${previous.slug}`}
                    className={cn(buttonVariants({ size: "sm" }), "rounded-full px-5")}
                  >
                    Continue {previous.title}
                  </Link>
                ) : null}
                <Link
                  href={`/courses/${courseSlug}`}
                  className={cn(buttonVariants({ size: "sm", variant: "outline" }), "rounded-full px-5")}
                >
                  Back to syllabus
                </Link>
              </div>
            </div>
          </main>
        </div>
      </ReaderShellFade>
    </div>
  );
}
