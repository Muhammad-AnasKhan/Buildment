"use client";

import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/components/marketing/use-auto-advance";

export type HeroStat = { value: number; label: string; suffix?: string };

const DURATION_MS = 1200;

/** Counts from 0 to `to` with an ease-out curve (the count-up from the original design). */
function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const reduced = usePrefersReducedMotion();
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (reduced) return;
    let frame = 0;
    let start: number | null = null;
    const tick = (now: number) => {
      start ??= now;
      const progress = Math.min((now - start) / DURATION_MS, 1);
      setShown(Math.round(to * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [to, reduced]);

  const value = reduced ? to : shown;
  return (
    <>
      <span aria-hidden>
        {value}
        {suffix}
      </span>
      <span className="sr-only">
        {to}
        {suffix}
      </span>
    </>
  );
}

export function HeroStats({ stats }: { stats: HeroStat[] }) {
  if (stats.length === 0) return null;
  return (
    <ul className="mt-10 flex flex-wrap gap-x-15 gap-y-4 border-t border-border pt-7">
      {stats.map((stat) => (
        <li key={stat.label}>
          <p className="text-2xl font-extrabold tabular-nums tracking-tight sm:text-[1.65rem]">
            <CountUp to={stat.value} suffix={stat.suffix} />
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">{stat.label}</p>
        </li>
      ))}
    </ul>
  );
}
