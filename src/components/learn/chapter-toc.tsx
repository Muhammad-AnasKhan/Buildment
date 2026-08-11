"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { Heading } from "@/lib/mdx-headings";

type ChapterTocProps = {
  headings: Heading[];
  collapsed: boolean;
  onToggle: () => void;
};

export function ChapterToc({ headings, collapsed, onToggle }: ChapterTocProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (collapsed || headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "0px 0px -70% 0px", threshold: 0.1 }
    );

    for (const heading of headings) {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headings, collapsed]);

  if (collapsed || headings.length === 0) return null;

  return (
    <aside className="flex w-56 flex-col border-l border-neutral-200 bg-white transition-[width] duration-300 ease-in-out">
      <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
          On this page
        </span>
        <button
          type="button"
          onClick={onToggle}
          className="rounded-md p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
          aria-label="Collapse table of contents"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="size-4">
            <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3">
        <ul className="space-y-0.5">
          {headings.map((heading) => (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                className={cn(
                  "block rounded-md px-2.5 py-1.5 text-xs leading-relaxed transition-colors",
                  heading.level === 3 && "pl-5",
                  activeId === heading.id
                    ? "bg-indigo-50 font-medium text-indigo-700"
                    : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700"
                )}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export function TocToggle({
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
      aria-label={collapsed ? "Expand table of contents" : "Collapse table of contents"}
    >
      {collapsed ? (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="size-4">
          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="size-4">
          <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}
