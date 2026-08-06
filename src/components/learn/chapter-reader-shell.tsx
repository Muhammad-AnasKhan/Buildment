"use client";

import { useState } from "react";
import Link from "next/link";
import { ChapterSidebar, SidebarToggle } from "@/components/learn/chapter-sidebar";
import { ChapterToc, TocToggle } from "@/components/learn/chapter-toc";
import { ChapterNav } from "@/components/learn/chapter-nav";
import { ChapterProgressBar, useReadingProgress } from "@/components/learn/chapter-progress-bar";
import { ChecklistProvider } from "@/components/learn/checklist";
import { LearningLogProvider } from "@/components/learn/learning-log";
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
  children: React.ReactNode;
}) {
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const { progress } = useReadingProgress();

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Reading progress bar */}
      <ChapterProgressBar progress={progress} />

      {/* Left Sidebar */}
      <ChapterSidebar
        courseSlug={courseSlug}
        modules={modules}
        currentChapterSlug={prev?.slug ?? ""}
        collapsed={leftCollapsed}
        onToggle={() => setLeftCollapsed(!leftCollapsed)}
      />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar with breadcrumb + toggles */}
        <header className="flex shrink-0 items-center gap-3 border-b border-neutral-200 bg-white/95 px-4 py-2.5 backdrop-blur sm:px-6">
          <SidebarToggle collapsed={leftCollapsed} onClick={() => setLeftCollapsed(!leftCollapsed)} />
          <nav className="flex min-w-0 items-center gap-1.5 truncate text-xs text-neutral-500" aria-label="Breadcrumb">
            <Link href="/dashboard" className="shrink-0 transition-colors hover:text-neutral-950">
              Dashboard
            </Link>
            <span aria-hidden>/</span>
            <Link href={`/courses/${courseSlug}`} className="shrink-0 transition-colors hover:text-neutral-950">
              {courseTitle}
            </Link>
            <span aria-hidden>/</span>
            <span className="truncate font-mono text-xs text-neutral-400">{lessonLabel}</span>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <TocToggle collapsed={rightCollapsed} onClick={() => setRightCollapsed(!rightCollapsed)} />
          </div>
        </header>

        {/* Scrollable content area with TOC */}
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-6 lg:px-10">
            <div className="mx-auto max-w-3xl">
              {/* Back link */}
              <nav className="mb-6">
                <Link
                  href={`/courses/${courseSlug}`}
                  className="inline-flex items-center gap-1.5 text-xs text-neutral-500 transition-colors hover:text-indigo-600"
                >
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="rotate-180">
                    <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Back to course
                </Link>
              </nav>

              {/* Chapter header */}
              <div className="mb-8">
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <span className="rounded-md bg-neutral-100 px-2 py-0.5 font-mono font-medium text-neutral-600">
                    {lessonLabel}
                  </span>
                </div>
                <h1 className="mt-2 text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl">
                  {chapterTitle}
                </h1>
              </div>

              <LearningLogProvider chapterId={chapterId} initialAnswers={learningLogAnswers}>
              <ChecklistProvider chapterSlug={chapterSlug}>
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
                  "prose-hr:border-neutral-200",
                  "prose-img:rounded-xl prose-img:border prose-img:border-neutral-200",
                  "prose-figure:my-8 prose-figcaption:text-center prose-figcaption:text-sm prose-figcaption:text-neutral-500"
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
              />
            </div>
          </main>

          {/* Right Sidebar (TOC) */}
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
