"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, BookOpen, ChevronDown, ChevronRight, Menu, X, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SyllabusModule } from "@/components/learn/course-syllabus";

type ChapterSidebarProps = {
  courseSlug: string;
  modules: SyllabusModule[];
  currentChapterSlug: string;
  collapsed: boolean;
  onToggle: () => void;
};

export function ChapterSidebar({ courseSlug, modules, currentChapterSlug, collapsed, onToggle }: ChapterSidebarProps) {
  const [openModules, setOpenModules] = useState<Set<string>>(() => {
    const open = new Set<string>();
    for (const mod of modules) {
      if (mod.chapters.some((ch) => ch.slug === currentChapterSlug)) {
        open.add(mod.id);
        break;
      }
    }
    return open;
  });
  const pathname = usePathname();

  useEffect(() => {
    for (const mod of modules) {
      if (mod.chapters.some((ch) => ch.slug === currentChapterSlug)) {
        setOpenModules((prev) => new Set([...prev, mod.id]));
      }
    }
  }, [currentChapterSlug, modules]);

  const toggleModule = (moduleId: string) => {
    setOpenModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  if (collapsed) return null;

  return (
    <aside className="flex w-72 flex-col border-r border-neutral-200 bg-white transition-[width] duration-300 ease-in-out">
      <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
        <Link
          href={`/courses/${courseSlug}`}
          className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-neutral-500 hover:text-neutral-700"
        >
          <LayoutDashboard className="size-3.5" />
          Curriculum
        </Link>
        <button
          type="button"
          onClick={onToggle}
          className="rounded-md p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
          aria-label="Collapse sidebar"
        >
          <X className="size-4" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {modules.map((mod) => {
          const isOpen = openModules.has(mod.id);
          const isActive = mod.chapters.some((ch) => ch.slug === currentChapterSlug);

          return (
            <div key={mod.id} className="mb-1">
              <button
                type="button"
                onClick={() => toggleModule(mod.id)}
                className={cn(
                  "flex w-full items-center gap-2 px-4 py-2 text-left text-sm transition-colors",
                  isActive && "bg-indigo-50/60"
                )}
              >
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-md font-mono text-[11px] font-bold tabular-nums",
                    isActive
                      ? "bg-indigo-600 text-white"
                      : "bg-neutral-100 text-neutral-600"
                  )}
                >
                  {String(mod.order).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-neutral-700">
                  {mod.title}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-neutral-400">
                    {mod.completedCount}/{mod.chapters.length}
                  </span>
                  {isOpen ? (
                    <ChevronDown className="size-3.5 text-neutral-400" />
                  ) : (
                    <ChevronRight className="size-3.5 text-neutral-400" />
                  )}
                </div>
              </button>

              {isOpen && (
                <ul className="border-t border-neutral-50">
                  {mod.chapters.map((chapter) => {
                    const isCurrent = chapter.slug === currentChapterSlug;
                    return (
                      <li key={chapter.id}>
                        <Link
                          href={`/courses/${courseSlug}/${chapter.slug}`}
                          className={cn(
                            "flex items-center gap-2.5 px-4 py-2 pl-12 text-sm transition-colors",
                            isCurrent
                              ? "bg-indigo-50 font-medium text-indigo-700"
                              : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                          )}
                        >
                          <StatusIcon status={chapter.status} />
                          <span className="min-w-0 truncate">{chapter.title}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

function StatusIcon({ status }: { status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" }) {
  if (status === "COMPLETED") {
    return <CheckCircle2 className="size-3.5 shrink-0 text-indigo-600" />;
  }
  if (status === "IN_PROGRESS") {
    return <div className="size-3.5 shrink-0 rounded-full border-2 border-indigo-300 bg-indigo-50" />;
  }
  return <div className="size-3.5 shrink-0 rounded-full border-[1.5px] border-neutral-300" />;
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
      className="flex size-8 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500 shadow-sm transition-colors hover:bg-neutral-50 hover:text-neutral-700"
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      {collapsed ? <Menu className="size-4" /> : <X className="size-4" />}
    </button>
  );
}
