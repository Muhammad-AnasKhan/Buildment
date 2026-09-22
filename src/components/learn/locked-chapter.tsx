"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChapterSidebar, SidebarToggle } from "@/components/learn/chapter-sidebar";
import { UserMenuDropdown } from "@/components/user-menu-dropdown";
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
}) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="flex h-[100dvh] flex-col bg-neutral-50">
      <header className="flex shrink-0 items-center gap-2 border-b border-neutral-200/80 px-3 py-2 sm:px-4">
        <SidebarToggle collapsed={collapsed} onClick={() => setCollapsed(!collapsed)} />
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
        <UserMenuDropdown user={user} compact signOutAction={signOutAction} />
      </header>

      <div className="flex min-h-0 flex-1">
        <ChapterSidebar
          courseSlug={courseSlug}
          modules={modules}
          currentChapterSlug={currentChapterSlug}
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />
        <main className="flex-1 overflow-y-auto px-4 py-16 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-lg text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-500">
              <Lock className="size-5" aria-hidden />
            </div>
            <p className="mt-4 font-mono text-xs tabular-nums text-neutral-400">{lessonLabel}</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-950">
              {chapterTitle} is locked
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-neutral-600">
              Finish the previous chapter so this one unlocks. Sequential chapters keep the project
              spine in order — you are not missing content, you are just not there yet.
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
    </div>
  );
}
