"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ChapterSidebar, SidebarToggle } from "@/components/learn/chapter-sidebar";
import { ChapterToc, TocToggle } from "@/components/learn/chapter-toc";
import { ChapterNav } from "@/components/learn/chapter-nav";
import { ChapterProgressBar, useReadingProgress } from "@/components/learn/chapter-progress-bar";
import { ChecklistProvider } from "@/components/learn/checklist";
import { LearningLogProvider } from "@/components/learn/learning-log";
import { UserMenuDropdown } from "@/components/user-menu-dropdown";
import { cn } from "@/lib/utils";
import type { Heading } from "@/lib/mdx-headings";
import type { SyllabusModule } from "@/components/learn/course-syllabus";

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
  learningLogAnswers = {},
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
  learningLogAnswers?: Record<string, string>;
  modules: SyllabusModule[];
  headings: Heading[];
  prev?: { slug: string; title: string; moduleOrder: number; order: number };
  next?: { slug: string; title: string; moduleOrder: number; order: number };
  user: { name?: string | null; email?: string | null; image?: string | null };
  signOutAction: () => Promise<void>;
  children: React.ReactNode;
}) {
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const scrollRef = useRef<HTMLElement>(null);
  const { progress } = useReadingProgress(scrollRef);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
  }, [chapterSlug]);

  return (
    <div className="flex h-[100dvh] flex-col bg-neutral-50">
      <header className="shrink-0 border-b border-neutral-200/80 bg-neutral-50">
        <div className="flex items-center gap-2 px-3 py-2 sm:px-4">
          <SidebarToggle collapsed={leftCollapsed} onClick={() => setLeftCollapsed(!leftCollapsed)} />
          <div className="flex min-w-0 flex-1 items-center gap-1.5 text-xs text-neutral-400">
            <Link
              href={`/courses/${courseSlug}`}
              className="truncate transition-colors hover:text-neutral-600"
            >
              {courseTitle}
            </Link>
            <span aria-hidden className="shrink-0 text-neutral-300">
              /
            </span>
            <span className="shrink-0 font-mono tabular-nums text-neutral-400">{lessonLabel}</span>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <TocToggle collapsed={rightCollapsed} onClick={() => setRightCollapsed(!rightCollapsed)} />
            <UserMenuDropdown user={user} compact signOutAction={signOutAction} />
          </div>
        </div>
        <ChapterProgressBar progress={progress} />
      </header>

      <div className="flex min-h-0 flex-1">
        <ChapterSidebar
          courseSlug={courseSlug}
          modules={modules}
          currentChapterSlug={chapterSlug}
          collapsed={leftCollapsed}
          onToggle={() => setLeftCollapsed(!leftCollapsed)}
        />

        <div className="flex min-w-0 flex-1 overflow-hidden">
          <main ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-8 sm:px-6 lg:px-10">
            <div className="mx-auto max-w-3xl">
              <header className="mb-8">
                <p className="font-mono text-xs tabular-nums text-neutral-400">{lessonLabel}</p>
                <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl">
                  {chapterTitle}
                </h1>
              </header>

              <LearningLogProvider chapterId={chapterId} initialAnswers={learningLogAnswers}>
                <ChecklistProvider chapterSlug={chapterSlug}>
                  <article
                    className={cn(
                      "prose prose-neutral max-w-none",
                      "prose-headings:scroll-mt-16 prose-headings:font-semibold prose-headings:tracking-tight",
                      "prose-h2:mt-12 prose-h2:border-b prose-h2:border-neutral-200 prose-h2:pb-2 prose-h2:text-xl prose-h2:first:mt-0",
                      "prose-h3:mt-8 prose-h3:text-lg",
                      "prose-p:leading-[1.75] prose-p:text-neutral-700",
                      "prose-li:text-neutral-700 prose-li:leading-relaxed",
                      "prose-strong:text-neutral-900 prose-strong:font-semibold",
                      "prose-code:rounded prose-code:bg-neutral-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[0.85em] prose-code:font-normal prose-code:text-neutral-800 prose-code:before:content-none prose-code:after:content-none",
                      "prose-pre:overflow-x-auto prose-pre:rounded-xl prose-pre:border prose-pre:border-neutral-800 prose-pre:bg-neutral-950 prose-pre:p-4 prose-pre:text-neutral-100",
                      "prose-pre:code:bg-transparent prose-pre:code:p-0 prose-pre:code:text-[0.875em] prose-pre:code:font-normal prose-pre:code:text-neutral-100 prose-pre:code:before:content-none prose-pre:code:after:content-none",
                      "prose-blockquote:rounded-r-lg prose-blockquote:border-l-4 prose-blockquote:border-neutral-300 prose-blockquote:bg-neutral-50 prose-blockquote:px-4 prose-blockquote:py-3 prose-blockquote:not-italic prose-blockquote:text-neutral-700",
                      "prose-hr:border-neutral-200",
                      "prose-img:rounded-xl prose-img:border prose-img:border-neutral-200",
                      "prose-figure:my-8 prose-figcaption:text-center prose-figcaption:text-sm prose-figcaption:text-neutral-500"
                    )}
                  >
                    {children}
                  </article>
                </ChecklistProvider>
              </LearningLogProvider>

              <ChapterNav courseSlug={courseSlug} prev={prev} next={next} />
            </div>
          </main>

          <ChapterToc
            headings={headings}
            collapsed={rightCollapsed}
            onToggle={() => setRightCollapsed(!rightCollapsed)}
          />
        </div>
      </div>
    </div>
  );
}
