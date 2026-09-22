"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight, Menu, X, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SyllabusModule } from "@/components/learn/course-syllabus";
import { SyllabusChapterRow } from "@/components/learn/syllabus-chapter-row";

type ChapterSidebarProps = {
  courseSlug: string;
  modules: SyllabusModule[];
  currentChapterSlug: string;
  collapsed: boolean;
  onToggle: () => void;
  mobileSheet?: boolean;
};

function chapterSlugFromPath(pathname: string, courseSlug: string) {
  const prefix = `/courses/${courseSlug}/`;
  if (!pathname.startsWith(prefix)) return null;
  const rest = pathname.slice(prefix.length);
  if (!rest || rest.includes("/")) return null;
  return decodeURIComponent(rest);
}

function SidebarPanel({
  courseSlug,
  modules,
  activeSlug,
  activeLinkRef,
  openModules,
  toggleModule,
  onToggle,
}: {
  courseSlug: string;
  modules: SyllabusModule[];
  activeSlug: string;
  activeLinkRef: React.RefObject<HTMLAnchorElement | null>;
  openModules: Set<string>;
  toggleModule: (id: string) => void;
  onToggle: () => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <Link
          href={`/courses/${courseSlug}`}
          className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground"
          onClick={onToggle}
        >
          <LayoutDashboard className="size-3.5" />
          Curriculum
        </Link>
        <button
          type="button"
          onClick={onToggle}
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Close sidebar"
        >
          <X className="size-4" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-2" aria-label="Course chapters">
        {modules.map((mod) => {
          const isOpen = openModules.has(mod.id);
          const moduleHasActive = mod.chapters.some((ch) => ch.slug === activeSlug);

          return (
            <div key={mod.id} className="mb-1">
              <button
                type="button"
                onClick={() => toggleModule(mod.id)}
                className={cn(
                  "flex w-full items-center gap-2 px-4 py-2 text-left text-sm transition-colors",
                  moduleHasActive && "bg-muted/60"
                )}
              >
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-md font-mono text-[11px] font-bold tabular-nums",
                    moduleHasActive
                      ? "bg-foreground text-background"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {String(mod.order).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground/90">
                  {mod.title}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-muted-foreground">
                    {mod.completedCount}/{mod.chapters.length}
                  </span>
                  {isOpen ? (
                    <ChevronDown className="size-3.5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="size-3.5 text-muted-foreground" />
                  )}
                </div>
              </button>

              {isOpen && (
                <ul className="border-t border-border/60">
                  {mod.chapters.map((chapter) => {
                    const isCurrent = chapter.slug === activeSlug;
                    return (
                      <li key={chapter.id}>
                        <SyllabusChapterRow
                          courseSlug={courseSlug}
                          chapter={chapter}
                          variant="sidebar"
                          isActive={isCurrent}
                          linkRef={isCurrent ? activeLinkRef : undefined}
                        />
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </nav>
    </>
  );
}

export function ChapterSidebar({
  courseSlug,
  modules,
  currentChapterSlug,
  collapsed,
  onToggle,
  mobileSheet = false,
}: ChapterSidebarProps) {
  const pathname = usePathname();
  const activeSlug = chapterSlugFromPath(pathname, courseSlug) ?? currentChapterSlug;
  const activeLinkRef = useRef<HTMLAnchorElement>(null);

  const [openModules, setOpenModules] = useState<Set<string>>(() => {
    const open = new Set<string>();
    for (const mod of modules) {
      if (mod.chapters.some((ch) => ch.slug === activeSlug)) {
        open.add(mod.id);
        break;
      }
    }
    return open;
  });

  useEffect(() => {
    for (const mod of modules) {
      if (mod.chapters.some((ch) => ch.slug === activeSlug)) {
        setOpenModules((prev) => new Set([...prev, mod.id]));
      }
    }
  }, [activeSlug, modules]);

  useEffect(() => {
    if (collapsed) return;
    activeLinkRef.current?.scrollIntoView({ block: "nearest", behavior: "auto" });
  }, [activeSlug, collapsed]);

  useEffect(() => {
    if (!mobileSheet || collapsed) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileSheet, collapsed]);

  const toggleModule = (moduleId: string) => {
    setOpenModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  if (collapsed) return null;

  const panelProps = {
    courseSlug,
    modules,
    activeSlug,
    activeLinkRef,
    openModules,
    toggleModule,
    onToggle,
  };

  if (mobileSheet) {
    return (
      <>
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-neutral-950/30 md:hidden"
          onClick={onToggle}
        />
        <aside className="fixed inset-y-0 left-0 z-50 flex w-[min(18rem,85vw)] flex-col border-r border-border bg-card text-card-foreground shadow-xl md:hidden">
          <SidebarPanel {...panelProps} />
        </aside>
      </>
    );
  }

  return (
    <aside className="hidden w-72 shrink-0 flex-col border-r border-border bg-card text-card-foreground transition-[width] duration-300 ease-in-out md:flex">
      <SidebarPanel {...panelProps} />
    </aside>
  );
}

export function SidebarToggle({
  collapsed,
  onClick,
}: {
  collapsed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      {collapsed ? <Menu className="size-4" /> : <X className="size-4" />}
    </button>
  );
}
