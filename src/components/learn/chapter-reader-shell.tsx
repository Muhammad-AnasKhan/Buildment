"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ChapterSidebar, SidebarToggle } from "@/components/learn/chapter-sidebar";
import { ChapterToc, TocToggle } from "@/components/learn/chapter-toc";
import { ChapterNav } from "@/components/learn/chapter-nav";
import { ReadingProgressBar, useReadingProgress } from "@/components/learn/chapter-progress-bar";
import { CheckpointHeaderLabel } from "@/components/learn/checkpoint-header-label";
import { ChecklistProvider } from "@/components/learn/checklist";
import { LearningLogProvider } from "@/components/learn/learning-log";
import { UserMenuDropdown } from "@/components/user-menu-dropdown";
import { ReaderShellFade, ReaderShellSkeleton } from "@/components/learn/reader-shell-skeleton";
import { FocusModeToggle, ReaderFocusDock } from "@/components/learn/reader-focus-dock";
import { cn } from "@/lib/utils";
import { useReaderLayout } from "@/lib/use-reader-layout";
import type { Heading } from "@/lib/mdx-headings";
import type { SyllabusModule } from "@/components/learn/course-syllabus";
import { AskHelpDialog } from "@/components/help/ask-help-dialog";
import { StudyClock } from "@/components/learn/study-time-chip";
import { useStudySession } from "@/lib/use-study-session";
import { ThemeToggle } from "@/components/theme-toggle";
import type { HelpThreadView } from "@/components/help/help-types";

function FocusProgressBar({ scrollRef }: { scrollRef: React.RefObject<HTMLElement | null> }) {
  const { progress } = useReadingProgress(scrollRef);
  if (progress <= 0) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[55] h-0.5 bg-border/80">
      <div
        className="h-full bg-foreground/40 transition-[width] duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export function ChapterReaderShell({
  courseSlug,
  courseTitle,
  lessonLabel,
  chapterTitle,
  modules,
  headings,
  prev,
  next,
  chapterSlug,
  chapterId,
  estimatedMinutes = null,
  readerMode = "DEFAULT",
  learningLogAnswers = {},
  checklistState = {},
  chapterComplete,
  canMarkComplete,
  checkpointsCompleted,
  checkpointsTotal,
  isGateChapter = false,
  nextLocked,
  courseId,
  helpThread,
  user,
  signOutAction,
  children,
}: {
  courseSlug: string;
  courseTitle: string;
  lessonLabel: string;
  chapterTitle: string;
  chapterSlug: string;
  chapterId: string;
  estimatedMinutes?: number | null;
  readerMode?: "DEFAULT" | "QUIZ";
  learningLogAnswers?: Record<string, string>;
  checklistState?: Record<string, boolean>;
  chapterComplete: boolean;
  canMarkComplete: boolean;
  checkpointsCompleted: number;
  checkpointsTotal: number;
  isGateChapter?: boolean;
  nextLocked: boolean;
  courseId: string;
  helpThread: HelpThreadView | null;
  modules: SyllabusModule[];
  headings: Heading[];
  prev?: { slug: string; title: string; moduleOrder: number; order: number };
  next?: { slug: string; title: string; moduleOrder: number; order: number };
  user: { id: string; name?: string | null; email?: string | null; image?: string | null };
  signOutAction: () => Promise<void>;
  children: React.ReactNode;
}) {
  const {
    isMobile,
    leftCollapsed,
    setLeftCollapsed,
    rightCollapsed,
    setRightCollapsed,
    skipSkeleton,
  } = useReaderLayout(courseSlug);
  const scrollRef = useRef<HTMLElement>(null);

  const [showSkeleton, setShowSkeleton] = useState(!skipSkeleton);
  const [focusMode, setFocusMode] = useState(false);
  const study = useStudySession(chapterId);
  const layoutBeforeFocus = useRef({ left: true, right: true });

  const exitFocusMode = useCallback(async () => {
    setFocusMode(false);
    setLeftCollapsed(layoutBeforeFocus.current.left);
    setRightCollapsed(layoutBeforeFocus.current.right);
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {
        /* user gesture may be required */
      }
    }
  }, [setLeftCollapsed, setRightCollapsed]);

  const enterFocusMode = useCallback(async () => {
    layoutBeforeFocus.current = { left: leftCollapsed, right: rightCollapsed };
    setFocusMode(true);
    setLeftCollapsed(true);
    setRightCollapsed(true);
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      /* fullscreen optional */
    }
  }, [leftCollapsed, rightCollapsed, setLeftCollapsed, setRightCollapsed]);

  const toggleFocusMode = useCallback(() => {
    if (focusMode) void exitFocusMode();
    else void enterFocusMode();
  }, [focusMode, enterFocusMode, exitFocusMode]);

  useEffect(() => {
    if (!focusMode) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") void exitFocusMode();
    };
    const onFullscreenChange = () => {
      if (!document.fullscreenElement && focusMode) {
        setFocusMode(false);
        setLeftCollapsed(layoutBeforeFocus.current.left);
        setRightCollapsed(layoutBeforeFocus.current.right);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, [focusMode, exitFocusMode, setLeftCollapsed, setRightCollapsed]);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
  }, [chapterSlug]);

  useEffect(() => {
    if (readerMode === "QUIZ") {
      void enterFocusMode();
    }
  }, [chapterSlug, readerMode, enterFocusMode]);

  useEffect(() => {
    if (!showSkeleton) return;
    const timer = window.setTimeout(() => setShowSkeleton(false), 280);
    return () => window.clearTimeout(timer);
  }, [chapterSlug, showSkeleton]);

  return (
    <div
      className={cn("relative h-[100dvh] bg-background text-foreground", focusMode && "bg-background")}
    >
      {showSkeleton ? (
        <div className="pointer-events-none absolute inset-0 z-10" aria-hidden>
          <ReaderShellSkeleton visible />
        </div>
      ) : null}

      <ReaderShellFade>
        {!focusMode && (
          <header className="shrink-0 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <div className="flex items-center gap-2 px-3 py-2 sm:px-4">
              <SidebarToggle
                collapsed={leftCollapsed}
                onClick={() => setLeftCollapsed(!leftCollapsed)}
              />
              <div className="flex min-w-0 flex-1 items-center gap-1.5 text-xs text-muted-foreground">
                <Link
                  href={`/courses/${courseSlug}`}
                  className="truncate transition-colors hover:text-foreground"
                >
                  {courseTitle}
                </Link>
                <span aria-hidden className="shrink-0 text-border">
                  /
                </span>
                <span className="shrink-0 font-mono tabular-nums text-muted-foreground">
                  {lessonLabel}
                </span>
              </div>
              <CheckpointHeaderLabel
                completed={checkpointsCompleted}
                total={checkpointsTotal}
                chapterComplete={chapterComplete}
              />
              <StudyClock
                status={study.status}
                busy={study.busy}
                sessionSeconds={study.sessionSeconds}
                chapterTotalSeconds={study.chapterTotalSeconds}
                estimatedMinutes={estimatedMinutes}
                onStart={study.start}
                onPause={study.pause}
                onResume={study.resume}
                onStop={study.stop}
              />
              <div className="flex shrink-0 items-center gap-1.5">
                <AskHelpDialog
                  courseId={courseId}
                  courseSlug={courseSlug}
                  chapterId={chapterId}
                  chapterTitle={chapterTitle}
                  viewerId={user.id}
                  thread={helpThread}
                />
                <ThemeToggle />
                <FocusModeToggle active={focusMode} onClick={toggleFocusMode} />
                <TocToggle
                  collapsed={rightCollapsed}
                  onClick={() => setRightCollapsed(!rightCollapsed)}
                />
                <UserMenuDropdown user={user} compact signOutAction={signOutAction} />
              </div>
            </div>
            <ReadingProgressBar scrollRef={scrollRef} />
          </header>
        )}

        {focusMode && (
          <StudyClock
            className="fixed right-4 top-3 z-40"
            status={study.status}
            busy={study.busy}
            sessionSeconds={study.sessionSeconds}
            chapterTotalSeconds={study.chapterTotalSeconds}
            estimatedMinutes={estimatedMinutes}
            onStart={study.start}
            onPause={study.pause}
            onResume={study.resume}
            onStop={study.stop}
          />
        )}

        {focusMode && <FocusProgressBar scrollRef={scrollRef} />}

        <div className="flex min-h-0 flex-1">
          <ChapterSidebar
            courseSlug={courseSlug}
            modules={modules}
            currentChapterSlug={chapterSlug}
            collapsed={leftCollapsed}
            onToggle={() => setLeftCollapsed(!leftCollapsed)}
            mobileSheet={isMobile || focusMode}
          />

          <div className="flex min-w-0 flex-1 overflow-hidden">
            <main
              ref={scrollRef}
              className={cn(
                "flex-1 overflow-y-auto",
                focusMode ? "px-4 py-10 sm:px-8 lg:px-16" : "px-4 py-8 sm:px-6 lg:px-10"
              )}
            >
              <div className={cn("mx-auto max-w-3xl", focusMode && "max-w-2xl lg:max-w-3xl")}>
                <header className="mb-8">
                  <p className="font-mono text-xs tabular-nums text-muted-foreground">{lessonLabel}</p>
                  <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {chapterTitle}
                  </h1>
                  {isGateChapter ? (
                    <p className="mt-3 inline-flex items-center gap-2 rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-sm text-foreground">
                      <span className="text-[11px] font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-300">
                        Module gate
                      </span>
                      <span className="text-muted-foreground">
                        Complete the checklist and learning log before the next module unlocks.
                      </span>
                    </p>
                  ) : null}
                  {checkpointsTotal > 0 && (
                    <p className="mt-2 font-mono text-xs tabular-nums text-neutral-500 sm:hidden">
                      {chapterComplete
                        ? "All checkpoints complete"
                        : `${checkpointsCompleted}/${checkpointsTotal} checkpoints`}
                    </p>
                  )}
                </header>

                <LearningLogProvider chapterId={chapterId} initialAnswers={learningLogAnswers}>
                  <ChecklistProvider chapterId={chapterId} initialChecks={checklistState}>
                    <article
                      className={cn(
                        "prose prose-neutral max-w-none",
                        "prose-headings:scroll-mt-16 prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-foreground",
                        "prose-h2:mt-12 prose-h2:border-b prose-h2:border-border prose-h2:pb-2 prose-h2:text-xl prose-h2:first:mt-0",
                        "prose-h3:mt-8 prose-h3:text-lg",
                        "prose-p:leading-[1.75]",
                        "prose-li:leading-relaxed",
                        "prose-strong:font-semibold prose-strong:text-foreground",
                        "prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[0.85em] prose-code:font-normal prose-code:before:content-none prose-code:after:content-none",
                        "prose-pre:max-w-none prose-pre:p-0 prose-pre:bg-transparent prose-pre:border-0",
                        "prose-figure:my-6",
                        "prose-blockquote:rounded-r-lg prose-blockquote:border-l-4 prose-blockquote:border-border prose-blockquote:bg-muted/50 prose-blockquote:px-4 prose-blockquote:py-3 prose-blockquote:not-italic",
                        "prose-hr:border-border",
                        "prose-img:rounded-xl prose-img:border prose-img:border-border",
                        "prose-figure:my-8 prose-figcaption:text-center prose-figcaption:text-sm prose-figcaption:text-muted-foreground",
                        "prose-table:block prose-table:max-w-full prose-table:overflow-x-auto prose-th:whitespace-nowrap prose-td:align-top prose-td:text-sm"
                      )}
                    >
                      {children}
                    </article>
                  </ChecklistProvider>
                </LearningLogProvider>

                <ChapterNav
                  courseSlug={courseSlug}
                  prev={prev}
                  next={next}
                  nextLocked={nextLocked}
                  chapterId={chapterId}
                  chapterComplete={chapterComplete}
                  canMarkComplete={canMarkComplete}
                  checkpointsCompleted={checkpointsCompleted}
                  checkpointsTotal={checkpointsTotal}
                />
              </div>
            </main>

            <ChapterToc
              headings={headings}
              collapsed={rightCollapsed}
              onToggle={() => setRightCollapsed(!rightCollapsed)}
              mobileSheet={isMobile || focusMode}
            />
          </div>
        </div>

        {focusMode && <ReaderFocusDock onExitFocus={() => void exitFocusMode()} />}
      </ReaderShellFade>
    </div>
  );
}
