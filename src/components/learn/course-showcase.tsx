"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ShowcaseTab } from "@/lib/course-showcase";

const DOT_COLORS = ["bg-red-400", "bg-amber-400", "bg-emerald-400"];

export function CourseShowcase({ tabs }: { tabs: ShowcaseTab[] }) {
  const [activeId, setActiveId] = useState(tabs[0]?.id);
  const active = tabs.find((tab) => tab.id === activeId) ?? tabs[0];
  if (!active) return null;

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600">
            Interactive preview
          </p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-neutral-950">
            What you&apos;ll build
          </h2>
          <p className="mt-1 text-sm text-neutral-500">{active.moduleHint}</p>
        </div>

        <div className="flex items-center gap-1 self-start rounded-xl border border-neutral-200 bg-neutral-50 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveId(tab.id)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                tab.id === active.id
                  ? "bg-white text-indigo-700 shadow-sm ring-1 ring-indigo-100"
                  : "text-neutral-500 hover:text-neutral-900"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-neutral-200">
        <div className="flex items-center gap-1.5 border-b border-neutral-200 bg-neutral-100 px-3 py-2">
          {DOT_COLORS.map((color) => (
            <span key={color} className={cn("size-2.5 rounded-full", color)} aria-hidden />
          ))}
          <span className="mx-auto flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-3 py-0.5 font-mono text-[11px] text-neutral-500">
            <Lock className="size-3 text-emerald-600" aria-hidden />
            freshmarket.app
          </span>
        </div>

        <div className="space-y-2.5 bg-white p-4 sm:p-5">
          {active.items.map((item) => (
            <div
              key={item.title}
              className="flex items-center justify-between gap-3 rounded-lg border border-neutral-100 bg-neutral-50/60 px-3.5 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-neutral-900">{item.title}</p>
                <p className="truncate text-xs text-neutral-500">{item.meta}</p>
              </div>
              {item.badge ? (
                <span className="shrink-0 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                  {item.badge}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
