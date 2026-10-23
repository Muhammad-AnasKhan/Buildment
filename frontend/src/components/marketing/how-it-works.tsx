"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
} from "react";
import { BookOpen, Check, Pause, Play, Rocket } from "lucide-react";
import { STEPS } from "@/components/marketing/marketing-content";
import {
  useInView,
  usePrefersReducedMotion,
  useTimerBar,
} from "@/components/marketing/use-auto-advance";
import { cn } from "@/lib/utils";

export type HowItWorksCourse = {
  title: string;
  meta: string;
  coverUrl: string | null;
};

const STEP_MS = 6000;

const delay = (seconds: number) => ({ "--d": `${seconds}s` }) as CSSProperties;

/* ----------------------------- stage scenes ----------------------------- */

function MiniCover({ coverUrl }: { coverUrl: string | null }) {
  return coverUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={coverUrl}
      alt=""
      className="size-11 shrink-0 rounded-lg object-cover"
    />
  ) : (
    <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
      <BookOpen className="size-5" />
    </span>
  );
}

const ROW = "flex items-center gap-3.5 rounded-[14px] border border-border p-3";

/** Step 1: three courses pop in, the first gets picked, the Enroll button flips to "Enrolled". */
function CoursePickerScene({ courses }: { courses: HowItWorksCourse[] }) {
  const delays = [0.1, 0.25, 0.4];
  return (
    <>
      {delays.map((d, i) => {
        const course = courses[i];
        const className = cn(ROW, i === 0 ? "bm-pick" : "bm-pop");
        return course ? (
          <div key={i} className={className} style={delay(d)}>
            <MiniCover coverUrl={course.coverUrl} />
            <div className="min-w-0">
              <b className="block truncate text-[15px] font-semibold">
                {course.title}
              </b>
              <small className="block text-[13px] text-muted-foreground">
                {course.meta}
              </small>
            </div>
          </div>
        ) : (
          // Fewer than three published courses: neutral placeholder rows, never invented course names.
          <div key={i} className={className} style={delay(d)}>
            <span className="size-11 shrink-0 rounded-lg bg-muted" />
            <span className="flex-1 space-y-2">
              <span className="block h-2.5 w-2/5 rounded-full bg-muted" />
              <span className="block h-2 w-1/4 rounded-full bg-muted/60" />
            </span>
          </div>
        );
      })}
      <div className="relative mt-1.5 min-w-32 self-end rounded-xl bg-foreground px-5 py-2.5 text-center text-sm font-semibold text-background">
        <span className="bm-enroll-from block">Enroll</span>
        <span className="bm-enroll-to absolute inset-0 grid place-items-center">
          Enrolled ✓
        </span>
      </div>
    </>
  );
}

/** Step 2: checklist rows appear one by one, each box ticks itself, a progress bar fills. */
function ChecklistScene() {
  const items: Array<[string, number]> = [
    ["Read: sessions and cookies", 0.1],
    ["Build the login endpoint", 0.7],
    ["Answer the checkpoint question", 1.3],
    ["Mentor review received", 1.9],
  ];
  return (
    <>
      {items.map(([label, d]) => (
        <div
          key={label}
          style={delay(d)}
          className="bm-pop flex items-center gap-3 rounded-xl bg-muted/50 px-3 py-2.5 text-sm"
        >
          <span className="bm-check grid size-[22px] shrink-0 place-items-center rounded-[7px] bg-ok text-white">
            <Check className="size-3.5" strokeWidth={3} />
          </span>
          {label}
        </div>
      ))}
      <div className="mt-1.5 h-[7px] overflow-hidden rounded-full bg-muted">
        <i className="bm-grow block h-full bg-gradient-to-r from-foreground to-ok" />
      </div>
    </>
  );
}

/** Step 3: terminal lines print in sequence, then the "live" card pops up. */
function DeployScene() {
  return (
    <>
      <div className="rounded-[14px] bg-[#161411] p-4 font-mono text-[13px] leading-[1.8] text-[#d9d2c8]">
        <p style={delay(0.1)} className="bm-pop">
          $ npm run build
        </p>
        <p style={delay(0.6)} className="bm-pop text-[#7ee2a8]">
          ✓ Build passed
        </p>
        <p style={delay(1.1)} className="bm-pop text-[#7ee2a8]">
          ✓ 42 tests passed
        </p>
        <p style={delay(1.6)} className="bm-pop">
          → Deploying to production…
        </p>
      </div>
      <div
        style={delay(2.2)}
        className="bm-pop flex items-center gap-3 rounded-[14px] bg-ok-soft p-3.5"
      >
        <Rocket className="size-6 shrink-0 text-ok" />
        <div className="text-[15px]">
          <b className="block font-semibold">freshmarket.app</b>
          <small className="block text-[13px] text-muted-foreground">
            Your project is live
          </small>
        </div>
        <span className="ml-auto rounded-full bg-ok px-2.5 py-0.5 text-xs font-bold text-white">
          Live
        </span>
      </div>
    </>
  );
}

/* ------------------------------ main block ------------------------------ */

export function HowItWorks({ courses }: { courses: HowItWorksCourse[] }) {
  const [active, setActive] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  const reduced = usePrefersReducedMotion();
  const { inView, seen } = useInView(rootRef);
  const autoplay = !reduced && inView;
  const paused = userPaused || hovered || focused;

  // Each step fills a 6s bar at its bottom edge, then hands over to the next one (loops).
  useTimerBar(barRef, {
    duration: STEP_MS,
    restartKey: active,
    enabled: autoplay,
    paused,
    onDone: () => setActive((index) => (index + 1) % STEPS.length),
  });

  // The vertical line grows down to the active step's dot.
  useLayoutEffect(() => {
    const track = trackRef.current;
    const line = lineRef.current;
    if (!track || !line) return;
    const measure = () => {
      const item = track.querySelectorAll<HTMLElement>("[data-step]")[active];
      if (item) line.style.height = `${item.offsetTop + 10}px`;
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, [active]);

  function onFocus(event: FocusEvent<HTMLDivElement>) {
    // Only keyboard focus pauses; a mouse click on a step must not freeze the tour forever.
    setFocused(event.target.matches(":focus-visible"));
  }

  return (
    <div
      ref={rootRef}
      onPointerEnter={(event) => setHovered(event.pointerType === "mouse")}
      onPointerLeave={() => setHovered(false)}
      onFocus={onFocus}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocused(false);
      }}
      className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-10"
    >
      <div ref={trackRef} className="relative pl-7">
        <span
          aria-hidden
          className="absolute bottom-5 left-[17px] top-5 w-0.5 bg-border"
        />
        <span
          ref={lineRef}
          aria-hidden
          className="absolute left-[17px] top-5 z-[1] w-0.5 bg-foreground transition-[height] duration-700 ease-[cubic-bezier(.3,.8,.3,1)]"
          style={{ height: 0 }}
        />
        <ol className="flex flex-col gap-3">
          {STEPS.map((step, index) => {
            const on = index === active;
            const done = index < active;
            return (
              <li key={step.title} data-step className="relative">
                <span
                  aria-hidden
                  className={cn(
                    "absolute -left-6 top-4 z-[2] grid size-7 place-items-center rounded-full border-2 text-[13px] font-bold tabular-nums transition-all duration-300",
                    done && "border-ok bg-ok text-white",
                    on &&
                      "scale-[1.15] border-foreground bg-foreground text-background",
                    !done &&
                      !on &&
                      "border-border bg-card text-muted-foreground",
                  )}
                >
                  {done ? (
                    <Check className="size-3.5" strokeWidth={3} />
                  ) : (
                    index + 1
                  )}
                </span>
                <button
                  type="button"
                  aria-current={on ? "step" : undefined}
                  onClick={() => setActive(index)}
                  className={cn(
                    "relative block w-full overflow-hidden rounded-[18px] border bg-card py-4 pl-[22px] pr-5 text-left outline-none transition-all duration-300 focus-visible:ring-3 focus-visible:ring-ring/50",
                    on
                      ? "translate-x-1.5 border-foreground/60 shadow-lg shadow-foreground/10"
                      : "border-border hover:border-foreground/25",
                  )}
                >
                  <h3 className="text-xl font-semibold tracking-tight">
                    {step.title}
                  </h3>
                  {on ? (
                    <>
                      <p className="bm-pop mb-2.5 mt-1.5 text-[15px] leading-6 text-muted-foreground">
                        {step.text}
                      </p>
                      <span className="bm-pop inline-block rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-foreground">
                        {step.badge}
                      </span>
                      <span
                        ref={barRef}
                        aria-hidden
                        className="absolute bottom-0 left-0 h-[3px] w-full bg-foreground"
                        style={{
                          transform: "scaleX(0)",
                          transformOrigin: "left",
                        }}
                      />
                    </>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-lg shadow-foreground/5">
        <div className="flex h-12 items-center justify-between gap-3 border-b border-border/70 bg-muted/20 px-4">
          <div className="flex items-center gap-1.5" aria-hidden>
            <span className="size-2.5 rounded-full bg-foreground/20" />
            <span className="size-2.5 rounded-full bg-foreground/10" />
            <span className="size-2.5 rounded-full bg-foreground/10" />
          </div>
          <p className="min-w-0 truncate text-[13px] text-muted-foreground">
            {STEPS[active].stage}
          </p>
          {reduced ? (
            <span className="size-7" aria-hidden />
          ) : (
            <button
              type="button"
              onClick={() => setUserPaused((value) => !value)}
              aria-pressed={userPaused}
              aria-label={
                userPaused ? "Resume automatic tour" : "Pause automatic tour"
              }
              className="grid size-7 place-items-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {userPaused ? (
                <Play className="size-3.5" aria-hidden />
              ) : (
                <Pause className="size-3.5" aria-hidden />
              )}
            </button>
          )}
        </div>
        {/* Decorative demo: remounts per step (and once when first scrolled into view) to replay it. */}
        <div
          aria-hidden
          className="flex min-h-[330px] flex-col justify-center gap-2.5 p-[22px]"
        >
          <div
            key={`${active}-${seen ? "seen" : "idle"}`}
            className="flex flex-col gap-2.5"
          >
            {active === 0 ? <CoursePickerScene courses={courses} /> : null}
            {active === 1 ? <ChecklistScene /> : null}
            {active === 2 ? <DeployScene /> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
