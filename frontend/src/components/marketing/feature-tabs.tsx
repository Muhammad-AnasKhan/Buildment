"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import {
  Check,
  CheckCheck,
  ChevronRight,
  CircleDashed,
  Clock3,
  Flame,
} from "lucide-react";
import {
  VALUE_PROPS,
  type FeatureRow,
  type RowStatus,
  type Tone,
} from "@/components/marketing/marketing-content";
import { usePrefersReducedMotion } from "@/components/marketing/use-auto-advance";
import { cn } from "@/lib/utils";

/* Theme is black & white; the only real colour in the section is the icons.
   Every class is spelled out in full so Tailwind can see it. */
const ICON_COLOR: Record<Tone, string> = {
  indigo: "text-indigo-600 dark:text-indigo-400",
  sky: "text-sky-600 dark:text-sky-400",
  emerald: "text-emerald-600 dark:text-emerald-400",
  amber: "text-amber-600 dark:text-amber-400",
  violet: "text-violet-600 dark:text-violet-400",
  orange: "text-orange-600 dark:text-orange-400",
  rose: "text-rose-600 dark:text-rose-400",
};

/** Black-to-white gradient used by every progress bar (light track: light grey → black, dark track: grey → white). */
const BAR_GRADIENT =
  "bg-[linear-gradient(90deg,#d4d4d8,#09090b)] dark:bg-[linear-gradient(90deg,#52525b,#fafafa)]";

/* ------------------------------ small helpers ------------------------------ */

/** Flips to true shortly after mount so width / colour transitions have something to animate from. */
function useReady(delayMs = 60) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setReady(true), delayMs);
    return () => clearTimeout(id);
  }, [delayMs]);
  return ready;
}

/** Eased count from 0 to `target`; jumps straight to the end for reduced-motion visitors. */
function useCountUp(target: number, duration = 900) {
  const reduced = usePrefersReducedMotion();
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (reduced) return;
    let frame = 0;
    let start: number | null = null;
    const tick = (now: number) => {
      start ??= now;
      const progress = Math.min((now - start) / duration, 1);
      setValue(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, reduced]);
  return reduced ? target : value;
}

function Meter({
  percent,
  className,
}: {
  percent: number;
  className?: string;
}) {
  const ready = useReady();
  return (
    <div
      className={cn("h-2 overflow-hidden rounded-full bg-muted", className)}
      aria-hidden
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-[900ms] ease-out motion-reduce:transition-none",
          BAR_GRADIENT,
        )}
        style={{ width: ready ? `${percent}%` : "0%" }}
      />
    </div>
  );
}

function Pill({ children }: { children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-semibold text-foreground",
      )}
    >
      {children}
    </span>
  );
}

/* ------------------------------ right-hand status ------------------------------ */

function RatioStatus({ value, total }: { value: number; total: number }) {
  const shown = useCountUp(value);
  return (
    <span className="flex w-24 flex-col items-end gap-1.5 sm:w-28">
      <span className="tabular-nums">
        <b className="text-lg font-extrabold leading-none text-foreground">
          {shown}
        </b>
        <span className="ml-1 text-xs font-medium text-muted-foreground">
          of {total}
        </span>
      </span>
      <Meter percent={(value / total) * 100} className="h-1.5 w-full" />
    </span>
  );
}

function StreakStatus({ days }: { days: number }) {
  const ready = useReady(200);
  return (
    <span className="flex flex-col items-end gap-1.5">
      <Pill>
        <Flame className={cn("size-3.5", ICON_COLOR.orange)} aria-hidden />
        <span className="tabular-nums">
          <b className="font-extrabold">{days}</b> days
        </span>
      </Pill>
      <span className="flex gap-1" aria-hidden>
        {Array.from({ length: 7 }, (_, index) => (
          <span
            key={index}
            style={{ transitionDelay: `${index * 70}ms` }}
            className={cn(
              "size-2 rounded-full transition-colors duration-300 motion-reduce:transition-none",
              ready && index < days ? "bg-foreground" : "bg-muted",
            )}
          />
        ))}
      </span>
    </span>
  );
}

function StatusView({ status }: { status: RowStatus }) {
  switch (status.kind) {
    case "done":
      return (
        <Pill>
          <Check
            className={cn("size-3.5", ICON_COLOR.emerald)}
            strokeWidth={3}
            aria-hidden
          />
          {status.text}
        </Pill>
      );
    case "answered":
      return (
        <Pill>
          <CheckCheck
            className={cn("size-3.5", ICON_COLOR.emerald)}
            strokeWidth={2.5}
            aria-hidden
          />
          {status.text}
        </Pill>
      );
    case "progress":
      return (
        <Pill>
          <span className="relative flex size-2" aria-hidden>
            <span className="absolute inline-flex size-full rounded-full bg-foreground opacity-70 motion-safe:animate-ping" />
            <span className="relative inline-flex size-2 rounded-full bg-foreground" />
          </span>
          {status.text}
        </Pill>
      );
    case "next":
      return (
        <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-dashed border-border px-2.5 py-1 text-xs font-medium text-muted-foreground">
          <CircleDashed className="size-3.5" aria-hidden />
          {status.text}
        </span>
      );
    case "time":
      return (
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-muted-foreground">
          <Clock3 className="size-3.5" aria-hidden />
          {status.text}
        </span>
      );
    case "ratio":
      return <RatioStatus value={status.value} total={status.total} />;
    case "count":
      return (
        <span className="grid size-8 place-items-center rounded-full bg-foreground text-sm font-extrabold tabular-nums text-background shadow-md">
          {status.value}
        </span>
      );
    case "streak":
      return <StreakStatus days={status.days} />;
  }
}

/* ------------------------------ panel pieces ------------------------------ */

function Row({ row, index }: { row: FeatureRow; index: number }) {
  return (
    <li
      style={{ "--d": `${index * 70}ms` } as CSSProperties}
      className={cn(
        "bm-pop group flex items-center gap-3.5 rounded-2xl border border-border bg-background/70 px-3.5 py-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/30 hover:shadow-md motion-reduce:transform-none",
      )}
    >
      <span
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-xl bg-muted transition-transform duration-200 group-hover:-rotate-6 group-hover:scale-110 motion-reduce:transform-none",
          ICON_COLOR[row.tone],
        )}
      >
        <row.icon className="size-5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1 text-sm font-medium leading-5 text-foreground">
        {row.label}
      </span>
      {row.status ? <StatusView status={row.status} /> : null}
    </li>
  );
}

/** Overall bar shown above rows that describe steps (done / in progress / up next). */
function ProgressSummary({ rows }: { rows: readonly FeatureRow[] }) {
  const steps = rows.filter(
    (row) =>
      row.status && ["done", "progress", "next"].includes(row.status.kind),
  );
  const done = steps.filter((row) => row.status?.kind === "done").length;
  const percent = steps.length ? Math.round((done / steps.length) * 100) : 0;
  const shown = useCountUp(percent);
  if (steps.length === 0) return null;
  return (
    <div className="mb-4 flex items-center gap-3">
      <Meter percent={percent} className="flex-1" />
      <span className="text-sm font-extrabold tabular-nums text-foreground">
        {shown}%
      </span>
    </div>
  );
}

/* ------------------------------ main block ------------------------------ */

export function FeatureTabs() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const count = VALUE_PROPS.length;

  function focusTab(index: number) {
    setActive(index);
    tabRefs.current[index]?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      focusTab((index + 1) % count);
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      focusTab((index - 1 + count) % count);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusTab(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusTab(count - 1);
    }
  }

  const current = VALUE_PROPS[active];

  return (
    <div className="flex flex-col gap-10 lg:gap-12">

      <div className="grid gap-5 lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-7">
        <div
          role="tablist"
          aria-orientation="vertical"
          aria-label="Features"
          className="flex flex-col gap-2.5"
        >
          {VALUE_PROPS.map((item, index) => {
            const selected = index === active;
            return (
              <button
                key={item.title}
                ref={(node) => {
                  tabRefs.current[index] = node;
                }}
                type="button"
                role="tab"
                id={`feature-tab-${index}`}
                aria-selected={selected}
                aria-controls="feature-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(index)}
                onKeyDown={(event) => onKeyDown(event, index)}
                className={cn(
                  "group/tab relative flex cursor-pointer items-start gap-3 overflow-hidden rounded-2xl border p-4 text-left outline-none transition-all duration-300 focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transform-none",
                  selected
                    ? "border-foreground/40 bg-muted/60 shadow-lg lg:translate-x-1.5"
                    : "border-border bg-card hover:-translate-y-0.5 hover:border-foreground/25 hover:shadow-md",
                )}
              >
                <span
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-xl bg-muted transition-all duration-300",
                    selected
                      ? "scale-105 bg-background shadow-md"
                      : "group-hover/tab:scale-105",
                    ICON_COLOR[item.tone],
                  )}
                >
                  <item.icon className="size-5" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-semibold tracking-tight text-foreground">
                    {item.title}
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                    {item.text}
                  </span>
                </span>
                <ChevronRight
                  aria-hidden
                  className={cn(
                    "mt-2.5 hidden size-4 shrink-0 transition-all duration-300 lg:block",
                    selected
                      ? "translate-x-0 text-foreground opacity-100"
                      : "-translate-x-1 opacity-0",
                  )}
                />
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          id="feature-panel"
          aria-labelledby={`feature-tab-${active}`}
          aria-live="polite"
          className="relative min-h-[18rem] overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-xl shadow-foreground/5 sm:p-7"
        >
          {/* soft neutral glow */}
          <div
            key={`glow-${active}`}
            aria-hidden
            className="bm-pop pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-foreground/5 blur-3xl"
          />

          {/* key = remount on tab change, so the header, meters and rows animate in again */}
          <div key={active} className="relative">
            <div className="mb-5 flex items-center gap-3.5">
              <span
                className={cn(
                  "bm-pop grid size-12 shrink-0 place-items-center rounded-2xl bg-muted shadow-sm",
                  ICON_COLOR[current.tone],
                )}
              >
                <current.icon className="size-6" aria-hidden />
              </span>
              <h3 className="text-xl font-semibold leading-tight tracking-tight sm:text-2xl">
                {current.panelTitle}
              </h3>
            </div>
            <ProgressSummary rows={current.rows} />
            <ul className="flex flex-col gap-2.5">
              {current.rows.map((row, index) => (
                <Row key={row.label} row={row} index={index} />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
