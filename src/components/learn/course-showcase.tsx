"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ShowcaseTab } from "@/lib/course-showcase";

function ShowcaseLightbox({
  tab,
  onClose,
}: {
  tab: ShowcaseTab;
  onClose: () => void;
}) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-neutral-950/95">
      <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6">
        <p className="text-sm font-medium text-white">{tab.label}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close fullscreen preview"
          className="rounded-full border border-white/15 bg-white/10 p-2 text-white transition hover:bg-white/20"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6 sm:px-8">
        <div className="mx-auto flex w-full max-w-5xl justify-center">
          {/* Native resolution — no Next.js resize pipeline */}
          <img
            src={tab.imageUrl}
            alt={tab.imageAlt}
            width={tab.imageWidth}
            height={tab.imageHeight}
            className="h-auto w-auto max-w-full"
            decoding="async"
          />
        </div>
      </div>
    </div>
  );
}

export function CourseShowcase({ tabs }: { tabs: ShowcaseTab[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  const scrollToIndex = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, tabs.length - 1));
      slideRefs.current[clamped]?.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
      setActiveIndex(clamped);
    },
    [tabs.length]
  );

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || entry.intersectionRatio < 0.6) continue;
          const idx = slideRefs.current.indexOf(entry.target as HTMLDivElement);
          if (idx >= 0) setActiveIndex(idx);
        }
      },
      { root: container, threshold: 0.6 }
    );

    for (const el of slideRefs.current) {
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [tabs.length]);

  if (!tabs.length) return null;

  const lightboxTab = lightboxIndex !== null ? tabs[lightboxIndex] : null;

  return (
    <>
      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600">
            Interactive preview
          </p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-neutral-950">
            What you&apos;ll build
          </h2>
        </div>

        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
          <div className="relative">
            <div
              ref={scrollRef}
              className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {tabs.map((tab, index) => (
                <div
                  key={tab.id}
                  ref={(el) => {
                    slideRefs.current[index] = el;
                  }}
                  className="flex w-full shrink-0 snap-center snap-always items-center justify-center px-6 py-10 sm:px-10 sm:py-12"
                >
                  <button
                    type="button"
                    onClick={() => setLightboxIndex(index)}
                    className="group relative cursor-zoom-in rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                    aria-label={`View ${tab.label} fullscreen`}
                  >
                    <Image
                      src={tab.imageUrl}
                      alt={tab.imageAlt}
                      width={tab.imageWidth}
                      height={tab.imageHeight}
                      unoptimized
                      sizes="(max-width: 896px) 90vw, 640px"
                      className="h-auto w-auto max-h-[min(65vh,520px)] max-w-[min(100%,360px)] object-contain sm:max-w-[min(100%,420px)]"
                      priority={index === 0}
                    />
                    <span className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900/75 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                        <ZoomIn className="size-3.5" aria-hidden />
                        View full screen
                      </span>
                    </span>
                  </button>
                </div>
              ))}
            </div>

            {tabs.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => scrollToIndex(activeIndex - 1)}
                  disabled={activeIndex === 0}
                  aria-label="Previous screen"
                  className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-neutral-200 bg-white p-2 text-neutral-600 shadow-sm transition hover:bg-neutral-50 disabled:pointer-events-none disabled:opacity-40 sm:left-3"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollToIndex(activeIndex + 1)}
                  disabled={activeIndex === tabs.length - 1}
                  aria-label="Next screen"
                  className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-neutral-200 bg-white p-2 text-neutral-600 shadow-sm transition hover:bg-neutral-50 disabled:pointer-events-none disabled:opacity-40 sm:right-3"
                >
                  <ChevronRight className="size-5" />
                </button>
              </>
            ) : null}
          </div>

          {tabs.length > 1 ? (
            <div className="border-t border-neutral-200 bg-white px-3 py-3 sm:px-4">
              <div className="flex gap-1 overflow-x-auto rounded-lg bg-neutral-50 p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {tabs.map((tab, index) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => scrollToIndex(index)}
                    className={cn(
                      "flex-1 shrink-0 rounded-md px-3 py-2 text-center text-xs font-medium transition-colors sm:text-sm",
                      index === activeIndex
                        ? "bg-white text-indigo-700 shadow-sm ring-1 ring-indigo-100"
                        : "text-neutral-500 hover:text-neutral-900"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {lightboxTab ? (
        <ShowcaseLightbox tab={lightboxTab} onClose={() => setLightboxIndex(null)} />
      ) : null}
    </>
  );
}
