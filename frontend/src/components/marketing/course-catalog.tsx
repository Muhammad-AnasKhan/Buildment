"use client";

import { useMemo, useRef, useState, type FocusEvent } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import {
  CourseCard,
  FeaturedCourseCard,
  type CourseCardData,
} from "@/components/marketing/course-card";
import {
  useInView,
  usePrefersReducedMotion,
  useTimerBar,
} from "@/components/marketing/use-auto-advance";
import { cn } from "@/lib/utils";

export type CatalogCourse = CourseCardData & { id: string };

const PAGE_SIZE = 4;
const SLIDE_MS = 5000;
const ALL = "all";

const chipClass =
  "rounded-full border px-[15px] py-[7px] text-sm font-medium capitalize outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50";
const roundButton =
  "grid size-10 place-items-center rounded-xl border border-border bg-card text-foreground outline-none transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transform-none";

/**
 * Four-up auto-advancing carousel. Chips come from the difficulty values that really exist in the
 * catalog; the track slides one page (four cards) at a time; the active dot fills over 5s and then
 * moves on; hover, keyboard focus, the pause button and leaving the screen all freeze the timer.
 */
export function CourseCatalog({ courses }: { courses: CatalogCourse[] }) {
  const [filter, setFilter] = useState<string>(ALL);
  const [page, setPage] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);

  const reduced = usePrefersReducedMotion();
  const { inView } = useInView(rootRef, 0.2);

  const difficulties = useMemo(() => {
    const seen = new Set<string>();
    for (const course of courses)
      if (course.difficulty) seen.add(course.difficulty);
    return [...seen];
  }, [courses]);

  const filtered = useMemo(
    () =>
      filter === ALL ? courses : courses.filter((c) => c.difficulty === filter),
    [courses, filter],
  );

  const slides = useMemo(() => {
    const out: CatalogCourse[][] = [];
    for (let i = 0; i < filtered.length; i += PAGE_SIZE)
      out.push(filtered.slice(i, i + PAGE_SIZE));
    return out;
  }, [filtered]);

  const pageCount = slides.length;
  const current = Math.min(page, Math.max(pageCount - 1, 0));
  const multiPage = pageCount > 1;
  const autoplay = multiPage && !reduced && inView;
  const paused = userPaused || hovered || focused;

  function go(delta: number) {
    setPage((current + delta + pageCount) % pageCount);
  }

  function selectFilter(next: string) {
    setFilter(next);
    setPage(0);
  }

  useTimerBar(fillRef, {
    duration: SLIDE_MS,
    restartKey: `${filter}:${current}`,
    enabled: autoplay,
    paused,
    onDone: () => setPage((value) => (value + 1) % Math.max(pageCount, 1)),
  });

  function onFocus(event: FocusEvent<HTMLDivElement>) {
    // Keyboard focus pauses; a mouse click on a chip or arrow must not stop the carousel for good.
    setFocused(event.target.matches(":focus-visible"));
  }

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Course catalog"
      onPointerEnter={(event) => setHovered(event.pointerType === "mouse")}
      onPointerLeave={() => setHovered(false)}
      onFocus={onFocus}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocused(false);
      }}
    >
      {difficulties.length > 1 ? (
        <div
          role="group"
          aria-label="Filter courses by difficulty"
          className="mb-6 flex flex-wrap gap-2"
        >
          {[ALL, ...difficulties].map((value) => {
            const active = filter === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={active}
                onClick={() => selectFilter(value)}
                className={cn(
                  chipClass,
                  active
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-card text-foreground hover:border-foreground/30",
                )}
              >
                {value === ALL ? "All" : value}
              </button>
            );
          })}
        </div>
      ) : null}

      {filtered.length === 1 ? (
        <FeaturedCourseCard course={filtered[0]} />
      ) : (
        <div
          className="overflow-hidden"
          aria-live={autoplay && !paused ? "off" : "polite"}
        >
          <div
            className="flex transition-transform duration-700 ease-[cubic-bezier(.65,0,.25,1)] motion-reduce:transition-none"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {slides.map((slide, index) => (
              <div
                key={index}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${pageCount}`}
                // Off-screen pages must not be reachable by keyboard or screen reader.
                inert={index !== current}
                className="grid basis-full shrink-0 grid-cols-1 items-stretch gap-[18px] px-0.5 pb-[18px] pt-1.5 sm:grid-cols-2 lg:grid-cols-4"
              >
                {slide.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-2 flex items-center justify-between gap-4">
        <div className="flex gap-2">
          {multiPage
            ? slides.map((_, index) => {
                const on = index === current;
                return (
                  <button
                    key={index}
                    type="button"
                    aria-label={`Go to slide ${index + 1}`}
                    aria-current={on ? "true" : undefined}
                    onClick={() => setPage(index)}
                    className={cn(
                      "relative h-2.5 overflow-hidden rounded-full bg-border p-0 outline-none transition-[width] duration-300 focus-visible:ring-3 focus-visible:ring-ring/50",
                      on ? "w-12" : "w-2.5 hover:bg-foreground/30",
                    )}
                  >
                    {on ? (
                      <span
                        ref={fillRef}
                        aria-hidden
                        className="absolute inset-0 bg-foreground"
                        style={{
                          transformOrigin: "left",
                          transform: autoplay ? "scaleX(0)" : "scaleX(1)",
                        }}
                      />
                    ) : null}
                  </button>
                );
              })
            : null}
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-sm text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "course" : "courses"}
          </span>
          {multiPage ? (
            <>
              {reduced ? null : (
                <button
                  type="button"
                  onClick={() => setUserPaused((value) => !value)}
                  aria-pressed={userPaused}
                  aria-label={
                    userPaused
                      ? "Resume automatic sliding"
                      : "Pause automatic sliding"
                  }
                  className={roundButton}
                >
                  {userPaused ? (
                    <Play className="size-4" aria-hidden />
                  ) : (
                    <Pause className="size-4" aria-hidden />
                  )}
                </button>
              )}
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous courses"
                className={roundButton}
              >
                <ChevronLeft className="size-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next courses"
                className={roundButton}
              >
                <ChevronRight className="size-4" aria-hidden />
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
