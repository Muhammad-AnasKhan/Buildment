"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { Heading } from "@/lib/mdx-headings";

type ChapterTocProps = {
  headings: Heading[];
  collapsed: boolean;
  onToggle: () => void;
  mobileSheet?: boolean;
};

function TocPanel({
  headings,
  activeId,
  onToggle,
}: {
  headings: Heading[];
  activeId: string | null;
  onToggle: () => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          On this page
        </span>
        <button
          type="button"
          onClick={onToggle}
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Close table of contents"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="size-4">
            <path
              d="M10 4L6 8l4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3">
        <ul className="space-y-0.5">
          {headings.map((heading) => (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                onClick={onToggle}
                className={cn(
                  "block rounded-md px-2.5 py-1.5 text-xs leading-relaxed transition-colors",
                  heading.level === 3 && "pl-5",
                  activeId === heading.id
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}

export function ChapterToc({
  headings,
  collapsed,
  onToggle,
  mobileSheet = false,
}: ChapterTocProps) {
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

  useEffect(() => {
    if (!mobileSheet || collapsed) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileSheet, collapsed]);

  if (collapsed || headings.length === 0) return null;

  if (mobileSheet) {
    return (
      <>
        <button
          type="button"
          aria-label="Close table of contents"
          className="fixed inset-0 z-40 bg-neutral-950/30 md:hidden"
          onClick={onToggle}
        />
        <aside className="fixed inset-y-0 right-0 z-50 flex w-[min(16rem,85vw)] flex-col border-l border-border bg-card text-card-foreground shadow-xl md:hidden">
          <TocPanel headings={headings} activeId={activeId} onToggle={onToggle} />
        </aside>
      </>
    );
  }

  return (
    <aside className="hidden w-56 shrink-0 flex-col border-l border-border bg-card text-card-foreground transition-[width] duration-300 ease-in-out md:flex">
      <TocPanel headings={headings} activeId={activeId} onToggle={onToggle} />
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
          <path
            d="M6 4l4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="size-4">
          <path
            d="M10 4L6 8l4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
